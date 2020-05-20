/**
 * @file 体验前置 - 基础信息
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

// import { Modal, Table } from 'antd'
import Edit from 'common/reactComponent/Edit'
import editCfg from './cfg/edit'

export default props => {
    const editProps = editCfg(props)
    
    return (
        <div className="public-lesson-table">
            <Edit {...editProps} />
        </div>
    )
}
