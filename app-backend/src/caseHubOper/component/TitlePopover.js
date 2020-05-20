/*
** @file: TitlePopover
** @author: huanghaolei
** @date: 2019-07-01
*/
import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from 'antd'

const DEFAULT_ONLY_TITLE = true

const list = [{
    label: '案例id',
    key: 'id',
}, {
    label: '案例标题',
    key: 'title',
}, {
    label: '案例链接',
    key: 'postUrl',
}]

function renderCntItm(opt) {
    return list.map(item => {
        const { label, key } = item
        const labelStyle = {
            display: 'inline-block',
            width: 70,
        }
        return (
            <div>
                <span style={labelStyle}>{label}:</span>
                {
                    key === 'postUrl' ? (
                        <a href={opt[key]} target="_blank">{opt[key]}</a>
                    ) : <span>{opt[key]}</span>   
                }
            </div>
        )
    })
}

function content(opt) {
    const { onlyTitle = DEFAULT_ONLY_TITLE, title } = opt
    const cnt = onlyTitle ? title : renderCntItm(opt)
    return (
        <div>{ cnt }</div>
    )
}

function TitlePopover(props) {
    const {
        title = '', onlyTitle = DEFAULT_ONLY_TITLE, id,
    } = props
    const popoverProps = {
        trigger: onlyTitle ? 'hover' : 'click',
        overlayStyle: {
            maxWidth: onlyTitle ? 400 : 900,
        },
        content: content(props),
    }
    const cntStyle = {
        cursor: 'pointer',
    }
    return (
        <Popover {...popoverProps}>
            {
                onlyTitle ? (
                    <span style={cntStyle}>
                        {
                            title.length > 10 ? `${title.slice(0, 10)}...` : title
                        }
                    </span>
                ) : (
                    <span style={{ ...cntStyle, color: 'rgb(24, 144, 255)' }}>{id}</span>
                )
            }
        </Popover>
    )
}

TitlePopover.defaultProps = {
    title: '',
    id: 0,
    postUrl: '',
    onlyTitle: true,
}

TitlePopover.propTypes = {
    // eslint-disable-next-line react/require-default-props
    title: PropTypes.string,
    id: PropTypes.number,
    postUrl: PropTypes.string,
    onlyTitle: PropTypes.bool,
}

export default TitlePopover
