/*
* @file: Table cfg
* @author: gushouchuang
* @date: 2020-3-5
* */

// import React from 'react'
import { getColumns } from './tableFields'

const getCfg = component => {
    const { state } = component
    const { quickList } = state
    return {
        columns: getColumns(component) || [],
        dataSource: quickList,
        pagination: false,
    }
}

export default getCfg
