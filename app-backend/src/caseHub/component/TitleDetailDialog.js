/*
* @file: title detail
* @author: huanghaolei
* @date: 2018-09-25
* */

import React from 'react'
import { Popover } from 'antd'

class TitleDetailDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { text } = this.props
        const content = (
            <div style={{ padding: '10px' }}>
                {text}
            </div>
        )
        const popOverProps = {
            title: null,
            trigger: 'hover',
            content,
            placement: 'top',
            overlayStyle: {
                width: '200px',
            },
        }
        return (
            <div style={{ cursor: 'pointer' }}>
                <Popover {...popOverProps}>
                    { text.length > 10 ? `${text.slice(0, 10)}...` : text }
                </Popover>
            </div>
        )
    }
}

export default TitleDetailDialog

