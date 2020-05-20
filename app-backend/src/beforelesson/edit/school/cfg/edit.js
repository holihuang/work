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
                'schoolName', 
            )
        
        const imgList = ['schoolLogo', 'schoolUrl', 'introduction']

        imgList.forEach(key => {
            injection[key] = []

            item[key] && (injection[key] = [{
                uid: item[key],
                url: item[key],
                status: 'done',
                name: '',
            }])
        })
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
                field: 'schoolName',
                label: '院校名称',
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
            [{
                type: 'Diy',
                field: 'schoolLogo',
                label: '院校logo',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'schoolLogo',
                        fileList: injection.schoolLogo,
                        // uploadTips: '上传图片',
                        width: 265,
                        height: 182,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'schoolUrl',
                label: '院校顶部图',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'schoolUrl',
                        fileList: injection.schoolUrl,
                        // uploadTips: '上传图片',
                        width: 690,
                        height: 397,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'introduction',
                label: '招生简介图',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'introduction',
                        fileList: injection.introduction,
                        // uploadTips: '上传图片',
                        width: 679,
                        size: 60,
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