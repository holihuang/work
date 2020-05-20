/*
**@file: StoryNoticeAdd
**@author: huanghaolei
**@date: 2019-10-16
*/
import React from 'react'
import getFilterList from './cfg/filterCfg'
import '../style.less'

function Filter(props) {
    const filterList = getFilterList(props)
    return filterList.map(item => {
        const {
            component: Component, label = '', fields,
            defaultProps = {},
        } = item

        const componentProps = {
            label,
            fields,
            ...defaultProps,
        }
        const lineWrapperStyle = {
            display: 'flex',
            margin: '15px 0',
        }
        const labelStyle = {
            width: '80px',
        }
        const operAreaStyle = {
            width: '360px',
        }
        const labelTxt = label ? `${label}：` : null
        return (
            <div style={lineWrapperStyle}>
                <div style={labelStyle}>{labelTxt}</div>
                <div style={operAreaStyle}>
                    <Component {...componentProps} />
                </div>
            </div>
        )
    })
}

function StoryNoticeAdd(props) {
    const filterProps = {
        ...props,
    }
    return <Filter {...filterProps} />
}

export default StoryNoticeAdd
