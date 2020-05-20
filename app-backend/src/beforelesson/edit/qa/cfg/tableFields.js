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
		title: '视频封面',
		dataIndex: 'coverUrl',
		key: 'coverUrl',
		render(value, row, index) {
			const imgProps = {
				src: row.coverUrl,
				height: 'auto',
				width: 485,
				title: '视频封面',
			}
			return (
				<ImgRender {...imgProps} />
			)
		}
	}, 
	{
		title: '视频标题',
		dataIndex : 'title',
		key: 'title',
	},
	{
		title: '视频描述',
		dataIndex: 'description',
		key: 'description'
	}, 
	{
		title: '视频文件',
		dataIndex: 'videoUrl',
		key: 'videoUrl',
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
