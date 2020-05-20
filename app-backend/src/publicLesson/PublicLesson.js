/**
 * @file 公开课配置
 *
 * @auth gushouchuang
 * @date 2018-1-10
 */

import React, {Component, PropTypes} from 'react'

import { Modal, Table } from 'antd'

import Title from 'common/reactComponent/Title'
import Filters from 'common/reactComponent/Filters'
import List from 'common/reactComponent/List'

import titleCfg from './cfg/title'
import filtersCfg from './cfg/filters'
import listCfg from './cfg/list'
import { getDetailColumns } from './cfg/tableFields'

import './PublicLesson.less'

export default props => {

    const titleProps = titleCfg(props)
    const filtersProps = filtersCfg(props)
    const listProps = listCfg(props)

    const modalProps = {
        className: 'public-lesson-table',
        title: '操作日志',
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('closeDetail')
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
                props.detail && <Modal {...modalProps}>
                    <Table {...detailProps} />
                </Modal>
            }
        </div>
    )
}
