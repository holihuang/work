/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:44 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-02-27 18:46:53
 */
/**
 * @file test backbone import reaact
 * @author gushouchuang
 * @date 2017-12-29
 */
import React, {Component} from 'react'

import Title from '../../common/reactComponent/Title'
import Filters from '../../common/reactComponent/Filters'
import List from '../../common/reactComponent/List'
import SubjectContentModal from './subjectContentModal/index'
import ResultModal from './resultModal'

import { getColumns } from './TableFields'

export default (props) => {

    const titleProps = {
        link: {
            label: '< 返回专题列表',
            onChangeCb() {
                // route hash
                window.location.hash = '#subject'
            }
        },
        title: props.subjectName + ' -> 管理专题内容',
        btnProps: []
    }
    if(props.allowOperate == 1) {
        titleProps.btnProps.push({
            label: '添加',
            onClickCb: () => {
                props.dispatch('modalChange',{visible:true})
            },
        })
    }

    const filtersProps = {
        list: [
            [{
                type: 'Select',
                field: 'contentType',
                defaultValue: 0,
                label: '内容',
                dataSource: [{
                    label: '帖子',
                    value: 0,
                }],
                onChangeCb: e => {
                    //
                    return props.dispatch('selectContentType', e)
                }
            }]
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
    }
    switch(props.queryContentType) {
        case 0:
            filtersProps.list[0].push({
                type: 'Input',
                field: 'postId',
                placeholder: '请输入帖子id',
                label: '',
                width: 200,
            })
        break
    }
    const listProps = {
        columns: getColumns(props),
        dataSource: props.dataSource,
        total: props.total,
        pagination : {
            pageSize: 10, // antd默认是10
            total: props.total,
            current: props.listParams.pageNo,
        },
        // pageSize: 20, 
        tableReload: params => {
            console.log(params)
            props.dispatch('tableReload', params)
        }
    }
    const subjectContentModalProps = {
        visible: true,
        handleOk: _ => {

        },
        handleCancel: _ =>{
            props.dispatch('modalChange',{visible:false})
        },
        ...props
    }
    const resultModalProps = {
        visible: true,
        handleOk: _ => {

        },
        handleCancel: _ =>{
            props.dispatch('resultModalChange',{visible:false})
        },
        ...props
    }
    return (
        <div>
            <Title {...titleProps} />
            <Filters {...filtersProps} />
            <List {...listProps} />
            {props.addVisible ? <SubjectContentModal {...subjectContentModalProps} /> : null}
            {
                props.resultModalVisible ? 
                <ResultModal {...resultModalProps} />
                : null
            }
        </div>
    )
}

