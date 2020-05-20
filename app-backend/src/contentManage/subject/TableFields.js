/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:41 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-02-28 14:15:54
 */
/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-1-2
 */
import React from 'react'
import moment from 'moment'

import {envCfg} from '../../common/envCfg'
import OperCell from '../../common/reactComponent/tableRender/OperCell'

// 接收props
export const getColumns = (props) => {
    const operateList = (type, e) => {
        let list = [{
            label: '查看',
            onClickCb() {
                props.dispatch('view', e)
            }
        }]
        switch(+type) {
            case 1:
                list.push({
                    label: '更新',
                    onClickCb() {
                        props.dispatch('edit', e)
                    }
                },{
                    label: '下线',
                    onClickCb() {
                        props.dispatch('offline', e)
                    }
                },{
                    label: '管理内容',
                    onClickCb() {
                        props.dispatch('editContent', e)
                    }
                })
                break
            case 2:
                list.push({
                    label: '查看内容',
                    onClickCb() {
                        props.dispatch('editContent', e)
                    }
                })
                break
            default:
                break
        }
        return {list}
    }
	return [{ 
		title: '专题图片',
        dataIndex: 'subjectImageUrl',
        className: 'table-colum',
        key: 'subjectImageUrl',
        render(value, row, index) {
            return <img width="100" onClick={ _ => {
                props.dispatch('imgPreview', { previewVisible: true, previewImgUrl:value });
            }} src={value}/>
        }
	}, 
	{
		title: '专题名称',
        dataIndex: 'subjectName',
        className: 'table-colum',
		key: 'subjectName',
    }, 
	{
		title: '专题简介',
        dataIndex: 'subjectAbstract',
        className: 'table-colum',
        key: 'subjectAbstract',
    },
    {
		title: '权重值',
        dataIndex: 'subjectWeight',
        className: 'table-colum',
		key: 'subjectWeight',
	},
	{
		title: '受众类型',
        dataIndex: 'userType',
        className: 'table-colum',
        key: 'userType',
        render(value, row, index) {
            let label = ''
            switch(value){
                case 1:
                    label = '全部用户'
                    break
                case 2:
                    label = '付费用户'
                    break
                case 3:
                    label = '免费用户'
                    break
            }
            return label
        }
	},
	{
		title: '创建人',
        dataIndex : 'creater',
        className: 'table-colum',
        key: 'creater',
	}, 
	{
		title: '创建时间',
        dataIndex: 'createTime',
        className: 'table-colum',
        key: 'createTime',
        render(value, row, index) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
	},
	{
		title: '最后一次操作人',
        dataIndex : 'updater',
        className: 'table-colum',
        key: 'updater',
	}, 
	{
		title: '最后一次操作时间',
        dataIndex: 'updateTime',
        className: 'table-colum',
        key: 'updateTime',
        render(value, row, index) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
    },
	{
		title: '展示状态',
        dataIndex: 'status',
        className: 'table-colum',
		key: 'status',
        render(value, row, index) {
            let label = ''
            switch(value){
                case 1:
                    label = '展示中'
                    break
                case 2:
                    label = '已下线'
                    break
            }
            return label
        }
	},
	{
		title: '操作',
        dataIndex: 'status',
        className: 'table-colum',
		key: 'oper',
		render(value, row, index) {

			const e = {
				value,
				row,
				index,
            }
			const operProps = operateList(value, e)

			return (
				<OperCell {...operProps} />
			)
		}
	}]
}