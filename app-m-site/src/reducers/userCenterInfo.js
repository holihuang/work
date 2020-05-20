/*
** @file: userCenter
** @author: huanghaolei
** @date: 2019-08-01
*/
import { handleActions } from 'redux-actions'
import Constants from '../constants/userCenterInfo'
import { Toast } from 'antd-mobile'

function formatNullData(data) {
    const obj = {}
    Object.entries(data).forEach(([key, value]) => {
        if(key === 'profile' && value === null) {
            obj[key] = {}
        } else {
            obj[key] = value
        }
    })
    return obj
}

export default handleActions({
    [Constants.ON_PERSON_CENTER_RETRIVE_INFO_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...formatNullData(data),
        }
    },
    [Constants.ON_PERSON_CENTER_RETRIVE_INFO_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_UPDATE_PROFILE_SUCCEEDED](state, action) {
        const { data = {} } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.ON_UPDATE_PROFILE_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_CHANGE](state, action) {
        const { params = {} } = action
        return {
            ...state,
            profile: {
                ...state.profile,
                ...params,
            },
        }
    },
    [Constants.ON_CLEAR_USER_CENTER_INFO_PARAMS](state, action) {
        const { params } = action
        return {
            ...state,
            params,
        }
    },
}, {
    profile: {},
})