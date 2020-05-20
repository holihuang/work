// @author gushouchuang
import { getJSON } from 'dataservice'
import browser from '@sunl-fe/sfe-st/lib/browser'
import { service } from './common/service'
import { envCfg } from './common/envCfg'
import { global } from './common/global'
import { common } from './common/common'
import Backbone from 'backbone'

import { Modal, Button } from 'antd'
import React from 'react'
import { render } from 'react-dom'
import ImAccessInTip from './imReact/imAccessInTip/ImAccessInTip'


// 后续使用dataservice包的接口 数据格式都必须严格按照下面来
getJSON.initHttpDTO({
    JsonDTO: {
        flag: 'rs', // 成功标志
        message: 'rsdesp', // 信息
        data: 'resultMessage', // 数据集合
    },
    badStatus: [
        {
            status: 200,
            callback: _ => {
                //说明是未登录，返回了200，但是出现了parsererror错误
                //为了进一步确定，判断responseText
                if (jqXHR.responseText.indexOf('<!DOCTYPE') != -1) {
                    window.location.href = envCfg.loginUrl;
                } else {
                    //alert(jqXHR.responseText);
                    //说明是接口返回数据格式错误导致解析失败
                    alert('网络有点问题，请刷新页面试试'); //PM说先按这样来提示
                }
            }
        },
        {
            status: 401,
            callback: _ => {
                console.warn('当前未登录，请通过sso登录 dataservice')
                // sso标志，需要定向到单点页面 本地环境暂不添加sso服务
                const originPage = encodeURIComponent(`${location.protocol}//${location.host}/community-mgr-war/index.html`)
                if (process.env.NODE_ENV === 'dev') {
                    location.href = '/dev_login'
                } else {
                    location.href = envCfg.loginUrl
                }
            }
        },
        {
            status: 404,
            callback: _ => {
                alert('请求接口不存在')
            }
        },
        {
            status: 704,
            callback: _ => {
                // 登录互踢
                console.warn('多方登录，被踢下线')
                let { userId, userAccount, imUserId } = common.getUserInfo()
                // sso登出，无需参数和回调
                service.getSSOLogout({
                    userId: +userId,
                    imUserId: +imUserId,
                    userAccount,
                }, (response) => {
                    if(response.rs) {
                        location.href = envCfg.logoutUrl
                    } else {
                        console.warn('logout 服务失败')
                    }
                })
            }
        },
    ],
})


// 引入antd css
import 'antd/dist/antd.less'

require('./styles/index.less')
require('bootstrap/dist/js/npm')

require('bootstrap/dist/js/bootstrap')

require('datepicker/build/build_standalone.less')
require('datepicker/js/bootstrap-datetimepicker')

/*
 * @getUserInfo {function} 获取userInfo
 * */
const getUserAccount = () => {
    return new Promise((resolve, reject) => {
        service.getUserAccount({}, (response) => {
            if(response.rs) {
                resolve(response)
            } else {
                // sso登出，无需参数和回调
                service.getSSOLogout({
                    userId: -1,
                    imUserId: -1,
                    userAccount: 'error@sunlands.com',
                }, response => {
                    if (response.rs) {
                        location.href = envCfg.logoutUrl
                    } else {
                        console.warn('logout 服务失败')
                    }
                })
            }
        })
    })
}

// 初始化日志
function initMontior (imId) {
    // 怕第三方库的js没加载完，这里兼容写个定时器监听
    if (typeof BJ_REPORT === 'object') {
        BJ_REPORT.init({
            id: 4,  //app后台 // 上报 id, 不指定 id 将不上报
            uin: imId, // 指定用户 id, (默认已经读取 qq uin)
            delay: 1000, // 当 combo 为 true 可用，延迟多少毫秒，合并缓冲区中的上报（默认）
            url: "http://sa.fe.sunlands.com/badjs", // 指定上报地址
            random: 1, // 抽样上报，1~0 之间数值，1为100%上报（默认 1）
            repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报)
            // 避免出现单个用户同一错误上报过多的情况
            onReport: function(id, errObj){}, // 当上报的时候回调。 id: 上报的 id, errObj: 错误的对象
            ext: {}, // 扩展属性，后端做扩展处理属性。例如：存在 msid 就会分发到 monitor,
            offlineLog: true, // 是否启离线日志 [默认 false]
            offlineLogExp: 5, // 离线有效时间，默认最近5天
        })
    } else {
        setTimeout(() => {
            iiinit(imId)
        }, 300)
    }
    (function() {
        let src = ''
        // slog.base.js 记录不包括性能统计数据
        // slog.base.js 记录不包括性能统计数据
        const testSrc = 'http://172.16.140.50:21001/slog/2.2.0/slog.all.js'; // 测试 slog.all.js 地址
        // var src = 'http://172.16.140.50:21001/slog/2.1.2/slog.base.js'; // 测试 slog.base.js 地址
        const prodSrc = '//assorted.sunlands.com/slog/2.2.0/slog.all.js'; // 线上 slog.all.js 地址
        // var src = '//assorted.sunlands.com/slog/2.1.2/slog.base.js'; // 线上 slog.base.js 地址
        if (process.env.NODE_ENV === 'production') {
            src = prodSrc
        } else {
            src = testSrc
        }
        var slog = document.createElement("script");
          slog.src = src;
          slog.setAttribute("name", "SLS1");
          slog.setAttribute("sid", "10005");// 此处sid需要手动添加
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(slog, s);
      })();
}


// 记录访问一个会话页面次数
function countStatics() {
    const ls = window.localStorage
    let accessInNo = +ls.getItem('accessInNo')
    if (accessInNo) {
        accessInNo  = accessInNo + 1
    } else {
        accessInNo = 1
    }
    ls.setItem('accessInNo', accessInNo)
}

let canEnterWithinOneImState = true
function initImKickInBrowser() {
    const ls = window.localStorage

    let imStateTimeStamp = ls.getItem('imStateTimeStamp')

    if (imStateTimeStamp) {
        canEnterWithinOneImState = false
        // 统计访问次数
        countStatics()
    } else {
        imStateTimeStamp = new Date().getTime()
        ls.setItem('imStateTimeStamp', imStateTimeStamp)
        ls.setItem('accessInNo', 0)

        canEnterWithinOneImState = true
        window.onunload = () => {
            ls.removeItem('imStateTimeStamp')
        }
    }
}

initImKickInBrowser()

if (canEnterWithinOneImState) {
    getUserAccount().then(response => {
        const resultMessage = response.resultMessage || {}
        // console.log(`user ip: ${window.userIp}`)
        const {
            imId,
            userRole,
            appNickname,
            siteMap,
            userAccount,
            userId,
            userNickname,
            roleList,
            questionAssist,
            robotAssist,
            guessAskHasOpen
        } = resultMessage

        window.userInfo = {
            userNickname,
            userAccount,
            userId: userId + '',
            imId: imId + '', // 由于之前jsp通信 userId和imId都是字符串，保留。
            userRole,
            appNickname,
            siteMap,
            questionAssist,
            robotAssist,
            guessAskHasOpen
        }

        
        // 由于初始化前拿不到imid / uid信息，所以埋点id只能有随机数 + 时间戳构成
        global.BJ_MONTIOR_ID = imId + '-' + new Date().getTime()

        initMontior(imId)
        // 至少保证browser初始化在slog之后。

        try {
            browser.init({
                // host: '172.16.113.191', // ws server启动的服务ip，注意没有http://前缀
                // url: '/sfe-st/validate', // ws path
                port: '4199', // 端口
                // maxHeight: '400px', // dom的最大高度（注意带px） 默认为400px
                // maxWidth: '600px', // 最大宽度 默认为600px
                // time: 10000, // browser ws的心跳间隔，默认10s
                sys: 'app-backend',
            })
        } catch (e) {
            console.log(e)
        }

        try {
            const userAccountPrefix = (userAccount || '').replace('@sunlands.com', '')
            const statCookie = common.getCookie(`wsSingleStat-${userAccountPrefix}`) || '-1'
            
            BJ_REPORT.info('getUserAccount done, montiorId=' + global.BJ_MONTIOR_ID + ';url=' + location.href + ';statCookie=' + statCooki + ';userIp=' + window.userIp)
        } catch(e) {
            //do nothind
        }

        // @gushouchuang
        // 简单判断下参数中有from=iw标志且身为为班主任/值班老师，暂时不考虑扩展性
        const disableUse = location.search.indexOf('fromworkflow') === -1
            && (
                userRole.indexOf('SCH_DUTYTEACHER') > -1 // 值班老师
                || userRole.indexOf('SCH_TEACHER') > -1 // 班主任
            )
            // && questionAssist.hasShow === 1 // 小流量名单 - 图灵学院 TODO 全流量直接删除它
            && (location.href.indexOf('am.sunlands.com') > -1) // 线上才生效

        if (disableUse) {
            const noProps = {
                title: ``,
                visible: true,
                footer: null,
                closable: false,
                onCancel: () => {
                    // 不允许关闭，强制去班主任工作台
                    return
                }
            }

            const linkProps = {
                type: 'primary',
                onClick: () => {
                    // 链接到班主任工作台（线上）
                    location.href = 'http://iw.shangdejigou.cn/#/instructor/home'
                }
            }

            render(
                <Modal {...noProps}>
                    <p style={{
                        paddingTop: '20px',
                        textAlign: 'center',
                        color: '#47ABEF',
                        fontSize: '16px',
                    }}>
                        APP运营后台搬家啦，请登录班主任工作台点击IM或者群登录
                    </p>
                    <div style={{
                        textAlign: 'center',
                        padding: '50px 0 10px 0',
                    }}>
                        <Button {...linkProps}>跳转到班主任工作台</Button>
                    </div>
                </Modal>,
                document.getElementById('app')
            )

            return
        }

        // 获取url.hash中是否有online/offline
        const hash = location.hash
        const IMStateReg = /^#[\s\S]*\?\~[\s\S]*((online)|(offline))[\s\S]*/
        if(IMStateReg.test(hash)) {
            const hashWithOutParams = hash.slice(hash.indexOf('#'), hash.indexOf('?'))
            if(!hashWithOutParams.includes('online') && !hashWithOutParams.includes('offline')) {
                //确保hash值中不能包含'online'|'offline'字段，online|offline一定是在hash参数中
                let online = 0
                if(hash.includes('online')) {
                    //在线
                    online = 1
                } else if(hash.includes('offline')) {
                    //离线
                    online = 0
                }
                const userAccountPrefix = (userAccount || '').replace('@sunlands.com', '')
                document.cookie = `wsSingleStat-${userAccountPrefix}=${online}`
                const beReplacedStr = online ? 'online' : 'offline'
                // 没扩展性，暂时解决线上问题
                window.location.hash = hash.replace('?~' + beReplacedStr, '')
            }
        }

        // init page
        for (let i = 0, len = roleList.length; i < len; i++) {
            global.permissions[roleList[i].perName] = roleList[i].isHave
        }
        // 页面的加载，不仅依赖于init ajax回来，还依赖于权限ajax回来。
        require.ensure(['./router'], require => {
            require('./router')
            // 手动触发一次hash初始化
            Backbone.history.start();
        })
    }).catch((e) => {
        console.log(e, 'userinfo ajax error')
        alert(e)
    })
} else {
    const oneImTipProps = {
        title: null,
        visible: true,
        footer: null,
        closable: false,
    }

    const accessInNo = window.localStorage.getItem('accessInNo')
    const baseStyle = { textAlign: 'center', margin: '25px' }

    let style, text
    if (accessInNo >= 3) {
        style = {...baseStyle, color: '#1890ff', cursor: 'pointer'}
        text = '点击后记得手动刷新才可以正常使用~'
    } else {
        style = {...baseStyle, color: '#333'}
        text = '您已打开App运营后台tab页，不支持再次打开'
    }

    const imAccessInTipProps = {
        style,
        text,
        accessInNo,
    }

    render(
        <Modal {...oneImTipProps}>
            <ImAccessInTip {...imAccessInTipProps} />
        </Modal>,
        document.getElementById('app')
    )
}

window.$ = window.jQuery = $

$(window).on('load', function() {
    try {
        BJ_REPORT.info(new Date() + 'window load')
    } catch(e) {
        //do nothind
    }
})

//leave
window.addEventListener("beforeunload", function (e) {
    try {
        BJ_REPORT.report(new Date() + 'user leave', true)
    } catch(e) {
    }
})

try {
    BJ_REPORT.tryJs().spyAll()
} catch(e) {
    //do nothing
}

