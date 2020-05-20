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
		title: '班型ID',
		dataIndex : 'classId',
		key: 'classId',
	},
	{
		title: '权重值',
		dataIndex : 'weight',
		key: 'weight',
	},
	{
		title: '名称',
		dataIndex: 'className',
		key: 'className'
	},
	{
		title: '价格',
		dataIndex : 'price',
		key: 'price',
	},
	{
		title: '售卖状态',
		dataIndex: 'sellStatus',
		key: 'sellStatus',
		render(e, row, index) {
			return cfg.sellStatus.find(item => item.value === row.sellStatus).label
		}
	},
	{
		title: '特点',
		dataIndex: 'classFeature',
		key: 'classFeature'
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
