/*
* @file: filter cfg
* @author: huanghaolei
* @date:2018-09-14
* */

import React from 'react'
import moment from 'moment'
import optionCfg from './optionCfg'

const getCfg = (component = {}) => {
    const { props = {} } = component
    const { hash } = window.location
    let operBtnArr = []
    let ageObj = {}
    let timeObj = {}
    if (hash.includes('add')) {
        operBtnArr = [
            {
                type: 'Button',
                field: 'save',
                text: '保存',
                skin: 'primary',
                width: '220px',
                onClickCb: () => {
                    const { dispatch } = props
                    const tip = hash.includes('edit') ? '修改成功' : '新建成功'
                    dispatch('onSave', { tip })
                },
            },
        ]
        ageObj = {
            type: 'Number',
            field: 'age',
            placeholder: '请输入年龄',
            style: {
                width: '220px',
            },
            marginRight: '15px',
            defaultValue: props.age,
            onChangeCb: (e, filterComponent) => {
                const { dispatch } = props
                const funcName = hash.includes('add') ? 'onChangeAgeAdd' : 'onChangeAge'
                dispatch(funcName, { age: (e || 0) })
            },
        }
        timeObj = {
            type: 'DatePicke', // to tip:// Filters //: DatePicke !=== DatePicker
            field: 'postCreateTime',
            placeholder: '请输入发帖时间',
            style: {
                width: '415px',
                height: '32px',
            },
            defaultValue: /.*add$/.test(hash) ? null : moment(props.postCreateTime || '', 'YYYY-MM-DD'),
            format: 'YYYY-MM-DD',
            marginRight: '15px',
            // label: '发起时间',
            onChangeCb: e => {
                const { dispatch } = props
                const funcName = hash.includes('add') ? 'onChangeRangePickerAdd' : 'onChangeRangePicker'
                dispatch(funcName, { e })
            },
        }
    } else {
        operBtnArr = [
            {
                type: 'Button',
                field: 'query',
                text: '查询',
                skin: 'primary',
                width: '100px',
                marginRight: '-20px',
                onClickCb: (e, filterComponent) => {
                    const { dispatch } = props
                    dispatch('onQuery', { isQueryAll: true })
                },
            }, {
                type: 'Button',
                filed: 'add',
                text: '新建',
                skin: 'primary',
                width: '100px',
                marginRight: '-20px',
                onClickCb: (e, filterComponents) => {
                    window.location.hash = '/caseHub/add'
                },
            }, {
                type: 'Button',
                field: 'export',
                skin: 'primary',
                text: '导出',
                width: '100px',
                onClickCb: (e, filterComponent) => {
                    const { dispatch } = props
                    dispatch('onExport', { ...filterComponent.state })
                },
            },
        ]
        ageObj = {
            type: 'Select',
            size: 'default',
            field: 'age',
            // label: '年龄',
            placeholder: '请选择年龄',
            style: {
                width: '220px',
            },
            marginRight: '15px',
            defaultValue: props.age,
            dataSource: [{
                value: '',
                label: '请选择年龄',
            },
            ...optionCfg.ageList,
            ],
            onChangeCb: (e, filterComponent) => {
                const { dispatch } = props
                const funcName = hash.includes('add') ? 'onChangeAgeAdd' : 'onChangeAge'
                dispatch(funcName, { age: e })
            },
        }
        timeObj = {
            type: 'RangePicker',
            field: 'rangePicker',
            dateFormat: 'YYYY-MM-DD',
            style: {
                width: '455px',
                height: '32px',
            },
            marginRight: '15px',
            // label: '发起时间',
            onChangeCb: e => {
                const { dispatch } = props
                const funcName = hash.includes('add') ? 'onChangeRangePickerAdd' : 'onChangeRangePicker'
                dispatch(funcName, { e })
            },
        }
    }
    return {
        lineMargin: '15px',
        style: {
            padding: '0 30px',
        },
        list: [
            [{
                type: 'Select',
                size: 'default',
                field: 'province',
                // label: '省',
                placeholder: '请选择省',
                style: {
                    width: '220px',
                },
                marginRight: '15px',
                defaultValue: props.province,
                dataSource: [{
                    value: '',
                    label: '请选择省',
                },
                ...optionCfg.provinceList,
                ],
                onChangeCb: (e, filterComponent) => {
                    // onChange province to model
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeProvinceAdd' : 'onChangeProvince'
                    dispatch(funcName, { province: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'academy',
                // label: '学院',
                placeholder: '请选择学院',
                style: {
                    width: '220px',
                },
                marginRight: '15px',
                defaultValue: props.academy,
                dataSource: [{
                    value: '',
                    label: '请选择学院',
                },
                ...optionCfg.academyList,
                ],
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeAcademyAdd' : 'onChangeAcademy'
                    dispatch(funcName, { academy: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                showSearch: true,
                field: 'majorName',
                // label: '专业',
                placeholder: '请选择专业',
                style: {
                    width: '220px',
                },
                marginRight: '15px',
                defaultValue: props.majorName,
                dataSource: [{
                    value: '',
                    label: '请选择专业',
                },
                ...props.majorList,
                ],
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeMajorAdd' : 'onChangeMajor'
                    dispatch(funcName, { majorName: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'education',
                // label: '原学历',
                placeholder: '请选择原学历',
                style: {
                    width: '220px',
                },
                marginRight: '15px',
                defaultValue: props.education,
                dataSource: [{
                    value: '',
                    label: '请选择原学历',
                },
                ...optionCfg.originalEduLevelList.map(item => ({ label: item, value: item })),
                ],
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeEducationAdd' : 'onChangeEducation'
                    dispatch(funcName, { education: e })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'sex',
                // label: '性别',
                placeholder: '请选择性别',
                style: {
                    width: '220px',
                },
                marginRight: '15px',
                defaultValue: props.sex,
                dataSource: [{
                    value: '',
                    label: '请选择性别',
                },
                ...optionCfg.sexList,
                ],
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeSexAdd' : 'onChangeSex'
                    dispatch(funcName, { sex: e })
                },
            }],
            [{
                ...ageObj,
            }, {
                ...timeObj,
            }, {
                type: 'Number',
                field: 'postId',
                // label: '帖子id',
                placeholder: '请输入帖子id',
                marginRight: '15px',
                width: '220px',
                defaultValue: props.postId,
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangePostIdAdd' : 'onChangePostId'
                    const value = e || ''
                    if (/\D/.test(value)) {
                        filterComponent.setState({ postId: '' })
                        dispatch(funcName, { postId: '' })
                        return
                    }
                    dispatch(funcName, { postId: (e || '') })
                },
            }, {
                type: 'Number',
                field: 'studentId',
                // label: '学院id',
                placeholder: '请输入学员id',
                marginRight: '15px',
                width: '220px',
                defaultValue: props.studentId,
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeStudentIdAdd' : 'onChangeStudentId'
                    const value = e || ''
                    if (/\D/.test(value)) {
                        filterComponent.setState({ studentId: '' })
                        dispatch(funcName, { studentId: '' })
                        return
                    }
                    dispatch(funcName, { studentId: (e || '') })
                },
            }],
            [{
                type: 'Input',
                field: 'studentName',
                placeholder: '请输入学员姓名',
                marginRight: '15px',
                width: '220px',
                defaultValue: props.studentName,
                onChangeCb: e => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeStudentNameAdd' : 'onChangeStudentName'
                    dispatch(funcName, { studentName: e.target.value.trim() })
                },
            }, {
                type: 'Number',
                filed: 'id',
                placeholder: '请输入案例id',
                marginRight: '15px',
                width: '220px',
                defaultValue: props.id,
                onChangeCb: (e, filterComponent) => {
                    const value = e || ''
                    const { dispatch } = props
                    const funcName = 'onChangeId'
                    if (/\D/.test(value)) {
                        return
                    }
                    dispatch(funcName, { id: value })
                },
            }, {
                type: 'Input',
                field: 'title',
                placeholder: '请输入标题关键词',
                marginRight: '15px',
                width: '220px',
                defaultValue: props.title,
                onChangeCb: e => {
                    const { dispatch } = props
                    dispatch('onChangeCaseTitle', { title: e.target.value.trim() })
                },
            }, {
                type: 'Select',
                size: 'default',
                field: 'career',
                mode: 'multiple',
                placeholder: '请选择职业',
                marginRight: '15px',
                style: {
                    width: '220px',
                },
                defaultValue: props.career,
                dataSource: [
                    ...props.careerList.map(item => ({ label: item, value: item })),
                ],
                onChangeCb: (e, filterComponent) => {
                    const { dispatch } = props
                    const selected = e.includes('待定') ? ['待定'] : e
                    filterComponent.setState({
                        career: selected,
                    })
                    dispatch('onChangeCareer', { career: e })
                },
            }],
            [
            // {
            //     type: 'Select',
            //     field: 'identityLabel',
            //     mode: 'multiple',
            //     // label: '身份标签',
            //     placeholder: '请选择身份标签',
            //     marginRight: '15px',
            //     style: {
            //         width: '220px',
            //     },
            //     defaultValue: props.identityLabel,
            //     dataSource: [
            //     // {
            //     //     value: '请选择',
            //     //     label: '请选择身份标签',
            //     // },
            //         ...optionCfg.identityLabelList,
            //     ],
            //     onChangeCb: (e, filterComponent) => {
            //         const { dispatch } = props
            //         const funcName = hash.includes('add') ? 'onChangeIdentityLabelAdd' : 'onChangeIdentityLabel'
            //         const value = e.length ? e : ''
            //         dispatch(funcName, { identityLabel: value })
            //     },
            // },
                {
                    type: 'Select',
                    size: 'default',
                    field: 'contentLabel',
                    mode: 'multiple',
                    // label: '内容标签',
                    placeholder: '请选择内容标签',
                    marginRight: '15px',
                    style: {
                        width: '220px',
                    },
                    defaultValue: props.contentLabel,
                    dataSource: [
                        ...optionCfg.contentLabelList,
                    ],
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        const funcName = hash.includes('add') ? 'onChangeContentLabelAdd' : 'onChangeContentLabel'
                        const value = e.length ? e : ''
                        dispatch(funcName, { contentLabel: value })
                    },
                }, {
                    type: 'Select',
                    size: 'default',
                    field: 'postSource',
                    // label: '来源',
                    placeholder: '请选择来源',
                    marginRight: '15px',
                    style: {
                        width: '220px',
                    },
                    defaultValue: props.postSource,
                    dataSource: [{
                        value: '',
                        label: '请选择来源',
                    },
                    ...optionCfg.postSourceList,
                    ],
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        const funcName = hash.includes('add') ? 'onChangePostSourceAdd' : 'onChangePostSource'
                        dispatch(funcName, { postSource: e })
                    },
                }, {
                    type: 'Select',
                    size: 'default',
                    field: 'productType',
                    placeholder: '请选择产品分类',
                    marginRight: '15px',
                    style: {
                        width: '220px',
                    },
                    defaultValue: props.productType,
                    dataSource: [{
                        label: '请选择产品分类',
                        value: -1,
                    },
                    ...optionCfg.productTypeList,
                    ],
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        dispatch('onChangeProductType', { productType: e })
                    },
                }, {
                    type: 'Select',
                    size: 'default',
                    field: 'publishState',
                    placeholder: '请选择发布状态',
                    marginRight: '15px',
                    style: {
                        width: '220px',
                    },
                    defaultValue: -1,
                    dataSource: [{
                        value: -1,
                        label: '请选择发布状态',
                    },
                    ...optionCfg.publishStateList,
                    ],
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        dispatch('onChangePublishState', { publishState: e })
                    },
                },
                ...operBtnArr,
            ],
        ],

    }
}

export default getCfg
