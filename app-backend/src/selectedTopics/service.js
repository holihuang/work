/*
** @file: service
** @author: huanghaolei
** @date: 2019-07-15
*/

import { ajax } from 'getJSON'

// 获取优质案例页列表
const adminBatchUpdate = params => ajax('/community-manager-war/server/topic/adminBatchUpdate.action', params)
// 操作日志
const adminGetOpLogList = params => ajax('/community-manager-war/server/topic/adminGetOpLogList.action', params)


export default {
    adminBatchUpdate,
    adminGetOpLogList,
}
