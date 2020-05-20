/*
** @file: service
** @author: huanghaolei
** @date: 2019-06-27
*/

import { ajax } from 'getJSON'

// 获取优质案例页列表
const showGoodPostList = params => ajax('/community-manager-war/server/post/showGoodPostList.action', params)
// 更改权重
const updateWeight = params => ajax('/community-manager-war/server/post/updateWeight.action', params)
// 显示|隐藏
const updateShowStatus = params => ajax('/community-manager-war/server/post/updateShowStatus.action', params)
// 角标
const updateIcon = params => ajax('/community-manager-war/server/post/updateIcon.action', params)
// 日志列表
const showCaseOperationLog = params => ajax('/community-manager-war/server/post/showCaseOperationLog.action', params)
// 批量显示|隐藏
const updateShowStatusBatch = params => ajax('/community-manager-war/server/post/updateShowStatusBatch.action', params)
// 批量设置权重
const updateWeightBatch = params => ajax('/community-manager-war/server/post/updateWeightBatch.action', params)

export default {
    showGoodPostList,
    updateWeight,
    updateShowStatus,
    showCaseOperationLog,
    updateIcon,
    updateShowStatusBatch,
    updateWeightBatch,
}
