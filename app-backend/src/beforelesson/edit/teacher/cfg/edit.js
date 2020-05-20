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
    if (editType === 'edit') {
        const item = dataSource[editIndex]
        injection = _.pick(
                item,
                'teacherName',
                'feature',
            )
        
        injection.imageUrl = []
        item.imageUrl && (injection.imageUrl = [{
            uid: item.imageUrl,
            url: item.imageUrl,
            status: 'done',
            name: '',
        }])
    }

    return {
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        injection, // edit状态下需要回填的数据
        list: [
            [{
                type: 'Input',
                field: 'teacherName',
                label: '讲师姓名',
                placeholder: '不超过5个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 5,
                    }]
                },
                style: {
                    width: 320
                },
            }],
			[{
				type: 'Input',
				field: 'feature',
				label: '讲师特点',
				placeholder: '不超过24个字符',
				required: true,
				valid: {
					onchange: [{
						reg: 'maxLength',
						value: 24,
					}]
				},
				style: {
					width: 320
				},
			}],
            [{
                type: 'Diy',
                field: 'imageUrl',
                label: '讲师头像',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'imageUrl',
                        fileList: injection.imageUrl,
                        // uploadTips: '上传图片',
                        width: 406,
                        height: 388,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
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