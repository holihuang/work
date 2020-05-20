/*
** @personalProfile: 公益活动首页
** @author: fxr
** @date: 2019-12-20
*/

import React from 'react'
import { hashHistory } from 'react-router'

import { GET_PROJECT_LIST_REQUESTED } from 'Constants/publicBenefit.js'

import global from '../../common/global'

import styles from '../../styles/less/publicBenefitList.less'

import caseListPic from '../../images/publicBenefit/icon-case-pic-list.jpg'

const DEFAULT_PAGE_NO = 1
const DEFAULT_PAGE_SIZE = 10

const isApp = navigator.userAgent.indexOf('sunland') !== -1
const ua = navigator.userAgent

class PublicBenefitList extends React.Component {

    componentDidMount() {
        // 获取userAuth和设备信息，存到store
        // this.getCommonInfo()
        // 绑定滚动事件
        this.bindScrollEvent()
        if (+global.publicBenefitList.pageNo === 1) {
            // 只有一页数据，从详情页跳回到列表的store需清空，见reducer
            this.getList()
        }
        if (isApp) {
            if (typeof JSBridge === 'undefined') {
                // 老版本app，不能使用 JSBridge
            } else {
                // 新版本app，能够使用 JSBridge
                window.JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                    title: '爱心捐赠',
                }))
                window.JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
            }
        }
    }

    componentWillUnmount() {
        this.unbindScrollEvent()
    }

    // getJSBridgeInfo = () => {
    //     // if (!isApp) {
    //     //     if (typeof JSBridge !== 'undefined') {
    //     //         // 老版本app，不能使用 JSBridge
    //     //     } else {
    //     //         // 新版本app，能够使用 JSBridge
    //     //         // 判断是哪个设备
    //     //         // const isAndroid = ua.indexOf('android') !== -1
    //     //         // const isIos = ua.indexOf('ios') !== -1
    //     //         // const channelSource = isAndroid ? 'CS_APP_ANDROID' : (isIos ? 'CS_APP_IOS' : '')
    //     //         // const userInfo = JSON.parse(JSBridge.getData('userInfo'))
    //     //         // const { userAuth } = userInfo
    //     //         userAuth = 2
    //     //         channelSource = 'CS_APP_IOS'
    //     //         this.getStuKindness()
    //     //         this.getMyDonationRank()
    //     //     }
    //     // }
    //     const userAuth = 2
    //     const channelSource = 'CS_APP_IOS'
    //     return {
    //         userAuth,
    //         channelSource,
    //     }
    // }

    getList = opt => {
        const { pageNo = DEFAULT_PAGE_NO, pageSize = DEFAULT_PAGE_SIZE } = opt || {}
        const { dispatch } = this.props
        dispatch({
            type: GET_PROJECT_LIST_REQUESTED,
            payload: {
                params: {
                    pageNo,
                    pageSize,
                    orderBy: '-id, completeStatus',
                },
                source: 'list',
                cb: resultMessage => {
                    const { data = [], pageIndex } = resultMessage
                    global.publicBenefitList.pageNo = pageIndex
                    // data为[]时停止触底加载
                    if (!data.length) {
                        this.unbindScrollEvent()
                    }
                },
            },
        })
    }

    bindScrollEvent = () => {
        document.addEventListener('scroll', this.handleScroll, false)
        // 滚动到上次离开的位置
        this.srcollToLastPosition()
    }

    unbindScrollEvent = _ => {
        document.removeEventListener('scroll', this.handleScroll, false)
    }

    srcollToLastPosition = () => {
        let element = document.body
        // 在global拿到上次的位置
        element.scrollTop = global.publicBenefitList.scrollTop
    }

    getScrollTop = () => {
        let scroll_top = 0
        if (document.documentElement && document.documentElement.scrollTop) {
            scroll_top = document.documentElement.scrollTop
        }
        else if (document.body) {
            scroll_top = document.body.scrollTop
        }
        return scroll_top
    }

    handleScroll = () => {
        // const overflowValue = document.body.style.overflow
        let { publicBenefitList: { pageNo } } = global
        // 窗口距定偏移量
        const scroll = this.getScrollTop()
        // 窗口高度
        const windowHeight = document.documentElement.clientHeight
        // 文档高度
        const docHeight = document.documentElement.scrollHeight
        // 文档底部加载更多
        // if (overflowValue === 'hidden') {
        //     return
        // } else {
        //     if (scroll + windowHeight >= docHeight) {
        //         this.getList({ pageNo: ++pageNo })
        //     }
        // }
        if (scroll + windowHeight > (docHeight - 20)) {
            this.getList({ pageNo: ++pageNo })
        }
    }

    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = caseListPic
    }

    handleJump = projectNo => {
        // 记忆滑出时视口距顶部位置
        global.publicBenefitList.scrollTop = this.getScrollTop()
        hashHistory.push(`/publicBenefitDetail/${projectNo}`)
    }

    render() {
        const { publicBenefit } = this.props
        const {
            projectListInfo: {
                dataSource: projectList,
            }
        } = publicBenefit
        return (
            <div className={styles.benefitListWrapper}>
                {projectList && projectList.length ? projectList.map((item, index) => {
                    const {
                        projectNo,
                        title,
                        listImageUrl,
                        targetKindnessCount,
                        donatedKindnessCount,
                        completeStatus,
                    } = item
                    return (
                        <div className={styles.benefitListItem} key={`${projectNo}-${index}`} onClick={()=>{ this.handleJump(projectNo) }}>
                            {completeStatus === 1 && <span className={styles.iconComplete} />}
                            <img src={listImageUrl || CaseListPic} onError={e =>this.checkAvatarError(e)} alt="" className={styles.benefitListImg}/>
                            <div className={styles.listPicPop} />
                            <div className={styles.benefitListTitle}>
                                {title}
                                <div className={styles.benefitListCount}>
                                <span>已获得</span>
                                <span className={styles.colorRed}>{donatedKindnessCount}</span>
                                <span>颗爱心</span>
                            </div>
                            </div>
                            <div className={styles.benefitListBtn} onClick={()=>{ this.handleJump(projectNo) }}></div>
                        </div>
                    )
                }) : null }
            </div>
        )
    }
}

export default PublicBenefitList

