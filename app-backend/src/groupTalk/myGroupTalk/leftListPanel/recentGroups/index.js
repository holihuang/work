import { Items } from './items/index'
import { common } from '../../../../common/common'

const tpl = require('./tpl.html')

const PAGE_SIZE = 20

// model
const Model = window.Backbone.Model.extend({
    defaults: {
        messageList: [],
        pageNo: 2, // ajax拉取是从第二页开始
    },
})

// view
const RecentGroups = window.Backbone.View.extend({

    initialize(options) {
        const { send } = options
        this.send = send
        this.model = new Model()
        this.listenTo(this.model, 'change:activeGroupId', this.renderList)
        this.listenTo(this.model, 'change:messageList', this.renderList)
        this.listenTo(this.model, 'change:searchResultList', this.renderSearchList)
        this.render()
    },

    events: {
        'click #searchBtn': 'searchGroup',
        'input #searchGroupIpt': 'searchAllGroup',
        'click .item': 'setActiveGroup',
        'click .cancel-top': 'cancelTop',
        'click .set-top': 'setTop',
        'keypress #searchGroupIpt': 'handleSearchEnter',
    },

    handleSearchEnter(e) {
        if (e.keyCode === 13) {
            this.searchGroup()
            return false
        }

        return true
    },

    searchGroup() {
        this.$el.find('#searchMessageItemListContainer').find('.loaded-all-data').hide()
        const condition = this.$el.find('#searchGroupIpt').val().trim()
        if (condition) {
            this.$el.find('#messageItemList').hide()
            this.$el.find('#searchMessageItemListContainer').show()
            this.$el.find('#searchMessageItemList').html('')

            this.getOldMessages(condition)
        } else {
            this.$el.find('#messageItemList').show()
            this.$el.find('#searchMessageItemListContainer').hide()
        }
    },

    searchAllGroup(e) {
        if (!$(e.currentTarget).val().trim()) {
            this.$el.find('#messageItemList').show()
            this.$el.find('#searchMessageItemListContainer').hide()
        }
    },

    update(data) {
        const { messageList, command, content } = data
        const oldMessageList = this.model.get('messageList')
        let newMessageList = []

        if (command === 'RECEIVE') {
            newMessageList = [...messageList]
        } else if (['RECEIVE_GROUP', 'RECEIVE_TRANSFER_GROUP', 'RECEIVE_SET_CADRE_USER'].includes(command)) { // 增量推左侧、群转让给登录者、被设置为管理员
            if (content.message.onTop === 2) { // 推送的是置顶信息，直接放在头位
                newMessageList = [
                    {
                        ...content.message,
                    },
                    ...oldMessageList.filter(item => item.groupId !== content.message.groupId),
                ]
            } else {
                let topPos = -1
                oldMessageList.find((item, index) => {
                    if (item.onTop !== 2) {
                        topPos = index
                        return true
                    }
                    return false
                })

                if (topPos === -1) { // 所有的都置顶了
                    newMessageList = [
                        ...oldMessageList,
                        {
                            ...content.message,
                        },
                    ]
                } else {
                    const topList = oldMessageList.splice(0, topPos)


                    newMessageList = [
                        ...topList,
                        {
                            ...content.message,
                        },
                        ...oldMessageList.filter(item => item.groupId !== content.message.groupId)
                    ]
                }
            }
        } else if (['RS_TRANSFER_GROUP', 'RECEIVE_DELETE_GROUP', 'RS_DELETE_GROUP', 'RECEIVE_DELETE_USER', 'RECEIVE_CANCLE_CADRE_USER'].includes(command)) { // 群转让、群解散、踢出群、被取消管理员
            newMessageList = oldMessageList.filter(item => item.groupId !== content.groupId)
            // 如果被干掉的恰巧是当前窗口，需要清空左侧列表群选中状态 activeGroupId
            if (content.groupId === this.model.get('activeGroupId')) {
                this.model.set({
                    activeGroupId: '',
                })
            }
        // 如果左侧列表里没有，则不更新左侧
        } else if (['RECEIVE_REVOKE', 'REVOKE_SUCCESS'].includes(command)) { // 他人的撤销操作、自己撤回消息
            newMessageList = oldMessageList.map(item => {
                if (content.groupId === item.groupId) {
                    return {
                        ...item,
                        ...content,
                    }
                }
                return item
            })
        } else if (['RS_SET_ACTIVE_GROUP'].includes(command)) { // 切换群
            const activeGroupId = +content.activeGroupChatInfo.groupId
            this.model.set({
                activeGroupId,
            })

            newMessageList = oldMessageList.map(item => {
                if (activeGroupId === item.groupId) {
                    return {
                        ...item,
                        hasAite: 0, // set active不会再推左侧列表，需手动重置可能存在的Key
                        messageCount: 0,
                    }
                } else {
                    return item
                }
            })
        } else if (['RECEIVE_GROUP_HAS_AT'].includes(command)) { // @逻辑有坑，im分两次发送，app版本升级存在困难，前端妥协做处理
            const { groupId } = content
            newMessageList = oldMessageList.map(item => {
                if (groupId === item.groupId) {
                    return {
                        ...item,
                        hasAite: 1, // 由前端做遍历切换hasAite值。
                    }
                }
                return item
            })
        } else if (['RS_UPDATE_GROUP_DETAILS'].includes(command)) { // 群设置里，修改完群名字后，服务端不会推RECEIVE_GROUP，前端自己维护messageList
            const { activeGroupId } = this.model.toJSON()
            newMessageList = oldMessageList.map(item => {
                if (activeGroupId === item.groupId) {
                    return {
                        ...item,
                        groupName: content.groupName,
                    }
                }
                return item
            })
        } else if (['RS_MULTI_SEND'].includes(command)) { // 群转发 => 触发多次RECEIVE_GROUP
            const { successGroupIdList } = content

            // 注意倒循环
            for (let i = successGroupIdList.length - 1; i >= 0; i -= 1) {
                this.update({
                    command: 'RECEIVE_GROUP',
                    content: {
                        message: {
                            ...successGroupIdList[i],
                            userNickname: content.userNickname,
                        },
                    },
                })
            }
            return
        }

        this.model.set({ messageList: newMessageList })
    },

    // 通过ws推送拿到的消息
    renderList() {
        const { messageList = [], activeGroupId } = this.model.toJSON()
        if (this.items) {
            this.items.undelegateEvents()
        }

        this.items = new Items({
            el: this.$el.find('#messagesFromWsPanel')[0],
            messageList,
            activeGroupId,
        })

        if (!messageList.length) {
            this.$el.find('.loaded-all-data').show()
        }
    },

    renderSearchList() {
        const { searchResultList, activeGroupId } = this.model.toJSON()
        this.searchItems = new Items({
            messageList: searchResultList,
            activeGroupId,
        })
        this.$el.find('#searchMessageItemList').append(this.searchItems.$el)
    },

    // 搜索后的响应
    getSearchGroupListRs(data) {
        const response = data
        // 需要ws额外返回的condition
        const { condition = '' } = response
        if (response.rs) {
            // 有延迟，判断是否是当前筛选条件的返回
            if (condition && (condition !== this.$el.find('#searchGroupIpt').val().trim())) {
                return
            }

            const messageList = response.resultMessage.resultList
            const len = messageList.length
            if (len) {
                this.model.set({ searchResultList: messageList })
            } else {
                this.hasLoadedAllSearchData = true
                this.$el.find('#searchMessageItemListContainer').find('.loaded-all-data').show()
            }
        } else {
            alert('获取更多消息失败，请稍后再试！')
        }

        this.isLoading = false
        this.isSearchLoading = false
        this.$el.find('.loading-list-items').hide()
    },

    // 处理置顶或者取消置顶
    setTopOrNotRs(data) {
        const { groupId, resultFlag, type } = data || {}

        if (resultFlag) {
            const { messageList } = this.model.toJSON()

            const arr = JSON.parse(JSON.stringify(messageList))
            // 找到索引
            let tempIdx
            let lastTopIdx = 0

            arr.forEach((item, index) => {
                // 找到索引
                if (+item.groupId === +groupId) {
                    tempIdx = index
                }
                // 找到最后一个置顶的索引
                if (+item.onTop === 2) {
                    lastTopIdx = index
                }
            })

            if (tempIdx >= 0) {
                // 找到群聊
                let tempGroup
                tempGroup = arr[tempIdx]
                tempGroup = JSON.parse(JSON.stringify(tempGroup))
                // 置顶
                if (+type === 2) {
                    tempGroup.onTop = 2 // 置顶
                    arr.splice(tempIdx, 1)
                    arr.unshift(tempGroup)
                    this.model.set({ messageList: arr })
                } else if (+type === 1) { // 取消置顶
                    tempGroup.onTop = 1 // 取消置顶
                    arr.splice(tempIdx, 1)

                    arr.splice(lastTopIdx, 0, tempGroup)
                    this.model.set({
                        messageList: arr,
                    })
                }
            } else {
                alert('没有需要操作的群聊')
            }
        } else {
            alert('操作失败!')
        }
    },

    /**
     * 获取老师端最近左侧历史群聊列表
     */
    getOldMessages(condition = '') {
        this.$el.find('.loading-list-items').show()

        const { userAccount } = common.getUserInfo()
        const { pageNo } = this.model.toJSON()

        this.send({
            command: 'GET_SEARCH_GROUP_LIST',
            data: {
                userAccount,
                tab: 1, // 1标识最近
                condition: encodeURIComponent(condition),
                imUserId: common.getUserInfo().imIdForGroup,
            },
        })
    },

    setActiveGroup(e) {
        // 输入框获取焦点
        $('#message').focus()
        // 如果当前已经被选中，则不做任何处理
        if ($(e.currentTarget).hasClass('current-checked-item')) {
            return
        }
        const groupId = $(e.currentTarget).attr('groupid')

        this.send({
            command: 'SET_ACTIVE_GROUP',
            data: {
                groupId,
            },
        })
    },

    // 置顶
    setTop(e) {
        const groupId = +$(e.currentTarget).attr('groupId')
        this.send({
            command: 'GROUP_TOP',
            data: {
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
                type: 2,
            },
        })

        return false // 阻止冒泡
    },

    // 取消置顶
    cancelTop(e) {
        const groupId = +$(e.currentTarget).attr('groupId')
        this.send({
            command: 'GROUP_TOP',
            data: {
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
                type: 1,
            },
        })

        return false // 阻止冒泡
    },


    render() {
        this.$el.html(tpl())
        return this
    },
})

export { RecentGroups }
