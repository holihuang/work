/**
 * @file 公开课配置
 *
 * @auth gushouchuang
 * @date 2018-1-10
 */

import { ajax } from 'getJSON'

const getLessonsList = params => {
    return ajax('/community-manager-war/publicLesson/adminListPulicLesson.action', params)
}

const delLessonsList = params => {
    return ajax('/community-manager-war/publicLesson/adminDelPublicLesson.action', params)
}
//获取课程标签列表
const getLabelList = params => {
    return ajax('/community-manager-war/publicLesson/adminListLessonLabel.action', params)
}

const getLessonDetail = params => {
    return ajax('/community-manager-war/publicLesson/adminListPublicLessonOperation.action', params)
}

//获取企业家直播课程
const getLiveLessonList = params => {
    return ajax('/community-manager-war/publicLesson/adminListLiveLesson.action', params)
}

//获取课程来源
const getCourseSource = params => {
    return ajax('/community-manager-war/teachermessage/listAllCollege.action', params)
}

//新增课程
const getAddCourse = params => {
    return ajax('/community-manager-war/publicLesson/adminAddPulicLesson.action', params)
}

//更新课程
const getUpdateCourse = params => {
    return ajax('/community-manager-war/publicLesson/adminUpdatePublicLesson.action', params)
}

//通过id获取公开课信息（更新）
const getPublicLessonById = params => {
    return ajax('/community-manager-war/publicLesson/adminGetPublicLessonById.action', params)
}

export default {
    getLessonsList,
    delLessonsList,
    getLabelList,
    getLessonDetail,
    getLiveLessonList,
    getCourseSource,
    getUpdateCourse,
    getAddCourse,
    getPublicLessonById
}
