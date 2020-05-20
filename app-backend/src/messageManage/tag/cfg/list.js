/**
 * @file list cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */
import _ from 'lodash'

import cfg from './index'
import { getColumns } from './tableFields'

const getCfg = component => {
	const props = component.props

    return {
        columns: getColumns(component),
        ..._.pick(props, 'dataSource', 'total'),
        pagination: false,
        tableReload: _ => {}
    }
}

export default getCfg