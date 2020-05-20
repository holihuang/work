import { common } from '../../../../common/common'
import { Items } from './items/index'

const tpl = require('./tpl.html')

const PAGE_SIZE = 20

const Model = window.Backbone.Model.extend({
    defaults: {
        activeGroupId: -1,
        resultList: [],
        searchGroupList: [],
        pageNo: 1, // 全部群组分页页码
    },
})

const AllGroups = window.Backbone.View.extend({
    initialize(options) {
        const { send, activeGroupId } = options
        this.send = send
        this.model = new Model()
        this.model.set({ activeGroupId })
        this.render()
        this.listenTo(this.model, 'change:resultList', this.renderGroupList)
        this.listenTo(this.model, 'change:searchGroupList', this.renderSearchGroupList)
        this.initGroupList()
        this.initScrollEvents()
    },

    events: {
        'click #searchBtn': 'searchGroup',
        'input #searchGroupIpt': 'searchAllGroup',
        'keypress #searchGroupIpt': 'handleSearchEnter',
        'click .item': 'setActiveGroup',
    },

    update(data) {
        const { activeGroupId } = data
        this.model.set({ activeGroupId })
    },

    handleSearchEnter(e) {
        if (e.keyCode === 13) {
            this.searchGroup()
            return false
        }

        return true
    },

    searchGroup(e) {
        const condition = this.$el.find('#searchGroupIpt').val().trim()

        // 重置各种状态
        this.isSearchLoading = false
        this.hasLoadedAllSearchData = false
        this.$el.find('#groupList').empty()
        this.$el.find('#searchGroupList').empty()

        if (!condition) {
            this.$el.find('#searchGroupList').empty().hide()
            this.$el.find('#groupList').show()
            this.model.set({ pageNo: 1 })
            this.getGroupList(1)
        } else {
            this.$el.find('#searchGroupList').show()
            this.$el.find('#groupList').hide()

            this.getGroupList(1, condition)
        }
    },

    searchAllGroup(e) {
        if (!$(e.currentTarget).val().trim()) {
            // 重置各种状态
            this.isSearchLoading = false
            this.hasLoadedAllSearchData = false
            this.$el.find('#groupList').empty()
            this.$el.find('#searchGroupList').empty()

            this.$el.find('#searchGroupList').empty().hide()
            this.$el.find('#groupList').show()
            this.model.set({ pageNo: 1 })
            this.getGroupList(1)
        }
    },

    setActiveGroup(e) {
        // 如果当前已经被选中，则不做任何处理
        if ($(e.currentTarget).hasClass('current-checked-item')) {
            return
        }

        const groupId = $(e.currentTarget).attr('groupid')
        const groupName = $(e.currentTarget).attr('groupname')
        const memberCount = $(e.currentTarget).attr('memberCount')
        let userIsOwner = $(e.currentTarget).attr('userIsOwner')
        const groupForbidden = $(e.currentTarget).attr('groupForbidden')
        const memberForbidden = $(e.currentTarget).attr('memberForbidden')
        userIsOwner = userIsOwner === 'true'
        this.send({
            command: 'SET_ACTIVE_GROUP',
            data: {
                groupId,
                groupName,
                memberCount,
                userIsOwner,
                groupForbidden,
                memberForbidden,
            },
        })
    },

    initScrollEvents() {
        const $groupList = this.$el.find('#groupListContainer')
        const that = this
        $groupList.on('scroll', () => {
            const h = $groupList.height()
            const height = $groupList[0].scrollHeight

            // 获取滚动高度
            const scrollTop = $groupList.scrollTop()

            // 滚动多页，再触发一次搜索，scrollTop会=0，此时btn会触发搜索，这里应该return
            if (scrollTop > 0 && scrollTop + h > height - 5) {
                // 此时应该加载更多
                if (!this.isLoading && !this.hasLoadedAllData) {
                    this.isLoading = true
                    const { pageNo } = that.model.toJSON()
                    this.$el.find('.loading-list-items').show()
                    this.getGroupList(pageNo)
                }
            }
        })
    },

    initGroupList() {
        this.getGroupList()
    },
    
    getSearchGroupListRs(data) {
        const response = data
        // 需要ws额外返回的condition
        if (response.rs) {
            const { resultList } = response.resultMessage
            if (resultList && resultList.length) {
                
                this.model.set({ searchGroupList: resultList })
            } else {
                this.hasLoadedAllSearchData = true
                this.$el.find('.loaded-all-data').show()
            }
        } else {
            alert(`获取数据失败，${response.rsdesp}`)
        }

        this.$el.find('.loading-list-items').hide()

        this.isSearchLoading = false
    },

    getGroupListRs(data) {
        const response = data
        // 需要ws额外返回的condition
        let { pageNo = 1 } = response

        if (response.rs) {
            const { resultList } = response.resultMessage
            if (resultList && resultList.length) {
                this.model.set({ resultList })
            } else {
                this.hasLoadedAllData = true
                this.$el.find('.loaded-all-data').show()
            }

            pageNo += 1

            this.model.set({ pageNo })
        } else {
            alert(`获取数据失败，${response.rsdesp}`)
        }

        this.$el.find('.loading-list-items').hide()

        this.isLoading = false
    },

    getGroupList(pageNo = 1, condition) {
        const { userAccount } = common.getUserInfo()
        const { resultList, searchGroupList } = this.model.toJSON()
        
        // condition && (params.condition = encodeURIComponent(condition))
        if (condition) {
            this.send({
                command: 'GET_SEARCH_GROUP_LIST',
                data: {
                    userAccount,
                    condition: encodeURIComponent(condition),
                    tab: 2, // 2标识全部
                    imUserId: common.getUserInfo().imIdForGroup,
                },
            })
        } else {
            this.send({
                command: 'GET_ALL_GROUP_MSG_LIST',
                data: {
                    userAccount,
                    pageNo,
                    pageSize: PAGE_SIZE,
                    cursorGroupId: resultList.length ? resultList[resultList.length - 1].groupId : 0, // 最近一个结果的groupid，没有则传0
                    imUserId: common.getUserInfo().imIdForGroup,
                },
            })
        }
    },

    renderGroupList() {
        const { resultList, activeGroupId } = this.model.toJSON()
        const items = new Items({ resultList, activeGroupId })
        this.$el.find('#groupList').append(items.$el)
    },

    renderSearchGroupList() {
        const { searchGroupList, activeGroupId } = this.model.toJSON()
        const items = new Items({ resultList: searchGroupList, activeGroupId })
        this.$el.find('#searchGroupList').append(items.$el)
    },

    format(data) {
        return data
    },

    render() {
        this.$el.html(tpl())
    },
})

export { AllGroups }
