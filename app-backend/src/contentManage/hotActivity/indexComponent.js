/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:44 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-01 21:55:52
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
import AddAct from './addAct/index'
import OperateLog from './operateLog/index'
import ImgPreview from './imgPreview'

import { getColumns } from './TableFields'

export default (props) => {

    const titleProps = {
        title: '热门活动',
        btnProps: [{
            label: '新增活动',
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
                field: 'title',
                label: '活动标题',
                width: 300,
                style: {
                    width: 180
                },
            },{
                type: 'Select',
                field: 'contentType',
                defaultValue: '0',
                label: '跳转页面',
                width: 300,
                labelWidth: '95',
                style: {
                    width: 180
                },
                dataSource: [{
                    label: '全部',
                    value: '0',
                },
                {
                    label: '帖子详情页',
                    value: '1',
                },
                {
                    label: '话题详情页',
                    value: '2',
                },
                {
                    label: '活动页面',
                    value: '3',
                }],
                onChangeCb: e => {
                    //
                    return props.dispatch('selectContentType', e)
                }
            },],
            [{
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
            },
            {
                type: 'DatePicke',
                field: 'showTime',
                needHMS: 'true',
                label: '展示时间包含',
                width: 300,
                style: {
                    width: 180
                },
            },
            {
                type: 'Select',
                field: 'status',
                defaultValue: '0',
                width: 300,
                style: {
                    width: 180
                },
                label: '展示状态',
                dataSource: [{
                    label: '全部',
                    value: '0',
                },
                {
                    label: '待上线',
                    value: '1',
                },
                {
                    label: '进行中',
                    value: '2',
                },
                {
                    label: '已结束',
                    value: '3',
                }]
            },]
        ],
        query: filters => {
            props.dispatch('query', filters)
        }
    }
    switch(props.queryContentType) {
        case 1:
            filtersProps.list[0].push({
                type: 'Input',
                inputType: 'number',
                field: 'skipId',
                placeholder: '请输入帖子id',
                label: '',
                key: 'skipId',
            })
        break
        case 2:
        filtersProps.list[0].push({
            type: 'Input',
            field: 'skipName',
            placeholder: '请输入话题名称',
            label: '',
            key: 'skipName',
        })
        break
    }
    const listProps = {
        columns: getColumns(props),
        dataSource: props.dataSource,
        total: props.total,
        // pageSize: 20, 
        pagination : {
            pageSize: 10, // antd默认是10
            total: props.total,
            current: props.listParams.pageNo,
        },
        tableReload: params => {
            console.log(params)
            props.dispatch('tableReload', params)
        }
    }
    const addActProps = {
        visible: true,
        handleOk: _ => {

        },
        handleCancel: _ =>{
            props.dispatch('modalChange',{visible:false})
        },
        ...props
    }
    const operateLogProps = {
        visible: props.operateLogVisible,
        handleOk: _ => {
            props.dispatch('closeOperateLog')
        },
        dataSource: props.operateLogList,
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
            {props.addVisible ? <AddAct {...addActProps} /> : null}
            <OperateLog {...operateLogProps} />
            <ImgPreview {...imgPreviewProps} />
        </div>
    )
}

