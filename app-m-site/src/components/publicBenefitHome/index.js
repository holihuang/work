/*
** @personalProfile: 公益活动首页
** @author: hyt
** @date: 2019-12-09
*/

import React from 'react'
import { hashHistory } from 'react-router'

import { GET_MY_DONATION_RANK_REQUESTED, GET_SUT_DIND_NESS_REQUESTED } from 'Constants/publicBenefit.js'
import UserInfo from './userInfo'
import ListInfo from './listInfo'
import RankInfo from './rankInfo'

import util from '../../common/util'
import styles from '../../styles/less/publicBenefit.less'

const isApp = navigator.userAgent.indexOf('sunland') !== -1
const ua = navigator.userAgent

const { slog } = util

let userId = ''
class PublicBenefitHome extends React.Component {

    componentDidMount() {
        // 获取userAuth和设备信息，存到store
        this.getCommonInfo()
    }

    getJSBridgeInfo = () => {
        if (isApp) {
            if (typeof JSBridge === 'undefined') {
                // 老版本app，不能使用 JSBridge
            } else {
                // 新版本app，能够使用 JSBridge
                window.JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                    title: '爱心捐赠',
                }))
                window.JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
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

    getCommonInfo = () => {
        const { userAuth } = this.getJSBridgeInfo() || {}
        userAuth && this.getStuKindness(userAuth)
        userAuth && this.getMyDonationRank(userAuth)
        userId && setTimeout(() => {
            slog('welfare_mainpage', { userId })
        }, 1000)
    }

    getStuKindness = userAuth => {
        const {
            dispatch,
        } = this.props
        dispatch({
            type: GET_SUT_DIND_NESS_REQUESTED,
            payload: {
                params: {
                    userAuth,
                },
            },
        })
    }

    getMyDonationRank = userAuth => {
        const {
            dispatch,
        } = this.props
        dispatch({
            type: GET_MY_DONATION_RANK_REQUESTED,
            payload: {
                params: {
                    userAuth,
                },
            },
        })
    }

    render() {
        const { dispatch, publicBenefit } = this.props
        const userInfoProps = {
            dispatch,
            publicBenefit,
            userId,
            getJSBridgeInfo: this.getJSBridgeInfo,
        }
        const listInfoProps = {
            dispatch,
            publicBenefit,
            userId,
        }
        const rankInfoProps = {
            ...listInfoProps,
        }
        return (
            <div className={styles.publicBenefitWrapper}>
                <UserInfo {...userInfoProps} />
                <div className={styles.introWrapper} onClick={() => { hashHistory.push('/publicBenefitIntro') }}/>
                <ListInfo {...listInfoProps} />
                <RankInfo {...rankInfoProps} />
            </div>
        )
    }
}

export default PublicBenefitHome
