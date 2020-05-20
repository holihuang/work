/*
* @file: table cfg
* @author: gushouchuang
* @date: 2018-12-09
* */
import React from 'react'
import { ImgRender, OperCell } from 'tpl2'

export const getColumns = component => {
    const { props } = component
    return [{
        title: 'ID',
        dataIndex: 'projectId',
    },
    {
        title: '标题',
        dataIndex: 'title',
    },
    {
        title: '封面图',
        dataIndex: 'coverImageUrl',
        render(value, row, index) {
            const imgProps = {
                src: row.coverImageUrl,
                height: 'auto',
                width: 485,
                title: '视频封面',
            }
            return (
                <ImgRender {...imgProps} />
            )
        },
    },
    {
        title: '学员姓名',
        dataIndex: 'stuName',
    },
    {
        title: '上线时间',
        dataIndex: 'effectTime',
    },
    {
        title: '展示状态',
        dataIndex: 'onlineStatusDesc',
    },

    {
        title: '操作',
        key: 'oper',
        render(...rest) {
            const operProps = {
                args: rest,
                list: [{
                    label: '下线',
                    disabled: rest[0].onlineStatus !== 'ONLINE',
                    onClickCb(e) {
                        props.dispatch('offline', e.row.projectId)
                    },
                },
                {
                    label: '编辑',
                    disabled: rest[0].onlineStatus === 'ONLINE',
                    onClickCb(e) {
                        window.location.hash = `commonwealEdit/${e.row.projectId}`
                    },
                },
                {
                    label: '预览',
                    onClickCb(e) {
                        props.dispatch('preview', e.row.projectNo)
                    },
                },
                {
                    label: '日志',
                    onClickCb(e) {
                        props.dispatch('log', e.row.projectId)
                    },
                }],
            }
            return (
                <OperCell {...operProps} />
            )
        },
    }]
}
