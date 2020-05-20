/*
 * @Author: litingwei
 * @Date: 2019-09-16 16:30:59
 * @LastEditTime: 2019-09-19 15:17:46
 * @LastEditors: litingwei
 */
import { handleActions } from 'redux-actions'
import Constants from '../constants/examine'
import { Toast } from 'antd-mobile'
import lodash from 'lodash'

const defaultStoreData = {
    countPerPage: 10,
    pageIndex: 1,
    postList: [],
    email263: '',
    employName: '',
}

export default handleActions({
    [Constants.GET_USER_PROFILE_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.GET_USER_PROFILE_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.QUERY_TAG_SUCCEEDED](state, action) {
        const { data: { flag } } = action
        return {
            ...state,
            redHeartState: flag,
        }
    },
    [Constants.QUERY_TAG_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.UPDATE_TAG_INFO_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_MY_POST_LIST_SUCCEEDED](state, action) {
        const { postList } = state
        const { data } = action
        const { resultList, countPerPage } = data
        return {
            ...state,
            // countPerPage,
            // pageIndex,
            // pageCount,
            // totalCount,
            postList: resultList,
        }
    },
    [Constants.GET_MY_POST_LIST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.SET_INVATATION_SHIELD_SUCCESSED](state, action) {
        const { postList } = state
        const { data } = action
        const newPostList = lodash.cloneDeep(postList)
        newPostList.forEach((item, index) => {
            if (item.postMasterId === data) {
                item.isShield = true
            }
        })
        return {
            ...state,
            postList: newPostList,
        }
    },
    [Constants.SET_INVATATION_SHIELD_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.DO_BATCH_AUDIT_FOR_POST_SUCCESSED](state, action) {
        return {
            ...state,
        }
    },
    [Constants.DO_BATCH_AUDIT_FOR_POST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_USERINFO_BY_TOKEN_SUCCESSED](state, action) {
        const { postList } = state
        const { data } = action
        const { email263, employName } = data
        return {
            ...state,
            email263,
            employName,
        }
    },
    [Constants.GET_USERINFO_BY_TOKEN_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_RESET_PERSONAL_PROFILE_STORE](state, action) {
        return defaultStoreData
    },
}, defaultStoreData)