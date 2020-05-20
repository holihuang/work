/*
** @file: caseHub
** @author: huanghaolei
** @date: 2019-05-20
*/
import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/bottomNav'

function* getShortUrl(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.GET_SHORT_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.ON_GET_SHORT_URL_SUCCEEDED,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.ON_GET_SHORT_URL_FAILED,
            e
        })
    }
} 

function* getShortUrlSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_GET_SHORT_URL_REQUESTED)
        yield call(getShortUrl, payload)
    }
}

export {
    getShortUrlSaga,
}