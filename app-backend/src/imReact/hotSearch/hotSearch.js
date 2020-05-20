import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Modal } from 'antd'
import service from './service'

import { common } from '../../common/common'
import util from '../../common/util'

class HotSearch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    // 智能搜索 开启/关闭
    onToggle = _ => {
        const { checked } = this.props
        const userInfo = common.getUserInfo()
        // 设置开关状态
        service.setIntelligentSearch({
            userAccount: userInfo.userAccount,
            imUserId: userInfo.imId,
            hasOpen: checked ? 0 : 1,
            channelCode: 'CS_BACKGROUND',
        }).then(response => {
            // this.setState({
            //     checked: !checked,
            // })
            this.toggleFlag(!checked)
        }, error => {
            Modal.error({ title: error })
        })
        // 判断问答辅助状态
        // service.getAdminGetQuestionStatus({
        //     channelCode: 'CS_BACKGROUND',
        //     imUserId: userInfo.imId,
        // }).then(res => {
        //     if (res === '0') {
        //     } else {
        //         Modal.warning({
        //             title: '开启失败！请先关闭问答辅助功能！',
        //             content: '',
        //         })
        //     }
        // }, err => {
        //     Modal.error({ title: err })
        // })
    }

    toggleFlag(value) {
        this.props.dispatch('toggleFlag', value)
        // 添加点击智能搜索开关的埋点
        const { userAccount, userId } = common.getUserInfo()
        util.slog('click_ai_search_switch', { userId, userAccount, value })
    }
    render() {
        const { checked } = this.props

        return (
            <div style={{ marginBottom: '10px', height: '22px', position: 'relative' }}>
                <div style={{ float: 'right', marginRight: '20px' }}>
                    <span style={{ marginRight: '8px', fontSize: '12px' }}>智能搜索</span>
                    <Switch checked={checked} onChange={this.onToggle} />
                </div>
            </div>
        )
    }
}

export default HotSearch

HotSearch.propTypes = {
    checked: PropTypes.bool,
}

HotSearch.defaultProps = {
    checked: null,
}

