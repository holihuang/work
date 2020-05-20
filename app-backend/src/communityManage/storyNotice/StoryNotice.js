/*
** @file: StoryNotice - component
** @author: huanghaolei
** @date: 2019-10-15
*/
import React from 'react'
import { Modal } from 'antd'
import { Filters, List } from '@sunl-fe/sfe-tpl2'
import filterCfg from './cfg/filterCfg'
import listCfg from './cfg/listCfg'
import StoryNoticeAdd from './add/StoryNoticeAdd'
import paramsKeyCfg from './cfg/paramsKeyCfg'
import './style.less'

const { addParamsKeyArr } = paramsKeyCfg

// add组件参数加了Add后缀，在此单独处理下
function getStoryNoticeAddParams(props) {
    const obj = {}
    addParamsKeyArr.forEach(item => {
        const { key: keyWithSuffix } = item
        const [key] = keyWithSuffix.split('_')
        obj[key] = props[keyWithSuffix]
    })
    return obj
}

function handleCloseModal(e, props) {
    const { dispatch } = props
    dispatch('onCloseCreateModal', { showCreateModal: false })
}

function handleModalSubmit(...args) {
    const [, props] = args
    const { dispatch } = props
    dispatch('onCreateFormSubmit', {})
}

function resetAddFilterParams(props) {
    const { dispatch } = props
    dispatch('resetAddFilterParams', {})
}

function StoryNotice(...args) {
    const [props] = args
    const bodyWrapperStyle = {
        margin: '0 30px',
    }
    const { showCreateModal = false, dispatch } = props
    const filterProps = filterCfg(props)
    const listProps = listCfg(props)
    const modalProps = {
        visible: true,
        title: '新建',
        maskClosable: false,
        onCancel: e => {
            handleCloseModal(e, props)
            resetAddFilterParams(props)
        },
        onOk: e => {
            handleModalSubmit(e, props)
        },
    }
    const storyNoticeAddProps = {
        dispatch,
        ...getStoryNoticeAddParams(props),
    }
    return (
        <div className="wrapper">
            <h3 className="header">学员故事通知</h3>
            <div style={bodyWrapperStyle}>
                <Filters {...filterProps} />
                <List {...listProps} />
                {
                    showCreateModal ? (
                        <Modal {...modalProps}>
                            <StoryNoticeAdd {...storyNoticeAddProps} />
                        </Modal>
                    ) : null
                }
            </div>
        </div>
    )
}

export default StoryNotice
