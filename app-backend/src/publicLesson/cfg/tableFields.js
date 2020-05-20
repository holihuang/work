/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-1-2
 */
import React from 'react'

import OperCell from 'common/reactComponent/tableRender/OperCell'
import ImgRender from 'common/reactComponent/tableRender/ImgRender'

import cfg from './index'

// 接收props
export const getColumns = props => {
	return [{ 
		title: '课程ID',
		dataIndex: 'id',
		key: 'id'
	}, 
	{
		title: '课程封面',
		dataIndex: 'imgUrl',
		key: 'imgUrl',
		render(value, row, index) {
			const imgProps = {
				src: row.imgUrl,
				height: 'auto',
				width: 485,
				title: '课程封面',
			}
			return (
				<ImgRender {...imgProps} />
			)
		}
	}, 
	{
		title: '课程名称',
		dataIndex : 'lessonName',
		width: 250,
		key: 'lessonName',
	},
	{
		title: '课程标签',
		dataIndex: 'labelName',
		key: 'labelName'
	}, 
	{
		title: '供应商',
		dataIndex: 'liveProvider',
		key: 'liveProvider',
		render(value, row, index) {
			const source = cfg.liveProvider.find(item => item.value === row.liveProvider)
			return source ? source.label : ''
		}
	}, 
	{
		title: '讲师姓名',
		dataIndex: 'teacherName',
		key: 'teacherName'
	},
	{
		title: '开始时间',
		dataIndex: 'beginTime',
		key: 'beginTime'
	},
	{
		title: '结束时间',
		dataIndex: 'endTime',
		key: 'endTime'
	},
	{
		title: '课程状态',
		dataIndex: 'lessonStatus',
		key: 'lessonStatus',
		render(value, row, index) {
			return cfg.lessonStatus.find(item => item.value == row.lessonStatus).label
		}
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
		}
	},
	{
		title: '操作',
		dataIndex: 'oper',
		key: 'oper',
		render(...rest) {
			const operProps = {
				args: rest,
				list: [{
					label: '更新',
					onClickCb(e) {
						props.dispatch('edit', e)
					}
				},
				{
					label: '删除',
					onClickCb(e) {
						props.dispatch('del', e)
					}
				}]
			}

			return (
				<OperCell {...operProps} />
			)
		}
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
		title: '操作内容',
		dataIndex: 'type',
		key: 'type',
	}]
}