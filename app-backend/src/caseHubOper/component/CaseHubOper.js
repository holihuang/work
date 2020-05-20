import React, { useState, useEffect } from 'react'
import { Tabs, Table, Modal, Input, Select, Button, Checkbox, message } from 'antd'
import { Filters } from 'tpl2'

import PopUp from './PopUp'
import TitlePopover from './TitlePopover'

import '../style.less'
import filtersCfg from '../cfg/filtersCfg'
import optionCfg from '../cfg/optionCfg'
import upperIconCfg from '../cfg/upperIconCfg'
import patchOperCfg from '../cfg/patchOperCfg'

const { TabPane } = Tabs
const { Option } = Select

const HEADER_TITLE = '优质案例展示管理'
const TABS_ARR = ['员工APP', 'BF工作台']
// // 暂时取该处默认值，后续从props获取
// const tabIndex = 0

const baseUrl = process.env.NODE_ENV === 'test' ? 'http://172.16.140.50:8000' : 'http://luntan.sunlands.com'

function onChangeTabs(e, dispatch) {
    dispatch('onSaveTabIndex', {
        showPostion: e,
    })
}

function getTabsProps(props) {
    const { dispatch } = props
    return {
        onChange: e => {
            onChangeTabs(e, dispatch)
        },
    }
}

function HeadTab(props) {
    // const { dispatch } = props
    // useEffect(() => {
    //     dispatch('onSaveTabIndex', { showPostion: tabIndex })
    // }, [])

    const dom = []
    TABS_ARR.forEach((item, index) => {
        const tabProps = {
            key: index,
            tab: item,
        }
        dom.push(<TabPane {...tabProps} />)
    })
    return (
        <Tabs {...getTabsProps(props)}>{dom}</Tabs>
    )
}

function PageFilter(opt) {
    const { props, style } = opt
    const filtersProps = filtersCfg(props)
    return (
        <div style={style}>
            <Filters {...filtersProps} />
        </div>
    )
}

function handleClkOperBtn(opt = {}) {
    const {
        e, toggleWeightModal = () => {},
        text, weightKey, setWeightNumber = () => {},
        setId = () => {}, idKey, dispatch, setState = () => {},
        toggleLogModal, toggleUpperIconModal = () => {},
        setUpperIconModalObj = () => {},
        showPostion,
    } = opt
    const { oper } = e.target.dataset
    const teacherAccount = window.userInfo.userNickname
    if (oper === 'weight') {
        setId(text[idKey])
        setWeightNumber(text[weightKey])
        toggleWeightModal(true)
    } else if (oper === 'show') {
        // 显示|隐藏
        dispatch('onShowOrHide', {
            id: text.id,
            showPostion,
            weight: text.showWeight,
            showStatus: +text.showStatus ? 0 : 1,
            teacherAccount,
        })
    } else if (oper === 'upperIcon') {
        setId(text[idKey])
        toggleUpperIconModal(true)
        setUpperIconModalObj({ iconExpire: text.iconExpire, iconType: text.iconType })
    } else if (oper === 'log') {
        // 日志列表
        toggleLogModal(true)
        dispatch('onGetLogList', { id: text.id, showPostion })
    }
    setState({ isPatch: false })
}

function handleWeightIpt(...args) {
    const [cb = () => {}, value = ''] = args
    if (/\D/.test(value)) {
        // 非数字
        return
    }
    cb(value)
}

function handlePagerChange(...args) {
    const [pageNo, pageSize, dispatch] = args
    dispatch('onPagerChange', {
        pageNo,
        pageSize,
    })
}

function LogList(opt) {
    const { logList } = opt
    const logProps = {
        columns: [{
            title: '操作人',
            dataIndex: 'operator',
        }, {
            title: '操作事件',
            dataIndex: 'operateEvent',
        }, {
            title: '权重',
            dataIndex: 'weight',
        }, {
            title: '配置角标',
            dataIndex: 'iconType',
            render: text => {
                const [itm = {}] = optionCfg.iconTypeList.filter(item => item.value === +text)
                return (
                    <div>{itm.label}</div>
                )
            },
        }, {
            title: '角标到期时间',
            dataIndex: 'iconExpireTime',
        }, {
            title: '操作时间',
            dataIndex: 'operateTime',
        }],
        dataSource: logList,
    }
    return (
        <Table {...logProps} />
    )
}

function getParams(opt = {}) {
    const { selectedRowKeys = [], resultList } = opt
    const ids = []
    selectedRowKeys.forEach(item => {
        const { id } = resultList[item]
        ids.push(id)
    })
    return {
        ids,
    }
}

function handlePatchOper(opt = {}) {
    const {
        key, value, toggleUpperIconModal = () => {},
        state: { selectedRowKeys = [] }, setState, dispatch,
        showWeightModal, toggleWeightModal, resultList = [],
        props: {
            showPostion,
        },
    } = opt
    const baseParams = getParams({ selectedRowKeys, resultList })

    // 未选中
    if (!selectedRowKeys.length) {
        message.warning('请先选中要操作的案例')
        return
    }

    let stateObj = { isPatch: true, selectedRowKeys }
    if (key === 'iconType') {
        // 角标
        toggleUpperIconModal(true)
    } else if (key === 'weight') {
        // 权重
        toggleWeightModal(true)
    } else if (key === 'showStatus') {
        // 显示|隐藏
        dispatch('updateShowStatusBatch', {
            ...baseParams,
            showPostion,
            [key]: value,
        })
        stateObj = { isPatch: true }
    }
    setState(stateObj)
}

function PatchOper(opt = {}) {
    const {
        list, iconObj, iconChange, showUpperIconModal,
        toggleUpperIconModal, state, setState, resultList,
        showWeightModal, toggleWeightModal, dispatch,
        props,
    } = opt
    const operWrapperStyle = {
        padding: '5px 30px',
    }
    return (
        <div style={operWrapperStyle}>
            {
                list.map(item => {
                    const {
                        label, key, pair = false, value,
                    } = item
                    const operBtnProps = {
                        type: 'primary',
                        'data-type': key,
                        'data-pair': pair,
                        'data-value': value,
                        style: {
                            marginRight: '10px',
                        },
                        onClick: e => {
                            const { type, value } = e.target.dataset
                            let { pair } = e.target.dataset
                            pair = JSON.parse(pair)
                            handlePatchOper({
                                key: type,
                                pair,
                                value,
                                iconObj,
                                iconChange,
                                showUpperIconModal,
                                toggleUpperIconModal,
                                state,
                                setState,
                                dispatch,
                                resultList,
                                showWeightModal,
                                toggleWeightModal,
                                dispatch,
                                props,
                            })
                        },
                    }
                    return (
                        <Button {...operBtnProps}>{label}</Button>
                    )
                })
            }
        </div>
    )
}

function List(opt) {
    const {
        style, props: {
            resultList = [], dispatch, pageIndex, countPerPage, totalCount, pageNo, pageSize,
            showPostion,
        }, toggleWeightModal, setWeightNumber, toggleLogModal, toggleUpperIconModal,
        patch, setPatch,
        setId,
        state, setState,
        setUpperIconModalObj,
    } = opt
    const columns = [{
        title: '案例id',
        // dataIndex: 'id',
        render: text => {
            const { id, title, postUrl } = text
            const popProps = {
                onlyTitle: false,
                id,
                title,
                postUrl,
            }
            return (
                <TitlePopover {...popProps} />
            )
        },
    }, {
        title: '帖子id',
        dataIndex: 'postId',
        render: postId => {
            const url = `${baseUrl}/community-pc-war/#post/${postId}`
            const linkStyle = {
                color: 'rgb(24, 144, 255)',
            }
            return (
                <a style={linkStyle} target="_blank" rel="noopener noreferrer" href={url}>{postId}</a>
            )
        },
    }, {
        title: '标题',
        // dataIndex: 'title',
        render: text => {
            const popProps = {
                title: text.title,
            }
            return (
                <TitlePopover {...popProps} />
            )
        },
    }, {
        title: '学员id',
        dataIndex: 'studentId',
    }, {
        title: '学员姓名',
        dataIndex: 'studentName',
    }, {
        title: '内容标签',
        // dataIndex: 'contentLabel',
        render: (text, record) => PopUp(text, 'contentLabel'),
    }, {
        title: '帖子来源',
        dataIndex: 'postSource',
    }, {
        title: '发帖时间',
        dataIndex: 'postCreateTime',
    }, {
        title: '展示状态',
        render: text => {
            const { showStatus } = text
            return (
                <span>{optionCfg.publishStateList.filter(item => +item.value === +showStatus)[0].label}</span>
            )
        },
    }, {
        title: '展示权重',
        dataIndex: 'showWeight',
    }, {
        title: '角标设置',
        dataIndex: 'iconType',
        render: text => {
            const [itm = {}] = optionCfg.iconTypeList.filter(item => item.value === +text)
            return (
                <span>{itm.label}</span>
            )
        },
    }, {
        title: '操作',
        render: (...args) => {
            const [text] = args
            const baseStyle = {
                color: '#1890ff',
                cursor: 'pointer',
                marginRight: '10px',
            }
            const showProps = {
                style: baseStyle,
                'data-oper': 'show',
                onClick: e => {
                    handleClkOperBtn({
                        e, dispatch, text, setState, showPostion,
                    })
                },
            }
            const wightProps = {
                style: baseStyle,
                'data-oper': 'weight',
                onClick: e => {
                    handleClkOperBtn({
                        e,
                        toggleWeightModal,
                        text,
                        weightKey: 'showWeight',
                        setWeightNumber,
                        setId,
                        idKey: 'id',
                        setState,
                        showPostion,
                    })
                },
            }
            const upperIconProps = {
                style: baseStyle,
                'data-oper': 'upperIcon',
                onClick: e => {
                    handleClkOperBtn({
                        e,
                        dispatch,
                        text,
                        toggleUpperIconModal,
                        setId,
                        idKey: 'id',
                        setState,
                        setUpperIconModalObj,
                        showPostion,
                    })
                },
            }
            const logProps = {
                style: baseStyle,
                'data-oper': 'log',
                onClick: e => {
                    handleClkOperBtn({
                        e,
                        dispatch,
                        text,
                        toggleLogModal,
                        setState,
                        showPostion,
                    })
                },
            }
            return (
                <div>
                    <span {...showProps}>{+text.showStatus ? '展示' : '隐藏'}</span>
                    <span {...wightProps}>权重</span>
                    <span {...upperIconProps}>角标</span>
                    <span {...logProps}>日志</span>
                </div>
            )
        },
    }]
    const pagination = {
        showSizeChanger: true,
        defaultCurrent: pageNo,
        defaultPageSize: pageSize,
        current: pageIndex,
        pageSize: countPerPage,
        total: totalCount,
        showQuickJumper: true,
        pageSizeOptions: [50, 100, 200],
        onChange: (page, size) => {
            handlePagerChange(page, size, dispatch)
            setState({ isPatch: false })
        },
        onShowSizeChange: (current, size) => {
            handlePagerChange(current, size, dispatch)
            setState({ isPatch: false })
        },
    }
    const tableProps = {
        dataSource: resultList,
        columns,
        pagination,
        rowSelection: {
            selectedRowKeys: state.selectedRowKeys || [],
            onChange: e => {
                setState({ selectedRowKeys: e })
            },
        },
    }
    return (
        <div style={style}>
            <Table {...tableProps} />
        </div>
    )
}

function renderUpperIconModal(opt = {}) {
    const { obj, onIconModalChange } = opt
    const list = upperIconCfg.upperIconArr.map(item => {
        const { key } = item
        let o = item
        if (key === 'iconExpire') {
            o = {
                ...item, show: !(+obj.iconType === 0),
            }
        }
        return o
    })
    return list.filter(item => item.show)
        .map(item => {
            const {
                key, label, options = [], defaults,
            } = item
            const rowStyle = {
                display: 'flex',
                margin: '10px 5px',
            }
            const labelStyle = {
                width: '80px',
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'flex-start',
                'justify-content': 'center',
            }
            const sltProps = {
                defaultValue: obj[key],
                style: {
                    width: '100px',
                },
                onChange: e => {
                    onIconModalChange({ ...obj, [key]: e })
                },
            }
            return (
                <div style={rowStyle}>
                    <div style={labelStyle}>{label}</div>
                    <Select {...sltProps}>
                        {
                            [{ label: '请选择', value: -1 }].concat(options).map(item => {
                                const { label, value } = typeof item !== 'object' ? { value: +item.replace(/\D/g, ''), label: item } : item
                                return <Option value={value}>{label}</Option>
                            })
                        }
                    </Select>
                </div>
            )
        })
}

function getUpperIconDefaults() {
    return upperIconCfg.upperIconArr.reduce((res, item) => {
        const { key, defaults } = item
        return res = { ...res, [key]: defaults }
    }, {})
}

function checkUpperIconModalEmpty(obj) {
    const { upperIconArr } = upperIconCfg
    for (let i = 0; i < upperIconArr.length; i++) {
        const { key, label } = upperIconArr[i]
        if (obj[key] < 0) {
            message.warning(`${label}不能为空`)
            return true
        }
    }
    return false
}

function CaseHubOper(...args) {
    const [props] = args
    const {
        dispatch, logList = [], resultList = [],
        showPostion,
    } = props
    const [showWeightModal, toggleWeightModal] = useState(false)
    const [weightNumber, setWeightNumber] = useState('')
    const [showLogModal, toggleLogModal] = useState(false)
    const [showUpperIconModal, toggleUpperIconModal] = useState(false)
    const [upperIconModalObj, setUpperIconModalObj] = useState(getUpperIconDefaults())
    const [id, setId] = useState('')
    const [patch, setPatch] = useState({})
    const [state, setState] = useState({})
    const wrapperStyle = {
        width: '100%',
        marginTop: '-30px',
    }
    const titleStyle = {
        padding: '10px',
        borderBottom: '1px solid #E0E0E0',
        fontSize: '20px',
        color: '#333333',
        lineHeight: '32px',
    }
    const bodyStyle = {}
    const headProps = {
        dispatch,
    }
    const filterProps = {
        props: { ...props, state, setState },
        style: {
            padding: '10px 30px',
        },
    }
    const patchOperProps = {
        dispatch,
        props,
        resultList,
        list: patchOperCfg.list,
        iconObj: upperIconModalObj,
        iconChange: setUpperIconModalObj,
        showUpperIconModal,
        toggleUpperIconModal,
        toggleWeightModal,
        showWeightModal,
        state,
        setState,
    }
    const listProps = {
        props,
        toggleWeightModal,
        setWeightNumber,
        toggleLogModal,
        toggleUpperIconModal,
        setUpperIconModalObj,
        setId,
        patch,
        setPatch,
        state,
        setState,
        style: {
            padding: '10px 30px',
        },
    }
    const modalProps = {
        title: '设置权重，权重值高的案例将优先展示',
        visible: true,
        onOk: () => {
            toggleWeightModal(false)
            const { isPatch } = state
            if (isPatch) {
                dispatch('updateWeightBatch', {
                    ids: getParams({ selectedRowKeys: state.selectedRowKeys, resultList }).ids,
                    weight: weightNumber,
                    showPostion,
                })
            } else {
                dispatch('onUpdateWeight', {
                    id, weight: weightNumber, showPostion, teacherAccount: window.userInfo.userNickname,
                })
            }
            setState({ isPatch: false })
            setWeightNumber('')
        },
        onCancel: () => {
            toggleWeightModal(false)
            setState({ isPatch: false })
            setWeightNumber('')
        },
    }

    const weightIptprops = {
        placeholder: '请输入0或正整数',
        value: weightNumber,
        onChange: e => {
            handleWeightIpt(setWeightNumber, e.target.value)
        },
        style: {
            marginTop: 10,
        },
    }
    const logModalProps = {
        visible: true,
        title: '操作日志',
        width: 720,
        onOk: () => {
            toggleLogModal(false)
            setState({ isPatch: false })
        },
        onCancel: () => {
            toggleLogModal(false)
            setState({ isPatch: false })
        },
    }
    const upperIconModalProps = {
        visible: true,
        title: '角标',
        onOk: () => {
            let ids
            if (state.isPatch) {
                ids = getParams({ selectedRowKeys: state.selectedRowKeys, resultList }).ids
            } else {
                ids = [id]
            }
            const upperIconObj = upperIconModalObj
            if (+upperIconObj.iconType === 0) {
                delete upperIconObj.iconExpire
            }
            // 验空
            if (checkUpperIconModalEmpty(upperIconObj)) {
                return
            }
            dispatch('onUpdateIcon', { ...upperIconObj, ids, showPostion })
            toggleUpperIconModal(false)
            setUpperIconModalObj(getUpperIconDefaults())
            setId('')
            setState({ isPatch: false })
        },
        onCancel: () => {
            toggleUpperIconModal(false)
            setUpperIconModalObj(getUpperIconDefaults())
            setId('')
            setState({ isPatch: false })
        },
    }
    const logListProps = {
        logList,
    }
    return (
        <div style={wrapperStyle}>
            <h3 style={titleStyle}>{HEADER_TITLE}</h3>
            <HeadTab {...headProps} />
            <div style={bodyStyle}>
                <PageFilter {...filterProps} />
                <PatchOper {...patchOperProps} />
                <List {...listProps} />
                {
                    showWeightModal ? (
                        <Modal {...modalProps}>
                            <Input {...weightIptprops} />
                        </Modal>
                    ) : null
                }
                {
                    showLogModal ? (
                        <Modal {...logModalProps}>
                            <LogList {...logListProps} />
                        </Modal>
                    ) : null
                }
                {
                    showUpperIconModal ? (
                        <Modal {...upperIconModalProps}>
                            {
                                renderUpperIconModal({
                                    obj: upperIconModalObj,
                                    onIconModalChange: setUpperIconModalObj,
                                })
                            }
                        </Modal>
                    ) : null
                }
            </div>
        </div>
    )
}

export default CaseHubOper
