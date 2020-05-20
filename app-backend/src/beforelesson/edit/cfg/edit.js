/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import cfg from './index'

const getCfg = props => {
    const { dataSource, editType, editIndex } = props
    let injection = {}
    if (editType === 'edit') {
        const item = dataSource[editIndex]
        injection = _.pick(
                item,
                'liveProvider', 
                'labelName',
                // 'id',
                // 'lessonName',
                'imgUrl',
            )
        // mock  TODO
        injection.id = '2'
        injection.lessonName = '1'
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
                field: 'liveProvider',
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
                field: 'id',
                label: '所属分类',
                required: true,
                tips: '选择后不可更改！',
                dataSource: cfg.major,
                style: {
                    width: 150
                },
                onChangeCb: e => {
                    console.log(e)
                }
            }],
        ],
        save: e => {
            props.dispatch('submitEdit', e)
        },
        cancel: e => {
            props.dispatch('closeEdit')
        }
    }
}

export default getCfg