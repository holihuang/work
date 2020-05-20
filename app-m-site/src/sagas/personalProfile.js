/*
** @file: personalProfile
** @author: huanghaolei
** @date: 2019-08-19 
*/

import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/personalProfile'


function *getMyPostList(action) {
    try {
        const { params } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_MY_POST_LIST_URL, params)
        yield put({
            type: Constants.GET_MY_POST_LIST_SUCCEEDED,
            data: resultMessage
        })
    } catch(e) {
        yield put({
            type: Constants.GET_MY_POST_LIST_FAILED,
            e
        })
    }
}

function *updateTagInfo(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.UPDATE_TAG_INFO_URL, params)
        if(cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.UPDATE_TAG_INFO_FAILED,
            e
        })
    }
}

function *queryTag(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.QUERY_TAG_URL, params)
        yield put({
            type: Constants.QUERY_TAG_SUCCEEDED,
            data: resultMessage
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.QUERY_TAG_FAILED,
            e
        })
    }
}

function *getUserProfile(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_USER_PROFILE_URL, params)
        yield put({
            type: Constants.GET_USER_PROFILE_SUCCEEDED,
            data: resultMessage
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_USER_PROFILE_FAILED,
            e,
        })
    }
}

function *getUserProfileSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_USER_PROFILE_REQUESTED)
        yield call(getUserProfile, payload)
    }
}

function *queryTagSaga() {
    while(true) {
        const { payload } = yield take(Constants.QUERY_TAG_REQUESTED)
        yield call(queryTag, payload)
    }
}

function *updateTagInfoSaga() {
    while(true) {
        const { payload } = yield take(Constants.UPDATE_TAG_INFO_REQUESTED)
        yield call(updateTagInfo, payload)
    }
}

function *getMyPostListSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_MY_POST_LIST_REQUESTED)
        yield call(getMyPostList, payload)
    }
}

export {
    getUserProfileSaga,
    queryTagSaga,
    updateTagInfoSaga,
    getMyPostListSaga,
}