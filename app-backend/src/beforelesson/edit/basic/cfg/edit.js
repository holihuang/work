/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React from 'react'
import _ from 'lodash'

import UploadImg from 'common/reactComponent/projectRender/UploadImg'

// import cfg from './index'

const getCfg = props => {
    const typeId = props.typeId
    const injection = _.pick(
            props,
            'majorName', 
            'condition',
            'majorFeature',
            'postIds',
            'learnYears',
            'majorProperty',
            'degreeType',
            'examTime',
            'introduction',
        ) || {}
    const imgList = ['logoUrl', 'lessonFeatureUrl', 'learnPlanUrl']

    imgList.forEach(key => {
        injection[key] = []

        props[key] && (injection[key] = [{
            uid: props[key],
            url: props[key],
            status: 'done',
            name: '',
        }])
    })

    let list = []
    // 研究生
    if (typeId === 1) {
        list = [
            [{
                type: 'Input',
                field: 'majorName',
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
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'logoUrl',
                label: '专业背景图',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'logoUrl',
                        fileList: injection.logoUrl,
                        // uploadTips: '上传图片',
                        width: 716,
                        height: 423,
                        size: 500,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'condition',
                label: '报考条件',
                placeholder: '不超过90个字符',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 90,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'learnYears',
                label: '学制',
                placeholder: '不超过10个字符',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 10,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'majorProperty',
                label: '专业性质',
                placeholder: '不超过10个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 10,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'majorFeature',
                label: '专业特点',
                placeholder: '不超过26个字符，用英文逗号“,”隔开，建议每条不超过8个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 26,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'examTime',
                label: '考试时间',
                placeholder: '不超过13个字符',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 13,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'lessonFeatureUrl',
                label: '课程特点',
                render(diyProps) {
                    const uploadProps = {
                        field: 'lessonFeatureUrl',
                        fileList: injection.lessonFeatureUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'learnPlanUrl',
                label: '学习规划指导',
                render(diyProps) {
                    const uploadProps = {
                        field: 'learnPlanUrl',
                        fileList: injection.learnPlanUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'postIds',
                label: '学习讨论',
                placeholder: '请输入在学习讨论模块置顶展示的帖子id，用英文逗号“，”分隔开，不超过50个',
                valid: {
                    onchange: [{
                        reg: e => {
                            const ids = _.chain(e.split(','))
                                .map(item => {
                                    return item.trim()
                                })
                                .without('')
                                .uniq()
                                .value()

                            return {
                                rst: ids.length <= 50,
                                message: '帖子数量不得超过50！',
                            }
                        }
                    }]
                },
                style: {
                    width: 450
                }
            }],
        ]
    // 本科
    } else if (typeId === 2) {
        list = [
            [{
                type: 'Input',
                field: 'majorName',
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
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'logoUrl',
                label: '专业logo',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'logoUrl',
                        fileList: injection.logoUrl,
                        // uploadTips: '上传图片',
                        width: 88,
                        height: 88,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Input',
                field: 'majorFeature',
                label: '专业特点',
                placeholder: '不超过26个字符，用英文逗号“,”隔开，建议每条不超过8个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 26,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'degreeType',
                label: '学位类型',
                placeholder: '不超过6个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 6,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'lessonFeatureUrl',
                label: '课程特点',
                render(diyProps) {
                    const uploadProps = {
                        field: 'lessonFeatureUrl',
                        fileList: injection.lessonFeatureUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'learnPlanUrl',
                label: '学习规划指导',
                render(diyProps) {
                    const uploadProps = {
                        field: 'learnPlanUrl',
                        fileList: injection.learnPlanUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'postIds',
                label: '学习讨论',
                placeholder: '请输入在学习讨论模块置顶展示的帖子id，用英文逗号“，”分隔开，不超过50个',
                valid: {
                    onchange: [{
                        reg: e => {
                            const ids = _.chain(e.split(','))
                                .map(item => {
                                    return item.trim()
                                })
                                .without('')
                                .uniq()
                                .value()

                            return {
                                rst: ids.length <= 50,
                                message: '帖子数量不得超过50！',
                            }
                        }
                    }]
                },
                style: {
                    width: 450
                }
            }],
        ]
    // 专科
    } else if (typeId === 3) {
        list = [
            [{
                type: 'Input',
                field: 'majorName',
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
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'logoUrl',
                label: '专业logo',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'logoUrl',
                        fileList: injection.logoUrl,
                        // uploadTips: '上传图片',
                        width: 88,
                        height: 88,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Input',
                field: 'majorFeature',
                label: '专业特点',
                placeholder: '不超过26个字符，用英文逗号“,”隔开，建议每条不超过8个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 26,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'lessonFeatureUrl',
                label: '课程特点',
                render(diyProps) {
                    const uploadProps = {
                        field: 'lessonFeatureUrl',
                        fileList: injection.lessonFeatureUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'learnPlanUrl',
                label: '学习规划指导',
                render(diyProps) {
                    const uploadProps = {
                        field: 'learnPlanUrl',
                        fileList: injection.learnPlanUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'postIds',
                label: '学习讨论',
                placeholder: '请输入在学习讨论模块置顶展示的帖子id，用英文逗号“，”分隔开，不超过50个',
                valid: {
                    onchange: [{
                        reg: e => {
                            const ids = _.chain(e.split(','))
                                .map(item => {
                                    return item.trim()
                                })
                                .without('')
                                .uniq()
                                .value()

                            return {
                                rst: ids.length <= 50,
                                message: '帖子数量不得超过50！',
                            }
                        }
                    }]
                },
                style: {
                    width: 450
                }
            }],
        ]
    // 资格
    } else if (typeId === 4) {
        list = [
            [{
                type: 'Input',
                field: 'majorName',
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
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'logoUrl',
                label: '专业背景图',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'logoUrl',
                        fileList: injection.logoUrl,
                        // uploadTips: '上传图片',
                        width: 372,
                        height: 266,
                        size: 100,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'introduction',
                label: '专业简介',
                placeholder: '不超过70个字符',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 70,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'majorFeature',
                label: '专业特点',
                placeholder: '不超过26个字符，用英文逗号“,”隔开，建议每条不超过8个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 26,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Textarea',
                field: 'condition',
                label: '报考条件',
                placeholder: '不超过90个字符',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 90,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Input',
                field: 'examTime',
                label: '考试时间',
                placeholder: '不超过13个字符',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 13,
                    }]
                },
                style: {
                    width: 450
                },
            }],
            [{
                type: 'Diy',
                field: 'lessonFeatureUrl',
                label: '课程特点',
                render(diyProps) {
                    const uploadProps = {
                        field: 'lessonFeatureUrl',
                        fileList: injection.lessonFeatureUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Diy',
                field: 'learnPlanUrl',
                label: '学习规划指导',
                render(diyProps) {
                    const uploadProps = {
                        field: 'learnPlanUrl',
                        fileList: injection.learnPlanUrl,
                        // uploadTips: '上传图片',
                        width: 750,
                        size: 200,
                        ...diyProps, // 仅透传changeState方法       
                    }
                    return <UploadImg {...uploadProps} />
                }
            }],
            [{
                type: 'Textarea',
                field: 'postIds',
                label: '学习讨论',
                placeholder: '请输入在学习讨论模块置顶展示的帖子id，用英文逗号“，”分隔开，不超过50个',
                valid: {
                    onchange: [{
                        reg: e => {
                            const ids = _.chain(e.split(','))
                                .map(item => {
                                    return item.trim()
                                })
                                .without('')
                                .uniq()
                                .value()

                            return {
                                rst: ids.length <= 50,
                                message: '帖子数量不得超过50！',
                            }
                        }
                    }]
                },
                style: {
                    width: 450
                }
            }],
        ]
    }

    return {
        labelWidth: '150',
        btnStyle: {
            paddingLeft: '130px',
        },
        hideCancel: true,
        injection, // edit状态下需要回填的数据
        list,
        save: (e, editCompnent) => {
            props.dispatch('submitEdit', e, editCompnent)
        },
        cancel: e => {
            props.dispatch('closeEdit')
        }
    }
}

export default getCfg