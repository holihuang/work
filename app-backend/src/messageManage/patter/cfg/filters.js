/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import cfg from './index'

const getCfg = component => {
    const props = component.props

    return {
        lineMargin: ['15px'],
        height: ['32px'],
        style: {
            padding: '0 15px',
            position: 'relative',
        },

        
        list: [
            [{
                type: 'Select',
                size: 'default',
                field: 'tag',
                label: '话术标签',
                placeholder: '请选择话术标签',
                style: {
                    width: '200px',
                },
                marginRight: '15px',
                dataSource: [{
                    value: '',
                    label: '请选择话术标签',
                },
                ...props.labelList,
                ],
                onChangeCb: (e, filterComponent) => {
                },
            },
            {
                type: 'Input',
                field: 'keyword',
                placeholder: '请输入回复内容',
                marginRight: '15px',
                width: '200px',
                onChangeCb: (e, filterComponent) => {
                },
            },
            {
                type: 'Button',
                field: 'query',
                text: '查询',
                skin: 'primary',
                width: '100px',
                onClickCb: (e, filterComponent) => {
                    const { state } = filterComponent
                    
                    component.props.dispatch('getList', {
                        pageNo: 1,
                        labelId: state.tag,
                        searchContent: encodeURIComponent(state.keyword),
                    })
                }
            },
            ],
        ],
        query: filters => {
        }
    }
}

export default getCfg