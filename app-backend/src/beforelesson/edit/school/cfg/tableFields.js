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
		title: '院校logo',
		dataIndex: 'schoolLogo',
		key: 'schoolLogo',
		render(value, row, index) {
			const imgProps = {
				src: row.schoolLogo,
				height: 'auto',
				width: 485,
				title: '院校logo',
			}
			return (
				<ImgRender {...imgProps} />
			)
		}
	}, 
	{
		title: '院校名称',
		dataIndex : 'schoolName',
		key: 'schoolName',
	},
	{
		title: '院校顶部图',
		dataIndex: 'schoolUrl',
		key: 'schoolUrl',
		render(value, row, index) {
			const imgProps = {
				src: row.schoolUrl,
				height: 'auto',
				width: 485,
				title: '院校顶部图',
			}
			return (
				<ImgRender {...imgProps} />
			)
		}
	}, 
	{
		title: '院校招生简介图',
		dataIndex: 'introduction',
		key: 'introduction',
		render(value, row, index) {
			const imgProps = {
				src: row.introduction,
				height: 'auto',
				width: 485,
				title: '院校招生简介图',
			}
			return (
				<ImgRender {...imgProps} />
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
