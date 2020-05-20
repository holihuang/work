/**
 * @file 标签管理
 *
 * @auth gushouchuang
 * @date 2018-9-12
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal, Button } from 'antd'
import { List, Edit } from 'tpl2'

import cfg from './cfg'
import editCfg from './cfg/edit'
import listCfg from './cfg/list'

class Patter extends Component {
    constructor(...args) {
        super(...args)

        this.state = {}
    }

    render() {
        const { props } = this

        const listProps = listCfg(this)
        const editProps = editCfg(this)

        const editModalProps = {
            title: `${cfg.editText[props.editType]}标签`,
            visible: true,
            footer: null,
            onCancel: () => {
                props.dispatch('closeModal')
            }
        }

        const linkProps = {
            onClick: () => {
                window.location.hash = '#/patter'
            }
        }

        const addProps = {
            onClick: () => {
                this.props.dispatch('add')
            }
        }

        return (
            <div className="patter-table">
                <div style={{
                    position: 'relative',
                    paddingBottom: '15px',
                    marginBottom: '10px',
                }}>
                    <div>
                        <span {...linkProps}
                        style={{
                            color: '#888',
                            cursor: 'pointer',
                            paddingLeft: '15px',
                        }}>话术管理</span>
                        <span style={{
                            color: '#888',
                            padding: '0 10px',
                        }}>/</span>
                        <span>标签管理</span>
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '15px',
                        top: '-3px',
                    }}>
                        <Button {...addProps}>添加标签</Button>
                    </div>
                </div>
                <div style={{
                    background: '#EDEEEE',
                    padding: '15px',
                }}>
                    <div style={{
                        background: '#FFFFFF',
                    }}>
                        <List {...listProps} />
                    </div>
                </div>
                {
                    props.editType && <Modal {...editModalProps}>
                        <Edit {...editProps} />
                    </Modal>
                }
            </div>
        )
    }
}
export default Patter
