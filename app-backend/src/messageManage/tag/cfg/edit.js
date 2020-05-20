/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import cfg from './index'

const getCfg = component => {
    const { props } = component

    return {
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        list: [
            [{
                type: 'Input',
                field: 'labelName',
                label: '标签名称',
                placeholder: '请输入标签名称，不超过6个字',
                required: true,
                defaultValue: props.editCnt.labelName,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 6,
                    },
                    {
                        reg: value => {
                            return {
                                rst: /^[A-Za-z0-9\u4e00-\u9fa5]+$/g.test(value),
                                message: '只能是中文、字母和数字的组合',
                            }
                        }
                    }]
                },
                style: {
                    width: 250
                },
            }],
        ],
        save: e => {
            component.props.dispatch('submitEdit', e)
        },
        cancel: e => {
            component.props.dispatch('closeModal')
        }
    }
}

export default getCfg