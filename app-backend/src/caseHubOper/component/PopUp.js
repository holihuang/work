/*
** @file: CntLabel,内容标签
** @author: huanghaolei
** date: 2019-07-01
*/
import React from 'react'
import { Popover } from 'antd'
import '../style.less'

const liStyle = {
    border: '1px solid rgb(201, 207, 216)',
    marginBottom: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: 'rgb(243, 246, 251)',
    color: 'rgba(0, 0, 0, .6)',
    padding: '5px',
    marginRight: '5px',
}

function renderTxt(...args) {
    const [list = []] = args
    return list.slice(0, 2).map(item => (
        <span style={liStyle}>{item}</span>
    ))
}

function renderPopCnt(...args) {
    const [list = []] = args
    return list.map(item => (
        <div style={{ ...liStyle, display: 'inline-block' }}>{item}</div>
    ))
}

function PopUp(...args) {
    const [props, key] = args
    const content = renderPopCnt(props[key])
    const popoverProps = {
        trigger: 'hover',
        title: null,
        placement: 'left',
        content,
        overlayStyle: {
            width: 210,
        },
    }
    return (
        <Popover {...popoverProps}>
            <div style={{ width: 160 }}>
                {
                    renderTxt(props[key])
                }
            </div>
        </Popover>
    )
}

export default PopUp
