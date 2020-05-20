import moment from 'moment'
import { global } from 'common/global'
import util from 'common/util'

import { LeftListPanel } from './leftListPanel/index'
import { ChatDialog } from './chatDialog/index'
import { envCfg } from '../../common/envCfg'
// import {AudioPlayer} from '../../common/audioPlayer'
// import {createNotification} from '../../common/notification'
import { chatInfoModelUtil } from './chatInfo'
import { common } from '../../common/common'
import { wsUtil } from '../../common/wsUtil'
import tpl from './tpl.html'
import getJSON from '../../common/getJSON'
import { url } from '../../common/url'

// import {service} from "src/common/service"
import intelligentSearchService from '../../imReact/hotSearch/service'

const Conversation = window.Backbone.View.extend({
    className: 'conversation-container',

    initialize(options) {
        const { role } = options

        chatInfoModelUtil.setRole(role)

        this.model = chatInfoModelUtil.model

        this.initWs()
        // 获取老师头像
        this.getTeacherImgUrl()
        // 直接render的话，会销毁其他容器组件，不符合预期
        this.listenTo(this.model, 'change:queueNum', this.updateQueueNum)
        this.getAdminAllQuickReplys()
        this.render()
        // slog: 老师进入IM聊天页面（包含班主任/值班老师/客诉老师IM页面）
        this.onLog()
    },

    onLog() {
        // 两处异步数据
        const userInfo = common.getUserInfo()
        const { userId, userAccount } = userInfo
        const { questionAssist: { hasOpen } } = window.userInfo
        intelligentSearchService.getIntelligentSearch({
            userAccount: userInfo.userAccount,
            imUserId: userInfo.imId,
            channelCode: 'CS_BACKGROUND',
        }).then(response => {
            util.slog('entered_im_page_role', {
                userId,
                userAccount,
                intelligentSearchState: +response, // 智能搜索开关状态
                questionAssistState: hasOpen, // 问答辅助开关状态
                time: moment().format('YYYY-MM-DD hh:mm:ss'),
            })
        }, err => {
            alert(err)
        })
    },

    initWs() {
        const { imUserId } = common.getUserInfo()
        const role = chatInfoModelUtil.model.get('role')

        const { ws, eventIndex } = wsUtil({
            wsUrl: `${envCfg.wsReqUrl}?imUserId=${imUserId}&role=${role}`,
            onOpen: wsUtil.isPending() ? () => {} : _ => {
                this.ws.send({
                    command: 'GET_DATA',
                    data: {
                        teacherImId: +common.getUserInfo().imUserId,
                    },
                })
            },
            onMessage: this.getChatMessages.bind(this),
            onClose(isNormal) {
                if (isNormal) {
                    return
                }
                alert('由于您长时间未操作，连接已主动断开，请按F5刷新即可正常使用')
            },
        })

        this.ws = ws
        this.eventIndex = eventIndex

        if (wsUtil.isPending()) {
            this.ws.send({
                command: 'GET_DATA',
                data: {
                    teacherImId: +common.getUserInfo().imUserId,
                },
            })
        }
    },

    updateQueueNum() {
        const queueNum = this.model.get('queueNum')
        this.$el.find('#imQueueNum').html(queueNum)
    },

    // 获取全部话术
    getAdminAllQuickReplys() {
        const { userAccount } = common.getUserInfo()
        getJSON(url.ADMIN_GETALLQUICKREPLYS, {
            userAccount,
            channelCode: 'CS_BACKGROUND',
        }).then(response => {
            // 把数据放在global里面
            global.allQuicklyReplys = response.resultList
        })
    },

    getTeacherImgUrl() {
        const role = chatInfoModelUtil.model.get('role')
        getJSON(url.GET_TEACHER_IMG_URL, {
            role,
            imUserId: common.getUserInfo().imUserId,
        }).then(avatar => {
            chatInfoModelUtil.model.set({
                avatar,
            })
        })
    },

    // 获取聊天信息所有数据
    getChatMessages(e) {
        // 隐藏loading
        this.$el.find('.loading').hide()

        const { command, data } = common.parseJSON(e.data)

        try {
            window.BJ_REPORT.info(new Date() + e.data)
        } catch (err) {
            // do nothing
        }

        switch (command) {
        case 'RECEIVE': // 接收到新消息
            const { messageList, activeChatInfo } = data

            chatInfoModelUtil.handleReceive({
                messageList,
                activeChatInfo,
            })

            break
        case 'CLOSE': // 学员主动关闭对话或超时关闭，此时会话窗口不关闭
            chatInfoModelUtil.handleStudentClose({
                ...data,
            })

            break
        case 'SEND_SUCCESS': // 发送消息成功
            chatInfoModelUtil.sendMessageSuccess({
                ...data,
            })

            break
        case 'SEND_FAILED': // 发送消息失败
            chatInfoModelUtil.sendMessageFail({
                ...data,
            })

            break
        case 'CREATE_FAILED': // 班主任接入会话失败
            chatInfoModelUtil.handleCreateFailed({
                ...data,
            })

            break
        case 'CLOSE_RESULT': // 老师直接关闭会话
            chatInfoModelUtil.handleTeacherClose({
                ...data,
            })

            break
        case 'TRANSFER_CLOSE': // 值班老师转接响应
            chatInfoModelUtil.handleTransferResult({
                ...data,
            })

            break
        case 'GET_HISROTY_MESSAGE_LIST_RESULT':
            const { activeChatInfo: { watchType, orderDetailId } } = data
            if (watchType === 1) {
                // 我的
                chatInfoModelUtil.handleGetHistoryMessageWithSomeone(data.activeChatInfo.messageList || [])
            } else if (watchType === 2) {
                // 所有人的
                chatInfoModelUtil.handleGetHistoryMessageForAll(data.activeChatInfo.messageList || [], orderDetailId)
            } else {
                // 值不对，do nothing
            }

            break
        case 'GET_SESSION_LIST_RESULT':
            chatInfoModelUtil.handleGetHistorySessionList(data.messageList)

            break
        case 'MESSAGE_TOP_RESULT': // 置顶
            chatInfoModelUtil.handleMessageTopResult({
                ...data,
            })

            break
        case 'UPDATE_TEACHER_STATUS_RESULT': // 老师在线状态变化
            chatInfoModelUtil.handleTeacherStatusChange({
                ...data,
            })

            break
        case 'TEACHER_STATUS':
            chatInfoModelUtil.handleGetTeacherStatusInfo({
                ...data,
            })
            break
        case 'PUSH_QUESTION_ASSIST':
            chatInfoModelUtil.handleQuestionAssistPush(data)
            // const { userAccount, userId } = common.getUserInfo()
            util.slog('question_assist_dialog_show', {
                content: JSON.stringify(data),
                question: data.content,
                consultId: chatInfoModelUtil.model.get('activeChatInfo').messageList[0].consultId,
            })
            break
        // 被动接收后端推送的排队人数
        case 'PUSH_QUEUE_NUMBER':
            chatInfoModelUtil.handleQueueNum(data.number || 0)
            break
        default:
            break
        }
    },

    // /*
    //  * 通知提醒
    //  */
    // notify() {
    //     new AudioPlayer({
    //         src: './audio/messageComing.mp3'
    //     });

    //     createNotification({
    //         content: '有新消息~'
    //     });

    //     //标题
    //     this.titleInterval && clearInterval(this.titleInterval);
    //     this.titleInterval = setInterval(_ => {
    //         document.title = document.title.substr(1) || '您有未读的新消息！';
    //     }, 400);

    //     document.title = '您有未读的新消息！';
    // },

    // clearNotify() {
    //     clearInterval(this.titleInterval);
    //     document.title = 'APP运营后台';
    // },

    /*
     * 渲染最近列表
     */
    renderLeftPanel() {
        this.leftListPanel = new LeftListPanel({
            el: this.$el.find('#leftListPanel')[0],
            send: this.ws.send,
        })
    },

    /*
     * 渲染右侧聊天窗口
     */
    renderChatDialog() {
        this.chatDialog = new ChatDialog({
            el: this.$el.find('#chatDialogContainer')[0],
            send: this.ws.send,
        })
    },

    /**
     * 销毁
     */
    destroy() {
        chatInfoModelUtil.reset()
        this.ws.send({
            command: 'SET_ACTIVE_USER',
            data: {
                orderDetailId: -1,
            },
        })

        this.ws.removeListener(this.eventIndex)
        this.remove()

        this.chatDialog.destroy()
        this.leftListPanel.destroy()
    },

    render() {
        // console.log(`render conversation`)
        this.$el.html(tpl())
        this.renderLeftPanel()
        this.renderChatDialog()
    },
})

export { Conversation }
