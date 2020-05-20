/*
** @file: listCfg
** @author: huanghaolei
** @date: 2019-10-15
*/
import getColumns from './tableFields'

export default component => {
    const {
        resultList = [], defaultPageSize, pageNo, pageSize,
        dispatch, totalCount,
    } = component
    return {
        columns: getColumns(component),
        dataSource: resultList,
        pagination: {
            defaultPageSize,
            current: pageNo,
            pageSize,
            total: totalCount,
            onChange: (page, size) => {
                dispatch('onChangePager', { pageNo: page, pageSize: size })
            },
        },
    }
}
