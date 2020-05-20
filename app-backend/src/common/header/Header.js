/**
 * @file header
 *
 * @auth gushouchuang
 * @date 2018-5-23
 */

import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { Menu, Dropdown, Switch, Modal } from 'antd'

import { global } from 'common/global'
import { common } from '../common'

import IMQuestionAssistSwitch from './questionAssist/Index'
import SetImDis from './setImDisModal/Index'
import ROBOR_SWITCH from '../../images/robotSwitch.png'

const MAP_STATUS = {
    online: {
        i: 'icon icon-online',
        span: 'online-status online-status-on',
        text: 'IM在线',
    },
    offline: {
        i: 'icon icon-offline',
        span: 'online-status online-status-off',
        text: 'IM离线',
    },
}

const LIST_STAT = [{
    value: 'setonline',
    match: 1,
    i: 'icon icon-online',
    text: 'IM在线',
},
{
    value: 'setoffline',
    match: 0,
    i: 'icon icon-offline',
    text: 'IM离线',
}]

class Header extends Component {
    constructor(...args) {
        super(...args)
        const { robotAssist: { hasOpen = 0 }, guessAskHasOpen } = common.getUserInfo()
        this.state = {
            showStatLayer: false,
            showDisModal: false,
            hasOpen, // 机器人默认状态
            guessYouAskChecked: guessAskHasOpen,
            statusEmptyState: true, // 跟隨prop中statusEmpty字段一起控制modal
        }
    }

    createStat() {
        const { online } = this.props
        const key = online ? 'online' : 'offline'
        const map = MAP_STATUS[key]

        const statProps = {
            onClick: () => {
                this.setState({
                    showStatLayer: true,
                })
            },
        }

        return (
            <span {...statProps}>
                <i className={map.i} />
                <span className={map.span}>{map.text}</span>
            </span>
        )
    }

    createStatList() {
        if (!this.state.showStatLayer) {
            return null
        }

        const { online } = this.props
        const dom = []
        LIST_STAT.forEach(item => {
            const liProps = {
                value: item.value,
                onClick: e => {
                    this.setState({
                        showStatLayer: false,
                    })
                    this.togOnline(item.value)
                },
            }

            dom.push(
                <li {...liProps}>
                    {
                        online === item.match && <i className="icon icon-checked" />
                    }
                    <span className={item.span}>{item.text}</span>
                </li>)
        })

        return (
            <ul className="operate-panel">
                {dom}
            </ul>
        )
    }

    togOnline(type) {
        try {
            window.BJ_REPORT.info(`tog online state, type = ${type}, montiorId=${global.BJ_MONTIOR_ID}`)
        } catch (e) {
            // do nothing
        }

        const value = type === 'setoffline' ? 0 : 1

        this.props.dispatch('togWsStat', value)
    }

    // 关闭modal
    closeModal() {
        this.setState({
            statusEmptyState: false,
        })
    }

    render() {
        // const props = this.props
        const userInfo = common.getUserInfo()
        const { hasOpen, guessYouAskChecked, statusEmptyState } = this.state
        const { statusEmpty } = this.props // 获取是否返回空对象
        const userAccountPrefix = (window.userInfo.userAccount || '').replace('@sunlands.com', '')
        const cookieKeyName = `onlineStatusEmpty-${userAccountPrefix}`
        const cookieVal = +common.getCookie(cookieKeyName) || 0 // 如果没有值，则取0
        const {
            userNickname,
            questionAssist,
            userRole,
            robotAssist,
        } = userInfo

        const isTeacherOnDuty = userRole.indexOf('SCH_DUTYTEACHER') !== -1
        const isTeacher = userRole.indexOf('SCH_TEACHER') !== -1
        const isAfterTeacher = userRole.indexOf('SCH_AFTERSALETEACHER') !== -1

        const isNotAfterTeacher = isTeacher || isTeacherOnDuty
        const isAnyTeacher = isTeacherOnDuty || isTeacher || isAfterTeacher
        // const { online } = this.props

        const setDisProps = {
            onClick: () => {
                this.setState({
                    showDisModal: true,
                })
            },
        }

        const outProps = {
            onClick: () => {
                this.props.dispatch('logout')
            },
        }

        const isTeacherOnDutyTemp = isTeacherOnDuty ? 3 : -1
        const disProps = {
            // type: isTeacher // 班主任为2
            //     ? 2
            //     :  isTeacherOnDuty // 值班老师为3
            //         ? 3
            //         : -1,
            type: isTeacher ? 2 : isTeacherOnDutyTemp,
            close: () => {
                this.setState({
                    showDisModal: false,
                })
            },
        }

        const robotProps = {
            checked: hasOpen,
            onChange: checked => {
                // 开启|关闭机器人
                this.props.dispatch('toggleRobotState', {
                    value: checked ? 1 : 0,
                    cb: () => {
                        this.setState({ hasOpen: checked })
                    },
                })
            },
        }

        const guessYouAskProps = {
            checked: guessYouAskChecked,
            onChange: checked => {
                // 开启|关闭 猜你想问
                this.props.dispatch('toggleGuessAsk', {
                    checked,
                    cb: () => {
                        this.setState({ guessYouAskChecked: checked })
                    },
                })
            },
        }

        const robotStyle = {
            width: '25px',
            height: '25px',
            borderRadius: '50%',
        }
        const robotTitleNameStyle = {
            cursor: 'default',
            background: 'none',
        }

        const robotMenu = (
            <Menu>
                {
                    robotAssist.hasShow ? (
                        <Menu.Item key="1" style={{ ...robotTitleNameStyle }}>
                            <span style={{ display: 'inline-block', margin: '0 5px', verticalAlign: 'bottom' }}>智能机器人</span>
                            <div style={{ float: 'right' }}>
                                <Switch {...robotProps} />
                            </div>
                        </Menu.Item>
                    ) : null
                }
                {/* <Menu.Item key="2" style={{ ...robotTitleNameStyle }}>
                    <span style={{ display: 'inline-block', margin: '0 5px', verticalAlign: 'bottom' }}>猜你想问功能</span>
                    <div style={{ float: 'right' }}>
                        <Switch {...guessYouAskProps} />
                    </div>
                </Menu.Item> */}
            </Menu>
        )

        const robotNode = (
            <div style={{ display: 'inline-block' }}>
                <div style={{ display: 'inline-block', marginLeft: '10px', cursor: 'pointer' }}>
                    <Dropdown overlay={robotMenu}>
                        <img style={robotStyle} src={ROBOR_SWITCH} alt="robot_switch" />
                    </Dropdown>
                </div>
                <span style={{ marginLeft: '10px' }}>|</span>
            </div>
        )

        return (
            <div>
                <div className="header header-page">
                    <div className="header-left">
                        <h1>尚德机构<span>APP运营后台</span></h1>
                    </div>
                    <div className="loginContainer header-right">
                        <span className="name fl">{userNickname}</span>
                        {
                            isAnyTeacher &&
                            <div className="operate-online-status fl">
                                {this.createStat()}
                                {this.createStatList()}
                                {
                                    isNotAfterTeacher &&
                                    <span {...setDisProps}>
                                        <span
                                            style={{
                                                padding: '0 10px 0 15px',
                                            }}
                                        >|
                                        </span>
                                        <span
                                            className=""
                                            style={{
                                                paddingRight: '10px',
                                            }}
                                        >
                                            <img src="images/header-set.png" height="18px" alt="" />
                                            <span style={{
                                                cursor: 'pointer',
                                            }}
                                            >设置留言接线人
                                            </span>
                                        </span>
                                        <span>|</span>
                                    </span>
                                }
                            </div>
                        }
                        {
                            questionAssist.hasShow === 1 &&
                            <div
                                style={{
                                    display: 'inline-block',
                                }}
                                id="questionAssistWraper"
                            >
                                <IMQuestionAssistSwitch {...questionAssist} />
                            </div>
                        }
                        {
                            // 班主任机器人设置权限
                            isTeacher ? (
                                robotNode
                            ) : null
                        }
                        <span id="logoutBtn" className="logout" {...outProps}>退出</span>
                    </div>
                </div>
                {
                    this.state.showDisModal && <SetImDis {...disProps} />
                }
                <Modal
                    title="警告"
                    style={{ top: 150 }}
                    closable={cookieVal > 3}
                    footer={null}
                    visible={statusEmpty && statusEmptyState}
                    maskClosable={false}
                    onCancel={() => { this.closeModal() }}
                >
                    { cookieVal < 4 ? <p>IM在线状态获取异常！请手动刷新页面！</p> : <p>在线状态获取异常！请及时联系运营人员！</p> }
                </Modal>
            </div>
        )
    }
}

Header.propTypes = {

}

Header.defaultProps = {

}

export default Header
