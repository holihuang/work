/*
** @file: userCenter
** @author: huanghaolei
** @date: 2019-08-01
*/


import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/userCenter'

function *getRecordSwitcherManager(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.RECORD_SWITCHER_MANAGER_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_RECORD_SWITCHER_MANAGER_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.GET_RECORD_SWITCHER_MANAGER_FAILED,
            data: resultMessage,
        })
    }
}

function *getPersonCenterRetrive(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.PERSON_CENTER_RETRIVE_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_PERSON_CENTER_RETRIVE_SUCCEEDED,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_PERSON_CENTER_RETRIVE_FAILED,
            e,
        })
    }
}

function *getPersonCenterRetriveSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_PERSON_CENTER_RETRIVE_REQUESTED)
        yield call(getPersonCenterRetrive, payload)
    }
}

function *getRecordSwitcherManagerSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_RECORD_SWITCHER_MANAGER_REQUESTED)
        yield call(getRecordSwitcherManager, payload)
    }
} 

export {
    getPersonCenterRetriveSaga,
    getRecordSwitcherManagerSaga,
}