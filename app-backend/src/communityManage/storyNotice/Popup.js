/*
** @file: Popup
** @author: huanghaolei
** @date: 2019-10-16
*/
import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from 'antd'

const maxLength = 40

function Popup(props) {
    const { value = '' } = props
    const txt = value.length >= maxLength ? `${value.slice(0, maxLength)}...` : value
    const popoverProps = {
        title: null,
        content: value,
        placement: 'bottom',
        overlayStyle: {
            maxWidth: '350px',
        },
    }
    return (
        <Popover {...popoverProps}>
            { txt }
        </Popover>
    )
}

Popup.defaultProps = {
    key: '',
    value: '',
}

Popup.propTypes = {
    key: PropTypes.string,
    value: PropTypes.string,
}

export default Popup
