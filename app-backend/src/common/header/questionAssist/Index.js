
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'
import { Switch, Modal } from 'antd'
import service from './service'
import { common } from '../../../common/common'
import { global } from '../../global'

class IMQuestionAssistSwitch extends Component {
    constructor(props) {
        super(props)
        const { hasOpen } = props
        this.state = {
            checked: !!hasOpen,
        }
    }

    onChange = checked => {
        const userInfo = common.getUserInfo()
        // 修改 问答辅助功能
        service.managerQuestionAssist({
            userAccount: userInfo.userAccount,
            imUserId: userInfo.imId,
            hasOpen: checked ? 1 : 0,
        }).then(response => {
            const state = !this.state.checked
            this.setState({
                checked: state,
            })
            // 问答辅助状态同步到global
            global.questionAssistState = state
        }, error => {
            Modal.error({ title: error })
        })
        // 获取智能搜索开关的状态（新增）
        // service.getIntelligentSearch({
        //     userAccount: userInfo.userAccount,
        //     imUserId: userInfo.imId,
        //     channelCode: 'CS_BACKGROUND',
        // }).then(res => {
        //     if (res === '1') {
        //         Modal.warning({
        //             title: '开启失败！请先关闭智能搜索功能！',
        //             content: '',
        //         })
        //     } else {

        //     }
        // }, err => {
        //     Modal.error({ title: err })
        // })
    }

    render() {
        console.log('switch props:', this.props)
        const { hasOpen } = this.props
        return (
            <div style={{
                display: 'inline-block',
                margin: '0 10px',
                paddingRight: '7px',
                borderRight: '1px solid #fff',
            }}
            >
                <span>
                    问答辅助
                    <Switch
                        // size="small"
                        defaultChecked={!!hasOpen}
                        checked={this.state.checked}
                        onChange={this.onChange}
                        style={{ marginLeft: '5px' }}
                    /> </span>
            </div>
        )
    }
}

IMQuestionAssistSwitch.defaultProps = {
    hasOpen: 0, // 类型:Number 说明:0关闭，1开启
}

IMQuestionAssistSwitch.propTypes = {
    hasOpen: PropTypes.number,
}

export default IMQuestionAssistSwitch
