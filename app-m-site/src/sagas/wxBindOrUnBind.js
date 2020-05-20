/*
** @file: wxBind
** @author: huanghaolei
** @date: 2019-12-11
*/


import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/wxBindOrUnBind'

function *getUserByTicket(action) {
    try {
        const { params, cb } = action
        const data = yield call(getJSON, URLS.ON_GET_USER_BY_TICKET_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.ON_GET_USER_BY_TICKET_SUCCEEDED,
            data: resultMessage,
        })
        if(cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.ON_GET_USER_BY_TICKET_FAILED,
            e,
        })
    }
}

function *manageBind263(action) {
    try {
        const { params, cb = () => {} } = action
        const data = yield call(getJSON, URLS.MANAGE_BIND_263_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.ON_MANAGE_BIND_263_SUCCEEDED,
            data: resultMessage,
        })
        if(cb) {
            cb()
        }
    } catch(e) {
        yield put({
            type: Constants.ON_MANAGE_BIND_263_FAILED,
            e,
        })
    }
}

function *manageBind263Saga() {
    while(true) {
        const { payload } = yield take(Constants.ON_MANAGE_BIND_263_REQUESTED)
        yield call(manageBind263, payload)
    }
}


function *getUserByTicketSaga() {
    while(true) {
        const { payload } = yield take(Constants.ON_GET_USER_BY_TICKET_REQUESTED)
        yield call(getUserByTicket, payload)
    }
}

export {
    manageBind263Saga,
    getUserByTicketSaga,
}