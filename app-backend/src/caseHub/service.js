/*
* @file: service
* author: huanghaolei
* @date: 2018-09-13
* */
import { ajax } from 'getJSON'

// 获取专业列表
const getMajorList = params => ajax('/community-manager-war/server/post/adminGetMajorList.action', params)

// 查询
const adminFindPostInfo = params => ajax('/community-manager-war/server/post/adminFindPostInfo.action', params)

// 获取日志列表
const adminGetLog = params => ajax('/community-manager-war/server/post/adminGetLog.action', params)


// 删除
const adminDelPost = params => ajax('/community-manager-war/server/post/adminDelPost.action', params)

// 新增|编辑
const adminAddPost = params => ajax('/community-manager-war/server/post/adminAddPost.action', params)

// 依据id查询
const adminGetPostInfo = params => ajax('/community-manager-war/server/post/adminGetPostInfo.action', params)

// 通过postId查询编辑信息
const adminGetOnePostInfo = params => ajax('/community-manager-war/server/post/adminGetOnePostInfo.action', params)

// 导出
const exportGoodPost = params => ajax('/community-manager-war/server/post/exportGoodPost.action', params)

export default {
    getMajorList,
    adminFindPostInfo,
    adminGetLog,
    adminDelPost,
    adminAddPost,
    adminGetPostInfo,
    adminGetOnePostInfo,
    exportGoodPost,
}
