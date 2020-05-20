/**
 * @file 体验前置 - 答疑视频
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

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
            position: 'absolute',
            right: '10px',
            top: '10px',
        },
        onClick: () => {
            props.dispatch('togEdit', 'add')
        },
    }
    
    const listProps = listCfg(props)
    const editProps = editCfg(props)

    const modalProps = {
        title: `${cfg.editText[props.editType]}招生院校`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('togEdit', '')
        }
    }

    return (
        <div className="">
            <div style={{
                position: 'relative',
            }}>
                <p style={{
                    padding: '13px 0 0 35px',
                    fontSize: '16px',
                    color: 'red',
                }}>填写数量需是6的倍数</p>
                <Button {...addProps}>新增</Button>
            </div>
            <List {...listProps} />
            {
                props.editType && <Modal {...modalProps}>
                    <Edit {...editProps} />
                </Modal>
            }
        </div>
    )
}
