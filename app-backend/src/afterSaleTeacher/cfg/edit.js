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
    const { dataSource, editType, editIndex, collegeList, familyList, editFamilyList } = props

    let injection = {}
    if (editType === 'edit') {
        const item = dataSource[editIndex]
        injection = _.pick(
                item,
                'teacherAccount', 
                'teacherName',
            )
        // 后端只返回学院 家族的name，id仅仅是前端自己生成的index，所以要转来转去
        injection.schoolName = props.dispatch('getValueByLabel', collegeList, item.schoolName)
        injection.familyName = props.dispatch('getValueByLabel', editFamilyList, item.familyName)
        injection.imgUrl = []
        item.imgUrl && (injection.imgUrl = [{
            uid: item.imgUrl,
            url: item.imgUrl,
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
                field: 'teacherAccount',
                label: '263账号',
                disabled: editType === 'edit',
                placeholder: '请填写老师账号',
                required: true,
                valid: {
                    onchange: [{
                        reg: 'isEmail',
                    }]
                },
                style: {
                    width: 250
                },
            }],
            [{
                type: 'Input',
                field: 'teacherName',
                label: '客诉老师姓名',
                placeholder: '请填写老师名称',
                required: true,
                tips: '不超过18字',
                valid: {
                    onchange: [{
                        reg: 'maxLength',
                        value: 18,
                    }]
                },
                style: {
                    width: 250
                },
            }],
            [{
                type: 'Select',
                field: 'schoolName',
                defaultValue: '',
                label: '学院',
                required: true,
                dataSource: [
                    {
                        value: '',
                        label: '请选择学院'
                    },
                    ...collegeList],
                style: {
                    width: 150
                },
                onChangeCb: e => {
                    return props.dispatch('handleSchoolNameChange', e, 'edit')
                }
            }],
            [{
                type: 'Select',
                field: 'familyName',
                defaultValue: '',
                required: true,
                label: '家族',
                dataSource: [
                    {
                        value: '',
                        label: '请选择家族'
                    },
                    ...editFamilyList],
                style: {
                    width: 150
                },
                onChangeCb: e => {
                    console.log(e)
                }
            }],
            [{
                type: 'Diy',
                field: 'imgUrl',
                label: '头像',
                required: true,
                render(diyProps) {
                    const uploadProps = {
                        field: 'imgUrl',
                        fileList: injection.imgUrl,
                        uploadTips: '上传头像',
                        width: 50,
                        height: 50,
                        size: 2048,
                        ignore: 'widthheight',
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
            props.dispatch('closeEdit')
        }
    }
}

export default getCfg