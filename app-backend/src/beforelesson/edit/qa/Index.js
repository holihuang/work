/**
 * @file 体验前置 - 答疑视频
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, {Component, PropTypes} from 'react'

import { Button, Modal } from 'antd'
import Edit from 'common/reactComponent/Edit'
import List from 'common/reactComponent/List'

import cfg from './cfg'
import editCfg from './cfg/edit'
import listCfg from './cfg/list'

export default props => {
    const addProps = {
        type: 'primary',
        style: {
            width: '120px',
            textAlign: 'center',
            height: '30px',
            marginRight: '30px',
        },
        onClick: () => {
            props.dispatch('togEdit', 'add')
        },
    }
    
    const listProps = listCfg(props)
    const editProps = editCfg(props)

    const editModalProps = {
        title: `${cfg.editText[props.editType]}视频`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('togEdit', '')
        }
    }

    const previewVideo = props.dataSource.length ? props.dataSource[props.detailIndex].videoUrl : ''
    const detailProps = {
        title: '查看视频',
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('togDetail', '')
        }
    }

    return (
        <div className="">
            <div style={{
            	textAlign: 'right',
            }}>
           		<Button {...addProps}>新增</Button>
            </div>
            <List {...listProps} />
            {
                props.editType && <Modal {...editModalProps}>
                    <Edit {...editProps} />
                </Modal>
            }
            {
                props.detailType && <Modal {...detailProps}>
                    <video src={previewVideo}  style={{width: '100%'}} controls="controls" />
                </Modal>
            }
        </div>
    )
}
