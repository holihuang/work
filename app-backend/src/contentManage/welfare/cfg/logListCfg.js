/*
* @file: log Table
* @author: gushouchuang
* @date: 2019-12-09
* */

import { getColumns } from './logTableField'

const getCfg = component => {
    const { props } = component
    const { logList } = props

    return {
        columns: getColumns(component) || [],
        dataSource: logList,
        pagination: false,
    }
}

export default getCfg
