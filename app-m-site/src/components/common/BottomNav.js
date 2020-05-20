/*
** @file: BottomNav
** @author: huanghaolei
** @date: 2019-09-17
*/
import React from 'react'
import classNames from 'classnames'

import getJSON from '../../common/dataService'
import global from '../../common/global'
import util from '../../common/util'
import Constants from '../../constants/bottomNav'
import Urls from '../../constants/URLS'
import style from '../../styles/less/bottomNav.less'

import homeIcon from '../../images/home.png'
import backIcon from '../../images/back.png'
import forwardIcon from '../../images/forward.png'

const { slog, getHashParams } = util
const skyNet = 'skynet'
const profileTxt = '扫码咨询'
const fieldsSet = {
    'case': 'site'
}

class BottomNav extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            profile: {},
            profileOpen: false,
        }
    }

    componentDidMount() {
        this.getPersonalInfo()
    }

    getPersonalInfoParams = _ => {
        const { query: { share263 = '' } } = this.props
        const { detailInfo: { account } } = global.platformInfo
        return {
            employ263: share263 || account,
        }
    }

    getPersonalInfo = _ => {
        const params = this.getPersonalInfoParams()
        getJSON(Urls.PERSON_CENTER_RETRIVE_URL, params).then(res => {
            const { resultMessage: { profile, profileOpen } } = res
            this.setState({
                profile,    // 在职员工个人信息，离职返回null
                profileOpen
            })
            // 名片展示时，访问打点
            this.staticPersonalInfoPvUv(profileOpen)
        })
    }

    getSlogParams = _ => {
        const { platformInfo: { detailInfo: { account } } } = global
        const { query: { id, channel, share263, sharewx } } = this.props
        return {
            caseId: id,
            channel,
            login263: account,
            share263,
            openId: sharewx,
        }
    }

    staticPersonalInfoPvUv = profileOpen => {
        if(!profileOpen) return
        const params = this.getSlogParams()
        setTimeout(() => {
            slog('profile_show_entry', params)
        }, 500)
    }

    handleBack = _ => {
        console.log('back')
        const { toPrevious } = this.props
        toPrevious()
        history.back()
    }

    handleHome = _ => {
        console.log('home')
        const { toHome, homeHash } = this.props
        toHome()
        location.hash = homeHash
    }

    callSkynetPcSDK = shortUrl => {
        const { platformInfo: { env, detailInfo } } = global
        let account = ''
        if (env === skyNet) {
            account = detailInfo.account
        }
        const { title, fields, } = this.props
        const content = `为您推荐一篇学员故事：《${title}》，点击右侧链接查看详情：${shortUrl}`
        new QWebChannel(qt.webChannelTransport, function(channel) {
            const commander = channel.objects.sscommander
            commander.execute(content) //客户端获取web端传来的content
        })
    }

    transUrlHashParams = _ => {
        const opt = getHashParams()
        const set = {
            login263: 'share263',
            staff: 'skynetPC'
        }
        const obj = {}
        Object.keys(opt).forEach(item => {
            const value = opt[item]
            const val = value in set ? set[value] : value
            const label = item in set ? set[item] : item
            obj[label] = val
        })
        const hashStr = Object.keys(obj).reduce((res, item) => {
            return res += `${item}=${obj[item]}&`
        }, '').slice(0, -1)
        const [hrefWithoutHash] = location.href.split('#')
        const [hashWithoutParams] = location.hash.split('?')
        return `${hrefWithoutHash}${hashWithoutParams}?${hashStr}`
    }

    getShortUrl = _ => {
        const { dispatch } = this.props
        const url = this.transUrlHashParams() 
        dispatch({
            type: Constants.ON_GET_SHORT_URL_REQUESTED,
            payload: {
                params: {
                    longUrl: url,
                },
                cb: data => {
                    const { shortUrl } = data
                    this.callSkynetPcSDK(shortUrl)
                },
            },
        })
    }

    handleForward = _ => {
        console.log('forward')
        const { toForward } = this.props
        this.getShortUrl()
        this.forwardSlog()
        toForward()
    }

    handleQrCodeClk = _ => {
        const params = this.getSlogParams()
        slog('profile_qrcode_click', params)
    }

    forwardSlog = _ => {
        const { fields, query: { id } } = this.props
        const { platformInfo: { env, detailInfo: { account } } } = global
        let slogPrefix = fields
        // 部分打点事件字段前缀做映射
        if( fields in fieldsSet) {
            // 'case'字段映射成'site'字段
            slogPrefix = fieldsSet[fields]
        }
        let login263 = ''
        let caseId = 0
        if (env === skyNet) {
            login263 = account
            caseId = id
        }
        slog(`${slogPrefix}_skynet_forward`, { login263, caseId })
    }

    renderPersonalInfo = _ => {
        const { profile } = this.state
        const { portrait = '', description = '', name = '', qrCode = '' } = profile || {}
        return (
            <div className={style.personalInfo}>
                <div className={style.personalInfoLeft}>
                    <img className={style.personalInfoAvatar} src={portrait} />
                    <div>
                        <div className={style.personalInfoName}>{name}</div>
                        <div className={style.personalInfoDesc}>{ description }</div>
                    </div>
                </div>
                <div className={style.personalInfoRight}>
                    <div className={style.personalInfoQrWrapper} onClick={this.handleQrCodeClk}>
                        <img className={style.personalInfoQrPic} src={qrCode} />
                    </div>
                    <div className={style.profileTxt}>{profileTxt}</div>
                </div>
            </div>
        )
    }

    checkIsShowPersonalInfo = _ => {
        const { query = {} } = this.props
        const { share263 = '', storyversion = '' } = query || {}
        const { detailInfo: { account } } = global.platformInfo
        const { profileOpen } = this.state
        let flag = false
        if(account) {
            // 员工app，天网精灵pc客户端环境, 后台推送到员工app工作通知（url中注入login263）
            flag = profileOpen // 开启展示个人名片功能开关
        }
        if(share263) {
            // app分享模式，微信分享模式下
            flag = storyversion && profileOpen  // storyversion: 学员故事2.0版本迭代标志字段
        }
        return flag
    }

    render() {
        const { useForward, env = skyNet } = this.props
        const showPersonalInfo = this.checkIsShowPersonalInfo()
        return (
            <div className={style.navWrapper}>
                {
                    showPersonalInfo ? this.renderPersonalInfo() : null
                }
                {
                    env === skyNet ? (
                        <div className={style.nav}>
                            <div className={style.operIconLeft}>
                                <img src={backIcon} className={classNames(style.iconStyle, style.backIcon)} onClick={this.handleBack} />
                                <img src={homeIcon} className={classNames(style.iconStyle, style.homeIcon)} onClick={this.handleHome} />
                            </div>
                            {
                                useForward ? (
                                    <div className={style.operRight} onClick={this.handleForward}>
                                        <img src={forwardIcon} className={classNames(style.iconStyle, style.operIconRight)} />
                                        复制转发
                                    </div>
                                ) : null
                            }
                        </div>
                    ) : null
                }
            </div>
        )
    }
}

export default BottomNav

BottomNav.defaultProps = {
    homeHash: '',
    title: '',
    query: {},
    useForward: true,
    dispatch: () => {},
    toPrevious: () => {},
    toHome: () => {},
    toForward: () => {},
}