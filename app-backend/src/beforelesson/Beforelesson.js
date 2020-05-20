/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal, Table } from 'antd'

import Title from 'common/reactComponent/Title'
import Filters from 'common/reactComponent/Filters'
import List from 'common/reactComponent/List'
import Edit from 'common/reactComponent/Edit'

import cfg from './cfg'
import titleCfg from './cfg/title'
import filtersCfg from './cfg/filters'
import listCfg from './cfg/list'
import editCfg from './cfg/edit'

import { getDetailColumns } from './cfg/tableFields'

export default props => {

    const titleProps = titleCfg(props)
    const filtersProps = filtersCfg(props)
    const listProps = listCfg(props)
    const editProps = editCfg(props)

    const editModalProps = {
        title: `${cfg.editText[props.editType]}专业`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('closeModal')
        }
    }

    const logModalProps = {
        title: `操作日志`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('closeModal', 'logModal')
        }
    }

    const detailProps = {
        columns: getDetailColumns(props),    
        dataSource: props.detail,
    }

    return (
        <div className="public-lesson-table">
            <Title {...titleProps} />
            <Filters {...filtersProps} />
            <List {...listProps} />
            {
                props.editType && <Modal {...editModalProps}>
                    <Edit {...editProps} />
                </Modal>
            }
            {
                props.logModal && <Modal {...logModalProps}>
                    <Table {...detailProps} />
                </Modal>
            }
        </div>
    )
}
