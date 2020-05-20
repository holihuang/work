/*
* @file: log table options cfg
* @author: huanghaolei
* @dateL 2018-09-18
* */

export const getColumns = (component) => {
    return [{
        title: '操作人',
        dataIndex: 'operator',
    }, {
        title: '操作类型',
        dataIndex: 'operateType',
    }, {
        title: '操作时间',
        dataIndex: 'operateTime',
    }]
}
