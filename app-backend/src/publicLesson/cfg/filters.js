/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-2-6
 */

import React from 'react'

import cfg from './index'
import Label from '../component/Label'

const getCfg = props => {
    const labelNameCb = []
    let { labelName, labelId } = props
    labelName = labelName.split(',')
    labelId = labelId.split(',')
    // 无需label与id对应准确
    labelName.forEach((item, index) => {
        labelNameCb.push({
            value:labelId[index],
            label: item,
        })
    })

    return {
        labelWidth: '70',
        list: [
            [{
                type: 'Input',
                field: 'id',
                defaultValue: props.id,
                placeholder: '填写课程ID',
                label: '课程ID',
                labelWidth: '55',
                width: 240,
                style: {
                    width: 180
                },
            },
            {
                type: 'Input',
                field: 'lessonName',
                defaultValue: props.lessonName,
                placeholder: '填写课程名称',
                label: '课程名称',
                width: 330,
                style: {
                    width: 245
                },
            },
            {
                type: 'Input',
                field: 'teacherName',
                defaultValue: props.teacherName,
                placeholder: '填写讲师名称',
                label: '讲师名称',
                width: 300,
            }],
            [{
                type: 'DiySelect',
                field: 'labelName',
                defaultValue: labelNameCb,
                label: '标签',
                labelWidth: '55',
                width: 240,
                placeholder: '请选择标签',
                labelMax: 20,
                style: {
                    width: 180
                },
                // 自定义render
                render(props) {
                    return <Label {...props} />
                }
            },
            {
                type: 'Select',
                field: 'liveProvider',
                label: '供应商',
                defaultValue: props.liveProvider,
                style: {
                    width: 80
                },
                dataSource: cfg.liveProvider
            },
            {
                type: 'Select',
                field: 'lessonStatus',
                defaultValue: props.lessonStatus,
                valueType: 'number',
                label: '课程状态',
                style: {
                    width: 80
                },
                dataSource: cfg.lessonStatus
            }],
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
    }
}

export default getCfg