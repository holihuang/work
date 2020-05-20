import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import lodash from 'lodash'
import { Toast } from 'antd-mobile';
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/examTask'

function *getActiveInfo(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_ACTIVITY_INFO, params)
        yield put({
            type: Constants.GET_ACTIVITY_INFO_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_ACTIVITY_INFO_FAILED,
            e
        })
    }
}
function *getActiveInfoSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_ACTIVITY_INFO_REQUESTED)
        yield call(getActiveInfo, payload)
    }
}

function *getStuCards(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_STU_CARDS, params)
        yield put({
            type: Constants.GET_STU_CARDS_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_STU_CARDS_FAILED,
            e
        })
    }
}
function *getStuCardsSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_STU_CARDS_REQUESTED)
        yield call(getStuCards, payload)
    }
}
function *getCardCnt(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_CARD_CNT, params)
        yield put({
            type: Constants.GET_CARD_CNT_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_CARD_CNT_FAILED,
            e
        })
    }
}
function *getCardCntSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_CARD_CNT_REQUESTED)
        yield call(getCardCnt, payload)
    }
}
function *getCard(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_CARD, params)
        yield put({
            type: Constants.GET_CARD_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_CARD_FAILED,
            e
        })
    }
}
function *getCardSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_CARD_REQUESTED)
        yield call(getCard, payload)
    }
}
function *getCardsByTag(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_STU_CARDS_BY_TAG, params)
        yield put({
            type: Constants.GET_STU_CARDS_BY_TAG_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_STU_CARDS_BY_TAG_FAILED,
            e
        })
    }
}
function *getCardsByTagSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_STU_CARDS_BY_TAG_REQUESTED)
        yield call(getCardsByTag, payload)
    }
}
function *synthesize(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.SYNTHESIZE, params)
        yield put({
            type: Constants.SYNTHESIZE_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.SYNTHESIZE_FAILED,
            e
        })
    }
}
function *synthesizeSaga() {
    while(true) {
        const { payload } = yield take(Constants.SYNTHESIZE_REQUESTED)
        yield call(synthesize, payload)
    }
}
function *getResult(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_RESULT, params)
        yield put({
            type: Constants.GET_RESULT_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_RESULT_FAILED,
            e
        })
    }
}
function *getResultSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_RESULT_REQUESTED)
        yield call(getResult, payload)
    }
}
function *getWeChatAccount(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_WEIXIN_ACCOUNT, params)
        yield put({
            type: Constants.GET_WEIXIN_ACCOUNT_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_WEIXIN_ACCOUNT_FAILED,
            e
        })
    }
}
function *getWeChatAccountSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_WEIXIN_ACCOUNT_REQUESTED)
        yield call(getWeChatAccount, payload)
    }
}
function *bindWeChat(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.BIND_WECHAT, params)
        yield put({
            type: Constants.BIND_WECHAT_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.BIND_WECHAT_FAILED,
            e
        })
    }
}
function *bindWeChatSaga() {
    while(true) {
        const { payload } = yield take(Constants.BIND_WECHAT_REQUESTED)
        yield call(bindWeChat, payload)
    }
}
function *withDraw(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.WITHDRAW, params)
        yield put({
            type: Constants.WITHDRAW_SUCCEEDED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.WITHDRAW_FAILED,
            e
        })
    }
}
function *withDrawSaga() {
    while(true) {
        const { payload } = yield take(Constants.WITHDRAW_REQUESTED)
        yield call(withDraw, payload)
    }
}

export {
    getActiveInfoSaga,
    getStuCardsSaga,
    getCardCntSaga,
    getCardSaga,
    getCardsByTagSaga,
    synthesizeSaga,
    getResultSaga,
    getWeChatAccountSaga,
    bindWeChatSaga,
    withDrawSaga,
}