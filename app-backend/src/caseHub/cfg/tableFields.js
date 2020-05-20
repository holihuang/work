/*
* @file: table options cfg
* @author: huanghaolei
* @date: 2018-09-18
* */
import React from 'react'
import { Popover } from 'antd'
import PopUp from '../component/PopUp'
import TitleDetailDialog from '../component/TitleDetailDialog'
import optionCfg from './optionCfg'


export const getColumns = component => {
    const { props } = component
    const unReleasedCaseUrlTxt = '当前案例未发布，暂时无法显示网页链接'
    const popoverStyle = {
        padding: '10px',
    }
    const operStyle = {
        color: '#108ee9',
        marginBottom: '5px',
        cursor: 'pointer',
    }

    const logProps = {
        onClick: e => {
            const { props: { dispatch } } = component
            const { index } = e.target.dataset
            dispatch('onClickLog', { index })
        },
        style: operStyle,
    }

    const editProps = {
        style: operStyle,
        onClick: e => {
            const { props: { dispatch } } = component
            const { index, caseid } = e.target.dataset
            dispatch('onClickEdit', { index, id: caseid })
        },
    }

    const deleteProps = {
        style: operStyle,
        onClick: e => {
            const { props: { dispatch } } = component
            const { index } = e.target.dataset
            dispatch('onClickDelete', { index })
        },
    }

    return [{
        title: '案例ID',
        // dataIndex: 'id',
        render: text => {
            const {
                id, postUrl = '', title = '', publishState,
            } = text
            const content = (
                <div style={popoverStyle}>
                    <p>案例id：{id}</p>
                    <p>案例标题：{title}</p>
                    <p>
                        案例链接：{
                            +publishState ? <a href={postUrl} target="_blank">{postUrl}</a> : unReleasedCaseUrlTxt
                        }
                    </p>
                </div>
            )

            const caseIdStyle = {
                cursor: 'pointer',
                color: '#108ee9',
            }

            return (
                <Popover content={content} title="" trigger="click">
                    <div style={caseIdStyle}>{id}</div>
                </Popover>
            )
        },
    }, {
        title: '帖子ID',
        dataIndex: 'postId',
        render: (text = [], record, index) => {
            const { luntanUrl } = record
            return (
                <a href={luntanUrl} style={{ color: '#1890ff' }} target="_blank" rel="noopener noreferrer" alt="帖子">{text}</a>
            )
        },
    }, {
        title: '帖子标题',
        dataIndex: 'title',
        render: (text = [], record, index) => {
            const titleDetailProps = {
                text,
            }
            return (
                <div>
                    <TitleDetailDialog {...titleDetailProps} />
                </div>
            )
        },
    }, {
        title: '学员ID',
        dataIndex: 'studentId',
    }, {
        title: '学员姓名',
        dataIndex: 'studentName',
    }, {
        title: '学院',
        dataIndex: 'academy',
    }, {
        title: '专业',
        dataIndex: 'majorName',
    }, {
        title: '产品分类',
        dataIndex: 'productType',
        render: text => {
            const { label = '' } = optionCfg.productTypeList.filter(item => +item.value === +text)[0] || {}
            return label
        },
    }, {
        title: '原学历',
        dataIndex: 'education',
    }, {
        title: '省',
        dataIndex: 'province',
    }, {
        title: '性别',
        dataIndex: 'sex',
    }, {
        title: '年龄',
        dataIndex: 'age',
        render: (text = [], record, index) => <span>{text || ''}</span>,
    }, {
        title: '职业标签',
        dataIndex: 'careerLabel',
        render: (text = [], record, index) => {
            const popUpProps = {
                list: text || [],
            }
            return (
                <div>
                    <PopUp {...popUpProps} />
                </div>
            )
        },
    }, {
        title: '内容标签',
        dataIndex: 'contentLabel',
        render: (text = [], record, index) => {
            const popUpProps = {
                list: text || [],
            }
            return (
                <div>
                    {
                        text.length ? <PopUp {...popUpProps} /> : null
                    }
                </div>
            )
        },
    }, {
        title: '帖子来源',
        dataIndex: 'postSource',
    },
    {
        title: '发帖时间',
        dataIndex: 'postCreateTime',
        // sorter: true,
        // filters: [],
        // defaultSortOrder: +props['timeOrderFlag'] === 1 ? 'descend' : 'ascend',
        // sortOrder: +props['timeOrderFlag'] === 1 ? 'descend' : 'ascend',
        // sorter: (a, b) => {
        // },
    }, {
        title: '状态',
        render: text => {
            const { publishState = 0 } = text
            const { label } = optionCfg.publishStateList.filter(item => +item.value === +publishState)[0]
            return <div>{label}</div>
        },
    }, {
        title: '操作',
        render: (text, record, index) => {
            const { postId, id } = text
            return (
                <div>
                    <div {...editProps} data-index={postId} data-caseid={id}>编辑</div>
                    <div {...deleteProps} data-index={postId}>删除</div>
                    <div {...logProps} data-index={postId}>日志</div>
                </div>
            )
        },
    }]
}
