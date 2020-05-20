/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */
import React from 'react'
import { ImgRender } from 'tpl2'

import cfg from './index'

import delIcon from 'src/images/patter-icon/icon-del.png'
import editIcon from 'src/images/patter-icon/icon-edit.png'
import topIcon from 'src/images/patter-icon/icon-top.png'
import unTopIcon from 'src/images/patter-icon/icon-top-no.png'

const ICON_LIST = {
    delIcon,
    editIcon,
    topIcon,
    unTopIcon,
}

// 接收props
export const getColumns = component => {

	return [{
        title: '话术标签',
        dataIndex: 'labelName',
        width: 174
    },
    {
        title: '话术内容',
        dataIndex: 'quickReplyContent',
        render(val, item) {
        	if (item.type === 2) {
                const imgProps = {
                    src: val,
                    littleWidth: '50',
                    littleHeight: '40',
                    height: 'auto',
                    width: '100%',
                    title: '话术图片',
                    label: item.remark,
                }

                return <ImgRender {...imgProps} />
        	} else {
                const showTxt = val.length > 200 ? val.substring(0, 200) + '...' : val

        		return showTxt
        	}
        },
    },
    {
        title: '操作',
        dataIndex: 'oper',
        key: 'oper',
        width: 200,
        render(val, row, index) {
        	const dom = []

            cfg.INLINE_OPER_LIST.forEach(item => {

                const txt = item.field === 'top' && row.top === 1
                    ? '取消置顶'
                    : item.text

                const srcKey = item.field === 'top' && row.top === 1
                    ? 'unTopIcon'
                    : item.icon

                const imgProps = {
                    title: txt,
                    height: '18px',
                    onClick: () => {
                        component.props.dispatch('inlineOper', {
                            field: item.field,
                            index,
                        })
                    },
                    style: {
                        margin: '0 12px',
                        cursor: 'pointer',
                    }
                } 

                dom.push(
                    <img src={ICON_LIST[srcKey]} {...imgProps} />
                )
            })

            return dom
        },
    },
    ]
}
