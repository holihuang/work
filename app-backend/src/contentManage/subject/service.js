/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:54 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-01-22 16:53:27
 */

import { url } from '../../common/url';
import { common } from '../../common/common'
import getJSON from 'getJSON'

const adminAddSubject = params => {
    return getJSON(url.ADMIM_ADD_SUBJECT, params)
}
const adminGetSubjectList = params => {
    return getJSON(url.ADMIN_GET_SUBLECT_LIST, params)
}
const adminGetSubjectById = params => {
    return getJSON(url.ADMIN_GET_SUBJECT_BY_ID, params)
}
const adminUpdateSubject = params => {
    return getJSON(url.ADMIN_UPDATE_SUBJECT, params)
}
const adminOfflineSubject = params => {
    return getJSON(url.ADMIN_OFFLINE_SUBJECT, params)
}
export default {
    adminAddSubject,
    adminGetSubjectList,
    adminGetSubjectById,
    adminUpdateSubject,
    adminOfflineSubject,
}