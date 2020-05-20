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
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        list: [
            [{
                type: 'Input',
                field: 'majorName',
                label: '专业名称',
                placeholder: '不超过15个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 15,
                    }]
                },
                style: {
                    width: 250
                },
            }],
            [{
                type: 'Select',
                field: 'typeId',
                label: '所属分类',
                required: true,
                valueType: 'number',
                tips: '选择后不可更改！',
                defaultValue: -1,
                dataSource: [
                    {
                        label: '请选择',
                        value: -1,
                    },
                    ...cfg.major
                ],
                valid: {
                    onsubmit: [{
                        reg: value => {
                            return {
                                rst: value !== -1,
                                message: `请完善'所属分类'信息`
                            }
                        }
                    }]
                },
                style: {
                    width: 150
                },
            }],
        ],
        save: e => {
            props.dispatch('submitEdit', e)
        },
        cancel: e => {
            props.dispatch('closeModal')
        }
    }
}

export default getCfg