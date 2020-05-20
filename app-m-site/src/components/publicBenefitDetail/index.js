/*
** @personalProfile: 公益活动首页
** @author: fxr
** @date: 2019-12-20
*/

import React from 'react'
import { hashHistory } from 'react-router'

import { GET_PROJECT_DETAIL_REQUESTED, DONATE_KINDNESS_REQUESTED } from 'Constants/publicBenefit.js'

import util from '../../common/util'
import { EMOTION_CN_TO_EN } from '../../common/emotion'

import styles from '../../styles/less/publicBenefitList.less'

import caseListPic from '../../images/publicBenefit/icon-detail-pic-1.jpg'

const { slog, getHashParams } = util

const isApp = navigator.userAgent.indexOf('sunland') !== -1
const ua = navigator.userAgent

let isPreload = false
let userId = ''

class PublicBenefitDetail extends React.Component {

    state = {
        donateVisible: false,
        kindnessCount: 5,
    }

    componentDidMount() {
        const opt = getHashParams()
        if (opt.isPreload) {
            isPreload = opt.isPreload
        }
        this.getProjectDetail()
        setTimeout(() => {
            slog('welfare_detailspage', {})
        }, 1000)
    }

    
    getJSBridgeInfo = () => {
        if (isApp) {
            if (typeof JSBridge == 'undefined') {
                // 老版本app，不能使用 JSBridge
            } else {
                // 新版本app，能够使用 JSBridge
                // 判断是哪个设备
                const isAndroid = ua.indexOf('android') !== -1
                const isIos = ua.indexOf('ios') !== -1
                const channelSource = isAndroid ? 'CS_APP_ANDROID' : (isIos ? 'CS_APP_IOS' : '')
                const userInfo = JSON.parse(JSBridge.getData('userInfo'))
                const { userAuth, userId: brigeUserId } = userInfo
                userId = brigeUserId
                return {
                    userAuth,
                    channelSource,
                }
            }
        }
    }

    getProjectDetail = () => {
        const {
            dispatch,
            params: {
                projectNo = '',
            },
        } = this.props
        dispatch({
            type: GET_PROJECT_DETAIL_REQUESTED,
            payload: {
                params: {
                    projectNo,
                },
            },
        })
    }

    handelStopPropagation = e => {
        if ( e && e.stopPropagation ) {
            e.stopPropagation()
            e.preventDefault()
        } else {
            window.event.cancelBubble = true;
        }
    }

    handleDonate = () => {
        this.setState({ donateVisible: true })
        slog('pre_dominate', {})
    }

    handleDonateClose = () => {
        this.setState({ donateVisible: false })
    }

    handleCountMinus = () => {
        const { kindnessCount }  = this.state
        if (kindnessCount > 5) {
            this.setState({ kindnessCount: kindnessCount - 5 })
        }
    }

    handleCountAdd = () => {
        const { kindnessCount }  = this.state
        this.setState({ kindnessCount: kindnessCount + 5 })
    }

    handleExchange = () => {
        const { kindnessCount } = this.state
        const {
            dispatch,
            params: {
                projectNo,
            }
        } = this.props
        const {
            userAuth = '',
        } = this.getJSBridgeInfo() || {}
        dispatch({
            type: DONATE_KINDNESS_REQUESTED,
            payload: {
                params: {
                    userAuth,
                    kindnessCount,
                    projectNo,
                },
                cb: () => {
                    window.location.reload()
                    // this.getProjectDetail()
                }
            },
        })
        slog('dominating', { userId })
    }

    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = caseListPic
    }

    addClass = itm => {
        const tailTagReg = /\s?\/?>$/
        const tailTag = ' />'
        const str = itm.replace(tailTagReg, tailTag)
        const arr = str.split(' ')
        arr.splice(1, 0, `class="${styles.emotionStyle}"`)
        return arr.reduce((res, item) => {
            return res += ` ${item}`
        }, '')
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

    resolveRichTxt = (content = '') => {
        let cnt = content.includes('<') ? content : decodeURIComponent(content)
        // 表情包替换
        const reg = /\[[^\[\]]*\]/
        const regGlobal = /\[[^\[\]]*\]/g
        const newEmotionArr = []
        // [撒花]格式表情处理
        if (reg.test(cnt)) {
            const matchedEmotionArr = [...cnt.match(regGlobal)]
            matchedEmotionArr.forEach(item => {
                const txt = item.slice(1, -1)
                const replacedCnt = EMOTION_CN_TO_EN[txt] ? `<img class=${styles.emotionStyle} src="./images/emotion/${EMOTION_CN_TO_EN[txt]}.png" alt="emotion_pic">` : null
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

    render() {
        const { donateVisible, kindnessCount } = this.state
        const { publicBenefit } = this.props
        const {
            projectDetailInfo: {
                title,
                coverImageUrl,
                content,
                targetKindnessCount,
                donatedKindnessCount,
                completeStatus,
            }
        } = publicBenefit
        const proRate = (donatedKindnessCount/targetKindnessCount) * 100
        const contentProps = {
            dangerouslySetInnerHTML: {
                __html: this.resolveRichTxt(content),
            },
        }
        return (
            <div className={styles.benefitDetailWrapper}>
                <div className={styles.benefitDetailTop}>
                    <img src={coverImageUrl || caseListPic} alt="" className={styles.detailPic} onError={e =>this.checkAvatarError(e)} />
                    <div className={styles.detailPicPop} />
                    {!isPreload && (completeStatus === 1 ? <div className={styles.iconComplete} /> : null)}
                    <div className={styles.detailTitle}>{title}</div>
                    {!isPreload &&
                    <div className={styles.detailProcess}>
                        <div className={styles.proGray}>
                            <div className={styles.proRed} style={{ width: `${proRate}%` }}/>
                        </div>
                        <div className={styles.detailCount}>
                            <div>
                                <div>已获得爱心</div>
                                <div className={styles.detailNum}>{donatedKindnessCount}</div>
                            </div>
                            <div>
                                <div>目标爱心</div>
                                <div className={styles.detailNum}>{targetKindnessCount}</div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
                <div className={styles.benefitDetailContent} {...contentProps} />
                {!isPreload &&
                <div
                    className={completeStatus === 1 ? styles.iconThanks : styles.iconExchange}
                    onClick={completeStatus === 1 ? null : this.handleDonate}
                />}
                {donateVisible &&
                <div className={styles.popMask} onClick={this.handleDonateClose} >
                    <div className={styles.popContent} onClick={this.handelStopPropagation}>
                        <div className={styles.exChangeTitle}>捐献爱心数量</div>
                        <div className={styles.exChangeTips}>5颗起捐</div>
                        <div className={styles.exChangeMain}>
                            <span className={styles.exChangeBtnSub} onClick={this.handleCountMinus} />
                            <span className={styles.exChangeInput}>{kindnessCount}</span>
                            <span className={styles.exChangeBtnAdd} onClick={this.handleCountAdd} />
                        </div>
                        <div onClick={this.handleExchange} className={styles.exChangeBtn} />
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default PublicBenefitDetail

