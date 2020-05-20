/*
** @file: caseHub
** @author: huanghaolei
** @date: 2019-05-20
*/
import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/caseHub'

function *updateForwardCnt(action) {
    try {
        const { params } = action
        const { resultMessage } = yield call(getJSON, URLS.UPDATE_FORWARD_CNT_URL, params)
    } catch(e) {
        yield put({
            type: Constants.ON_UPDATE_FORWARD_CNT_FAILED,
            e,
        })
    }
}

function *addWeixinReadCord(action) {
    try {
        const { payload } = action
        const { params, } = payload
        const { resultMessage } = yield call(getJSON, URLS.ADD_WEI_XIN_READ_CORD_URL, params)
        // yield put({
        //     type: Constants.ON_ADD_WEIXIN_READ_CORD_SUCCEEDED,
        //     data: resultMessage,
        // })
    } catch(e) {
        yield put({
            type: Constants.ON_ADD_WEIXIN_READ_CORD_FAILED,
            e
        })
    }
}

function* getWxJsSign(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_WX_JS_SIGN_URL, params)
        yield put({
            type: Constants.ON_GET_WX_JS_SIGN_SUCCEEDED,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.ON_GET_WX_JS_SIGN_FAILED,
            e,
        })
    }
}

function* getUserInfoInWechat(action) {
    try {
        const { params, cb = () => {} } = action
        const data = yield call(getJSON, URLS.GET_USER_INFO_IN_WECHAT_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_USER_INFO_IN_WECHAT_SUCCEEDED,
            data: resultMessage,
        })
        if(cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_USER_INFO_IN_WECHAT_FAILED,
            e,
        })
    }
}

function* getWxLoginUrl(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.GET_WX_LOGIN_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_WX_LOGIN_URL_SUCCEEDED,
            data: resultMessage,
            cb
        })
    } catch(e) {
        yield put({
            type: Constants.GET_WX_LOGIN_URL_FAILED,
            e,
        })
    }
}

function* getGoodPostContent(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.GET_GOOD_POST_CONTENT_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_GOOD_POST_CONTENT_SUCCEEDED,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_GOOD_POST_CONTENT_FAILED,
            e
        })
    }
} 

function* getGoodPostContentSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_GOOD_POST_CONTENT_REQUESTED)
        yield call(getGoodPostContent, payload)
    }
}

function* getWxLoginUrlSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_WX_LOGIN_URL_REQUESTED)
        yield call(getWxLoginUrl, payload)
    }
}

function* getUserInfoInWechatSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_USER_INFO_IN_WECHAT_REQUESTED)
        yield call(getUserInfoInWechat, payload)
    }
}

function* getWxJsSignSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_GET_WX_JS_SIGN_REQUESTED)
        yield call(getWxJsSign, payload)
    }
}

function *addWeixinReadCordSaga() {
    // while(true) {
    //     const { payload } = yield take(Constants.ON_ADD_WEIXIN_READ_CORD_REQUESTED)
    //     yield call(addWeixinReadCord, payload)
    // }
    yield* takeEvery(Constants.ON_ADD_WEIXIN_READ_CORD_REQUESTED, addWeixinReadCord)
}

function *updateForwardCntSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_UPDATE_FORWARD_CNT_REQUESTED)
        yield call(updateForwardCnt, payload)
    }
    
}

export {
    getGoodPostContentSaga,
    getWxLoginUrlSaga,
    getUserInfoInWechatSaga,
    getWxJsSignSaga,
    addWeixinReadCordSaga,
    updateForwardCntSaga,
}