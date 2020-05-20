/*
** @file: tableFields
** @author: huanghaolei
** @date: 2019-10-15
*/
import React from 'react'
import Popup from '../Popup'
import cfg from './index'
import '../style.less'

export default component => [{
    title: '通知id',
    dataIndex: 'id',
}, {
    title: '通知标题',
    dataIndex: 'pushTitle',
    className: 'maxLineWidth',
}, {
    title: '通知内容',
    dataIndex: 'pushContent',
    render: (text, record) => {
        const props = {
            key: 'pushContent',
            value: text,
            record,
        }
        return <Popup {...props} />
    },
}, {
    title: '内容类型',
    dataIndex: 'contentType',
    render: (text, record) => <span>{cfg.tableLabelMapSet[text]}</span>,
}, {
    title: '内容id',
    dataIndex: 'contentId',
}, {
    title: '渠道参数',
    dataIndex: 'channel',
    className: 'maxLineWidth',
}, {
    title: '推送时间',
    dataIndex: 'pushTime',
}, {
    title: '推送操作人',
    dataIndex: 'operator',
}, {
    title: '备注',
    dataIndex: 'remark',
    className: 'maxLineWidth',
}, {
    title: '操作',
    render: (row) => {
        const { dispatch } = component
        const { pushStatus = 0, id } = row
        const delProps = {
            onClick: () => {
                if(confirm('确定要删除吗？')) {
                    dispatch('onClickDel', { id })
                }
            }, 
            style: {
                cursor: 'pointer',
                color: '#1890ff',
            },
        }
        return (
            <div>
                {
                    !+pushStatus ? <span {...delProps}>删除</span> : null
                }
            </div>
        )
    }
}]
