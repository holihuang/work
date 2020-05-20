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
		title: '科目名称',
		dataIndex : 'courseName',
		key: 'courseName',
	},
	{
		title: '描述',
		width: '600',
		dataIndex: 'courseDesc',
		key: 'courseDesc'
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
				}]
			}
			return (
				<OperCell {...operProps} />
			)
		}
	}]
}
