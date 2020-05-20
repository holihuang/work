/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import { ajax } from 'getJSON'

const getMajorList = params => {
    return ajax('/community-manager-war/beforelesson/getMajorList.action', params)
}

const addMajor = params => {
    return ajax('/community-manager-war/beforelesson/addMajor.action', params)
}

const updateMajorStatus = params => {
    return ajax('/community-manager-war/beforelesson/updateMajorStatus.action', params)
}

const deleteMajor = params => {
    return ajax('/community-manager-war/beforelesson/deleteMajor.action', params)
}

const getOperationLog = params => {
    return ajax('/community-manager-war/beforelesson/getOperationLog.action', params)
}

// 编辑页面
// 基础信息
const getMajorById = params => {
    return ajax('/community-manager-war/beforelesson/getMajorById.action', params)
}

const updateMajor = params => {
    return ajax('/community-manager-war/beforelesson/updateMajor.action', params)
}

// 答疑视频
const getVideoList = params => {
    return ajax('/community-manager-war/beforelesson/getVideoList.action', params)
}

const addVideo = params => {
    return ajax('/community-manager-war/beforelesson/addVideo.action', params)
}

const updateVideo = params => {
    return ajax('/community-manager-war/beforelesson/updateVideo.action', params)
}

const deleteVideo = params => {
	return ajax('/community-manager-war/beforelesson/deleteVideo.action', params)
}

const getTeacherList = params => {
	return ajax('/community-manager-war/beforelesson/getTeacherList.action', params)
}

const addTeacher = params => {
	return ajax('/community-manager-war/beforelesson/addTeacher.action', params)
}

const deleteTeacher = params => {
	return ajax('/community-manager-war/beforelesson/deleteTeacher.action', params)
}

const updateTeacher = params => {
	return ajax('/community-manager-war/beforelesson/updateTeacher.action', params)
}


const getClassList = params => {
	return ajax('/community-manager-war/beforelesson/getClassList.action', params)
}

const addClass = params => {
	return ajax('/community-manager-war/beforelesson/addClass.action', params)
}

const deleteClassById = params => {
	return ajax('/community-manager-war/beforelesson/deleteClassById.action', params)
}

const updateClassById = params => {
	return ajax('/community-manager-war/beforelesson/updateClassById.action', params)
}

const getRegionList = params => {
	return ajax('/community-manager-war/beforelesson/getRegionList.action', params)
}

const updateRegionInfo = params => {
	return ajax('/community-manager-war/beforelesson/updateRegionInfo.action', params)
}

const getCourseList = params => {
	return ajax('/community-manager-war/beforelesson/getCourseList.action', params)
}

const updateCourse = params => {
	return ajax('/community-manager-war/beforelesson/updateCourse.action', params)
}

const getSchoolList = params => {
	return ajax('/community-manager-war/beforelesson/getSchoolList.action', params)
}

const addSchool = params => {
	return ajax('/community-manager-war/beforelesson/addSchool.action', params)
}

const updateSchool = params => {
	return ajax('/community-manager-war/beforelesson/updateSchool.action', params)
}

const deleteSchool = params => {
	return ajax('/community-manager-war/beforelesson/deleteSchool.action', params)
}

export default {
    getMajorList,
    addMajor,
    updateMajorStatus,
    deleteMajor,
    getOperationLog,
    getMajorById,
    updateMajor,
    getVideoList,
    addVideo,
    updateVideo,
    deleteVideo,
	getTeacherList,
	addTeacher,
	deleteTeacher,
	updateTeacher,
	getClassList,
	addClass,
	deleteClassById,
	updateClassById,
	getRegionList,
	updateRegionInfo,
	getCourseList,
	updateCourse,
	getSchoolList,
	addSchool,
	updateSchool,
	deleteSchool,
}
