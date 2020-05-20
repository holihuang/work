/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:41 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-02-28 14:37:47
 */
/**
 * @file table list fields
 *
 * @auth gushouchuang
 * @date 2018-1-2
 */
import React from 'react'
import moment from 'moment'

import { envCfg } from '../../common/envCfg'
import OperCell from '../../common/reactComponent/tableRender/OperCell'

// 接收props
export const getColumns = (props) => {
    
    let columns = [{
        title: '内容',
        dataIndex: 'postId',
        className: 'table-colum',
        key: 'postId',
        render(value, row, index) {
            return <div>
                        帖子
                        <br/>
                        <a style={{color: "rgb(16, 142, 233)"}} href={`${envCfg.postBaseUrl}${value}`} target="_blank">{value}</a>
                    </div>
        }
    },
    {
        title: '内容标题',
        className: 'table-colum',
        dataIndex: 'postTitle',
        key: 'postTitle',
    },
    {
        title: '内容状态',
        className: 'table-colum',
        dataIndex: 'status',
        key: 'status',
        render(value, row, index) {
            let label = ''
            switch (value) {
                case 0:
                    label = '正常'
                    break
                case 1:
                    label = '已删除'
                    break
                case 2:
                    label = '已屏蔽'
                    break
            }
            return label
        }
    },
    {
        title: '添加人',
        className: 'table-colum',
        dataIndex: 'creater',
        key: 'creater',
    },
    {
        title: '添加时间',
        className: 'table-colum',
        dataIndex: 'createTime',
        key: 'createTime',
        render(value, row, index) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
    }]

    if (props.allowOperate == 1) {
        columns.push(
            {
                title: '操作',
                className: 'table-colum',
                dataIndex: 'status',
                key: 'oper',
                render(value, row, index) {

                    const e = {
                        value,
                        row,
                        index,
                    }
                    const operProps = {
                        list: [
                            {
                                label: '移出专题',
                                onClickCb() {
                                    props.dispatch('del', e)
                                }
                            }
                        ]
                    }
                    return (
                        <OperCell {...operProps} />
                    )

                }
            })
    }
    return columns
}