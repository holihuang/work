/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import cfg from './index'

const getCfg = props => {
    return {
        list: [
            [{
                type: 'Input',
                field: 'majorName',
                defaultValue: props.majorName,
                placeholder: '专业名称',
                label: '专业名称',
                width: 270,
                style: {
                    width: 200
                },
            },
            {
                type: 'Select',
                field: 'typeId',
                label: '所属分类',
                defaultValue: props.typeId,
                valueType: 'number',
                style: {
                    width: 80
                },
                dataSource: [{
                    label: '全部',
                    value: -1,
                },
                ...cfg.major]
            },
            {
                type: 'Select',
                field: 'isHide',
                label: '状态',
                valueType: 'number',
                defaultValue: props.isHide,
                style: {
                    width: 80
                },
                dataSource: cfg.stat.map((item, index) => {
                    const target = {
                        label: item.label,
                        value: item.value,
                    }

                    index === 0 || (target.label = item.label + '中')

                    return target
                })
            }],
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
    }
}

export default getCfg