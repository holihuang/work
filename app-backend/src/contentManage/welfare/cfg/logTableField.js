/*
* @file: log table options
* @author: gushouchuang
* @date: 2019-12-09
* */

export const getColumns = component => ([{
    title: '操作人',
    dataIndex: 'operator',
}, {
    title: '操作类型',
    dataIndex: 'operateEvent',
}, {
    title: '操作时间',
    dataIndex: 'operateTime',
}])

