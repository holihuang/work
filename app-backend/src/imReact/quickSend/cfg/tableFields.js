/*
* @file: Table
* @author: gushouchuang
* @date: 2020-3-5
* */

import React from 'react'

import quickSendIcon from '../../../images/icon/icon-quick-send.png'

export const getColumns = component => [{
    title: '链接名称',
    dataIndex: 'linkName',
},
{
    title: '链接描述',
    dataIndex: 'linkDesc',
},
{
    title: '操作',
    render: (text, record, index) => (
        <div>
            <img
                src={quickSendIcon}
                alt=""
                style={{
                    cursor: 'pointer',
                }}
                onClick={component.send.bind(component, record)}
            />
        </div>
    ),
}]

