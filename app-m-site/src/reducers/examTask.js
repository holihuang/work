/*
** @file: examTask
** @author: huanghaolei
** @date: 2020-02-28
*/

import { handleActions } from 'redux-actions'
import Constants from 'Constants/examTask'
import { Toast } from 'antd-mobile'

export default handleActions({
    [Constants.ON_GET_STU_TASKS_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            list: data,
        }
    },
    [Constants.ON_GET_STU_TASKS_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_TIKU_INFO_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.GET_TIKU_INFO_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {
            ...state,
        }
    },
    [Constants.DO_TASK_SUCCEEDED](state, action) {
        Toast.success('操作成功', 1)
        return {...state}
    },
    [Constants.DO_TASK_FAILED](state, action) {
        const { e } = action
        // Toast.fail(e)
        return {...state}
    }
}, {
    list: [],
})
