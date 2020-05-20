/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:54 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-01-18 16:44:51
 */

import { url } from '../../common/url'
import { common } from '../../common/common'
import getJSON from 'getJSON'

const adminAddSubjectContent = params => {
    return getJSON(url.ADMIN_ADD_SUBJECT_CONTENT, params)
}
const adminGetSubjectContentList = params => {
    return getJSON(url.ADMIN_GET_SUBLECT_CONTENT_LIST, params)
}
const adminDeleteSubjectContent = params => {
    return getJSON(url.ADMIN_DELETE_SUBJECT_CONTENT, params)
}
export default {
    adminAddSubjectContent,
    adminGetSubjectContentList,
    adminDeleteSubjectContent,
}