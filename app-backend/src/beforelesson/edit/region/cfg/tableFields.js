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
		title: '地域',
		dataIndex : 'regionName',
		key: 'regionName',
	},
	{
		title: '专业代码',
		dataIndex: 'majorCode',
		key: 'majorCode'
	},
	{
		title: '考试时间',
		dataIndex: 'examTime',
		key: 'examTime'
	},
	{
		title: '主考院校',
		dataIndex: 'school',
		key: 'school'
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
