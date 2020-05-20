/*
* @file: component
* @author: gushouchuang
* @date: 2019-12-09
* */
import React from 'react'
import { Edit } from 'tpl2'
import { message } from 'antd'

import editCfg from './cfg/edit'

class Welfare extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    submitEdit = e => {
        const {
            effectTime,
        } = e
        // 为了antd.message类型的提示，校验上提到react组件
        if (effectTime.type) {
            if (effectTime.type === 'FIXED_TIME' && !effectTime.time) {
                message.error('发送时间不能为空。')
                return
            }
        } else {
            message.error('发送时间不能为空。')
            return
        }

        this.props.dispatch('submitEdit', e)
    }

    render() {
        const editProps = editCfg(this)

        return (
            <div style={{ width: '100%' }}>
                {/* <Title {...titleProps} /> */}
                <div style={{ padding: '10px 30px' }}>
                    <Edit {...editProps} />
                </div>
            </div>
        )
    }
}


Welfare.propTypes = {
}

Welfare.defaultProps = {
}

export default Welfare
