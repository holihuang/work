/**
 * @file list cfg
 *
 * @auth gushouchuang
 * @date 2018-2-6
 */
import _ from 'lodash'
import cfg from './index'
import { getColumns } from './tableFields'

const getCfg = props => {
    return {
        columns: getColumns(props),
        ..._.pick(props, 'dataSource', 'total', 'pageNo', 'pageSize', 'loading'),
        pageSizeOptions: cfg.pageSizeOptions,
        tableReload: params => {
            props.dispatch('pageChange', params)
        }
    }
}

export default getCfg