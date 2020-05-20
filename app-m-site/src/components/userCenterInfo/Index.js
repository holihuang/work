/*
** @file: UserCenterInfo
** @author: huanghaolei
** @date: 2019-12-13
*/
import React from 'react'
import { Toast } from 'antd-mobile'
import classnames from 'classnames'

import global from '../../common/global'
// import utils from '../../common/util'
import Constant from '../../constants/userCenterInfo'
import style from '../../styles/less/userCenterInfo.less'
import cfg from './cfg'

class UserCenterInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.getPersonalInfo()
    }

    getPersonalInfo = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constant.ON_PERSON_CENTER_RETRIVE_INFO_REQUESTED,
            payload: {
                params: { employ263: global.platformInfo.detailInfo.account }
            },
        })
    }

    handleItmClk = (className, flag, key) => {
        if(className === 'upload') {
            this[`uploadPic_${flag}`]({flag, key})
        }
    }

    onInsert = (ref, {className, flag}) => {
        if(className === 'upload') {
            this[`uploadPic_${flag}`] = ref
        }
    }

    handleChange = (...args) => {
        const [key, value] = args
        const { dispatch } = this.props
        dispatch({
            type: Constant.ON_CHANGE,
            params: {
                [key]: value,
            },
        })
    }

    renderEditList = _ => {
        const { list } = cfg
        const { userCenterInfo: { profile = {} } } = this.props
        return list.map((item, index) => {
            const { key, label, maxLength, component: Component, className, picType = 1 } = item
            const obj = className === 'ipt' ? { value: profile[key], placeholder: `请输入${label}`, maxLength } : { profile }
            const componentProps = {
                className: style.itmOperArea,
                flag: picType,
                key,
                ...obj,
                onInsert: ref => {
                    // 子组件upload方法注入到父组件中
                    this.onInsert(ref, {className, flag: picType})
                },
                onChange: this.handleChange.bind(this, key),
            }
            return (
                <div className={classnames(style.itmWrapper, style[className])} onClick={this.handleItmClk.bind(this, className, picType, key)}>
                    <div className={style.itmLabel}>{label}</div>
                    <Component {...componentProps} />
                </div>
            )
        })
    }

    updateProfile = _ => {
        const { dispatch, userCenterInfo: { profile } } = this.props
        const profileTmp = profile || {}
        const { list } = cfg
        // 验空
        for(let i = 0; i < list.length; i++) {
            const { key, label } = list[i]
            if(!profileTmp[key]) {
                Toast.fail(`${label}不能为空！`)
                return
            }
        }
        dispatch({
            type: Constant.ON_UPDATE_PROFILE_REQUESTED,
            payload: {
                params: {
                    ...profile,
                    employ263: global.platformInfo.detailInfo.account,
                },
                cb: () => {
                    this.back()
                    this.clearUserCenterInfoParams()
                }
            },
        })
    }

    clearUserCenterInfoParams = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constant.ON_CLEAR_USER_CENTER_INFO_PARAMS,
            params: {},
        })
    }

    // 后退到上页
    back = _ => {
        window.location.hash = global.referrerHash
    }

    handleBtnClk = key => {
        if(key === 'cancel') {
            this.back()
        } else if(key === 'save') {
            this.updateProfile()
        }
    }

    renderBtnList = _ => {
        const { btnList } = cfg
        return btnList.map(item => {
            const { label, key, component: Component, props } = item
            const componentProps = {
                className: style.operBtn,
                ...props,
                onClick: this.handleBtnClk.bind(this, key)
            }
            return <Component {...componentProps}>{label}</Component>
        })
    }

    render() {
        return (
            <div className={style.wrapper}>
                {
                    this.renderEditList()
                }
                {
                    <div className={style.tipWrapper}>
                        <div className={style.tipIcon}>!</div>
                        <div className={style.tipTxt}>{cfg.tipTxt}</div>
                    </div>
                }
                <div className={style.btnWrapper}>
                    {
                        this.renderBtnList()
                    }
                </div>
            </div>
        )
    }
}

export default UserCenterInfo
