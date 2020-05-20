/*
* @file: 新建|编辑 filter cfg
* @author: huanghaolei
* @date: 2018-09-25
* */

import moment from 'moment'
import optionCfg from './optionCfg'
import service from '../service'

const getCfg = (component = {}) => {
    const { props = {}, handleSave } = component
    const { hash } = window.location
    const { publishState } = props
    // const posIdDisabled = hash.includes('edit') ? +publishState : false
    const posIdDisabled = hash.includes('edit')
    const operBtnArr = !+publishState ? [
        {
            type: 'Button',
            field: 'tempSave',
            text: '暂存并继续',
            skin: 'primary',
            width: '220px',
            onClickCb: () => {
                handleSave({ isTempSave: 1 })
            },
        },
    ] : []

    return {
        lineMargin: '15px',
        style: {
            padding: '0 30px',
        },
        list: [
            [
                {
                    type: 'Input',
                    field: 'postId',
                    // label: '帖子id',
                    placeholder: '请输入帖子id',
                    disabled: posIdDisabled,
                    marginRight: '15px',
                    width: '220px',
                    defaultValue: props.postId,
                    onBlurCb: (e, filterComponent) => {
                        // e 内容
                        service.adminGetPostInfo({ postId: e }).then(response => {
                            const {
                                title = '',
                                postCreateTime = '',
                                studentId,
                                isRichText,
                                content,
                                externalLinks,
                                id,
                            } = response
                            filterComponent.setState({
                                title,
                                postCreateTime,
                                studentId,
                            })
                            const { dispatch } = props
                            dispatch(
                                'onBlured',
                                {
                                    title,
                                    postCreateTime,
                                    studentId,
                                    postId: e,
                                    isRichText,
                                    content,
                                    externalLinks,
                                    id,
                                },
                            )
                        }, reject => {
                            alert(reject)
                        })
                    },
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        const funcName = hash.includes('add') ? 'onChangePostIdAdd' : 'onChangePostId'
                        const value = e.target.value.trim()
                        if (/\D/.test(value)) {
                            filterComponent.setState({ postId: '' })
                            dispatch(funcName, { postId: '' })
                            return
                        }
                        dispatch(funcName, { postId: value })
                    },
                },
            ],
            [
                {
                    type: 'Input',
                    field: 'title',
                    placeholder: '请输入帖子标题',
                    marginRight: '15px',
                    width: '455px',
                    defaultValue: props.title,
                    onChangeCb: e => {
                        const { dispatch } = props
                        const funcName = hash.includes('add') ? 'onChangeTitleAdd' : 'onChangeTitle'
                        dispatch(funcName, { title: e.target.value.trim() })
                    },
                },
                {
                    type: 'DatePicker',
                    field: 'postCreateTime',
                    placeholder: '请输入发帖时间',
                    style: {
                        width: '220px',
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
                },
                {
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
                        dispatch(funcName, { studentId: value })
                    },
                },
            ],
            [
                {
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
                },
                {
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
                },
                {
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
                },
                {
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
                },
            ],
            [
                {
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
                },
                {
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
                },
                {
                    type: 'Number',
                    field: 'age',
                    placeholder: '请输入年龄',
                    style: {
                        width: '220px',
                    },
                    marginRight: '15px',
                    defaultValue: props.age || '',
                    onChangeCb: (e, filterComponent) => {
                        const { dispatch } = props
                        const funcName = hash.includes('add') ? 'onChangeAgeAdd' : 'onChangeAge'
                        const value = e || ''
                        if (/\D/.test(value)) {
                            filterComponent.setState({ age: '' })
                            dispatch(funcName, { age: '' })
                            return
                        }
                        dispatch(funcName, { age: e || 0 })
                    },
                },
            ],
            [{
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
                    dispatch('onChangeCareerAdd', { career: e })
                },
            },
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
                    dispatch(funcName, { contentLabel: e })
                },
            },
            {
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
            },
            {
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
                    value: -1,
                    label: '请选择产品分类',
                },
                ...optionCfg.productTypeList,
                ],
                onChangeCb: e => {
                    const { dispatch } = props
                    const funcName = hash.includes('add') ? 'onChangeProductTypeAdd' : 'onChangeProductType'
                    dispatch(funcName, { productType: e })
                },
            },
            ],
            // [...operBtnArr],
        ],
    }
}

export default getCfg
