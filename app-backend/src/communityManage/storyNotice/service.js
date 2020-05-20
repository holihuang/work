/*
** @file: storyNotice - service
** @author: huanghaolei
** @date: 2019-10-15
*/
import { ajax } from 'getJSON'

// 查询推送列表
const queryPushTask = params => ajax('/community-manager-war/server/post/queryPushTask.action', params)
// 新建推送任务
const createPushTask = params => ajax('/community-manager-war/server/post/createPushTask.action', params)
// 删除推送任务
const deletePushTask = params => ajax('/community-manager-war/server/post/deletePushTask.action', params)
export default {
    queryPushTask,
    createPushTask,
    deletePushTask,
}
