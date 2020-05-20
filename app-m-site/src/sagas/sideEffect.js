/*
** @file: saga-sideEffect.js
** @author: huanghaolei
** @date: 2019-06-11
*/

import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/sideEffect'

function* doAuthForSkynet(action) {
    try {
        const { payload: { params, cb } } = action
        const { resultMessage } = yield call(getJSON, URLS.DO_AUTH_FOR_SKY_NET_URL, params)
        yield put({
            type: Constants.ON_DO_AUTH_FOR_SKY_NET_SUCCEEDED,
            data: resultMessage
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch (e) {
        yield put({
            type: Constants.ON_DO_AUTH_FOR_SKY_NET_FAILED,
            e,
        })
    }
}

function* getPublishedPost(action) {
    try {
        const { payload: { params, cb, otherParams } } = action
        const data = yield call(getJSON, URLS.GET_PUBLISHED_POST_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_PUBLISHED_POST_SUCCEEDED,
            otherParams,
            params,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_PUBLISHED_POST_FAILED,
            e,
        })
    }
}

function* getUserInfo(action) {
    try {
        const { payload: { params, cb } } = action
        const data = yield call(getJSON, URLS.GET_USER_INFO_FROM_EMPLOYEE_APP_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_USER_INFO_SUCCEEDED,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_USER_INFO_FAILED,
            e
        })
    }
}

function* getPublishedPostSaga() {
    while(true) {
        const action = yield take(Constants.GET_PUBLISHED_POST_REQUESTED)
        yield call(getPublishedPost, action)
    }
}

function* getUserInfoSaga() {
    while(true) {
        const action = yield take(Constants.GET_USER_INFO_REQUESTED)
        yield call(getUserInfo, action)
    }
}

function* doAuthForSkynetSaga() {
    while(true) {
        const action = yield take(Constants.ON_DO_AUTH_FOR_SKY_NET_REQUESTED)
        yield call(doAuthForSkynet, action)
    }
}

export {
    getPublishedPostSaga,
    getUserInfoSaga,
    doAuthForSkynetSaga,
}