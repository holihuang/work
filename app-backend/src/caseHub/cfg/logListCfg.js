/*
* @file: log Table cfg
* @author: huanghaolei
* @date: 2018-09-18
* */
import { getColumns } from './logTableField'
const getCfg = (component) => {
    const props = component.props
    const { logList } = props
    return {
        columns: getColumns(component) || [],
        dataSource: logList,
        pagination: false,
    }
}

export default getCfg
