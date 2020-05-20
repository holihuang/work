/*
** @file: readRecord
** @author: huanghaolei
** date: 2019-07-31
*/

import { handleActions } from 'redux-actions'
import Constants from '../constants/readRecord'
import { Toast } from 'antd-mobile'

const defaultData = {
    resultList: [],
    pageIndex: 1,
    countPerPage: 10,
}

export default handleActions({
    [Constants.GET_WEIXIN_RECORD_LIST_SUCCEEDED](state, action) {
        const { data, otherParams: { changeTab = false, isRefresh = false }, params: { pageNo } } = action
        const { resultList } = data
        // 区分切换tab,onFresh
        let list = (changeTab || isRefresh) ? [] : state.resultList
        // pageNo = 1, 清掉store中的resultList
        if (+pageNo === 1) {
            list = []
        }
        return {
            ...state,
            ...data,
            resultList: list.concat(resultList)
        }
    },
    [Constants.GET_WEIXIN_RECORD_LIST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_CLEAR_RECORD_LIST](state, action) {
        return {
            ...state,
            ...defaultData,
        }
    },
}, {
    ...defaultData,
})