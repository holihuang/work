/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'

import cfg from './index'
import UploadFile from '../upload/UploadFile'

const getCfg = component => {
    const { props } = component

    return {
        labelWidth: '100',
        btnStyle: {
            textAlign: 'center',
        },
        list: [
            [{
                type: 'Select',
                field: 'labelId',
                label: '话术标签',
                placeholder: '请选择话术标签',
                required: true,
                defaultValue: '',
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
                type: 'Diy',
                field: 'upload',
                label: '选择文件',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'upload',
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadFile {...uploadProps} />
                },
            }],
            [{
                type: 'Button',
                field: 'tpl',
                text: '下载',
                label: '下载导入模板',
                icon: 'download',
                style: {
                    width: '86px',
                },
                onClickCb: (e, filterComponent) => {
                    // 下载excel
                    window.open('http://store.sunlands.com/original/20180918/1537253770375.xlsx')
                }
            }],
        ],
        save: e => {
            component.props.dispatch('submitImport', e)
        },
        cancel: e => {
            component.props.dispatch('closeModal', 'importModal')
        }
    }
}

export default getCfg