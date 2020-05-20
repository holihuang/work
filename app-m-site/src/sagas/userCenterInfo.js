/*
** @file: userCenter
** @author: huanghaolei
** @date: 2019-08-01
*/

import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/userCenterInfo'


function *updateProfile(action) {
    try {
        const { params, cb = () => {} } = action
        const data = yield call(getJSON, URLS.UPDATE_PROFILE_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.ON_UPDATE_PROFILE_SUCCEEDED,
            data: resultMessage,
        })
        cb()
    } catch(e) {
        yield put({
            type: Constants.ON_UPDATE_PROFILE_FAILED,
            e,
        })
    }
}

function *personCenterRetrive(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.PERSON_CENTER_RETRIVE_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.ON_PERSON_CENTER_RETRIVE_INFO_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.ON_PERSON_CENTER_RETRIVE_INFO_FAILED,
            e,
        })
    }
}


function *personCenterRetriveSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_PERSON_CENTER_RETRIVE_INFO_REQUESTED)
        yield call(personCenterRetrive, payload)
    }
} 

function *updateProfileSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_UPDATE_PROFILE_REQUESTED)
        yield call(updateProfile, payload)
    }
}

export {
    personCenterRetriveSaga,
    updateProfileSaga,
}