/*
** @file: UserCenter
** @author: huanghaolei
** @date: 2019-07-29
*/

import React from 'react'
import { Switch } from 'antd-mobile'
import global from '../../common/global'
import Constants from '../../constants/userCenter'
import style from '../../styles/less/userCenter.less'
import DEFAULT_USER from '../../images/defaultUser.png'
import expandIcon from '../../images/userCenter/expand.png'

// 状态列
const statusList = [
    { label: '工作通知', fields: 'pushOpen' },
    { label: '展示名片', fields: 'profileOpen' }
]

class UserCenter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        this.getUserInfo()
    }

    getUserInfo = _ => {
        const { dispatch, email263 } = this.props
        dispatch({
            type: Constants.GET_PERSON_CENTER_RETRIVE_REQUESTED,
            payload: {
                params: {
                    employ263: email263, // 员工263
                },
                cb: data => {
                    // 在state中批量设置状态列的默认值
                    this.setDefaultStatus(data)
                }
            }
        })
    }

    setDefaultStatus = data => {
        const obj = {}
        statusList.forEach(item => {
            const { fields } = item
            obj[fields] = data[fields]
        })
        this.setState(obj)
    }

    handleInfoClk = _ => {
        global.referrerHash = window.location.hash
        window.location.hash = '/userCenterInfo'
    }

    renderPersonelInfo = _ => {
        const { profile } = this.props
        const { name = '', description = '', portrait = '', qrCode = '' } = profile || {}
        return (
            <div className={style.infoWrapper} onClick={this.handleInfoClk}>
                <div className={style.infoLeft}>
                    <img className={style.avata} src={portrait || DEFAULT_USER} />
                    <div className={style.infoTxt}>
                        <div className={style.infoName}>{name}</div>
                        <div className={style.infoDesc}>{description}</div>
                    </div>
                </div>
                <div className={style.infoRight}>
                    <div className={style.qrCodeWrapper}>
                        <img src={qrCode} className={style.qrCode} />
                    </div>
                    <img src={expandIcon} className={style.expand} />
                </div>
            </div>
        )
    }

    handleSwitchChange = (opt, e) => {
        const { fields } = opt
        this.setState({
            [fields]: e
        })
        // 阅读通知开关
        this.toggleChanger(fields, e)
    }

    toggleChanger = (fields, value) => {
        const { dispatch, email263 } = this.props
        dispatch({
            type: Constants.GET_RECORD_SWITCHER_MANAGER_REQUESTED,
            payload: {
                params: {
                    [fields]: value ? 1 : 0,
                    employ263: email263, // 员工263
                },
            }
        })
    }

    renderStatusInfo = _ => {
        return statusList.map((item, index) => {
            const { label, fields } = item
            const checked = this.state[fields]
            const switchProps = {
                checked,
                onChange: this.handleSwitchChange.bind(this, { fields }),
            }
            return (
                <div key={index} className={style.statusItem}>
                    <div>{label}</div>
                    <Switch {...switchProps} />
                </div>
            )
        })
    }

    render() {
        return (
            <div className={style.wrapper}>
                { this.renderPersonelInfo() }
                { this.renderStatusInfo() }
            </div>
        )
    }
}

export default UserCenter
