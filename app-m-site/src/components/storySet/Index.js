/*
** @file: storySet
** @author: huanghaolei
** @date: 2019-07-29
*/
import React from 'react'
import moment from 'moment'

import TopTab from '../common/TopTab'
import WrongPage from '../common/WrongPage'

import style from '../../styles/less/sideEffect.less'
import global from '../../common/global'
import Constants from '../../constants/sideEffect'
import util from '../../common/util'

import COVER_DEFAULT from '../../images/defaultCover.png'
import SHARED_COUNT from '../../images/sharedCount.png'

const { slog } = util

// 故事集页面顶部tabList配置项
const storySetTabList = [
    { title: '全部', key: '-1' },
    { title: '自考', key: '1' },
    { title: '考研', key: '2' },
    { title: '资格证', key: '3' },
    { title: '其他', key: '0' },
]

const DEFAULT_PAGE_NO = 1
const DEFAULT_PAGE_SIZE = 10

let pageNo = DEFAULT_PAGE_NO
const skyNet = 'skynet'

class StorySet extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // 产品类型
            productType: global.sideEffect.productType,
        }
    }

    componentDidMount() {
        this.bindScrollEvent()
        // 第一次进入才请求
        if (+global.sideEffect.pageNo === 1) {
            // 只有一页数据，从详情页跳回到列表的store需清空，见reducer
            this.getList()
        }
        // 上滑
        this.swipeUp()
        // 全局存入主页路由
        this.storeHomeHash()
    }

    componentWillUnmount() {
        this.unbindScrollEvent()
        this.unbindSwipeUp()
    }

    unbindScrollEvent = _ => {
        document.removeEventListener('scroll', this.handleScroll, false)
    }

    unbindSwipeUp = _ => {
        const { body } = document
        body.removeEventListener('touchstart', e => {})
        body.removeEventListener('touchmove', e => {})
    }

    storeHomeHash = _ => {
        global.sideEffect.homeHash = window.location.hash
    }

    handleScroll = _ => {
        const { pageIndex = DEFAULT_PAGE_NO } = this.props
        let { sideEffect: { pageNo } } = global
        // 窗口距定偏移量
        const scroll = this.getScrollTop()
        // 窗口高度
        const windowHeight = document.documentElement.clientHeight
        // 文档高度
        const docHeight = document.documentElement.scrollHeight
        // 文档底部加载更多
        if (scroll + windowHeight > docHeight * 2 / 3) {
            this.getList({ pageNo: ++pageNo })
        }
    }


    bindScrollEvent = _ => {
        document.addEventListener('scroll', this.handleScroll, false)
        this.srcollToLastPosition()
    }

    srcollToLastPosition = _ => {
        let element = document.body
        // const { userAgent: ua } = navigator
        // if (/iphone/i.test(ua)) {
        //     element = document.body
        // } else if (/android/i.test(ua)) {
        //     element = document.documentElement
        // }
        element.scrollTop = global.sideEffect.scrollTop
    }

    swipeUp = _ => {
        const { email263 = '', getHashParams, account } = this.props
        const { platformInfo: { env } } = global
        let login263 = email263
        if (env === skyNet) {
            login263 = account
        }
        const { share263 = '' } = getHashParams()
        let startX, startY, moveEndX, moveEndY, X, Y
        const { body } = document
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
                slog('sideEffect_swipe_up', { login263, share263, time: moment().format('YYYY-MM-DD HH:mm')})    
            }
        }, { passive: false })
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

    getList = opt => {
        const { pageNo = DEFAULT_PAGE_NO, pageSize = DEFAULT_PAGE_SIZE, changeTab = false } = opt || {}
        const { productType } = this.state
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_PUBLISHED_POST_REQUESTED,
            payload: {
                params: {
                    pageNo,
                    pageSize,
                    productType,
                },
                otherParams: {
                    changeTab,
                },
                cb: (resultMessage) => {
                    const { resultList = [], pageIndex } = resultMessage
                    global.sideEffect.pageNo = pageIndex
                    if (!resultList.length) {
                        this.unbindScrollEvent()
                    }
                },
            },
        })
    }

    handleTabChange = key => {
        // 这里解决切换tab时，scroll事件失效的问题
        this.unbindScrollEvent()
        this.bindScrollEvent()

        this.setState({
            productType: key,
        }, () => {
            this.getList({ changeTab: true })
        })
    }

    clearStoryList = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_CLEAR_STORY_SET_DATA,
        })
    }

    storePageInfo = _ => {
        const { productType } = this.state
        // 记忆滑出时视口距顶部位置
        global.sideEffect.scrollTop = this.getScrollTop()
        // 记忆滑出时顶部tab选中项
        global.sideEffect.productType = productType
    }

    addHashParams = (hashStr, opt = {}) =>  {
        const [hash, hashParamsStr] = hashStr.split('?')
        const params = {}
        const arr = hashParamsStr.split('&') || []
        arr.forEach(item => {
            const [key, value] = item.split('=')
            params[key] = value
        })
        Object.keys(opt).forEach(item => {
            params[item] = opt[item]
        })
        const newHashParamsStr = Object.keys(params).filter(item => item !== '_k').reduce((res, item) => {
            return res += `${item}=${params[item]}&`
        }, '').slice(0, -1)
        return `${hash}?${newHashParamsStr}`
    }

    handleDetailPageClk = (hash, e) => {
        this.storePageInfo()
        window.location.hash = this.addHashParams(hash, { login263: global.platformInfo.detailInfo.account })
    }

    renderStoryList = _ => {
        const { resultList = [], email263 = '', account = '' } = this.props
        const { platformInfo: { env } } = global
        let login263 = email263
        if (env === skyNet) {
            login263 = account
        }
        const hasData = resultList.length
        // 区分天网精灵pc客户端和员工app
        const has263 = login263.length
        if (!hasData || !has263) {
            const key = !hasData ? 'empty' : (!has263 ? 'err' : '')
            return <WrongPage type={key} />
        }
        return resultList.map((item, index) => {
            const { title, postUrl, coverUrl, updateTime, forwardCnt = 0 } = item
            const url = coverUrl || COVER_DEFAULT
            const postUrlWith263 = `${postUrl}&login263=${login263}&channel=staff`
            const [, caseHubHash] = postUrlWith263.split('#')
            return (
                <div key={index} onClick={this.handleDetailPageClk.bind(this, caseHubHash)} className={style.unit}>
                    <img className={style.cover} src={url} />
                    <div className={style.cntWrapper}>
                        <div className={style.content}>
                            { title }
                        </div>
                        <div className={style.contentBottom}>
                            <div className={style.updateTime}>{updateTime}</div>
                            {/* <div className={style.sharedWrapper}>
                                <img className={style.sharedCount} src={SHARED_COUNT} alt="pic" />
                                { forwardCnt }
                            </div> */}
                        </div>
                    </div>
                </div>
            )
        })
    }
    render() {
        const { productType } = this.state
        const topTabProps = {
            list: storySetTabList,
            onChange: this.handleTabChange,
            defaultTabKey: productType,
        }
        return (
            <div className={style.storyWrapper}>
                <div className={style.topTab}>
                    <TopTab {...topTabProps} />
                </div>
                { this.renderStoryList() }
            </div>
        )
    }
}

export default StorySet