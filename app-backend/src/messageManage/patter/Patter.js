/**
 * @file 话术管理
 *
 * @auth gushouchuang
 * @date 2018-9-12
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal, Button, Icon } from 'antd'
import { Filters, List, Edit } from 'tpl2'

import cfg from './cfg'
import filtersCfg from './cfg/filters'
import listCfg from './cfg/list'
import editCfg from './cfg/edit'
import importCfg from './cfg/import'


class Patter extends Component {
    constructor(...args) {
        super(...args)

        this.state = {}
    }

    creatOperList() {
        const dom = []
        cfg.BTN_LIST.forEach(item => {
            const btnProps = {
                style: {
                    width: 120,
                },
                // icon: 'cloud',
                onClick: () => {
                    this.props.dispatch('operDetail', item.field)
                }
            }

            dom.push(
                <div style={{
                    display: 'inline-block',
                    marginLeft: '15px',
                }}>
                    <Button {...btnProps}>{item.text}</Button>
                </div>
            )
        })

        return dom
    }


    render() {
        const { props } = this

        const filtersProps = filtersCfg(this)

        const listProps = listCfg(this)
        const editProps = editCfg(this)
        const importProps = importCfg(this)

        const editModalProps = {
            title: `${cfg.editText[props.editType]}话术`,
            visible: true,
            footer: null,
            onCancel: () => {
                props.dispatch('closeModal')
            }
        }

        const importModalProps = {
            title: '导入话术',
            visible: true,
            footer: null,
            onCancel: () => {
                props.dispatch('closeModal', 'importModal')
            }
        }

        const importRstModalProps = {
            title: '',
            visible: true,
            footer: null,
            onCancel: () => {
                props.dispatch('closeModal', 'importRst', {
                    success: 0,
                    fail: 0,
                    url: '',
                })
            }
        }

        const okProps = {
            type: 'primary',
            style: {
                width: 120,
                marginRight: '100px',
            },
            onClick: () => {
                props.dispatch('closeModal', 'importRst', {
                    success: 0,
                    fail: 0,
                    url: '',
                })
            }
        }

        const downProps = {
            style: {
                width: 160,
            },
            onClick: () => {
                window.open(props.importRst.url)
            }
        }
            
        return (
            <div>
                <div style={{
                    position: 'relative',
                    marginBottom: '10px',
                }}>
                    <div>
                        <Filters {...filtersProps} key="5" />
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '20px',
                        top: 0,
                    }}>
                        {this.creatOperList()}
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
                {
                    props.importModal && <Modal {...importModalProps}>
                        <Edit {...importProps} />
                    </Modal>
                }
                {
                    props.importRst.url && <Modal {...importRstModalProps}>
                        <div style={{
                            textAlign: 'center',
                        }}>
                            上传成功 {props.importRst.success} 条话术，上传失败 {props.importRst.fail} 条话术
                            <p style={{
                                paddingTop: '25px',
                            }}>
                                <Button {...okProps}>确定</Button>
                                <Button {...downProps}>
                                    <Icon type="download" /> 下载导入结果
                                </Button>
                            </p>
                        </div>
                    </Modal>
                }
            </div>
        )
    }
}
export default Patter
