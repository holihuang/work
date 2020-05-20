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
    let injection = {}

	let list  = [
		[{
			type: 'Input',
			field: 'weight',
			label: '权重值',
			required: true,
			placeholder: '数字输入框',
			valid: {
				onchange: [{
					reg: e => {
						return {
							rst: /^\d+$/.test(e) && e >= 0 && e <= 100,
							message: '请输入从0-100开始的数值，值越小排序越靠前',
						}
					}
				}]
			},
			style: {
				width: 320
			},
		}],
		[{
			type: 'Textarea',
			field: 'classFeature',
			label: '特点',
			required: true,
			placeholder: '不超过26个字符，多条用英文逗号","分隔开，建议每条不超过8个',
			valid: {
				onchange: [{
					reg: 'maxLength',
					value: 26,
				}]
			},
			style: {
				width: 320
			},
		}],
	]

    if (editType === 'edit') {
		injection = _.pick(
			dataSource[editIndex],
			'weight',
			'classFeature',
		)

	} else {
		list = [
			[{
				type: 'Input',
				field: 'classId',
				label: ' 班型ID',
				placeholder: '数字输入框',
				required: true,
				valid: {
					onchange: [{
						reg: 'isPosInter', // 正整数
					}]
				},
				style: {
					width: 320
				},
			}],
			...list,
	    ]
    }

    return {
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        injection, // edit状态下需要回填的数据
        list,
        save: e => {
            props.dispatch('submitEdit', e)
        },
        cancel: e => {
            props.dispatch('togEdit', '')
        }
    }
}

export default getCfg