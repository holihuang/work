/**
 * @file 客诉老师配置
 *
 * @auth gushouchuang
 * @date 2018-1-10
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import { Modal } from 'antd'

import Title from 'common/reactComponent/Title'
import Filters from 'common/reactComponent/Filters'
import List from 'common/reactComponent/List'
import Edit from 'common/reactComponent/Edit'

import cfg from './cfg'
import titleCfg from './cfg/title'
import filtersCfg from './cfg/filters'
import listCfg from './cfg/list'
import editCfg from './cfg/edit'

export default props => {

    const titleProps = titleCfg(props)
    const filtersProps = filtersCfg(props)
    const listProps = listCfg(props)
    const editProps = editCfg(props)

    const modalProps = {
        title: `${cfg.editText[props.editType]}客诉老师账号`,
        visible: true,
        footer: null,
        onCancel: () => {
            props.dispatch('closeEdit')
        }
    }

    return (
        <div>
            <Title {...titleProps} />
            <Filters {...filtersProps} />
            <List {...listProps} />
            {
                props.editType && <Modal {...modalProps}>
                    <Edit {...editProps} />
                </Modal>
            }
        </div>
    )
}
