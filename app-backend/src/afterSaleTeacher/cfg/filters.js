/**
 * @file filter cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */

import React from 'react'

import cfg from './index'

const getCfg = props => {
    return {
        list: [
            [{
                type: 'Select',
                field: 'schoolName',
                label: '学院名称',
                defaultValue: '',
                style: {
                    width: 140
                },
                onChangeCb: e => {
                    return props.dispatch('handleSchoolNameChange', e)
                },
                dataSource: [
                    {
                        value: '',
                        label: '全部'
                    },
                    ...props.collegeList],
            },
            {
                type: 'Select',
                field: 'familyName',
                label: '家族名称',
                defaultValue: '',
                style: {
                    width: 120
                },
                dataSource: [
                    {
                        value: '',
                        label: '全部'
                    },
                    ...props.filterFamilyList],
            },
            {
                type: 'Select',
                field: 'deleteFlag',
                label: '状态',
                defaultValue: -1,
                style: {
                    width: 100,
                },
                dataSource: cfg.stat,
            },
            {
                type: 'Input',
                field: 'teacherAccount',
                placeholder: '请输入用户263账号',
                label: '客诉老师263账号',
                width: 565,
                style: {
                    width: 245
                },
            }],
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
    }
}

export default getCfg