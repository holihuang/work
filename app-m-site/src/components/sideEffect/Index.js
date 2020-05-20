/*
** @file sideEffect.js
** @author: huanghaolei
** @date: 2019-06-11
*/
import React from 'react'
import { Toast } from 'antd-mobile'

import BottomTabBar from '../common/BottomTabBar'
import StorySet from '../storySet/Index' 
import ReadRecord from '../readRecord/Index'
import UserCenter from '../userCenter/Index'
import global from '../../common/global'
import util from '../../common/util'

import Constants from '../../constants/sideEffect'
import style from '../../styles/less/sideEffect.less'

import STORY_SET_ICON from '../../images/storySet.png'
import STORY_SET_ACTIVE_ICON from '../../images/storySetActive.png'
import READ_RECORD_ICON from '../../images/readRecord.png'
import READ_RECORD_ACTIVE_ICON from '../../images/readRecordActive.png'
import USER_CENTER_ICON from '../../images/userCenter.png'
import USER_CENTER_ACTIVE_ICON from '../../images/userCenterActive.png'

const { slog } = util

const DEFAULT_PAGE_NO = 1
const DEFAULT_PAGE_SIZE = 10
const TOKEN_KEY = 'accessToken'
const skyNet = 'skynet'

let pageNo = DEFAULT_PAGE_NO

const tabBarList = [
    { key: 'storySet', label: '故事集', icon: STORY_SET_ICON, activeIcon: STORY_SET_ACTIVE_ICON },
    { key: 'readRecord', label: '阅读记录', icon: READ_RECORD_ICON, activeIcon: READ_RECORD_ACTIVE_ICON },
    { key: 'userCenter', label: '个人中心', icon: USER_CENTER_ICON, activeIcon: USER_CENTER_ACTIVE_ICON, }
]

class SideEffect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // tabBar默认选中的key
            selectedTab: this.mergeSelectedTab()
        }
    }

    componentDidMount() {
        // 天网精灵客户端token有效性校验
        if (global.platformInfo.env === skyNet) {
            this.checkSkynetToken().then(opt => {
                const { isExpired } = opt
                if (isExpired) {
                    Toast.fail('无效的天网精灵token')
                    return
                }
                this.loadPage()
                this.staticPvUv()
            })
        } else {
            this.loadPage()
        }
    }

    insertEnvInfo = _ => {
        // 环境信息注入到全局变量
        global.platformInfo = util.platformInfo()
    }

    loadPage = _ => {
        // 清除body overflow hidden
        this.setBodyScroll()
        this.checkEnv()
    }

    checkSkynetToken = _ => {
        return new Promise((resolve, reject) => {
            const { dispatch, location: { query: { accessTokenSkyNet = '' } } } = this.props
            dispatch({
                type: Constants.ON_DO_AUTH_FOR_SKY_NET_REQUESTED,
                payload: {
                    params: {
                        accessTokenSkyNet,
                    },
                    cb: data => {
                        const { account } = data
                        global.platformInfo.detailInfo.account = account
                        resolve(data)
                    }
                },
            })
        })
    }

    unbindScrollEvent = _ => {
        document.removeEventListener('scroll', this.handleScroll, false)
    }

    setBodyScroll = _ => {
        global.setBodyScroll()
    }

    checkEnv = _ => {
        this.insertEnvInfo()
        const { platformInfo: { env } } = global
        // 员工app获取login63
        if(env === 'empapp') {
            const params = this.getHashParams()
            this.getUserInfo(TOKEN_KEY, params)
        }
    }

    getUserInfo = (...args) => {
        const [token, params] = args
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_USER_INFO_REQUESTED,
            payload: {
                params: {
                    [token]: params[token]
                },
                cb: opt => {
                    const { email263 = '' } = opt
                    // 员工APP登录的263注入到global
                    this.injectEmApp263ToGlobal(email263)
                    this.staticPvUv(opt)
                    if (!email263.length) {
                        this.unbindScrollEvent()
                    }   
                }
            },
        })
    }

    injectEmApp263ToGlobal = email263 => {
        global.platformInfo.detailInfo.account = email263
    }

    staticPvUv = opt => {
        let { email263 = '' } = opt || {}
        const { platformInfo: { env, envName, detailInfo: { account = '' } } } = global
        const { share263 = '' } = this.getHashParams()
        // login263: 员工APP， 天网精灵
        if (env === skyNet) {
            // 天网精灵
            email263 = account
        }
        slog('sideEffect_entry_page', { login263: email263, share263, source: envName })
    }

    getHashParams = _ => {
        const { location: { hash } } = window
        const params = {}
        if (hash.includes('?')) {
            const [, paramsStr] = hash.split('?')
            const arr = paramsStr.includes('&') ? paramsStr.split('&') : [paramsStr]
            arr.forEach(item => {
                if (item.includes('=')) {
                    const [key, value] = item.split('=')
                    params[key] = value
                }
            })
        }
        return params
    }

    mergeSelectedTab = _ => {
        const { sideEffect: { selectedTab: selectedTabFromGlobal } } = global
        const { selectedTab = 'storySet' } = this.state || {}
        return selectedTabFromGlobal || selectedTab
    }

    renderContentComponent = _ => {
        const { sideEffect, dispatch, readRecord, userCenter } = this.props
        const { platformInfo: { env } } = global
        let { email263, employName, account } = sideEffect
        // account： 天网精灵263， email263：员工APP263
        email263 = env === skyNet ? account : email263
        const { selectedTab } = this.state
        if (selectedTab === 'storySet') {
            // storySet页面中列表数据存储在sideEffect
            const storySetProps = {
                email263,
                ...sideEffect,
                dispatch,
                getHashParams: this.getHashParams,
            }
            return <StorySet {...storySetProps} />
        } else if (selectedTab === 'readRecord') {
            const readRecordProps = {
                email263,
                dispatch,
                ...readRecord,
            }
            return <ReadRecord {...readRecordProps} />
        } else if (selectedTab === 'userCenter') {
            const userCenterProps = {
                email263,
                employName,
                dispatch,
                ...userCenter
            }
            return <UserCenter {...userCenterProps} />
        }
    }

    render() {
        const { sideEffect: { resultList = [], email263 = '', account = '' } } = this.props
        const { selectedTab } = this.state
        const { platformInfo: { env } } = global
        // account：天网精灵263， email263：员工APP263
        const login263 = env === skyNet ? account : email263
        const has263 = !!login263.length
        const hasData = !!resultList.length
        const whiteBackground = (!hasData || !has263) ? { background: '#fff' } : {}
        const tabBarProps = {
            list: tabBarList,
            selectedTab,
            onSelected: e => {
                this.setState({
                    selectedTab: e,
                })
                global.sideEffect.selectedTab = e
            }
        }
        return (
            <div style={whiteBackground} className={style.wrapper}>
                <div className={style.unitWrapper}>{this.renderContentComponent()}</div>
                <BottomTabBar {...tabBarProps} />
            </div>
        )
    }
}

export default SideEffect