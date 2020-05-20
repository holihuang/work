/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */
import React from 'react'

import OperCell from 'common/reactComponent/tableRender/OperCell'
import ImgRender from 'common/reactComponent/tableRender/ImgRender'

import cfg from './index'

// 接收props
export const getColumns = props => {
	return [{ 
		title: '专业名称',
		dataIndex: 'id',
		key: 'id'
	}, 
	{
		title: '所属分类',
		dataIndex : 'lessonName',
		width: 250,
		key: 'lessonName',
	},
	{
		title: '状态',
		dataIndex: 'labelName',
		key: 'labelName'
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
