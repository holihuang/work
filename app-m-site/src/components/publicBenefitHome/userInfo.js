/*
** @personalProfile: 公益活动个人信息
** @author: fxr
** @date: 2019-12-09
*/

import React from 'react'
import { EXCHANGE_KINDNESS_REQUESTED } from 'Constants/publicBenefit.js'

import util from '../../common/util'

import styles from '../../styles/less/publicBenefit.less'

import defaultPic from '../../images/default.png'

// import { Modal } from 'antd-mobile'
const { slog } = util

let overflowValue
class UserInfo extends React.Component {

    state = {
        exChangeVisible: false,
        confirmVisible: false,
        initCount: 10,
    }

    componentDidMount() {
        // document.querySelector('body').addEventListener('touchstart', function (ev) {
        //     event.preventDefault()
        // })
    }

    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = defaultPic
    }

    handleExchangeShow = () => {
        this.toggleModal('exChangeVisible', true)
        // 获取原来的overflow的值
        overflowValue = document.body.style.overflow
        this.stopBodyScroll(true)
        slog('pre_exchange', { userId: this.props.userId })
    }

    // 点击确认兑换
    handleExchange = () => {
        this.toggleModal('confirmVisible', true)
        this.stopBodyScroll(true)
        slog('exchanging', { userId: this.props.userId })
    }

    stopBodyScroll = type => {
        document.body.style.overflow = type ? 'hidden' : overflowValue
    }

    toggleModal = (key, value) => {
        this.setState({ [key]: value })
    }

    handleExchangeClose = () => {
        this.toggleModal('exChangeVisible', false)
        this.stopBodyScroll(false)
    }
    handleConfirmClose = () => {
        this.toggleModal('confirmVisible', false)
        this.stopBodyScroll(false)
    }

    handelStopPropagation = e => {
        if ( e && e.stopPropagation ) {
            e.stopPropagation()
            e.preventDefault()
        } else {
            window.event.cancelBubble = true;
        }
    }

    handleCountMinus = () => {
        const { initCount }  = this.state
        if (initCount > 10) {
            this.setState({ initCount: initCount - 10 })
        }
    }

    handleCountAdd = () => {
        const { initCount }  = this.state
        this.setState({ initCount: initCount + 10 })
    }

    handleOk = () => {
        const { initCount } = this.state
        const { dispatch, getJSBridgeInfo  } = this.props
        const { userAuth = '', channelSource = '' } = getJSBridgeInfo() || {}
        dispatch({
            type: EXCHANGE_KINDNESS_REQUESTED,
            payload: {
                params: {
                    kindnessCount: initCount,
                    userAuth,
                    channelSource,
                },
                cb: () => {
                    this.handleConfirmClose()
                    this.handleExchangeClose()
                    window.location.reload()
                },
            },
        })
        slog('exchanged', { userId: this.props.userId })
        
    }

    render() {
        const { publicBenefit: { userInfo } } = this.props
        const {
            sunlandCoin, // 尚德元数
            kindnessCount, // 剩余爱心数
            donatedKindnessCount, // 以捐赠爱心数
            donatedTimesCount, // donatedTimesCount
            student,
        } = userInfo
        const {
            avatar, // 头像
            nickname, // 昵称
        } = student || {}
        const { exChangeVisible, confirmVisible, initCount } = this.state
        return (
            <div style={{ display: 'table', width: '100%' }}>
                <div className={styles.userInfoWrapper}>
                    <div className={styles.userInfoTitle}>
                        <div className={styles.userInfoLeft}>
                            <span>我的尚德元：</span>
                            <span className={styles.sunlandCoin}>{sunlandCoin}</span>
                        </div>
                        <div className={styles.userInfoRight}>
                            <img src={avatar || defaultPic} alt="" onError={e =>this.checkAvatarError(e)} />
                        </div>
                    </div>
                    <div className={styles.userInfoBanner}>
                        <div className={styles.bannerMain}>
                            <div className={styles.bannerMainLine1}>当前爱心量：</div>
                            <div className={styles.bannerMainLine2}>{kindnessCount.toLocaleString()}</div>
                            <div className={styles.bannerMainLine3}>
                                <div className={styles.bannerMainLine3Item}>
                                    <div>已捐次数</div>
                                    <div className={styles.itemBottom}>{donatedTimesCount}</div>
                                </div>
                                <div className={styles.bannerMainLine3Item}>
                                    <div>已捐爱心量</div>
                                    <div className={styles.itemBottom}>{donatedKindnessCount}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.bannerExchange} onClick={this.handleExchangeShow} />
                    </div>
                </div>
                {exChangeVisible &&
                <div className={styles.popMask} onClick={this.handleExchangeClose}>
                    <div className={styles.exChangeModal} onClick={this.handelStopPropagation}>
                        <div className={styles.exChangeTitle}>兑换爱心数量</div>
                        <div className={styles.exChangeTips}>5个尚德元兑换1颗爱心，10颗起兑</div>
                        <div className={styles.exChangeMain}>
                            <span className={styles.exChangeBtnSub} onClick={this.handleCountMinus} />
                            <span className={styles.exChangeInput}>{initCount}</span>
                            <span className={styles.exChangeBtnAdd} onClick={this.handleCountAdd} />
                        </div>
                        <div onClick={this.handleExchange} className={styles.exChangeBtn} />
                    </div>
                </div>
                }
                {confirmVisible &&
                <div className={styles.popMask}>
                    <div className={styles.confirmModal}>
                        <div className={styles.confirmModalText}>您将要消耗{initCount * 5}尚德元，兑换{initCount}颗爱心，尚德元直接扣除且不能退还。</div>
                        <div className={styles.confirmModalBtn}>
                            <div className={styles.confirmBtn} onClick={this.handleConfirmClose}>取消</div>
                            <div className={styles.confirmBtn} onClick={this.handleOk}>确定</div>
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default UserInfo
