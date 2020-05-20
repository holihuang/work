/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2019-12-09
 */

import React from 'react'

import UploadRatioImg from 'common/reactComponent/projectRender/UploadRatioImg'
import SendTime from './sendTime'
import ContentEditor from './contentEditor'

const getCfg = component => {
    const {
        content,
        coverImageUrl,
        listImageUrl,
        effectTime,
        stuName,
        title,
        type,
    } = component.props

    return {
        labelWidth: '120',
        btnStyle: {
            marginLeft: '45px',
        },
        saveText: '生效',
        hideCancel: true,
        list: [
            [{
                type: 'Input',
                field: 'title',
                label: '标题文案',
                placeholder: '不超过15个字',
                defaultValue: title,
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 15,
                    }],
                },
                style: {
                    width: 250,
                },
            }],
            [{
                type: 'Input',
                field: 'stuName',
                label: '学员姓名',
                defaultValue: stuName,
                placeholder: '请填写学员姓名',
                required: true,
                style: {
                    width: 250,
                },
            }],
            [{
                type: 'Diy',
                field: 'coverImageUrl',
                label: '封面配图',
                required: true,
                defaultValue: coverImageUrl,
                render(diyProps) {
                    const uploadProps = {
                        field: 'coverImageUrl',
                        fileList: coverImageUrl ? [{
                            uid: coverImageUrl,
                            url: coverImageUrl,
                            status: 'done',
                            name: '',
                        }] : undefined,
                        uploadTips: '上传图片',
                        width: 5,
                        height: 3,
                        ratio: 'height:width',
                        detailInfo: '图片横竖比为5:3，JPG、PNG、JPEG格式。小于2M',
                        size: 2048,
                        ...diyProps, // 仅透传changeState方法
                    }
                    return <UploadRatioImg {...uploadProps} />
                },
            }],
            [{
                type: 'Diy',
                field: 'listImageUrl',
                defaultValue: listImageUrl,
                label: '列表页图',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'listImageUrl',
                        fileList: listImageUrl ? [{
                            uid: listImageUrl,
                            url: listImageUrl,
                            status: 'done',
                            name: '',
                        }] : undefined,
                        uploadTips: '上传图片',
                        width: 3,
                        height: 4,
                        ratio: 'width:height',
                        detailInfo: '图片横竖比为3:4，JPG、PNG、JPEG格式。小于2M',
                        size: 2048,
                        ...diyProps, // 仅透传changeState方法
                    }
                    return <UploadRatioImg {...uploadProps} />
                },
            }],
            [{
                type: 'Diy',
                field: 'content',
                label: '正文内容',
                defaultValue: content,
                required: true,
                render(diyProps, editComponent) {
                    const contentProps = {
                        editComponent,
                        ...diyProps, // 仅透传changeState方法
                    }
                    return <ContentEditor {...contentProps} />
                },
            }],
            [{
                type: 'Diy',
                field: 'effectTime',
                label: '发送时间',
                defaultValue: {
                    time: effectTime,
                    type: !type || type === 'OFFLINE' ? 'NEW' : type, // 默认选中‘暂存’
                },
                required: true,
                render(diyProps, editComponent) {
                    const timeProps = {
                        editComponent,
                        ...diyProps, // 仅透传changeState方法
                    }
                    return <SendTime {...timeProps} />
                },
            }],
        ],
        save: e => {
            component.submitEdit(e)
        },
    }
}

export default getCfg
