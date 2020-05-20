/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */

import React from 'react'
import UploadImg from 'common/reactComponent/projectRender/UploadImg'

import cfg from './index'

const getCfg = props => {
    const { dataSource, editType, editIndex } = props
    const injection = _.pick(
			dataSource[editIndex],
            'courseName',
            'courseDesc',
        )

    return {
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        injection, // edit状态下需要回填的数据
        list: [
            [{
                type: 'Input',
                field: 'courseName',
                disabled: true,
                label: '科目名称',
                required: true,
                style: {
                    width: 320
                },
            }],
            [{
                type: 'Textarea',
                field: 'courseDesc',
                label: '科目描述',
                placeholder: '不超过200个字符',
				required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 200,
                    }]
                },
                style: {
                    width: 320
                },
            }],
        ],
        save: e => {
            props.dispatch('submitEdit', e)
        },
        cancel: e => {
            props.dispatch('togEdit', '')
        }
    }
}

export default getCfg