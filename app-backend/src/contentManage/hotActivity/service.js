/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:54 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-01-18 16:44:16
 */

//import { getJSON } from 'dataservice'
import { url } from '../../common/url';
import { common } from '../../common/common'
import getJSON from 'getJSON'

const adminGetHotActivityList = params => {
    return getJSON(url.ADMIN_GET_HOT_ACT_LIST, params)
}
const getHotActivityOperationLog = params => {
    return getJSON(url.ADMIN_GET_HOT_ACT_OPERATE_LOG, params)
}
const adminUpdateHotActivity = params => {
    return getJSON(url.ADMIN_UPDATE_HOT_ACT, params)
}
const adminOfflineHotActivity = params => {
    return getJSON(url.ADMIN_OFFLINE_HOT_ACT, params)
}
const adminDeleteHotActivity = params => {
    return getJSON(url.ADMIN_DELETE_HOT_ACT, params)
}
const adminAddHotActivity = params => {
    return getJSON(url.ADMIN_ADD_HOT_ACT, params)
}
const adminGetHotActivityById = params => {
    return getJSON(url.ADMIM_GET_HOT_ACT, params)
}
export default {
    adminGetHotActivityList,
    getHotActivityOperationLog,
    adminUpdateHotActivity,
    adminOfflineHotActivity,
    adminDeleteHotActivity,
    adminGetHotActivityById,
    adminAddHotActivity,
}