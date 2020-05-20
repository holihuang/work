/*
** @personalProfile: 公益活动个人信息
** @author: fxr
** @date: 2019-12-18
*/

import React from 'react'
import classNames from 'classnames'
import { Modal } from 'antd-mobile'

import { GET_DONATION_RANK_REQUESTED } from 'Constants/publicBenefit.js'

import global from '../../common/global'

import styles from '../../styles/less/publicBenefit.less'

import defaultPic from '../../images/default.png'

const DEFAULT_PAGE_NO = 1
const DEFAULT_PAGE_SIZE = 10

class RankInfo extends React.Component {

    state = {
        visible: false,
    }

    componentDidMount() {
        // 绑定滚动事件
        this.bindScrollEvent()
        if (+global.publicBenefitHome.pageNo === 1) {
            // 只有一页数据，从详情页跳回到列表的store需清空，见reducer
            this.getDonateRankList()
        }
    }

    componentWillUnmount() {
        this.unbindScrollEvent()
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
        element.scrollTop = global.publicBenefitHome.scrollTop
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
        const overflowValue = document.body.style.overflow
        let { publicBenefitHome: { pageNo } } = global
        // 窗口距定偏移量
        const scroll = this.getScrollTop()
        // 窗口高度
        const windowHeight = document.documentElement.clientHeight
        // 文档高度
        const docHeight = document.documentElement.scrollHeight
        // 文档底部加载更多
        if (overflowValue === 'hidden') {
            return
        } else {
            if (scroll + windowHeight > (docHeight - 20) ) {
                this.getDonateRankList({ pageNo: ++pageNo })
            }
        }
    }

    handleClose = () => {
        this.setState({ visible: false })
    }

    handleShow = () => {
        this.setState({ visible: true })
    }

    getDonateRankList = opt => {
        const { pageNo = DEFAULT_PAGE_NO, pageSize = DEFAULT_PAGE_SIZE } = opt || {}
        const { dispatch } = this.props
        dispatch({
            type: GET_DONATION_RANK_REQUESTED,
            payload: {
                params: {
                    pageNo,
                    pageSize,
                },
                cb: resultMessage => {
                    const { data = [], pageIndex } = resultMessage
                    global.publicBenefitHome.pageNo = pageIndex
                    // data为[]时停止触底加载
                    if (!data.length) {
                        this.unbindScrollEvent()
                    }
                },
            },
        })
    }

    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = defaultPic
    }

    renderRankItem = (item, index) => {
        const {
            student,
            donatedKindnessCount,
        } = item
        const {
            avatar,
            nickname,
        } = student || {}
        const ranklineNumStyle = classNames({
            [styles.rankLineNum]: true,
            [styles.rankLineNum1]: index === 0,
            [styles.rankLineNum2]: index === 1,
            [styles.rankLineNum3]: index === 2,
        })
        const iconNumStyle = classNames({
            [styles.iconNum]: true,
            [styles.iconNum1]: index === 0,
            [styles.iconNum2]: index === 1,
            [styles.iconNum3]: index === 2,
        })
        const countNumStyle = classNames({
            [styles.rankLineCount]: true,
            [styles.rankLineCount1]: index === 0,
            [styles.rankLineCount2]: index === 1,
            [styles.rankLineCount3]: index === 2,
        })
        return (
            <div className={styles.rankLine} key={`rankItem_${index}`}>

                <div className={ranklineNumStyle}>{index + 1}</div>
                <div className={styles.rankLineLeft}>
                    {index === 0 && <span className={iconNumStyle} /> }
                    {index === 1 && <span className={iconNumStyle} /> }
                    {index === 2 && <span className={iconNumStyle} /> }
                    <img src={avatar || defaultPic} alt="" onError={e =>this.checkAvatarError(e)} />
                </div>
                <div className={styles.rankLineRight}>
                    <div className={styles.rankLineRightTop}>{nickname}</div>
                </div>
                <div className={countNumStyle}>
                    {donatedKindnessCount}
                </div>
            </div>
        )
    }

    render() {
        const { publicBenefit: { userInfo, personRankInfo, donationRankListInfo } } = this.props
        const {
            student,
            donatedKindnessCount,
        } = userInfo
        const {
            avatar, // 头像
            nickname, // 昵称 
        } = student || {}
        const {
            rankNo = -1,
        } = personRankInfo || {}
        const {
            dataSource: donationRankList,
        } = donationRankListInfo
        const { visible } = this.state
        return (
            <div>
                <div className={styles.rankInfoWrapper}>
                    <div className={styles.rankInfoTitle}>
                        <div className={styles.rankInfoLeft}>
                            <span>贡献爱心排行榜</span>
                            <span className={styles.iconTips} onClick={this.handleShow} />
                        </div>
                    </div>
                    <div className={styles.rankLinePerson}>
                        <div className={styles.rankLineNumPerson} />
                        <div className={styles.rankLineLeft}> <img src={avatar || defaultPic} alt="" onError={e =>this.checkAvatarError(e)} /></div>
                        <div className={styles.rankLineRight}>
                            <div className={styles.rankLineRightTop}>{nickname}</div>
                            <div className={styles.rankLineRightDown}>{rankNo === -1 ? '未上榜' : `当前排名${rankNo}`}</div>
                        </div>
                        <div className={styles.rankLineCount}>
                            {donatedKindnessCount}
                        </div>
                    </div>
                    {donationRankList && donationRankList.length > 0 ? donationRankList.map(this.renderRankItem) : null }
                </div>
                <Modal
                    className={styles.rankTipsModal}
                    transparent
                    visible={visible}
                    onClose={this.handleClose}
                    title='数据说明'
                >
                    <div className={styles.rankTipsModalLine}>1.排行榜仅展示前100名学员，此范围外的学员不在页面中展示。</div>
                    <div className={styles.rankTipsModalLine}>2.排行榜及个人名次每小时更新。</div>
                </Modal>
            </div>
        )
    }
}

export default RankInfo
