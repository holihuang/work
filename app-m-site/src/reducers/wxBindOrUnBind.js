/*
** @file: wxBind
** @author: huanghaolei
** @date: 2019-12-11
*/
import { handleActions } from 'redux-actions'
import Constants from '../constants/wxBindOrUnBind.js'
import { Toast } from 'antd-mobile'

export default handleActions({
    [Constants.ON_CHANGE_ACCOUNT](state, action) {
        const { payload: { params } } = action
        const { params: stateParams } = state
        return {
            ...state,
            params: {
                ...stateParams,
                ...params,
            }
        }
    },
    [Constants.ON_MANAGE_BIND_263_SUCCEEDED](state, action) {
        return {
            ...state,
        }
    },
    [Constants.ON_MANAGE_BIND_263_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {
            ...state,
        }
    },
    [Constants.ON_GET_USER_BY_TICKET_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.ON_GET_USER_BY_TICKET_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {
            ...state,
        }
    },
    [Constants.ON_CLEAR_PARAMS](state, action) {
        const { params } = action
        return {
            ...state,
            params,
        }
    },
    [Constants.ON_SAVE_DATA_FROM_URL](state, action) {
        const { params: payloadParams } = action
        const { params } = state
        return {
            ...state,
            params: {
                ...params,
                ...payloadParams,
            }
        }
    }
}, {
    params: {},
})