/*
** @file: bottomNav
** @author: huanghaolei
** @date: 2019-09-18
*/
import { handleActions } from 'redux-actions'
import Constants from '../constants/bottomNav'
import { Toast } from 'antd-mobile'

export default handleActions({
    [Constants.ON_GET_SHORT_URL_SUCCEEDED](state, action) {
        const { data } = action
        return { ...state, ...data, }
    },
    [Constants.ON_GET_SHORT_URL_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
}, {
    shortUrl: '',
})