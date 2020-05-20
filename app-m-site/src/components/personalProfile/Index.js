/*
** @personalProfile: 个人详情页
** @author: huanghaolei
** @date: 2019-08-19
*/
import React from 'react'
import { Modal, Toast } from 'antd-mobile'
import moment from 'moment'
import { Base64 } from 'js-base64'

import Truncate from '../truncate/Truncate.CommonJS'
import SlideImage from '../slideImage/slideImage'
import BottomNav from '../common/BottomNav'
import util from '../../common/util'
import { EMOTION_CN_TO_EN } from '../../common/emotion'
import global from '../../common/global'

import style from '../../styles/less/personalProfile.less'
import Constants from '../../constants/personalProfile'
import CaseHubConstats from '../../constants/caseHub'

import defaultUserIcon from '../../images/defaultUser.png'
import maleIcon from '../../images/male_profile.png'
import femaleIcon from '../../images/female_profile.png'
import vipIcon from '../../images/vip_profile.png'
import teacherIcon from '../../images/teacher_profile.png'
import collegeIcon from '../../images/college_profile.png'
import yellowStarIcon from '../../images/yellowStar.png'
import thumbChose from '../../images/thumb_chose.png'
import thumbEmpty from '../../images/thumb_empty.png'
import thumbProfile from '../../images/thumb_profile.png'
import commentsProfile from '../../images/comments_profile.png'
import noListIcon from '../../images/no-list.png'

import cfg from './cfg'

const skyNet = 'skynet'

const { slog } = util
const upperNumberOfThumb = 10000
const certainLength = 3

class PersonalProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            picScrollTop: 0,
            showModal: false,
            showSlideImage: false,
            redHeartState: 0,
            slideList: [],
            slideImageIndex: 0,
            postLike: 0,
        }
        // 事件，回调集
        this.eventSetArr = [{
            name: 'scroll',
            cb: this.handleScroll,
        }, {
            name: 'popstate',
            cb: this.handlePopState,
            target: window
        }]
    }

    componentDidMount() {
        this.setBodyScroll()
        // 环境信息
        this.getEnvInfo()
        // 绑定滚动事件
        this.toggleEvents(true, this.eventSetArr)
        // app环境下转发回调方法注入到window全局环境中
        this.setCbToWindowInApp({ name: 'setShareContent', cb: this.succeedCallbackInApp })
        // 个人基本信息
        this.getUserProfile()
        // profile帖子列表
        this.getMyPostList()
        // pv | uv
        this.staticPvUv()
    }

    componentWillUnmount() {
        // reset store
        this.resetStore()
        this.toggleEvents(false, this.eventSetArr)
    }

    getEnvInfo = _ => {
         // 环境信息注入到全局变量
         global.platformInfo = util.platformInfo()
         const { location: { query: { email263 } } } = this.props
         global.platformInfo.detailInfo.account = email263
    }

    setCbToWindowInApp = opt => {
        if (typeof JSBridge !== 'undefined') {
            const { name, cb } = opt || {}
            const funName = `${name}${new Date().getTime()}`
            // 加时间戳的回调方法挂在this上
            this.cbNameInApp = { [name]: funName }
            window[funName] = () => {
                cb()
            }
        }
    }

    getInfoFromApp = _ => {
        let res = ''
        if (typeof JSBridge !== 'undefined') {
            const { getData } = JSBridge
            if (getData) {
                const { userId = '' } = JSON.parse(JSBridge.getData('userInfo'))
                res = userId
            }
        }
        return res
    }

    staticPvUv = _ => {
        const { location: { query: { userId: userIdProfile, channel, openId, email263, share263, sharewx } } } = this.props
        const { platformInfo: { env, envName, detailInfo: { account = '' } } } = global
        const login263 = env === skyNet ? account : email263
        const slogParams = {
            profileId: Base64.decode(userIdProfile),
            channel,
            userId: this.getInfoFromApp(), // 主app，极速APP
            openId,
            login263, // from yuanbin server(员工APP，天网精灵pc客户端)
            share263,
            sharewx,
            source: envName,
        }

        setTimeout(() => {
            slog('profile_entry_page', slogParams)
        }, 500)
    }

    initShare = data => {
        const { shareInfo } = cfg
        const baseUrl = process.env.NODE_ENV === 'production' ? shareInfo.baseWxOnline : shareInfo.baseWxTest
        const { navigator: { userAgent }} = window
        const { location: { query }, routeParams: { userIdEncoded } } = this.props
        const ua = userAgent.toLowerCase()
        const shareParams = {
            ...shareInfo, baseUrl, userIdEncoded, ...query,
            content: `看看${data[shareInfo.contentKey]}在尚德的学习历程吧！`,
            imgUrl: data[shareInfo.imgKey] || shareInfo.sharedImgUrl,
        }
        // app环境
        if(typeof JSBridge !== 'undefined') {
            this.initAppShare(shareParams, data)
        }
        // 微信环境
        if (/MicroMessenger/i.test(ua)) {
            this.initWxShare(shareParams, data)
        }
    }

    initAppShare = (shareInfo, data) => {
        const { title, content, baseUrl, imgUrl, userIdEncoded, userId, email263 } = shareInfo
        JSBridge.doAction('setShareContent', JSON.stringify({
            succeedCallback: this.cbNameInApp.setShareContent,
        }), JSON.stringify({
            title,
            content,
            url: `${baseUrl}/community-pc-war/m/index.html#/personalProfile/${userIdEncoded}?userId=${userId}&channel=staffshare&share263=${email263}`,
            imgUrl,
            channel: 6,
        }))
    }

    initWxShare = (shareInfo, data) => {
        const { title, content, baseUrl, imgUrl, userIdEncoded, userId, openId } = shareInfo
        // 从url获取channel
        const { channel, share263 } = this.getHashParams()
        const cnt = {
            title, // 分享标题
            link: `${baseUrl}/community-pc-war/m/index.html#/personalProfile/${userIdEncoded}?userId=${userId}&share263=${share263}&channel=${channel}&sharewx=${openId}`,
            imgUrl, //分享者头像
            success: function () {
                this.slogForwardInWx()
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
            wx.onMenuShareAppMessage({ ...cnt, desc: content })
            // 分享到朋友圈
            wx.onMenuShareTimeline(cnt)
            
        })
        wx.error(function (res) {
            Toast.error(res)
        })
    }

    resetStore = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_RESET_PERSONAL_PROFILE_STORE,
        })
    }

    succeedCallbackInApp = _ => {
        this.slogForwardInApp()
    }

    slogForwardInApp = _ => {
        const { location: { query: { channel, email263 } }, routeParams: { userIdEncoded } } = this.props
        slog('profile_app_share', {
            profileId: userIdEncoded,
            channel,
            login263: email263, 
        })
    }

    slogForwardInWx = _ => {
        const { location: { query: { channel, openId } }, routeParams: { userIdEncoded } } = this.props
        slog('profile_wx_share', {
            profileId: userIdEncoded,
            channel,
            openId,
        })
    }

    toggleEvents = (flag, arr) => {
        arr.forEach(item => {
            const { name, cb, target = document } = item
            const action = flag ? 'addEventListener' : 'removeEventListener'
            target[action](name, cb, false)
        })
    }

    getScrollTop = _ => {
        let scroll_top = 0
        if (document.documentElement && document.documentElement.scrollTop) {
            scroll_top = document.documentElement.scrollTop
        }
        else if (document.body) {
            scroll_top = document.body.scrollTop
        }
        return scroll_top
    }

    handleScroll = _ => {
        let { personalProfile: { pageIndex } } = this.props
        // 窗口距定偏移量
        const scroll = this.getScrollTop()
        // 窗口高度
        const windowHeight = document.documentElement.clientHeight
        // 文档高度
        const docHeight = document.documentElement.scrollHeight
        // 文档底部加载更多
        if (scroll + windowHeight > docHeight * 4 / 5) {
            this.getMyPostList({ pageNo: ++pageIndex })
        }
    }

    handlePopState = e => {
        const { isTrusted } = e
        const { hash } = window.location
        // 暂时通过判断上一个，下一个页面识别
        if (isTrusted) {
            if(!hash.includes('caseHub')) {
                return
            }
            // 后退：清掉document.body.style.overflow = 'hidden'
            this.setBodyScroll()
        }
    }

    setBodyScroll = _ => {
        document.body.style.overflow = ''
    }

    getUserProfile = _ => {
        const { dispatch, routeParams: { userIdEncoded } } = this.props
        dispatch({
            type: Constants.GET_USER_PROFILE_REQUESTED,
            payload: {
                params: {
                    userId: userIdEncoded,
                },
                cb: data => {
                    const { postLike, email263 = '' } = data
                    this.setState({ postLike })
                    const ua = navigator.userAgent.toLowerCase()
                    // 微信环境下获取签名
                    if (/MicroMessenger/i.test(ua)) {
                        this.getSignatureFromWx(data)
                    }
                    // app环境
                    if (typeof JSBridge !== 'undefined') {
                        this.initShare(data)
                    }
                    // 点赞红心状态
                    if (!email263) {
                        this.getRedHeartState()
                    }
                }
            },
        })
    }

    getSignatureFromWx = res => {
        const { props: { dispatch } } = this
        const { imageUrl, nickName } = res
        let url = window.location.href
        if (url.includes('#')) {
            url = window.location.href.split('#')[0]
        }
        dispatch({
            type: CaseHubConstats.ON_GET_WX_JS_SIGN_REQUESTED,
            payload: {
                params: {
                    url: encodeURIComponent(url),
                },
                cb: data => {
                    this.initShare({...data, imageUrl, nickName})
                }
            },
        })
    }

    getRedHeartState = _ => {
        const { dispatch } = this.props
        const { platformInfo: { env, detailInfo } } = global
        const hashObj = this.getHashParams()
        const paramsKeyMap = {
            email263: 'account'
        }
        // const { env } = this.platformInfo
        dispatch({
            type: Constants.QUERY_TAG_REQUESTED,
            payload: {
                params: {
                    userId: hashObj.userId,
                    auth: detailInfo[paramsKeyMap[cfg.envKeySet[env]]], // 参数value: email263value值从detailInfo中account字段中获取
                    authType: cfg.envKeySet[env], // 参数key: email263
                },
                cb: data => {
                    const { flag } = data
                    this.toggleRedHeart(flag)
                }
            },
        })
    }

    getMyPostList = (opt = {}) => {
        const { dispatch, personalProfile: {
            countPerPage, pageIndex
        } } = this.props
        const { userId } = this.getHashParams()
        const { pageNo, pageSize } = opt
        dispatch({
            type: Constants.GET_MY_POST_LIST_REQUESTED,
            payload: {
                params: {
                    userId,
                    pageNo: pageNo || pageIndex,
                    pageSize: pageSize || countPerPage,
                },
            },
        })
    }

    toggleRedHeart = flag => {
        this.setState({ redHeartState: flag })
    }

    handleRedHeartToggle = _ => {
        const { redHeartState } = this.state
        let changedFlag = 0
        if (+redHeartState) {
            changedFlag = 0
        } else {
            changedFlag = 1
        }
        this.toggleRedHeart(changedFlag)
        // 更改红心状态
        this.updateRedHeart(changedFlag)
        // 更改红心数量
        this.toggleRedHeartNum(changedFlag)
        // 红心+1打点
        if (!+redHeartState) {
            this.slogRedHeart()
        }
    }

    slogRedHeart = _ => {
        const { location: { query: { userId: userIdOfUser, channel, openId, email263, share263, sharewx } }, routeParams: { userId } } = this.props
        const { platformInfo: { env } } = global
        // const { env } = this.platformInfo
        slog('profile_red_heart', {
            profileId: userId,
            userId: Base64.decode(userIdOfUser),
            channel,
            source: cfg.envLabelSet[env] || '其他',
            openId,
            login263: email263,
            share263,
            sharewx,
        })
    }

    toggleRedHeartNum = changedFlag => {
        const { postLike } = this.state
        const num = +changedFlag ? (+postLike + 1) : (+postLike - 1)
        this.setState({
            postLike: +num < 0 ? 0 : num
        })
    }

    getHashParams = _ => {
        const hash = window.location.hash
        const [, hashStr = ''] = hash.split('?')
        const obj = {}
        hashStr.split('&').forEach(item => {
            const [key, value] = item.split('=')
            if (key === 'userId') {
                obj[key] = Base64.decode(value)
            } else {
                obj[key] = value
            }
        })
        return obj
    }

    updateRedHeart = flag => {
        const { dispatch } = this.props
        const { platformInfo: { env } } = global
        const hashObj = this.getHashParams()
        // const { env } = this.platformInfo
        dispatch({
            type: Constants.UPDATE_TAG_INFO_REQUESTED,
            payload: {
                params: {
                    auth: hashObj[cfg.envKeySet[env]],
                    authType: cfg.envKeySet[env],
                    flag,
                    userId: hashObj.userId,
                },
                cb: () => {
                },
            },
        })
    }

    toggleModal = flag => {
        this.setState({
            showModal: flag
        })
    }

    handleModalClose = _ => {
        this.toggleModal(false)
    }

    setPicScrollTop = _ => {
        const { picScrollTop } = this.state
        this.setBodyScroll()
        document.body.scrollTop = picScrollTop
    }

    handleClkClass = _ => {
        const { personalProfile: {
            className = '', classList = []
        } } = this.props
        if (classList.length <= 1) {
            return
        }
        this.toggleModal(true)
    }

    formatCreatePostTime = time => {
        const formattedTime = moment(time).format('YYYY-MM-DD HH:mm:ss')
        let res = formattedTime
        const m = 60 // 一分钟
        const h = 60 * 60 // 一小时
        const d = 24 * 60 * 60 // 一天
        const now = new Date().getTime()
        const postTime = new Date(formattedTime).getTime()
        const delt = Math.ceil((now - postTime) / 1000) // 单位（秒）
        if (delt < m) {
            res = `${delt}秒前`
        } else if(delt >= m && delt < h) {
            res = `${ Math.ceil(delt / 60) }分钟前`
        } else if (delt >= h && delt < d) {
            res = `${ Math.ceil(delt / (60 * 60)) }小时前`
        } else if(delt >= d) {
            res = moment(res).format('YYYY-MM-DD')
        }
        const [timeDetailToDay] = res.split(' ')
        return timeDetailToDay
    }

    renderStudyList = _ => {
        const { personalProfile } = this.props
        const len = cfg.studyInfoList.length
        return cfg.studyInfoList.map((item, index) => {
            const { key, label } = item
            return (
                <div key={index} className={style.studyInoItem}>
                    <div className={style.studyLabelNum}>
                        <div className={style.studyInfoNum}>{personalProfile[key]}</div>
                        <div>{label}</div>
                    </div>
                    {
                        (+index !== len - 1) ? (
                            <div className={style.studyDivider}>|</div>
                        ) : null
                    }
                </div>
            )
        })
    }

    renderClassList = _ => {
        const { personalProfile: { classList = [] } } = this.props
        return classList.map((item, index) => {
            const { className } = item
            const itemClass = !+index ? 'newestItem' : 'normalItem'
            return (
                <div className={style.itemWrapper} key={index}>
                    {
                        !+index ? <img src={yellowStarIcon} className={style.yellowStarIcon} /> : null
                    }
                    <div className={style[itemClass]}>{className}</div>
                </div>
            )
        })
    }

    renderTeacherDepartment = _ => {
        const { personalProfile: {
            poseName = '', division = ''
        } } = this.props
        const sperator = '·'
        let res = `${division}${sperator}${poseName}`
        if (!division.length) {
            res = poseName
        }
        if (!poseName.length) {
            res = division
        }
        if (!division.length && !poseName.length) {
            res = ''
        }
        return res
    }

    renderHeader = _ => {
        const { personalProfile: {
            imageUrl, nickName, email263 = '', level, userName,
            sex, graduateSchool = '', signature = '', isVip, className = '', classList = [],
        } } = this.props
        const { redHeartState, postLike } = this.state
        // email263: 有值是老师，无值是学员
        const avatarIcon = imageUrl || defaultUserIcon
        const sexIcon = sex === 'MALE' ? maleIcon : femaleIcon
        const hasSchool = ( email263.length > 0 ) && ( graduateSchool.length > 0 )
        const tipIcon = email263.length > 0 ? teacherIcon : (
            +isVip ? vipIcon : null
        )
        const thumbIcon = +redHeartState ? thumbChose : thumbEmpty
        const classNameDom = className.length ? (
            <div className={style.classWrapper} onClick={this.handleClkClass}>
                <div className={style.class}>{className}</div>
                {
                    classList.length > 1 ? (
                        <div className={style.classMoreIcon}>></div>
                    ) : null
                }
            </div>
        ) : null
        const praiseNumber = +postLike > upperNumberOfThumb ? '9999+' : postLike
        return (
            <div className={style.headerWrapper}>
                <div className={style.headerTop}>
                    <div className={style.avatarWrapper}>
                        <img src={avatarIcon} className={style.avatar} />
                        {
                            tipIcon ? <img src={tipIcon} className={style.tipIcon} /> : null
                        }
                    </div>
                    <div className={style.basicUserInfo}>
                        <div className={style.nickNameLevel}>
                            <div className={style.nickName}>{nickName}</div>
                            <div className={style.level}>{`Lv.${level}`}</div>
                        </div>
                        <div className={style.nameSex}>
                            <div className={style.name}>{userName}</div>
                            <img className={style.sex} src={sexIcon} />
                            {
                                hasSchool ? <div className={style.school}>{`毕业于： ${graduateSchool}`}</div> : null
                            }
                        </div>
                        {
                            email263.length > 0 ? (
                                <div className={style.department}>
                                    { this.renderTeacherDepartment() }
                                </div>
                            ) : (
                                classNameDom
                            )
                        }
                        {
                            signature.length ? <div className={style.signature}>{ signature }</div> : null
                        }
                    </div>
                </div>
                {
                    email263.length > 0 ? (
                        null
                    ) : (
                        <div className={style.headerBottom}>
                            <div className={style.studyInfoWrapper}>
                                { this.renderStudyList() }
                            </div>
                            <div className={style.thumbWrapper} onClick={this.handleRedHeartToggle}>
                                <img src={thumbIcon} className={style.thumbIcon} />
                                <div className={style.thumbNumber}>{praiseNumber}</div>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }

    convertTo2DimensionalArrWithLengthOf3 = list => {
        const arr = []
        for(let i = 0; i < list.length; i += certainLength) {
            let start = i
            let end = i + certainLength
            arr.push(list.slice(start, end))
        }
        return arr
    }

    onClkImg = (list, e) => {
        const { row, col } = e.currentTarget.dataset
        this.setState({
            picScrollTop: this.getScrollTop(),
            showSlideImage: true,
            slideList: list,
            slideImageIndex: (+row) * +(certainLength) + (+col),
        })
        document.body.style.overflow = 'hidden'
    }

    generateRowImg = (list, row, slicedList) => {
        return (list || []).map((item, index) => {
            return (
                <div key={index} className={style.imgWrapperInCnt} data-row={row} data-col={index} onClick={ this.onClkImg.bind(this, slicedList) }>
                    <img src= {item} className={style.imgInCnt} />
                </div>
            )
        })
    }

    handleCloseSlideImage = () => {
        this.setState({ showSlideImage: false })
        this.setPicScrollTop()
     }

    renderRichTxtPic = list => {
        const slicedList = list.slice(0, 9)
        const arr = this.convertTo2DimensionalArrWithLengthOf3(slicedList)
        const dom = []
        arr.forEach((item, index) => {
            const rowImgStyle = item.length < certainLength ? { justifyContent: 'flex-start' } : {}
            dom.push(
                <div className={style.rowImgInCnt} style={rowImgStyle}>
                    { this.generateRowImg(item, index, slicedList) }
                </div>
            )
        })
        return dom
    }

    handleClkLongPicTxt = postId => {
        this.jumpToPostDetail(postId)
    }

    jumpToPostDetail = postId => {
        window.location.hash = `profileDetail/${postId}?fromProfile=1`
        // 点击帖子打点
        this.slogClickPosts(postId)
    }

    slogClickPosts = postId => {
        const { location: { query: { userId, channel, openId, email263, share263, sharewx } }, routeParams: { userIdEncoded } } = this.props
        const { platformInfo: { env } } = global
        // const { env } = this.platformInfo
        slog('profile_click_profilePosts', {
            profileId: userIdEncoded,
            channel,
            postId,
            source: cfg.envLabelSet[env] || '其他',
            userId: Base64.decode(userId),
            openId,
            login263: email263,
            share263,
            sharewx,
        })    
    }

    transTxtToEmotion = content => {
        let cnt = content
        const reg = /\[[^\[\]]*\]/
        const regGlobal = /\[[^\[\]]*\]/g
        const newEmotionArr = []
        // [撒花]格式表情处理
        if (reg.test(content)) {
            const matchedEmotionArr = [...cnt.match(regGlobal)]
            matchedEmotionArr.forEach(item => {
                const txt = item.slice(1, -1)
                const replacedCnt = EMOTION_CN_TO_EN[txt] ? `<img class=${style.emotionStyle} src="./images/emotion/${EMOTION_CN_TO_EN[txt]}.png" alt="emotion_pic">` : null
                newEmotionArr.push(replacedCnt)
            })
            matchedEmotionArr.forEach((item, index) => {
                if (newEmotionArr[index]) {
                    cnt = cnt.replace(item, newEmotionArr[index])
                }
            })
        }
        return cnt
    }

    formatContent = content => {
        return this.transTxtToEmotion(content)
    }

    renderItemContent = (opt, idx) => {
        const { hasRichText, content, postLinkList = [], styleType, title, postMasterId } = opt || {}
        let cnt = content
        let dom = (
            <div>
                <div onClick={this.jumpToPostDetail.bind(this, postMasterId)}>
                    {
                        cnt ? (
                            <Truncate lines={5} ellipsis={<span>...<div><div className={style.cntAllIncnt}>全部</div></div></span>}>
                                <div dangerouslySetInnerHTML={{ __html: cnt }}></div>
                            </Truncate> 
                        ) : null
                    }
                </div>
                <div className={style.imgRootInCnt}>
                    { this.renderRichTxtPic(postLinkList) }
                </div>
            </div>
        )
        // 富文本
        if (+hasRichText) {
            if (!+styleType) {
                // // 富文本
                // dom = (
                //     <div>
                //         <div onClick={this.jumpToPostDetail.bind(this, postMasterId)}>
                //             {
                //                 cnt ? (
                //                     <Truncate lines={5} ellipsis={<span>...<div><div className={style.cntAllIncnt}>全部</div></div></span>}>
                //                         <div dangerouslySetInnerHTML={{ __html: cnt }}></div>
                //                     </Truncate> 
                //                 ) : null
                //             }
                //         </div>
                //         <div className={style.imgRootInCnt}>
                //             { this.renderRichTxtPic(postLinkList) }
                //         </div>
                //     </div>
                // )
            } else if(+styleType === 2) {
                const [coverPic] = postLinkList
                // 长图文
                dom= (
                    <div className={style.longPicTxtWrapper} onClick={this.handleClkLongPicTxt.bind(this, postMasterId)}>
                        <img src={coverPic} className={style.coverPic} />
                        <div className={style.longPicTxt}>
                            { title }
                        </div>
                    </div>
                )
            }
            
        }
        return (
            <div>
                { dom }
            </div>
        )
    }

    renderPostList = _ => {
        const { personalProfile: { postList, imageUrl, nickName, level, collegeName, email263 = '', isVip } } = this.props

        const avatarIcon = imageUrl || defaultUserIcon
        const tipIcon = email263.length > 0 ? teacherIcon : (
            +isVip ? vipIcon : null
        )
        // 空列表
        if (!postList.length) {
            return (
                <div className={style.emptyListWrapper}>
                    <img src={noListIcon} className={style.noListImg} />
                    <div className={style.noListText}>{cfg.noListTxt}</div>
                </div>
            )
        }
        return postList.map((item, index) => {
            const { title, replyCount, praiseCount, createTime, postMasterId } = item
            return (
                <div key={index} className={style.itmCntWrapper}>
                    <div className={style.profileWrapperInCnt}>
                        <div className={style.avatarWrapperInCnt}>
                            <img src={avatarIcon} className={style.avatarInCnt} />
                            {
                                tipIcon ? <img src={tipIcon} className={style.tipIcon} /> : null
                            }
                        </div>
                        <div className={style.profileInRight}>
                            <div className={style.nickNameSexInCnt}>
                                <div className={style.nameInCnt}>{nickName}</div>
                                <div className={style.levelInCnt}>{`Lv.${level}`}</div>
                            </div>
                            <div className={style.academyInCnt}>{collegeName}</div>
                        </div>
                    </div>
                    <div className={style.content}>{ this.renderItemContent(item, index) }</div>
                    <div className={style.cntBottom}>
                        <img src={commentsProfile} className={style.commentsProfile} onClick={this.jumpToPostDetail.bind(this, postMasterId)} /> 
                        <div className={style.replyCount} onClick={this.jumpToPostDetail.bind(this, postMasterId)}>{replyCount}</div>
                        <img src={thumbProfile} className={style.thumbProfile} onClick={this.jumpToPostDetail.bind(this, postMasterId)} /> 
                        <div className={style.praiseCount} onClick={this.jumpToPostDetail.bind(this, postMasterId)}>{praiseCount}</div>
                        <div className={style.createTimeInCnt}>
                            { this.formatCreatePostTime(createTime) }
                        </div>
                    </div>
                </div>
            )
        })
    }

    renderBody = _ => {
        return (
            <div className={style.bodyWrapper}>
                <div className={style.bodyTitle}>TA的帖子</div>
                <div>
                    { this.renderPostList() }
                </div>
            </div>
        )
    }

    render() {
        const { platformInfo: { env }, sideEffect: { homeHash } } = global
        const { dispatch } = this.props
        const { showModal, showSlideImage, slideList = [], slideImageIndex } = this.state
        const modalProps = {
            visible: true,
            transparent: true,
            closable: false,
            onClose: this.handleModalClose,
        }
        const slideImageProps = {
            useNewApi: true,
            imagesArray: slideList,
            imgIndex: slideImageIndex + 1, // 图片索引 + 1
            onClose: this.handleCloseSlideImage,
        }
        const bottomNavProps = {
            dispatch,
            homeHash,
            env,
            useForward: false,
        }
        return (
            <div className={style.wrapper}>
                <div className={style.headerWrapperRoot}>{ this.renderHeader() }</div>
                <div className={style.bodyRoot}>{ this.renderBody() }</div>
                {
                    showModal ? (
                        <Modal {...modalProps}>
                            <div className={style.modalTitle}>我的学院</div>
                            <img src={collegeIcon} className={style.collegeIcon} />
                            {
                                this.renderClassList()
                            }
                        </Modal>
                    ) : null
                }
                {
                    showSlideImage ? <SlideImage {...slideImageProps} /> : null
                }
                {
                    env === skyNet ? (
                        <div className={style.bottomNavWrapper}>
                            <BottomNav {...bottomNavProps} />
                        </div>
                    ) : null
                }
            </div>
        )
    }
}

export default PersonalProfile