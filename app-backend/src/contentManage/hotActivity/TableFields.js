/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:41 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-01 23:56:25
 */
/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-1-2
 */
import React from 'react'
import moment from 'moment'

import {envCfg} from '../../common/envCfg'
import OperCell from '../../common/reactComponent/tableRender/OperCell'

// 接收props
export const getColumns = (props) => {
    const operateList = (type, e) => {
        let list = [{
            label: '查看',
            onClickCb() {
                props.dispatch('view', e)
            }
        }]
        switch(+type) {
            case 1:
                list.push({
                    label: '更新',
                    onClickCb() {
                        props.dispatch('edit', e)
                    }
                })
                list.push({
                    label: '删除',
                    onClickCb() {
                        props.dispatch('del', e)
                    }
                })
                break
            case 2:
                list.push({
                    label: '更新',
                    onClickCb() {
                        props.dispatch('edit', e)
                    }
                })
                list.push({
					label: '下线',
					onClickCb() {
						props.dispatch('offline', e)
					}
				})
                break
            default:
                break
        }
        return {list}
    }
	return [{ 
		title: '活动图',
		dataIndex: 'imageUrl',
        key: 'imageUrl',
        className: 'table-colum',
        render(value, row, index) {
            return <img width="100" onClick={ _ => {
                props.dispatch('imgPreview', { previewVisible: true, previewImgUrl:value });
            }} src={value}/>
        }
	}, 
	{
		title: '活动标题',
		dataIndex: 'title',
        key: 'title',
        className: 'table-colum',
	}, 
	{
		title: '跳转页面',
		dataIndex : 'contentType',
        key: 'contentType',
        className: 'table-colum',
        render(value, row, index) {
            switch(+value) {
                case 1:
                    return <div>
                                帖子详情页
                                <br/>
                                <a style={{color: "rgb(16, 142, 233)"}} href={`${envCfg.postBaseUrl}${row.skipId}`} target="_blank">{row.skipId}</a>
                            </div>
                case 2:
                    return <div>
                                话题详情页
                                <br/>
                                <a style={{color: "rgb(16, 142, 233)"}} href={`${envCfg.mBaseUrl}/#topic/${encodeURI(row.content)}`} target="_blank">{row.content}</a>
                                
                            </div>
                case 3:
                    return '活动页面'
            }
        }
        
	},
	{
        title: '受众类型',
        className: 'table-colum',
		dataIndex: 'userType',
        key: 'userType',
        render(value, row, index) {
            let label = ''
            switch(value){
                // case 0:
                //     label = '全部'
                //     break
                case 1:
                    label = '全部用户'
                    break
                case 2:
                    label = '付费用户'
                    break
                case 3:
                    label = '免费用户'
                    break
            }
            return label
        }
	}, 
	{
		title: '开始时间',
        dataIndex: 'startTime',
        className: 'table-colum',
        key: 'startTime',
        render(value, row, index) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
	}, 
	{
		title: '结束时间',
        dataIndex: 'endTime',
        className: 'table-colum',
        key: 'endTime',
        render(value, row, index) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
    },
    {
		title: '操作日志',
        dataIndex: 'operView',
        className: 'table-colum',
		key: 'operView',
		render(value, row, index) {

			const e = {
				value,
				row,
				index,
			}
			const operProps = {
				list: [{
					label: '查看',
					onClickCb() {
						props.dispatch('log', e)
					}
				}]
			}
			return (
				<OperCell {...operProps} />
			)
		}
	},
	{
		title: '展示状态',
        dataIndex: 'status',
        className: 'table-colum',
		key: 'status',
        render(value, row, index) {
            let label = ''
            switch(value){
                case 1:
                    label = '待上线'
                    break
                case 2:
                    label = '进行中'
                    break
                case 3:
                    label = '已结束'
                    break
            }
            return label
        }
	},
	{
		title: '操作',
        dataIndex: 'status',
        className: 'table-colum',
		key: 'oper',
		render(value, row, index) {

			const e = {
				value,
				row,
				index,
            }
			const operProps = operateList(value, e)

			return (
				<OperCell {...operProps} />
			)
		}
	}]
}