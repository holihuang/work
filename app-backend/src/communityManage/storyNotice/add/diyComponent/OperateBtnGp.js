/*
**@file: OperateBtnGp
**@author: huanghaolei
**@adte:2019-10-17
*/
import React from 'react'
import { Button } from 'antd'

const btnList = [{
    component: Button,
    type: 'primary',
    text: '发布',
    state: 1,
    style: {
        marginRight: '25px',
    },
}, {
    component: Button,
    text: '取消',
    state: 0,
}]

function OperateBtnGp(props) {
    console.log(props, 'in gp')
    const { onHandle } = props
    return btnList.map(item => {
        const {
            component: Component, text, state,
            type = 'default', style = {},
        } = item
        const componentProps = {
            type,
            style,
            'data-value': state,
            'data-text': text,
            onClick: onHandle,
        }
        return <Component {...componentProps}>{text}</Component>
    })
}

export default OperateBtnGp
