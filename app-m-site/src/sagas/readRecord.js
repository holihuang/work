/*
** @file: readRecord
** @author: huanghaolei
** @date: 2019-07-31
*/
import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/readRecord'

function *getWeixinRecordList(action) {
    try {
        const { params, otherParams, successCb, failCb } = action
        const data = yield call(getJSON, URLS.WEIXIN_RECORD_LIST_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_WEIXIN_RECORD_LIST_SUCCEEDED,
            params,
            otherParams,
            data: resultMessage,
        })
        if (successCb && typeof successCb === 'function') {
            successCb()
        }
        if (failCb && typeof failCb === 'function') {
            failCb()
        }
    } catch(e) {
        yield put({
            type: Constants.GET_WEIXIN_RECORD_LIST_FAILED,
            e,
        })
    }
}

function *getWeixinRecordListSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_WEIXIN_RECORD_LIST_REQUESTED)
        yield call(getWeixinRecordList, payload)
    }
}

export {
    getWeixinRecordListSaga,
}