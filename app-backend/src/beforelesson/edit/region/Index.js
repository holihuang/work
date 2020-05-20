/**
 * @file 体验前置 - 答疑视频
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal } from 'antd'
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

    const modalProps = {
        title: `${cfg.editText[props.editType]}地域`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('togEdit', '')
        }
    }

    return (
        <div className="">
            {
                props.classIsNone && <p style={{
                    paddingLeft: '15px',
                    color: 'red',
                    fontSize: '24px',
                }}>请先录入班型信息，再完善地域信息！</p>
            }
            <List {...listProps} />
            {
                props.editType && <Modal {...modalProps}>
                    <Edit {...editProps} />
                </Modal>
            }
        </div>
    )
}
