/*
**@file: addFilterCfg
**@author: huanghaolei
**@date:2019-10-18
*/

import React from 'react'
import { Input, DatePicker } from 'antd'
import moment from 'moment'
import SelectLinkage from '../diyComponent/SelectLinkage'
import File from '../diyComponent/File'

const { TextArea } = Input
export default props => {
    const { dispatch } = props
    return [
        {
            label: '通知标题',
            fields: 'pushTitle_Add',
            component: Input,
            defaultProps: {
                value: props.pushTitle,
                onChange: e => {
                    const { value } = e.target
                    if (value.length <= 40) {
                        dispatch('onChangeAddFilter', { fields: 'pushTitle_Add', value })
                    }
                },
            },
        },
        {
            label: '通知内容',
            fields: 'pushContent_Add',
            component: TextArea,
            defaultProps: {
                value: props.pushContent,
                rows: 5,
                onChange: e => {
                    const { value } = e.target
                    if (value.length <= 100) {
                        dispatch('onChangeAddFilter', { fields: 'pushContent_Add', value })
                    }
                },
            },
        },
        {
            label: '内容类型',
            fields: 'contentType_Add',
            component: SelectLinkage,
            defaultProps: {
                list: [{
                    label: '学员故事',
                    value: 1,
                    key: 'contentId',
                    reg: /^\d*$/, // 纯数字
                    placeholder: '请输入id',
                }],
                selectKey: 'contentType',
                value: props.contentId,
                onChange: e => {
                    console.log(e)
                },
                onInput: e => {
                    const obj = {}
                    Object.keys(e).forEach(item => {
                        obj[`${item}_Add`] = e[item]
                    })
                    dispatch('onChangeAddSelectLinkage', obj)
                },
            },
        },
        {
            label: '渠道参数',
            fields: 'channel_Add',
            component: SelectLinkage,
            defaultProps: {
                list: [{
                    label: 'sharepush',
                }, {
                    label: '自定义参数',
                    key: 'input', // 需手动输入参数
                    reg: /^(\d|[A-Za-z])*$/, // 字母|数字
                    placeholder: '自定义参数值',
                }],
                selectKey: 'channel',
                value: props.channel,
                onChange: e => {
                    const obj = {}
                    Object.keys(e).forEach(item => {
                        obj[`${item}_Add`] = e[item]
                    })
                    dispatch('onChangeAddSelectLinkage', obj)
                },
                onInput: e => {
                    const obj = {}
                    Object.keys(e).forEach(item => {
                        obj[`${item}_Add`] = e[item]
                    })
                    dispatch('onChangeAddSelectLinkage', obj)
                },
            },
        },
        {
            label: '推送名单',
            fields: 'file',
            component: File,
            defaultProps: {
                onUpload: (file, name) => {
                    dispatch('onChangeFile', { file_Add: file, fileName: name })
                },
            },
        },
        {
            label: '推送时间',
            fields: 'pushTime_Add',
            component: DatePicker,
            defaultProps: {
                allowClear: false,
                showTime: { defaultValue: moment('YYYY-MM-DD', 'HH:mm:ss') },
                onChange: e => {
                    dispatch('onChangeAddFilter', { fields: 'pushTime_Add', value: moment(e).format('YYYY-MM-DD HH:mm:00') })
                },
            },
        },
        {
            label: '备注信息',
            fields: 'remark_Add',
            component: TextArea,
            defaultProps: {
                rows: 3,
                value: props.remark,
                onChange: e => {
                    const { value } = e.target
                    if (value.length <= 100) {
                        dispatch('onChangeAddFilter', { fields: 'remark_Add', value })
                    }
                },
            },
        },
    ]
}
