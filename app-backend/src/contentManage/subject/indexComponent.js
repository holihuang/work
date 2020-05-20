/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:44 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-09-11 14:26:36
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
import SubjectModal from './subjectModal/index'
import ImgPreview from './imgPreview'

import { getColumns } from './TableFields'

export default (props) => {

    const titleProps = {
        title: '专题精选',
        btnProps: [{
            label: '新增专题',
            onClickCb: () => {
                console.log('加一个 业务逻辑')
                props.dispatch('modalChange',{visible:true})
            },
        }]
    }

    const filtersProps = {
        list: [
            [{
                type: 'Input',
                field: 'subjectName',
                label: '专题名称',
                width: 300,
                style: {
                    width: 180
                },
            },{
                type: 'Select',
                field: 'userType',
                defaultValue: '0',
                label: '受众类型',
                width: 300,
                style: {
                    width: 180
                },
                dataSource: [{
                    label: '全部',
                    value: '0',
                },
                {
                    label: '全部用户',
                    value: '1',
                },
                {
                    label: '付费用户',
                    value: '2',
                },
                {
                    label: '免费用户',
                    value: '3',
                }]
            },{
                type: 'Select',
                field: 'status',
                defaultValue: '0',
                label: '展示状态',
                width: 300,
                style: {
                    width: 180
                },
                dataSource: [{
                    label: '全部',
                    value: '0',
                },
                {
                    label: '展示中',
                    value: '1',
                },
                {
                    label: '已下线',
                    value: '2',
                }]
            },]
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
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
    const subjectModalProps = {
        visible: true,
        handleOk: _ => {

        },
        handleCancel: _ =>{
            props.dispatch('modalChange',{visible:false})
        },
        ...props
    }
    const imgPreviewProps = {
        visible: props.previewVisible,
        handleCancel: _ => {
            props.dispatch('imgPreview',{})
        },
        previewImgUrl: props.previewImgUrl
    }
    return (
        <div>
            <Title {...titleProps} />
            <Filters {...filtersProps} />
            <List {...listProps} />
            {props.addVisible ? <SubjectModal {...subjectModalProps} /> : null}
            <ImgPreview {...imgPreviewProps} />
        </div>
    )
}

