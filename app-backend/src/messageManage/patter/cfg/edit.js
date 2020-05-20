/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import { message } from 'antd'

import UploadImg from '../upload/UploadImg'
import cfg from './index'

const getCfg = component => {
    const { props } = component

    const injectFileList = props.editCnt.imgCnt
        ? [{
            uid: props.editCnt.imgCnt, // 直接用url做文件唯一标识（不需要rd额外开业务口子）
            name: props.editCnt.imgCnt,
            status: 'done',
            url: props.editCnt.imgCnt,
        }]
        : []

    return {
        labelWidth: '80',
        btnStyle: {
            textAlign: 'center',
        },
        list: [
            [{
                type: 'Select',
                size: 'default',
                field: 'labelId',
                label: '话术标签',
                placeholder: '请选择话术标签',
                required: true,
                defaultValue: props.editCnt.labelId,
                dataSource: [
                    {
                        label: '请选择话术标签',
                        value: '',
                    },
                    ...component.props.labelList,
                ],
                style: {
                    width: 150
                },
            }],
            [{
                type: 'Textarea',
                field: 'quickReplyContent',
                label: '话术内容',
                disabled: props.editCntType === '2',
                defaultValue: props.editCnt.quickReplyContent,
                required: true,
                placeholder: '请输入快捷回复用语，不可超过500字',
                onChangeCb: (e) => {
                    if (!!e.target.value && props.editCntType !== '1') {
                        component.props.dispatch('changeEditCntType', '1')
                    } else if (!e.target.value) {
                        component.props.dispatch('changeEditCntType', '')
                    }
                },
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 500,
                    }]
                },
                style: {
                    width: 320
                },
            }],
            [{
                type: 'Diy',
                field: 'upload',
                label: '添加图片',
                required: true,
                disabled: props.editCntType === '1',
                defaultValue: injectFileList,
                render(diyProps) {
                    const uploadProps = {
                        field: 'upload',
                        fileList: injectFileList,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                },
                onChangeCb(e, editComponent) {
                    // 说明有值
                    if (e.length) {
                        component.props.dispatch('changeEditCntType', '2')
                    } else {
                        component.props.dispatch('changeEditCntType', '')
                    }
                }
            }],
            [{
                type: 'Input',
                field: 'remark',
                label: '图片备注',
                disabled: props.editCntType === '1',
                defaultValue: props.editCnt.remark,
                placeholder: '请输入图片备注，不超过10个字',
                onChangeCb: (e) => {
                    if (!!e.target.value && props.editCntType !== '2') {
                        component.props.dispatch('changeEditCntType', '2')
                    } else if (!e.target.value) {
                        component.props.dispatch('changeEditCntType', '')
                    }
                },
                style: {
                    width: 250,
                },
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 10,
                    }]
                },
            },]
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