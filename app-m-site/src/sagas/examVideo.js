/*
** @file: examVideo
** @author: huanghaolei
** @date: 2020-03-03
*/

import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import getJSON from 'Common/dataService'
import URLS from 'Constants/URLS'
import Constants from 'Constants/examVideo'

function *videoList(action) {
    try {
        const { payload: { params } } = action
        const { resultMessage } = yield call(getJSON, URLS.VIDEO_LIST_URL, params)
        yield put({
            type: Constants.VIDEO_LIST_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.VIDEO_LIST_FAILED,
            data: e,
        })
    }
}

function *recordWatch(action) {
    try {
        const { payload: { params } } = action
        yield call(getJSON, URLS.RECORD_WATCH_URL, params)
    } catch(e) {
        yield put({
            type: Constants.RECORD_WATCH_FAILED,
            e,
        })
    }
}

function *videoListSaga() {
    yield *takeEvery(Constants.VIDEO_LIST_REQUESTED, videoList)
}

function *recordWatchSaga() {
    yield *takeEvery(Constants.RECORD_WATCH_REQUESTED, recordWatch)
}

export {
    videoListSaga,
    recordWatchSaga,
}