/*
** @file: examTask
** @author: huanghaolei
** @date: 2020-02-28
*/

import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import getJSON from 'Common/dataService'
import URLS from 'Constants/URLS'
import Constants from 'Constants/examTask'

function *getStuTasks(action) {
    try {
        const { payload: { params } } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_STU_TASKS_URL, params)
        yield put({
            type: Constants.ON_GET_STU_TASKS_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.ON_GET_STU_TASKS_FAILED,
            data: e,
        })
    }
}

function *getTikuInfo(action) {
    try {
        const { payload: { params, cb = () => {} } } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_TIKU_INFO_URL, params)
        yield put({
            type: Constants.GET_TIKU_INFO_SUCCEEDED,
            data: resultMessage,
        })
        if(cb) {
            cb()
        }
    } catch(e) {
        yield put({
            type: Constants.GET_TIKU_INFO_FAILED,
            e,
        })
    }
}

function *doTask(action) {
    try {
        const { payload: { params, cb = () => {} } } = action
        const { resultMessage } = yield call(getJSON, URLS.DO_TASK_URL, params)
        yield put({
            type: Constants.DO_TASK_SUCCEEDED,
            data: resultMessage,
        })
        cb()
    } catch(e) {
        yield put({
            type: Constants.DO_TASK_FAILED,
            e,
        })
    }
}

function *getStuTasksSaga() {
    yield* takeEvery(Constants.ON_GET_STU_TASKS_REQUESTED, getStuTasks)
}

function *getTikuInfoSaga() {
    yield* takeEvery(Constants.GET_TIKU_INFO_REQUESTED, getTikuInfo)
}

function *doTaskSaga() {
    yield *takeEvery(Constants.DO_TASK_REQUESTED, doTask)
}

export {
    getStuTasksSaga,
    getTikuInfoSaga,
    doTaskSaga,
}