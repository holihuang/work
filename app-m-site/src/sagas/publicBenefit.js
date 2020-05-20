import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/publicBenefit'

function *getStuKindness(action) {
    try {
        const { payload: { params } } = action
        const data = yield call(getJSON, URLS.GET_SUT_DIND_NESS_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_SUT_DIND_NESS_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.GET_SUT_DIND_NESS_FAILED,
            e,
        })
    }
}

function *getProjectList(action) {
    try {
        const { params, source = '', cb = () => {} } = action
        const data = yield call(getJSON, URLS.GET_PROJECT_LIST_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_PROJECT_LIST_SUCCEEDED,
            params,
            data: resultMessage,
            source,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_PROJECT_LIST_FAILED,
            e,
        })
    }
}

function *getMyDonationRank(action) {
    try {
        const { payload: { params } } = action
        const data = yield call(getJSON, URLS.GET_MY_DONATION_RANK_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_MY_DONATION_RANK_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.GET_MY_DONATION_RANK_FAILED,
            e,
        })
    }
}

function *getDonationRank(action) {
    try {
        const { params, cb  } = action
        const data = yield call(getJSON, URLS.GET_DONATION_RANK_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_DONATION_RANK_SUCCEEDED,
            params,
            data: resultMessage,
        })
        if (cb && typeof cb === 'function') {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_DONATION_RANK_FAILED,
            e,
        })
    }
}

function *exchangeKindness (action) {
    try {
        const { payload: { params, cb = () => {} } } = action
        yield call(getJSON, URLS.EXCHANGE_KINDNESS_URL, params)
        yield put({
            type: Constants.EXCHANGE_KINDNESS_SUCCEEDED,
            cb,
        })
        cb()
    } catch(e) {
        yield put({
            type: Constants.EXCHANGE_KINDNESS_FAILED,
            e,
        })
    }
}

function *getProjectDetail(action) {
    try {
        const { payload: { params} } = action
        const data =  yield call(getJSON, URLS.GET_PROJECT_DETAIL_URL, params)
        const { resultMessage } = data
        yield put({
            type: Constants.GET_PROJECT_DETAIL_SUCCEEDED,
            data: resultMessage,
        })
    } catch(e) {
        yield put({
            type: Constants.GET_PROJECT_DETAIL_FAILED,
            e,
        })
    }
}

function *donateKindness(action) {
    try {
        const { payload: { params, cb = () => {} } } = action
        yield call(getJSON, URLS.DONATE_KINDNESS_URL, params)
        yield put({
            type: Constants.DONATE_KINDNESS_SUCCEEDED,
            cb,
        })
    } catch(e) {
        yield put({
            type: Constants.DONATE_KINDNESS_FAILED,
            e,
        })
    }
}

function *donateKindnessSaga() {
    yield* takeEvery(Constants.DONATE_KINDNESS_REQUESTED, donateKindness)
}

function *getDonationRankSaga() {
    // yield* takeEvery(Constants.GET_DONATION_RANK_REQUESTED, getDonationRank)
    while(true) {
        const { payload } = yield take(Constants.GET_DONATION_RANK_REQUESTED)
        yield call(getDonationRank, payload)
    }
}

function *getStuKindnessSaga() {
    yield* takeEvery(Constants.GET_SUT_DIND_NESS_REQUESTED, getStuKindness)
}

function *getProjectListSaga() {
    // yield* takeEvery(Constants.GET_PROJECT_LIST_REQUESTED, getProjectList)
    while(true) {
        const { payload } = yield take(Constants.GET_PROJECT_LIST_REQUESTED)
        yield call(getProjectList, payload)
    }
}

function *getMyDonationRankSaga() {
    yield* takeEvery(Constants.GET_MY_DONATION_RANK_REQUESTED, getMyDonationRank)
}

function *exchangeKindnessSaga() {
    yield* takeEvery(Constants.EXCHANGE_KINDNESS_REQUESTED, exchangeKindness)
}

function *getProjectDetailSaga() {
    yield* takeEvery(Constants.GET_PROJECT_DETAIL_REQUESTED, getProjectDetail)
}

export {
    getStuKindnessSaga,
    getProjectListSaga,
    getMyDonationRankSaga,
    getDonationRankSaga,
    exchangeKindnessSaga,
    getProjectDetailSaga,
    donateKindnessSaga,
}