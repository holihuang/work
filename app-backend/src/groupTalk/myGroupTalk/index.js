import { wsObj } from './ws'
import { common } from '../../common/common'
import { global } from '../../common/global'
import { LeftListPanel } from './leftListPanel/index'
import { ChatDialog } from './chatDialog/index'
import { AudioPlayer } from '../../common/audioPlayer'
import { envCfg } from '../../common/envCfg'
import { service } from '../../common/service'

const tpl = require('./tpl.html')

const Model = window.Backbone.Model.extend({
    defaults: {
        activeGroupId: '',
    },
})

const MyGroupTalk = window.Backbone.View.extend({
    className: 'conversation-box',

    initialize(options) {
        const { groupId } = options
        this.model = new Model()
        if (groupId) {
            this.model.set({ activeGroupId: groupId })
        }
        this.listenTo(this.model, 'change:activeGroupChatInfo', this.handleActiveChatInfoChange)
        service.getImIdByAccount({
            userAccount: window.userInfo.userAccount,
        }, response => {
            if (response.rs) {
                this.render()
                this.renderLeftPanel()
                this.renderChatDialog()
                window.userInfo.imIdForGroup = response.resultMessage
                this.initWs()

                if (this.timer) {
                    clearTimeout(this.timer)
                }
                this.timer = setTimeout(() => {
                    if (global.buildGroupSuccess) {
                        alert('为了更好的保证群聊运营质量，不要忘记去设置群管理员~')
                        global.buildGroupSuccess = false
                    }
                }, 1000)
            } else {
                alert(response.rsdesp)
            }
        })
    },

    initWs() {
        const that = this
        const imUserId = common.getUserInfo().imIdForGroup
        const ws = new WebSocket(`${envCfg.groupWsReqUrl}?imUserId=${imUserId}`)
        ws.onopen = function () {
            console.log('ws connet successfully!')
            that.initActiveGroup()
        }
        ws.onmessage = this.onReceiveGroupMessage.bind(this)
        ws.onclose = function (param) {
            alert('由于您长时间未操作，连接已主动断开，请按F5刷新即可正常使用')
            console.log('ws closed!')
        }

        this.ws = ws
        wsObj.ws = this.ws
    },

    initActiveGroup() {
        const { activeGroupId } = this.model.toJSON()
        if (activeGroupId) {
            this.send({
                command: 'SET_ACTIVE_GROUP',
                data: {
                    groupId: activeGroupId,
                },
            })
        }
    },

    onReceiveGroupMessage(e) {
        $('.conversation-loading').hide()

        const chatMessagesInfo = common.parseJSON(e.data)

        const { data = {} } = chatMessagesInfo

        const { activeGroupChatInfo } = data // 接收到的
        const oriActiveChatInfo = this.model.get('activeGroupChatInfo') // 当前的

        if (activeGroupChatInfo && JSON.stringify(oriActiveChatInfo) === JSON.stringify(activeGroupChatInfo)) {
            // 若接收到的和当前的相同,说明是左侧列表数据发生了变化
            const { ts = 0 } = this.model.toJSON()
            const t = new Date()
            if (t - ts > 3 * 1000) {
                // 若间隔大于3s中，则更新数据
                // 立即更新
                this.updateModelAndTs(chatMessagesInfo)
            } else {
                // this.t && clearTimeout(this.t)  // 清除计时器
                if (this.t) {
                    clearTimeout(this.t) // 清除计时器
                }

                this.t = setTimeout(() => {
                    // 若3s后时间戳没有变化，说明期间没有更新过
                    const newTs = this.model.get('ts')
                    if (newTs === ts) {
                        this.updateModelAndTs(chatMessagesInfo)
                    }
                    console.log('timeout')
                }, 3000 - (t - ts))
            }
        } else {
            // 立即更新
            this.updateModelAndTs(chatMessagesInfo)
        }
    },

    // 发送消息
    send(options = {}) {
        // 发送消息
        // 首先检测ws是否正常连接;
        // 若连接错误，则进行提示，不清空输入框
        // 正常则发送消息，清空输入框
        const { ws } = this
        if (ws.readyState === 1) { // open
            const { command, data } = options

            if (command === 'SET_ACTIVE_GROUP') {
                const {
                    groupId,
                } = data

                this.chatDialog.loading()

                this.$el.find('.current-checked-item').removeClass('current-checked-item')

                this.$el.find(`[groupid="${groupId}"]`).addClass('current-checked-item')
            }

            ws.send(JSON.stringify({
                command,
                data,
            }))

            return true
        }
        alert('网络错误，请检查您的网络或刷新重试~')
        return false
    },

    // 聊天区发生变化，右侧更新
    handleActiveChatInfoChange() {
        const { activeGroupChatInfo } = this.model.toJSON()
        this.chatDialog.update(activeGroupChatInfo)
    },

    // 更新model和时间戳
    updateModelAndTs(chatMessagesInfo) {
        const { command, data } = chatMessagesInfo

        // 在这些command下（特质左侧列表要删某个群），如果恰巧是当前窗口，需要干掉
        if (['RS_TRANSFER_GROUP', 'RECEIVE_DELETE_GROUP', 'RS_DELETE_GROUP', 'RECEIVE_DELETE_USER', 'RECEIVE_CANCLE_CADRE_USER'].includes(command)
            && data && data.groupId === this.model.get('activeGroupId')) {
            this.model.set({
                activeGroupChatInfo: null,
                activeGroupId: '',
            })
            // 重置群id，下次切换群，必然就触发了handleGroupChange
            this.chatDialog.model.set({
                groupId: 0,
            })
            // 干掉会话框
            $('#chatDialogContainer').html('')
        }

        switch (command) {
        case 'RECEIVE': // 接收到消息 @gushouchuang RECEIVE仅推送左侧最近列表全量数据 不再推送右侧聊天数据
            this.leftListPanel.update({
                messageList: data.messageList,
                command: 'RECEIVE',
            })
            break
        case 'SEND_SUCCESS':
            this.chatDialog.handleMessageSuccess({
                ...data,
            })
            break
        case 'RS_HISTORY_GROUP_MSG': // 获取群聊历史聊天内容
            this.chatDialog.getHistoryGroupMessagesRs({
                ...data,
            })
            break
        case 'RS_FORBID_USER': // 禁言/解禁
            this.chatDialog.forbiddenRs({
                ...data,
            })
            break
        case 'RS_DELETE_USER': // 移除
            this.chatDialog.deleteUserRs({
                ...data,
            })
            break
        case 'RS_SET_CADRE_USER': // 设置班干部
            this.chatDialog.setCadreUserRs({
                ...data,
            })
            break
        case 'RS_GET_STU_DETAIL': // 获取成员详情
            this.chatDialog.getStudentDetailRs({
                ...data,
            })
            break
        case 'RS_ADD_NEW_MEMBERS': // 添加新成员
            this.chatDialog.addNewMembersRs({
                ...data,
            })
            break
        case 'RS_GET_GROUP_DETAILS': // 获取群设置
            this.chatDialog.getGroupDetailsRs({
                ...data,
            })
            break
        case 'RS_GET_GROUP_STATUS': // 获取群状态
            this.chatDialog.getGroupStatusRs({
                ...data,
            })
            break
        case 'RS_GET_GROUP_ANNOUNCE': // 获取群公告
            this.chatDialog.getGroupAnnounceRs({
                ...data,
            })
            break
        case 'RS_UPDATE_GROUP_DETAILS': // 更新群设置
            this.chatDialog.updateGroupDetailsRs({
                ...data,
            })
            // 后端不会推RECIEVE_GROUP，只能前端自己维护（更新groupName）
            this.leftListPanel.update({
                content: data,
                command: 'RS_UPDATE_GROUP_DETAILS',
            })
            break
        case 'RS_DELETE_GROUP_ANNOUNCE': // 删除群公告
            this.chatDialog.deleteGroupAnnounceRs({
                ...data,
            })
            break
        case 'RS_UPDATE_GROUP_ANNOUNCE': // 更新群公告
            this.chatDialog.updateGroupAnnounceRs({
                ...data,
            })
            break
        case 'RS_UPDATE_GROUP_STATE': // 群聊禁言
            this.chatDialog.updateGroupStateRs({
                ...data,
            })
            break
        case 'RS_LIST_GROUP_MEMBERS': // 获取成员列表
            this.chatDialog.getMembListRs({
                ...data,
            })
            break
        case 'RS_HIDE_MSG': // 消息屏蔽
            this.chatDialog.msgHideRs({
                ...data,
            })
            break
        case 'RS_GET_ALL_GROUP_MSG_LIST': // 全部list
            this.leftListPanel.getGroupListRs({
                ...data,
            })
            break
        case 'RS_GET_GROUP_MSG_LIST': // 最近list
            this.leftListPanel.getOldMessagesRs({
                ...data,
            })
            break
        case 'RS_GROUP_TOP': // 置顶或者取消置顶
            this.leftListPanel.setTopOrNotRs({
                ...data,
            })
            break
        case 'RS_GET_TRANS_GROUP_MSG_LIST': // 处理转发群备选数据变化
            this.chatDialog.getTransGroupMsgList({
                ...data,
            })
            break
        // 群改造，细化新增的ws command @gushouchuang
        case 'RECEIVE_GROUP': // 增量推左侧（单条）
            // 涉及左侧最近列表：第一次接收为全量（排序完成的），后续由前端维护，涉及到排序（维护置顶、非置顶），维护的依据为groupid
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_GROUP',
            })
            break
        case 'RS_GET_SEARCH_GROUP_LIST': // 最近/全部 搜索后的ws响应
            this.leftListPanel.getSearchGroupListRs({
                ...data,
            })
            break
        case 'RS_SET_ACTIVE_GROUP': // 切换群
            // 向应里，删除了userUrl（登录人在群里的头像）字段
            const { activeGroupChatInfo } = data
            // 说明是当前打开的群组的消息
            this.model.set({
                activeGroupId: +activeGroupChatInfo.groupId,
                activeGroupChatInfo,
                activeGroupName: activeGroupChatInfo.groupName,
                activeGroupMemberCount: activeGroupChatInfo.memberCount,
            })

            this.leftListPanel.update({
                content: data,
                command: 'RS_SET_ACTIVE_GROUP',
            })

            break
        case 'REVOKE_SUCCESS': // 撤回消息
            this.chatDialog.handleRevokeMsgSuccess({
                ...data,
            })
            // 原系统撤回消息后，会返回成功ack，并且全量推一次左侧
            // 现期望，不再推左侧，左侧列表由前端维护，维护需要用到的信息，从原ack中读取，ack的信息由server补充
            this.leftListPanel.update({
                content: data,
                command: 'REVOKE_SUCCESS',
            })
            break

        case 'RS_TRANSFER_GROUP': // 群主管理转让
            this.chatDialog.chooseTeacherRs({
                ...data,
            })
            // 通过获取到的groupId，删除左侧列表中的群（没找到的话就算了）
            this.leftListPanel.update({
                content: data,
                command: 'RS_TRANSFER_GROUP',
            })
            break
        case 'RECEIVE_DELETE_GROUP': // 群解散 收听端
            // 同群转让，通过groupid删除左侧列表中的群
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_DELETE_GROUP',
            })
            break
        case 'RS_DELETE_GROUP': // 群解散 操作端
            this.chatDialog.deleteRs({
                ...data,
            })
            // 同群转让，通过groupid删除左侧列表中的群
            this.leftListPanel.update({
                content: data,
                command: 'RS_DELETE_GROUP',
            })
            break
        case 'RS_MULTI_SEND': // 群转发
            this.chatDialog.mutiSendRs({
                ...data,
            })

            // 携带批量需要更新的信息，在左侧列表中，挨个更新
            this.leftListPanel.update({
                content: data,
                command: 'RS_MULTI_SEND',
            })
            break
        case 'RECEIVE_GROUP_ACTIVE': // 当前窗口 推送聊天信息
            this.model.set({
                activeGroupChatInfo: data.activeGroupChatInfo,
            })
            // 推送的消息，包含左侧和右侧会话全部信息，需要同时维护左侧和右侧
            this.leftListPanel.update({
                content: {
                    message: data.message,
                },
                command: 'RECEIVE_GROUP',
            })
            break
        case 'RECEIVE_REVOKE': // 他人的撤销操作
            // 左侧列表中更新信息，但不变动左侧列表的顺序
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_REVOKE',
            })
            // 右侧
            if (data.groupId === this.model.get('activeGroupId')) {
                this.chatDialog.revokeMsg(data)
            }
            break
        case 'RECEIVE_TRANSFER_GROUP': // 群转让结果
            // 需添加到左侧列表，无更多信息展示（最后发言人和内容），仅群头像和群名称
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_TRANSFER_GROUP',
            })

            // 右侧
            if (data.message.groupId === this.model.get('activeGroupId')) {
                this.chatDialog.updateGroupInfo({
                    userIsOwner: true, // 转让的肯定是群主
                })
            }
            break
        case 'RECEIVE_FORBID_GROUP': // 禁言 仅会返回当前弹窗
            // 仅返回当前窗口群的禁言信息，非当前窗口，不会推送
            this.chatDialog.updateGroupInfo({
                groupForbidden: data.forbidden,
            })
            break
        case 'RECEIVE_CANCLE_CADRE_USER': // 被取消管理员
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_CANCLE_CADRE_USER',
            })
            break
        case 'RECEIVE_SET_CADRE_USER': // 被设置为管理员
            // 与群转让等价
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_SET_CADRE_USER',
            })
            break
        case 'RECEIVE_DELETE_USER': // 被踢出
            // 与群解散等价
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_DELETE_USER',
            })

            break
        case 'RECEIVE_FORBID_USER': // 针对单人的禁言
            // 大概和群禁言相似
            this.chatDialog.updateGroupInfo({
                memberForbidden: data.forbidden,
            })

            break
        case 'RECEIVE_USER_QUIT': // 学员退出群聊/学员被移出群聊
            this.chatDialog.memberModel.set({
                memberCount: data.memberCount,
            })
            // 增量new 非mv模型
            this.chatDialog.model.set({
                messageList: [
                    {
                        ...data,
                    },
                ],
            })
            break
        case 'RECEIVE_INVITE_USER': // 邀请人员入群 仅更新人数，不做话术提示
            this.chatDialog.memberModel.set({
                memberCount: data.memberCount,
            })
            break
        case 'RECEIVE_GROUP_HAS_AT': // @逻辑有坑，im分两次发送，这command是处理第二次
            this.leftListPanel.update({
                content: data,
                command: 'RECEIVE_GROUP_HAS_AT',
            })
            break
        case 'KICK_NOTICE': // 互踢
            this.ws.close()
            break
        default:
            break
        }

        this.model.set({ ts: new Date() })

        // 新消息提示
        if (data && data.hasNewMessage) {
            this.notify()
        }
    },

    destroy() {
        if (this.ws) {
            this.send({
                command: 'SET_ACTIVE_GROUP',
                data: {
                    groupId: '0',
                },
            })
        }
    },

    notify() {
        const d = new AudioPlayer({
            src: './audio/messageComing.mp3',
        })

        console.log(d)
    },

    // 渲染左侧
    renderLeftPanel() {
        const { activeGroupId } = this.model.toJSON()
        this.leftListPanel = new LeftListPanel({
            el: this.$el.find('#leftListPanel')[0],
            send: this.send.bind(this),
            updateModelAndTs: this.updateModelAndTs.bind(this),
            activeGroupId,
        })
    },

    // 渲染聊天窗口
    renderChatDialog() {
        this.chatDialog = new ChatDialog({
            el: this.$el.find('#chatDialogContainer')[0],
            send: this.send.bind(this),
        })
    },

    render() {
        this.$el.html(tpl())
    },
})

export { MyGroupTalk }
