/**
 * @file react重构后的header
 *
 * @auth gushouchuang
 * @date 2018-5-23
 */

import { ComponentGenerator } from 'common/ReactBackbone'
// import _ from 'lodash'
// 对接dataservice
import { global } from 'common/global'
import knabseService from 'src/imReact/knbase/service'
import component from './Header'
import { common } from '../common'
import { envCfg } from '../envCfg'
import { wsUtil } from '../wsUtil'

import { chatInfoModelUtil } from '../../messageManage/conversation/chatInfo'
import { AudioPlayer } from '../../common/audioPlayer'
import { createNotification } from '../../common/notification'

import { service } from '../service'
// import {service as commonService} from 'common/service'


const componentProps = {
    defaults: {
        online: 1,
        statusEmpty: false, // 状态data字段是否是空
    },
    view: {
        el: document.getElementById('header'),
        Component: component,
        // preInit() {
        //     // 需要尽可能的提前补充hash 在sitemap render前
        //     this.testRouter()
        // },
        load() {
            return []
        },
        initBehavior() {
            // this.listenTo(chatInfoModelUtil.model, 'change:online', this.render)
            this.model.set({
                online: chatInfoModelUtil.model.get('online'),
            })

            const { userRole } = common.getUserInfo()
            if (
                userRole.indexOf('SCH_DUTYTEACHER') > -1
                || userRole.indexOf('SCH_TEACHER') > -1
                || userRole.indexOf('SCH_AFTERSALETEACHER') > -1 // 客诉老师
            ) {
                // 建立单通道ws
                this.initWs()
                // 建立知识库链接
                this.initKnbase()
            }
        },

        initKnbase() {
            // token
            knabseService.getToken({
                teacherAccount: common.getUserInfo().userAccount,
            }).then(rst => {
                // 通过token去init
                knabseService.init({
                    userToken: rst,
                    channel: 'Sv-Community',
                }).then(() => {
                    global.knbaseInited = true
                }, crst => {
                    console.warn('init: knbase init fail')
                })
            }, rst => {
                console.warn('init: knbase get token fail')
                // global.knbaseInited = false
            })
        },

        initWs() {
            const { imUserId } = common.getUserInfo()

            const role = chatInfoModelUtil.model.get('role')

            const { ws } = wsUtil({
                wsUrl: `${envCfg.wsReqUrl}?imUserId=${imUserId}&role=${role}`,
                // wsUrl: 'ws://172.16.102.127:8380/community-sv-war/singleChat?imUserId=2191756&role=afterSaleTeacher',
                onOpen: _ => {
                    this.handleWsOpen()
                    console.log('header open')
                },
                onMessage: this.handleWsMessage.bind(this),
                onClose: () => {
                    // ws断开
                    chatInfoModelUtil.handleWsClose()
                    // this.setOffline();
                },
            })

            this.ws = ws
        },
        // 且在线、离线状态
        togWsStat(value) {
            this.ws.send({
                command: 'UPDATE_TEACHER_STATUS',
                data: {
                    online: value,
                    imUserId: +common.getUserInfo().imUserId,
                },
            })
        },

        handleWsOpen() {
            const online = chatInfoModelUtil.model.get('online')

            chatInfoModelUtil.handleTeacherStatusChange({
                online,
            })
        },

        handleWsMessage(e) {
            const { command, data } = common.parseJSON(e.data)
            if (command === 'UPDATE_TEACHER_STATUS_RESULT') {
                const userAccountPrefix = (window.userInfo.userAccount || '').replace('@sunlands.com', '')
                // 记录登录状态
                document.cookie = `wsSingleStat-${userAccountPrefix}=${data.online}`

                chatInfoModelUtil.handleTeacherStatusChange(data)
                const dataStr = JSON.stringify(data)
                const cookieKeyName = `onlineStatusEmpty-${userAccountPrefix}`
                if (dataStr === '{}') {
                    const cookieVal = +common.getCookie(cookieKeyName) || 0 // 如果没有值，则取0
                    const cookieValNow = cookieVal + 1
                    document.cookie = `${cookieKeyName}=${cookieValNow}`
                    this.model.set({
                        online: data.online,
                        statusEmpty: true,
                    })
                } else {
                    document.cookie = `${cookieKeyName}=0`
                    this.model.set({
                        online: data.online,
                        statusEmpty: false,
                    })
                }

                try {
                    window.BJ_REPORT.info(`${new Date()}UPDATE_TEACHER_STATUS_RESULT${e.data}, montiorId=${global.BJ_MONTIOR_ID}`)
                } catch (err) {
                    // do nothing
                }
            } else if (command === 'RECEIVE') { // 关于ws的监听是push的，前后不会阻塞 - 在单通道里还有RECEIVE的监听
                if (data.hasNewMessage) {
                    this.notify()
                } else {
                    this.clearNotify()
                }
            }
        },

        /*
         * 通知提醒
         */
        notify() {
            const APTemp = new AudioPlayer({
                src: './audio/messageComing.mp3',
            })
            console.log(APTemp) // lint添加的

            const role = chatInfoModelUtil.getRole() || ''

            const typeText = {
                teacher: '班主任管理中',
                afterSaleTeacher: '客诉老师管理中',
                dutyteacher: '值班老师管理中',
            }[role]

            createNotification({
                content: `${typeText}有一条新消息，请及时查看~`,
            })

            // 标题
            // this.titleInterval && clearInterval(this.titleInterval)
            if (this.titleInterval) {
                clearInterval(this.titleInterval)
            }
            this.titleInterval = setInterval(_ => {
                document.title = document.title.substr(1) || '您有未读的新消息！'
            }, 400)

            document.title = '您有未读的新消息！'
        },

        clearNotify() {
            clearInterval(this.titleInterval)
            document.title = 'APP运营后台'
        },

        testRouter() {
            // // 如果是值班老师，需要查询老师状态
            // const { userRole } = common.getUserInfo()
            // if (userRole.indexOf('SCH_DUTYTEACHER') != -1) {
            //     // 如果是值班老师，默认跳转到会话页面
            //     chatInfoModelUtil.setRole('dutyteacher')

            //     if (!location.hash) {
            //         location.hash = '#dutyTeacherConversation'
            //     }
            // }

            // if (userRole.indexOf('SCH_TEACHER') != -1) {
            //     chatInfoModelUtil.setRole('teacher')

            //     if (!location.hash) {
            //         location.hash = '#myConversation'
            //     }
            // }
            // // 客诉老师
            // if (userRole.indexOf('SCH_AFTERSALETEACHER') != -1) {
            //     chatInfoModelUtil.setRole('afterSaleTeacher')

            //     if (!location.hash) {
            //         location.hash = '#afterSaleTeacherConversation'
            //     }
            // }
        },

        logout() {
            try {
                window.BJ_REPORT.report(`${new Date()}logout`, true)
            } catch (e) {
                // do nothing
            }

            // 如果是值班老师，需要查询老师状态
            // const {userRole} = common.getUserInfo();
            const {
                // userRole, imId, userId, userAccount,
                userRole, userId, userAccount,
            } = common.getUserInfo()
            if (
                +userRole.indexOf('SCH_DUTYTEACHER') !== -1
                || +userRole.indexOf('SCH_TEACHER') !== -1
                || +userRole.indexOf('SCH_AFTERSALETEACHER') !== -1
            ) { // 值班老师
                // this.setOffline();
                const online = chatInfoModelUtil.model.get('online')
                this.ws.send({
                    command: 'LOG_OUT',
                    data: {
                        imUserId: +common.getUserInfo().imUserId,
                        online,
                    },
                })
                this.ws.forceClose()
            }

            const userAccountPrefix = (window.userInfo.userAccount || '').replace('@sunlands.com', '')
            // 登出就清除ws状态cookie
            document.cookie = `wsSingleStat-${userAccountPrefix}=`

            // sso登出，无需参数和回调
            service.getSSOLogout({
                userId: +userId,
                imUserId: +common.getUserInfo().imUserId,
                userAccount,
            }, response => {
                if (response.rs) {
                    window.location.href = envCfg.logoutUrl
                } else {
                    console.warn('logout 服务失败')
                }
            })
        },
        toggleRobotState(opt) {
            const { value, cb } = opt
            const { userAccount, imUserId } = common.getUserInfo()
            const params = {
                hasOpen: value,
                userAccount,
                imUserId,
            }
            service.manageRobot(params, response => {
                if (response.rs) {
                    cb()
                    window.userInfo.robotAssist.hasOpen = +value
                    alert('设置成功')
                } else {
                    console.warn('manageRobot服务失败')
                }
            })
        },
        toggleGuessAsk(opt) {
            const { checked, cb } = opt
            const { userAccount, imUserId } = common.getUserInfo()
            const params = {
                hasOpen: checked ? 1 : 0,
                userAccount,
                imUserId,
            }
            service.manageGuessAsk(params, response => {
                if (response.rs) {
                    cb()
                    window.userInfo.guessAskHasOpen = checked ? 1 : 0
                    alert('设置成功')
                } else {
                    console.warn('manangeGuessAsk服务失败')
                }
            })
        },
    },
}

const Header = ComponentGenerator(componentProps)

export { Header }
