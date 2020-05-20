/*
** @file: examVideo
** @author: huanghaolei
** @date: 2020-03-03
*/

import { handleActions } from 'redux-actions'
import Constants from 'Constants/examVideo'
import { Toast } from 'antd-mobile'

export default handleActions({
    [Constants.VIDEO_LIST_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            videoList: data,
        }
    },
    [Constants.VIDEO_LIST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {
            ...state
        }
    }
}, {
    videoList: [],
})