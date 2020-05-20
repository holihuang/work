/*
** @file: CaseHub-UI-Component
** @author: huanghaolei
** @date: 2019-05-20
*/
import React from 'react'
import { Button, Toast } from 'antd-mobile'
import moment from 'moment'
import { Base64 } from 'js-base64'
import isEmpty from 'lodash/isEmpty'
import global from '../../common/global'
import style from '../../styles/less/caseHub.less'
import util from '../../common/util'
import { EMOTION_CN_TO_EN } from '../../common/emotion'

import Constants from '../../constants/caseHub.js'
import UserBanner from '../../images/userBanner.jpg'
import UsrBannerBlue from '../../images/usrBannerBlue.jpg'
import FEMALE from '../../images/female.png'
import MALE from '../../images/male.png'
import userVipIconURL from '../../images/userVip.png'
import employeeIconUrl from '../../images/employee.png'
import DEFAULT_AVATAR from '../../images/default.png'
import BottomNav from '../common/BottomNav'

const { slog } = util
const studyInfoArr = [{
    key: 'attendTime',
    label: '课时',
}, {
    key: 'questionCount',
    label: '做题',
}, {
    key: 'postAmount',
    label: '发帖',
}, {
    key: 'medalCount',
    label: '勋章',
}, {
    key: 'passedSubjectNum',
    label: '通过科目',
}]
// 做题数,通过科目数显示策略处理
const conditionItmArr = [{ key: 'questionCount', upper: 1000 }, { key: 'passedSubjectNum', upper: 2 }]
// 学院-班级信息， 格式：学院-专业-考期-班级（后期格式）
const classInfoArr = [{ key: 'collegeName', label: '学院' }, { key: 'className', label: '班级', show: false }]

// bottom 按钮组
const operBtnGpArr = [{
    key: 'unlike',
    label: '不喜欢',
    style: {
    },
    className: style.unlikeBtnStyle,
    activeClass: style.unlikeBtnStyleActive,
}, {
    key: 'like',
    label: '喜欢',
    style: {
    },
    className: style.likeBtnStyle,
    activeClass: style.likeBtnStyleActive,
}]

const deviceSouceSet = {
    sunlandapp: '主版app',
    liteapp: '极速版app',
    wx: '微信',
}
const SkynetPc = 'skynet'
const search = {}

let inWx = false
let inAndroid = false

const sharedImgUrl = 'http://store.sunlands.com/common/logo-sunlands.jpg'
const sharedCnt = '学习是一种信仰'
const baseWxTest = 'http://wxtest.ministudy.com'
const baseWxOnline = 'http://wx.sunlands.com'

const baseUrl = process.env.NODE_ENV === 'production' ? baseWxOnline : baseWxTest
class CaseHub extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            clickedBtnIdx: -1,
        }
        // this.useInfo = {}
        this.pageInfo = {}
        this.deviceInfo = {}
    }

    componentDidMount() {
        // 清除body overflow hidden
        this.setBodyScroll()
        // global slog
        this.setGlobalSlog()
        // set background color
        this.changeBackgroundColor('#fff')
        // 环境监测
        this.checkEnv()
        this.init()
    }

    init = _ => {
        if (window.JSBridge) {
            this.showShare()
        }
        // static:pv|uv
        setTimeout(this.staticPvUv, 500)
        // 上滑
        this.swipeUp()
        // app环境下转发回调方法注入到window全局环境中
        this.setCbToWindowInApp({ name: 'setShareContent', cb: this.succeedCallbackInApp })
        // 设置员工APP分享成功回调
        this.setShareSuccessCbInEmpApp()
    }

    setBodyScroll = _ => {
        global.setBodyScroll()
    }

    setCbToWindowInApp = opt => {
        if (typeof JSBridge !== 'undefined') {
            const { name, cb } = opt || {}
            const funName = `${name}${new Date().getTime()}`
            // 加时间戳的回调方法挂在this上
            this.cbNameInApp = { [name]: funName }
            window[funName] = function () {
                cb()
            }
        }
    }

    setShareSuccessCbInEmpApp = _ => {
        // 检测员工APP环境
        const { platformInfo: { env } } = global
        if (typeof JSBridge !== 'undefined') {
            // const { app } = this.deviceInfo
            if (env === 'empapp') {
                JSBridge.shareComplete = status => {
                    if (+status === 1) {
                        this.succeedCallbackInApp()
                    }
                }
            }
        }
    }

    addWeiXinReadcord = _ => {
        // 获取url参数
        this.getHashParams()
        const { id, ticket, channel, share263 = '' } = search
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_ADD_WEIXIN_READ_CORD_REQUESTED,
            payload: {
                params: {
                    id,
                    ticket,
                    channel,
                    share263,
                    eventType: 1,
                },
            },
        })
    }

    setGlobalSlog = _ => {
        if (window.slog) {
            window.globalSlog = window.slog.dot
        }
    }

    changeBackgroundColor = (color = '#f2f2f2') => {
        document.documentElement.style.backgroundColor = color
    }

    checkEnv = _ => {

        this.getEnvInfo()

        // 三种场景：app，wechat，web
        const { props: { dispatch } } = this
        const { navigator: { userAgent } } = window
        const ua = userAgent.toLowerCase()
        if (/MicroMessenger/i.test(ua)) {
            inWx = true
        }
        if (/android/i.test(ua)) {
            inAndroid = true
        }
        if (inWx) {
            // 获取url参数
            this.getHashParams()
            const { location: { href } } = window
            if (!search.ticket) {
                // 无ticket
                // needAuth: 1 == 弹窗授权
                this.getWxTicket({ needChekUrl: href, needAuth: 1 })
            } else {
                // 有ticket
                // 获取帖子内容
                this.getGoodPostContent()
                // 微信访问记录
                this.addWeiXinReadcord()
            }
        } else {
            // 获取帖子内容
            this.getGoodPostContent()
        }
    }

    getWxTicket = params => {
        const { dispatch } = this.props
        // get loginUrl
        dispatch({
            type: Constants.GET_WX_LOGIN_URL_REQUESTED,
            payload: {
                params,
                cb: (...args) => {
                    const [wxLoginUrl = ''] = args
                    window.location.href = wxLoginUrl
                },
            },
        })
    }

    getEnvInfo = _ => {
        // 环境信息注入到全局变量
        global.platformInfo = util.platformInfo()
        const { location: { query: { login263 = '' } } } = this.props
        global.platformInfo.detailInfo.account = login263
    }

    setTitle = _ => {
        const title = '学员故事'
        JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
            title,
        }))
    }

    showShare = _ => {
        JSBridge.doAction('showShareButton', JSON.stringify({}), JSON.stringify({}))
    }

    succeedCallbackInApp = _ => {
        this.getHashParams()
        const { id, login263 } = search
        const globalSlog = slog ? slog : globalSlog
        globalSlog('site_share_operation', { caseid: id, login263 })
        // app转发记录数接口
        this.updateForwardCnt({ id })
    }

    updateForwardCnt = opt => {
        const { id } = opt || {}
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_UPDATE_FORWARD_CNT_REQUESTED,
            payload: {
                params: {
                    id
                },
            },
        })
    }

    setShare = data => {
        if (typeof JSBridge === 'undefined') {
            return
        }
        const { platformInfo: { env } } = global
        this.getHashParams()
        // 微信分享区分主APP（极速app）和员工APP
        // const { app } = this.deviceInfo
        let actionCbName = JSON.stringify({
            succeedCallback: this.cbNameInApp.setShareContent,
        })
        if (env === 'empapp') {
            actionCbName = '{}'
        }
        const { id, login263 } = search
        const { title = '' } = data
        JSBridge.doAction('setShareContent', actionCbName, JSON.stringify({
            title,
            content: sharedCnt,
            url: `${baseUrl}/community-pc-war/m/index.html#/caseHub?id=${id}&channel=staffshare&share263=${login263}&storyversion=2`, // storyversion:学员故事2.0迭代标志字段
            imgUrl: sharedImgUrl,
            // channel: 6,
        }))
    }

    getUrlParams = _ => {
        const { location: { href = '' } } = window
        if (href.includes('?')) {
            const [, paramsStr = ''] = href.split('?')
            let paramsArr = []
            if (paramsStr.includes('&')) {
                paramsArr = paramsStr.split('&')
            }
            paramsArr.forEach(item => {
                const itm = item || ''
                if (itm.includes('=')) {
                    const [key, value] = item.split('=')
                    search[key] = value
                }
            })
        }
    }

    getHashParams = _ => {
        const { location: { hash } } = window
        const [, hashParams] = hash.split('?')
        const arr = hashParams.split('&')
        arr.forEach(item => {
            const [key = '', value = ''] = item.split('=')
            search[key] = value
        })
    }

    getSignatureFromWx = res => {
        const { title } = res
        const { props: { dispatch } } = this
        let url = window.location.href
        if (url.includes('#')) {
            url = window.location.href.split('#')[0]
        }
        dispatch({
            type: Constants.ON_GET_WX_JS_SIGN_REQUESTED,
            payload: {
                params: {
                    url: encodeURIComponent(url),
                },
                cb: data => {
                    this.getInfoFromWx().then(opt => {
                        this.initWXSignature(data, title, opt)
                    })
                }
            },
        })
    }

    initWXSignature = (...args) => {
        const [data, title, opt = {}] = args
        // 微信转发的263替换员工app转发的263
        const { employ263 = '' } = opt
        this.getHashParams()
        const { id, login263, channel, share263 = '' } = search
        const { openId } = this.getSlogParams()
        const content = {
            title, // 分享标题
            link: `${baseUrl}/community-pc-war/m/index.html#/caseHub?id=${id}&channel=${channel}&share263=${employ263 || share263}&sharewx=${openId}&storyversion=2`, // storyversion:学员故事2.0迭代标志字段
            imgUrl: sharedImgUrl, // 分享图标
            success: function () {
                // 设置成功
                const globalSlog = slog ? slog : globalSlog
                globalSlog('site_wx_share', { caseid: id, channel, openId })
            },
        }
        // js sdk加载是否加载完
        if (!window.wx) {
            return
        }
        wx.config({
            // debug: true,
            appId: '',
            timestamp: '',
            nonceStr: '',
            signature: '',
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'],
            ...data,
        })
        wx.ready(function () {
            // 分享给朋友
            wx.onMenuShareAppMessage({ ...content, desc: sharedCnt })
            // 分享到朋友圈
            wx.onMenuShareTimeline(content)

        })
        wx.error(function (res) {
            Toast.error(res)
        })
    }

    getInfoFromWx = _ => {
        return new Promise((resolve, reject) => {
            const { props: { dispatch } } = this
            // 获取url里面的参数
            this.getHashParams()
            const { ticket } = search
            dispatch({
                type: Constants.GET_USER_INFO_IN_WECHAT_REQUESTED,
                payload: {
                    params: {
                        ticket,
                    },
                    cb: (data) => {
                        resolve(data)
                    },
                },
            })
        })
    }

    staticPvUv = _ => {
        const { platformInfo: { env, envName, detailInfo: { account } } } = global
        let params = this.getSlogParams()
        if (env === SkynetPc) {
            //天网精灵pc客户端
            params = { ...params, login263: account }
        }
        slog('site_entry_page', { ...params, source: envName })
    }

    swipeUp = _ => {

        const params = this.getSlogParams()

        let startX, startY, moveEndX, moveEndY, X, Y
        const body = document.getElementsByTagName('body')[0]
        body.addEventListener('touchstart', e => {
            // e.preventDefault()
            startX = e.touches[0].pageX
            startY = e.touches[0].pageY
        }, { passive: false })
        body.addEventListener('touchmove', e => {
            // e.preventDefault()
            moveEndX = e.changedTouches[0].pageX
            moveEndY = e.changedTouches[0].pageY
            X = moveEndX - startX
            Y = moveEndY - startY
            if (Math.abs(Y) > Math.abs(X) && Y < 0) {
                slog('site_scroll_up', { ...params, time: moment().format('YYYY-MM-DD HH:mm') })
            }
        }, { passive: false })
    }

    componentWillUnmount() {
        const body = document.getElementsByTagName('body')[0]
        body.removeEventListener('touchstart', e => { })
        body.removeEventListener('touchmove', e => { })
        this.changeBackgroundColor()
        this.clearPageData()
    }

    clearPageData = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_CLEAR_CONTENT_DATA,
            payload: {},
        })
    }

    getGoodPostContent = _ => {
        const { dispatch } = this.props
        // getParams
        const href = window.location.href
        if (inAndroid) {
            // http://xxx?xxx#/caseHub?id=3
            this.getHashParams()
        } else {
            // 参数格式"http:xxx?id=1&channel=3"
            this.getHashParams()
        }
        let { id = -1, channel = -1 } = search
        if (+id === -1) {
            this.getHashParams()
        }
        id = search.id || -1
        channel = search.channel || -1
        if (id) {
            dispatch({
                type: Constants.GET_GOOD_POST_CONTENT_REQUESTED,
                payload: {
                    params: {
                        id
                    },
                    cb: (data) => {
                        // 使用title字段初始化app分享卡片
                        if (window.JSBridge) {
                            this.setShare(data)
                        }
                        // 使用title字段初始化微信分享卡片
                        if(inWx) {
                            this.getSignatureFromWx(data)
                        }
                    },
                },
            })
        } else {
            console.warn('获取案例id失败')
        }
        // 案例id || 渠道id
        this.pageInfo.caseId = id
        this.pageInfo.channelId = channel
    }

    toPersonalProfile = _ => {
        // 从 app | 微信 | url 获取打点数据信息
        const { userId, openId, login263 } = this.getSlogParams()
        // stuId是后端返回的明文userId
        const { caseHub: { userId: userIdEncoded, stuId } } = this.props
        const userIdTemp = Base64.encode(stuId)
        window.location.hash = `personalProfile/${userIdEncoded}?userId=${userIdTemp}&openId=${openId}&email263=${login263}`
    }

    renderClassInfo = _ => {
        const { props: { caseHub } } = this
        const showedArr = classInfoArr.filter(item => {
            const { show = true } = item
            return show
        })
        const classInfoStr = showedArr.reduce((res, item) => {
            const { key } = item
            return res += `${caseHub[key] || ''}-`
        }, '')
        return classInfoStr.slice(0, -1)
    }

    renderUserBasicInfo = _ => {
        const { caseHub: {
            nickName = '', level, levelName = '', signature = '', imageUrl = '', sex = 'MALE', isVip = 0, email263 = ''
        } } = this.props
        const sexSrc = sex === 'MALE' ? MALE : FEMALE
        const baseStyle = {
        }
        const imgStyle = {
            borderRadius: '50%',
        }
        const shadowStyle = {
        }
        const imgGpStyle = {
        }
        const identityIconStyle = {
        }
        const infoStyle = {
        }
        const nickNameStyle = {
            color: '#fff',
        }
        const levelStyle = {
        }
        const sexSrcStyle = {
        }
        const classInfoStyle = {
        }
        const signatureStyle = {
        }
        return (
            <div style={baseStyle} className={style.baseStyle}>
                <div style={{ position: 'relative' }}>
                    <div style={shadowStyle} className={style.shadowStyle}></div>
                    <div style={imgGpStyle} className={style.imgGpStyle}>
                        <img src={imageUrl.length ? imageUrl : DEFAULT_AVATAR} style={imgStyle} className={style.avtaImg} onClick={this.toPersonalProfile} />
                        {
                            email263 ? (
                                <img src={employeeIconUrl} style={identityIconStyle} className={style.identityIconStyle} />
                            ) : (
                                    isVip ? (
                                        <img src={userVipIconURL} className={style.identityIconStyle} />
                                    ) : null
                                )
                        }
                    </div>
                </div>
                <div style={infoStyle} className={style.infoStyle}>
                    <div>
                        <span style={nickNameStyle} className={style.nickNameStyle}>{nickName}</span>
                        <span style={levelStyle} className={style.levelStyle}>{`LV.${level}`}</span>
                        <img style={sexSrcStyle} className={style.sexSrcStyle} src={sexSrc} />
                    </div>
                    <div style={classInfoStyle} className={style.classInfoStyle}>{this.renderClassInfo()}</div>
                    <div style={signatureStyle} className={style.classInfoStyle}>{signature}</div>
                </div>
            </div>
        )
    }

    dealWithPartKey = (...args) => {
        const [arr, props] = args
        const list = [...arr]
        const obj = {}
        list.forEach((item, index) => {
            const { key, label } = item
            obj[key] = { ...item, index }
        })
        const beDeletedIndexArr = []
        conditionItmArr.forEach(item => {
            const { key, upper } = item
            const { index } = obj[key]
            if (props[key] < upper) {
                beDeletedIndexArr.push(index)
            }
        })
        beDeletedIndexArr.forEach((item, index) => {
            const i = item - index
            list.splice(i, 1)
        })
        return list
    }

    renderStudyInfo = _ => {
        const props = this.props.caseHub || {}
        // 做题数,通过科目数显示策略处理
        const list = this.dealWithPartKey(studyInfoArr, props)
        return list.map(item => {
            const { key, label } = item
            const keyProps = {
                style: {
                },
                className: style.studyItmStyle,
            }
            const labelProps = {
                style: {
                },
                className: style.studyLabelStyle,
            }
            return (
                <div>
                    <div {...keyProps}>{props[key]}</div>
                    <div {...labelProps}>{label}</div>
                </div>
            )
        })
    }

    getSlogParams = _ => {
        const { caseHub: { userInfoInWx = {} } } = this.props
        const { platformInfo: { env, detailInfo = {} } } = global
        const { userId, openId = '' } = env === 'wx' ? userInfoInWx : detailInfo
        // const { userId, openId } = isEmpty(this.useInfo) ? userInfoInWx : this.useInfo
        const { caseId, channelId } = this.pageInfo
        this.getHashParams()
        const { login263 = '', share263 = '', sharewx = '' } = search
        return {
            userId,
            openId,
            caseId,
            channelId,
            login263,
            share263,
            sharewx,
        }
    }

    transImgToAttr(...args) {
        const [imgStr, matchTag = 'pic'] = args
        const srcAttrReg = matchTag === 'pic' ? /^src=('|")?http/ : /^src=('|")?\.\/images/
        const tailTagReg = /\s?\/?>$/
        const tailTag = ' />'
        let isExtenalPicTag = false
        let isEmotionTag = false
        let srcAttr = ''
        const str = imgStr.replace(tailTagReg, tailTag)
        str.split(' ').forEach(item => {
            if (srcAttrReg.test(item)) {
                srcAttr = item
                if (matchTag === 'pic') {
                    // 外链图片
                    isExtenalPicTag = true
                } else if (matchTag === 'emotion') {
                    isEmotionTag = true
                }
            }
        })
        return {
            isExtenalPicTag,
            isEmotionTag,
            itm: str,
            srcAttr,
        }
    }

    addClass = itm => {
        const tailTagReg = /\s?\/?>$/
        const tailTag = ' />'
        const str = itm.replace(tailTagReg, tailTag)
        const arr = str.split(' ')
        arr.splice(1, 0, `class="${style.emotionStyle}"`)
        return arr.reduce((res, item) => {
            return res += ` ${item}`
        }, '')
    }

    resolveRichTxt = content => {
        let cnt = decodeURIComponent(content)
        // 表情包替换
        const reg = /\[[^\[\]]*\]/
        const regGlobal = /\[[^\[\]]*\]/g
        const newEmotionArr = []
        // [撒花]格式表情处理
        if (reg.test(cnt)) {
            const matchedEmotionArr = [...cnt.match(regGlobal)]
            matchedEmotionArr.forEach(item => {
                const txt = item.slice(1, -1)
                const replacedCnt = EMOTION_CN_TO_EN[txt] ? `<img class=${style.emotionStyle} src="./images/emotion/${EMOTION_CN_TO_EN[txt]}.png" alt="emotion_pic">` : null
                newEmotionArr.push(replacedCnt)
            })
            matchedEmotionArr.forEach((item, index) => {
                // tip: 被替换的表情包存在才允许替换操作
                if (newEmotionArr[index]) {
                    cnt = cnt.replace(item, newEmotionArr[index])
                }
            })
        }
        // <img xx src="./images/emotion/">格式表情处理
        const imgClassReg = /<img[^<>]*>/
        const imgClassRegGlobal = /<img[^<>]*>/g
        const emotionArr = []
        const emotionWithClassArr = []
        if (imgClassReg.test(cnt)) {
            const matchedImgClass = [...cnt.match(imgClassRegGlobal)]
            matchedImgClass.forEach(item => {
                const { isEmotionTag } = this.transImgToAttr(item, 'emotion')
                if (isEmotionTag) {
                    // 表情加class
                    const itm = this.addClass(item)
                    emotionArr.push(item)
                    emotionWithClassArr.push(itm)
                }
            })
            emotionArr.forEach((item, index) => {
                cnt = cnt.replace(item, emotionWithClassArr[index])
            })
        }
        return cnt
    }

    handleClkPreferenceBtn = (...args) => {
        const [label] = args
        const commonParams = this.getSlogParams()
        const params = {
            state: label,
            ...commonParams,
        }
        this.setState({
            clickedBtnIdx: label === '不喜欢' ? 0 : 1
        }, () => {
            slog('site_clicked_preference', params)
        })
    }

    rendeOperBtnGp = _ => {
        const { clickedBtnIdx = -1 } = this.state
        return operBtnGpArr.map((item, index) => {
            const { style, className, activeClass, key, label } = item
            const btnProps = {
                style,
                className: clickedBtnIdx === index ? activeClass : className,
                onClick: () => {
                    this.handleClkPreferenceBtn(label)
                },
            }
            return (
                <Button {...btnProps}>{label}</Button>
            )
        })
    }

    render() {
        const { caseHub: { content, email263 = '', title }, dispatch, location: { query } } = this.props
        const { platformInfo: { env }, sideEffect: { homeHash, previousHash } } = global
        const wrapperProps = {
            style: {
                backgroundColor: '#fff',
            },
            className: style.wrapperStyle,
        }
        const titleProps = {
            style: {
                position: 'relative',
            },
        }
        const basicProps = {
            style: {
                backgroundImage: `url(${UsrBannerBlue})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
            },
            className: style.basicInfoStyle,
        }
        const studyProps = {
            style: {
            },
            className: style.studyStyle,
        }
        const bodyProps = {
            className: email263 ? style.bodyStyle : style.bodyStyleWithStudyInfo,
        }
        const contentProps = {
            className: style.richTxtStyle,
            dangerouslySetInnerHTML: {
                __html: this.resolveRichTxt(content),
            },
        }
        const operBtnGpProps = {
            style: {
            },
            className: style.operBtnGpStyle,
        }
        const bottomNavProps = {
            dispatch,
            homeHash,
            title,
            query,
            fields: 'case',
            env,
        }
        return (
            <div {...wrapperProps}>
                <div {...titleProps}>
                    <div {...basicProps}>
                        {
                            this.renderUserBasicInfo()
                        }
                    </div>
                    {
                        !email263 ? (
                            <div {...studyProps}>
                                {
                                    this.renderStudyInfo()
                                }
                            </div>
                        ) : null
                    }
                </div>
                <div {...bodyProps}>
                    <div {...contentProps}></div>
                    <div {...operBtnGpProps}>
                        {
                            this.rendeOperBtnGp()
                        }
                    </div>
                </div>
                <BottomNav {...bottomNavProps} />
            </div>
        )
    }
}

export default CaseHub