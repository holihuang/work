/*
** @file: reducer-sideEffect.js
** @author: huanghaolei
** @date: 2019-06-11
*/
import { handleActions } from 'redux-actions'
import { Toast } from 'antd-mobile'
import Constants from '../constants/sideEffect'

function formatData(...args) {
    const [state, data, changeTab, params] = args
    const { pageNo } = params
    const { resultList } = state
    // 区分切换tab
    let list = changeTab ? [] : resultList
    /*
    ** storySet组件使用的pageNo作为是否是从详情页跳转到列表页的，
    ** 列表页只有一页数据时，列表页->详情页->列表页，需要先清除store列表数据
    */
    if (+pageNo === 1) {
        list = []
    }
    return list.concat(data.resultList)
}

export default handleActions({
    [Constants.GET_PUBLISHED_POST_SUCCEEDED](state, action) {
        const { data, otherParams, params } = action
        const { changeTab } = otherParams
        const resultList = formatData(state, data, changeTab, params)
        return { ...state, ...data, resultList }
    },
    [Constants.GET_PUBLISHED_POST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
    [Constants.ON_CLEAR_STORY_SET_DATA](state, action) {
        return {
            ...state,
            resultList: [],
            countPerPage: 0,
            pageCount: 0,
            pageIndex: 0,
            totalCount: 0,
        }
    },
    [Constants.GET_USER_INFO_SUCCEEDED](state, action) {
        const { data } = action
        const { isExpired } = data
        if (+isExpired) {
            Toast.fail('token失效')
        }
        return { ...state, ...data }
    },
    [Constants.GET_USER_INFO_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
    [Constants.ON_DO_AUTH_FOR_SKY_NET_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.ON_DO_AUTH_FOR_SKY_NET_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
}, {
    resultList: [],
    email263: '',
    account: '',
})