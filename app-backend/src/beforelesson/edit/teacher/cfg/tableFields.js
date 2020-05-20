/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */
import React from 'react'

import OperCell from 'common/reactComponent/tableRender/OperCell'
import ImgRender from 'common/reactComponent/tableRender/ImgRender'

import cfg from './index'

// 接收props
export const getColumns = props => {
	return [{ 
		title: '讲师头像',
		dataIndex: 'imageUrl',
		key: 'imageUrl',
		render(value, row, index) {
			const imgProps = {
				src: row.imageUrl,
				height: 'auto',
				width: 485,
				title: '讲师封面',
			}
			return (
				<ImgRender {...imgProps} />
			)
		}
	}, 
	{
		title: '讲师姓名',
		dataIndex : 'teacherName',
		key: 'teacherName',
	},
	{
		title: '讲师特点',
		dataIndex: 'feature',
		key: 'feature'
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
