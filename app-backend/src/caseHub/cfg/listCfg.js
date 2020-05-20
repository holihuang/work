/*
* @file: Table cfg
* @author: huanghaolei
* @date: 2018-09-18
* */
import React from 'react'
import { getColumns } from './tableFields'

const getCfg = component => {
    const { props } = component
    const { table = {}, pageSize, pageNo } = props
    const { resultList = [], totalCount = 1 } = table
    return {
        columns: getColumns(component) || [],
        dataSource: resultList,
        pagination: {
            showSizeChanger: true,
            pageSize: +pageSize,
            current: +pageNo,
            total: +totalCount,
            pageSizeOptions: ['50', '100', '200'],
            onChange: (page, size) => {
                const { dispatch } = props
                dispatch('onPageChange', { pageSize: size, pageNo: page })
            },
            onShowSizeChange: (current, size) => {
                const { dispatch } = props
                dispatch('onPageSizeChange', { pageSize: size, pageNo: current })
            },
        },
        // tableReload: params => {
        //     const { order, pageNo, pageSize } = params
        //     const { dispatch } = props
        //     dispatch('onOrder', { order, pageNo, pageSize })
        // },
    }
}

export default getCfg
