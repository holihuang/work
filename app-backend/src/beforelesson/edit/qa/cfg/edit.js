/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */

import React from 'react'
import UploadImg from 'common/reactComponent/projectRender/UploadImg'
import UploadVideo from 'common/reactComponent/projectRender/UploadVideo'

import cfg from './index'

const getCfg = props => {
    const { dataSource, editType, editIndex } = props
    let injection = {}
    if (editType === 'edit') {
        const item = dataSource[editIndex]
        injection = _.pick(
                item,
                'title', 
                'description',
            )
        
        injection.coverUrl = []
        item.coverUrl && (injection.coverUrl = [{
            uid: item.coverUrl,
            url: item.coverUrl,
            status: 'done',
            name: '',
        }])
        injection.videoUrl = []
        item.videoUrl && (injection.videoUrl = [{
            uid: item.videoUrl,
            url: item.videoImgUrl || '',
            videoUrl: item.videoUrl,
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
                field: 'title',
                label: '标题视频',
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
                field: 'coverUrl',
                label: '视频封面',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'coverUrl',
                        fileList: injection.coverUrl,
                        // uploadTips: '上传图片',
                        width: 684,
                        height: 380,
                        size: 60,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'videoUrl',
                label: '视频文件',
                required: true,
                render(diyProps) {
                    const VideoProps = {
                        field: 'videoUrl',
                        fileList: injection.videoUrl,
                        uploadTips: '上传视频',
                        size: 50,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadVideo {...VideoProps} />
                }
            }],
            [{
                type: 'Input',
                field: 'description',
                label: '视频描述',
                placeholder: '不超过15个字符',
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