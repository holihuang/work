/*
* @file: Table cfg
* @author: gushouchuang
* @date: 2019-12-09
* */
import { getColumns } from './tableFields'

const getCfg = component => {
    const { props } = component
    const {
        list = {},
        totalCount,
        pageSize,
        pageNo,
    } = props
    return {
        columns: getColumns(component) || [],
        dataSource: list,
        pagination: {
            showSizeChanger: true,
            pageSize: +pageSize,
            current: +pageNo,
            total: +totalCount,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => {
                const { dispatch } = props
                dispatch('getProjectList', { countPerPage: size, pageIndex: page })
            },
            onShowSizeChange: (current, size) => {
                const { dispatch } = props
                dispatch('getProjectList', { countPerPage: size, pageIndex: 1 })
            },
        },
    }
}

export default getCfg
