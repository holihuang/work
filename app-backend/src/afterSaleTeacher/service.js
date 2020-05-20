/**
 * @file 公开课配置
 *
 * @auth gushouchuang
 * @date 2018-1-10
 */

import { ajax } from 'getJSON'

const getTeacherList = params => {
    return ajax('/community-manager-war/afterSaleTeacher/ListAfterSaleTeachers.action', params)
}

const delTeacher = params => {
    return ajax('/community-manager-war/afterSaleTeacher/delAfterSaleTeacher.action', params)
}

const modTeacher = params => {
    return ajax('/community-manager-war/afterSaleTeacher/updateAfterSaleTeacher.action', params)
}

const addTeacher = params => {
    return ajax('/community-manager-war/afterSaleTeacher/addAfterSaleTeacher.action', params)
}

const listAllCollege = params => {
    return ajax('/community-manager-war/teachermessage/getAllCollege.action', params)
}

const listAllFamily = params => {
    return ajax('/community-manager-war/teachermessage/getAllFamily.action', params)
}

const listFamilyByCollege = params => {
    return ajax('/community-manager-war/teachermessage/listFamilyByCollegeId.action', params)
}

export default {
    getTeacherList,
    delTeacher,
    modTeacher,
    addTeacher,
    listAllCollege,
    listAllFamily,
    listFamilyByCollege,
}
