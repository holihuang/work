/*
** @file: filterCfg
** @author: huanghaolei
** @date: 2019-06-27
*/
import React from 'react'

import optionCfg from './optionCfg'

const getCfg = component => {
    const { dispatch, setState = () => {} } = component
    const marginRight = '1%'
    const width = '19%'
    const height = '32px'
    return {
        lineMargin: '15px',
        list: [
            [{
                type: 'Number',
                field: 'id',
                placeholder: '请输入案例id',
                marginRight,
                width,
                defaultValue: component.id,
                onChangeCb: (e, filterComponent) => {
                    const id = e || ''
                    filterComponent.setState({
                        id,
                    })
                    dispatch('onChangeId', { id })
                },
            }, {
                type: 'Input',
                field: 'title',
                placeholder: '请输入标题关键词',
                marginRight,
                width,
                onChangeCb: e => {
                    dispatch('onChangeTitle', { title: e.target.value })
                },
            }, {
                type: 'RangePicker',
                field: 'postRangePicker',
                dateFormat: 'YYYY-MM-DD',
                marginRight,
                width: '39%',
                onChangeCb: e => {
                    const [startTime, endTime] = e.value
                    dispatch('onChangeRangeTime', { startTime, endTime })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'postSource',
                placeholder: '请选择来源',
                marginRight,
                width,
                dataSource: [{
                    value: '',
                    label: '请选择来源',
                },
                ...optionCfg.postSourceList.map(item => ({ label: item, value: item })),
                ],
                onChangeCb: e => {
                    dispatch('onChangePostSource', { postSource: e })
                },
            }],
            [{
                type: 'Select',
                size: 'default',
                field: 'contentLabel',
                mode: 'multiple',
                placeholder: '请选择内容标签',
                marginRight,
                height,
                width,
                dataSource: [
                    ...optionCfg.contentLabelList.map(item => ({ label: item, value: item })),
                ],
                onChangeCb: e => {
                    dispatch('onChangeContentLabel', { contentLabel: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'showStatus',
                placeholder: '请选择发布状态',
                marginRight,
                width,
                defaultValue: component.showStatus,
                dataSource: [{
                    value: -1,
                    label: '请选择发布状态',
                },
                ...optionCfg.publishStateList.map(item => ({ label: item.label, value: item.value })),
                ],
                onChangeCb: e => {
                    dispatch('onChangeShowStatus', { showStatus: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'iconType',
                placeholder: '请选择角标',
                marginRight,
                width,
                defaultValue: component.iconType,
                dataSource: [{
                    value: -1,
                    label: '请选择角标',
                },
                ...optionCfg.iconTypeList, 
                ],
                onChangeCb: e => {
                    dispatch('onChangeIconType', { iconType: e })
                }
            }, {
                type: 'Button',
                field: 'query',
                text: '查询',
                skin: 'primary',
                width: '220px',
                onClickCb: (e, filterComponent) => {
                    dispatch('onQuery', { ...filterComponent.state, cb: setState })
                },
            },
            ],
        ],
    }
}

export default getCfg
