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
            'regionName',
            'majorCode',
            'examTime',
            'school',
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
                field: 'regionName',
                disabled: true,
                label: '地域',
                required: true,
                style: {
                    width: 320
                },
            }],
            [{
                type: 'Input',
                field: 'majorCode',
                label: '专业代码',
                placeholder: '不超过20个字符',
				required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 20,
                    }]
                },
                style: {
                    width: 320
                },
            }],
			[{
				type: 'Input',
				field: 'examTime',
				label: '考试时间',
				placeholder: '不超过13个字符',
				required: true,
				valid: {
					onchange: [{
						reg: 'maxLength',
						value: 13,
					}]
				},
				style: {
					width: 320
				},
			}],
			[{
				type: 'Input',
				field: 'school',
				label: '主考院校',
				placeholder: '不超过15个字符',
				required: true,
				valid: {
					onchange: [{
						reg: 'maxLength',
						value: 15,
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