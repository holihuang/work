/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */
import React from 'react'

import { Modal } from 'antd'
const confirm = Modal.confirm

import OperCell from 'common/reactComponent/tableRender/OperCell'
import ImgRender from 'common/reactComponent/tableRender/ImgRender'

import cfg from './index'

// 接收props
export const getColumns = props => {
	return [{ 
		title: '专业名称',
		dataIndex: 'majorName',
		key: 'majorName',
	}, 
	{
		title: '所属分类',
		dataIndex : 'typeId',
		key: 'typeId',
		render: (e, row, index) => {
			const target = cfg.major.find(item => item.value === row.typeId)
			return target ? target.label : ''
		},
	},
	{
		title: '状态',
		dataIndex: 'isHide',
		key: 'isHide',
		render: (e, row, index) => {
			const target = cfg.stat.find(item => item.value === row.isHide)
			return target ? target.label + '中' : ''
		},
	}, 
	{
		title: '操作日志',
		dataIndex: 'detail',
		render(...rest) {
			const operProps = {
				args: rest,
				list: [{
					label: '查看',
					onClickCb(e) {
						props.dispatch('detail', e)
					}
				}]
			}

			return (
				<OperCell {...operProps} />
			)
		},
	},
	{
		title: '操作',
		dataIndex: 'oper',
		key: 'oper',
		render(...rest) {
			let stat = cfg.stat.find(item => item.value === rest[1].isHide).label
			// 反转
			stat = stat === '隐藏' ? '显示' : '隐藏'

			const operProps = {
				args: rest,
				list: [{
					label: '编辑',
					onClickCb(e) {
						props.dispatch('edit', e)
					}
				},
				{
					label: stat,
					onClickCb(e) {
						confirm({
						    title: `确定${stat}该专业吗？`,
						    onOk() {
						      props.dispatch('stat', e)
						    },
						    onCancel() {},
						});
					}
				}]
			}

			if (stat === '显示') {
				operProps.list.push({
					label: '删除',
					onClickCb(e) {
						props.dispatch('del', e)
					}
				})
			}

			return (
				<OperCell {...operProps} />
			)
		},
	}]
}


// 查看明细的table
export const getDetailColumns = () => {
	return [{ 
		title: '序号',
		dataIndex: 'key',
		key: 'key'
	}, 
	{
		title: '操作时间',
		dataIndex: 'createTime',
		key: 'createTime',
	}, 
	{
		title: '操作人',
		dataIndex: 'operator',
		key: 'operator',
	}, 
	{
		title: '操作',
		dataIndex: 'type',
		key: 'type',
	}]
}