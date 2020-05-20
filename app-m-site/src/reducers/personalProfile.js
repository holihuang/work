/*
** @file: personalProfile
** @author: huanghaolei
** @date: 2019-08-19
*/
import { handleActions } from 'redux-actions'
import Constants from '../constants/personalProfile'
import { Toast } from 'antd-mobile'

const defaultStoreData = {
    countPerPage: 10,
    pageIndex: 1,
    postList: [],
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
        const { resultList, countPerPage, pageIndex, pageCount, totalCount } = data
        return {
            ...state,
            countPerPage,
            pageIndex,
            pageCount,
            totalCount,
            postList: postList.concat(resultList),
        }
    },
    [Constants.GET_MY_POST_LIST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_RESET_PERSONAL_PROFILE_STORE](state, action) {
        return defaultStoreData
    },
}, defaultStoreData)