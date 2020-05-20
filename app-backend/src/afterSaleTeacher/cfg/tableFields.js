/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */
import React from 'react'

import OperCell from 'common/reactComponent/tableRender/OperCell'

import cfg from './index'

// 接收props
export const getColumns = props => {
	return [{ 
		title: '学院',
		dataIndex: 'schoolName',
		key: 'schoolName'
	}, 
	{
		title: '家族',
		dataIndex : 'familyName',
		key: 'familyName',
	},
	{
		title: '客诉老师名称',
		dataIndex: 'teacherName',
		key: 'teacherName'
	}, 
	{
		title: '客诉老师263账号',
		dataIndex: 'teacherAccount',
		key: 'teacherAccount'
	}, 
	{
		title: '头像',
		dataIndex: 'imgUrl',
		key: 'imgUrl',
		render(value, row, index) {
			return (
				<img src={row.imgUrl} height='60' width='60' />
			)
		}
	}, 
	{
		title: '创建时间',
		dataIndex: 'createTime',
		key: 'createTime'
	},
	{
		title: '当前状态',
		dataIndex: 'deleteFlag',
		key: 'deleteFlag',
		render(e, row, index) {
			const target = cfg.stat.find(item => item.value === row.deleteFlag)
			return target ? target.label : ''
		}
	},
	{
		title: '操作',
		dataIndex: 'oper',
		key: 'oper',
		render(...rest) {
			const targetValue = (rest[1].deleteFlag + 1) % 2
			const target = cfg.stat.find(item => item.value === targetValue)
			
			const operProps = {
				args: rest,
				list: [{
					label: '修改',
					onClickCb(e) {
						props.dispatch('edit', e)
					}
				},
				{
					label: target.label,
					onClickCb(e) {
						props.dispatch('stat', e)
					}
				}]
			}
			return (
				<OperCell {...operProps} />
			)
		}
	}]
}
