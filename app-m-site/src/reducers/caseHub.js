/*
** @file: casuHub-reducer
** @author: huanghaolei
** @date: 2019-05-20
*/

import { handleActions } from 'redux-actions'
import Constants from '../constants/caseHub'
import { Toast } from 'antd-mobile'


const initParams = {
    id: -1,
    content: '',
    passedSubjectNum: 0,
    attendTime: 0,
    medalCount: 0,
    postAmount: 0,
    questionCount: 0,
    level: 0,
    levelName: '',
    nickName: '',
    signature: '',
    sex: '',
    imageUrl: '',
    isVip: '',
    email263: '',
    collegeName: '',
    className: '',
    familyName: '',
    groupName: '',
}

export default handleActions({
    [Constants.GET_GOOD_POST_CONTENT_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.GET_GOOD_POST_CONTENT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_WX_LOGIN_URL_SUCCEEDED](state, action) {
        const { data, cb } = action
        if (cb && typeof cb === 'function') {
            cb(data)
        }
        return {
            ...state,
            wxLoginUrl: data,
        }
    },
    [Constants.GET_WX_LOGIN_URL_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_USER_INFO_IN_WECHAT_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            userInfoInWx: data,
        }
    },
    [Constants.GET_USER_INFO_IN_WECHAT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {
            ...state,
        }
    },
    [Constants.ON_CLEAR_CONTENT_DATA](state, action) {
        return {
            ...state,
            ...initParams,
        }
    },
    [Constants.ON_GET_WX_JS_SIGN_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            wxSignature: data,
        }
    },
    [Constants.ON_GET_WX_JS_SIGN_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.ON_ADD_WEIXIN_READ_CORD_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
    [Constants.ON_UPDATE_FORWARD_CNT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return { ...state }
    },
}, {
    id: -1,
    content: '',
    attendTime: 0,
    questionCount: 0,
    postAmount: 0,
    medalCount: 0,
    questionCount: 0,
    passedSubjectNum: 0,
    wxLoginUrl: '',
    userInfoInWx: {},
    wxSignature: {},
})