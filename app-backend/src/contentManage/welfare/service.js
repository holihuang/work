/*
* @file: service
* author: gushouchuang
* @date: 2019-12-09
* */
import { ajax } from 'getJSON'

// 列表
const getProjectList = params => ajax('/community-manager-war/commonweal/getProjectList.action', params)

// 新建/编辑
const saveProject = params => ajax('/community-manager-war/commonweal/saveProject.action', params)

// 编辑回填
const getProjectDetail = params => ajax('/community-manager-war/commonweal/getProjectDetail.action', params)

// 下线
const offlineProject = params => ajax('/community-manager-war/commonweal/offlineProject.action', params)

// 操作日志
const getOperateLog = params => ajax('/community-manager-war/commonweal/getOperateLog.action', params)

export default {
    getProjectList,
    saveProject,
    getProjectDetail,
    offlineProject,
    getOperateLog,
}
