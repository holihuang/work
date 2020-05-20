/*
 * @Author: litingwei
 * @Date: 2019-09-16 16:31:59
 * @LastEditTime: 2019-09-24 14:42:44
 * @LastEditors: litingwei
 */

import { takeEvery, isCancelError } from 'redux-saga'
import { take, call, put, fork, cancel } from 'redux-saga/effects'
import lodash from 'lodash'
import { Toast } from 'antd-mobile';
import getJSON from '../common/dataService'
import URLS from '../constants/URLS'
import Constants from '../constants/examine'

function *getUserInfoByToken(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_USERINFO_BY_TOKEN_URL, params)
        yield put({
            type: Constants.GET_USERINFO_BY_TOKEN_SUCCESSED,
            data: resultMessage
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_USERINFO_BY_TOKEN_FAILED,
            e
        })
    }
}
function *getMyPostList(action) {
    try {
        const { params, cb } = action
        const { resultMessage } = yield call(getJSON, URLS.GET_NEED_TO_SHIEDL_LIST_URL, params)
        // 返回列表内容是空时，代表已经全部审核完毕
        // if (!resultMessage.resultList.length) {
        //     // Toast.info('当前全部主帖已审核完毕，请稍后再试~')
        //     return
        // }
        const data = lodash.cloneDeep(resultMessage)
        // 给每条数据加上一个属性isShield 代表是否屏蔽，通过修改这个字段，控制页面展示
        data.resultList.forEach((item, index) => {
            item.isShield = false
        })
        yield put({
            type: Constants.GET_MY_POST_LIST_SUCCEEDED,
            data: data
        })
        if (cb) {
            cb(resultMessage)
        }
    } catch(e) {
        yield put({
            type: Constants.GET_MY_POST_LIST_FAILED,
            e
        })
    }
}
function *setInvitationShield(action) {
    try {
        const { params, cb } = action
        const { postMasterId = '' } = params
        yield call(getJSON, URLS.SET_INVATATION_SHIELD_URL, params)
        yield put({
            type: Constants.SET_INVATATION_SHIELD_SUCCESSED,
            data: postMasterId,
        })
        if (cb) {
            cb()
        }
    } catch(e) {
        yield put({
            type: Constants.SET_INVATATION_SHIELD_FAILED,
            e: '设置出错'
        })
    }
}
function *doBatchAuditForPost(action) {
    try {
        const { params, cb } = action
        const { id = '' } = params
        yield call(getJSON, URLS.DO_BATCH_AUDIT_FOR_POST_URL, params)
        yield put({
            type: Constants.DO_BATCH_AUDIT_FOR_POST_SUCCESSED,
        })
        if (cb) {
            cb()
        }
    } catch(e) {
        yield put({
            type: Constants.DO_BATCH_AUDIT_FOR_POST_FAILED,
            e: '设置出错'
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
function *setInvitationShieldSaga() {
    while(true) {
        const { payload } = yield take(Constants.SET_INVATATION_SHIELD_REQUESTED)
        yield call(setInvitationShield, payload)
    }
}
function *getUserInfoByTokenSaga() {
    while(true) {
        const { payload } = yield take(Constants.GET_USERINFO_BY_TOKEN_REQUESTED)
        yield call(getUserInfoByToken, payload)
    }
}
function *doBatchAuditForPostSaga() {
    while(true) {
        const { payload } = yield take(Constants.DO_BATCH_AUDIT_FOR_POST_REQUESTED)
        yield call(doBatchAuditForPost, payload)
    }
}
export {
    getUserProfileSaga,
    queryTagSaga,
    updateTagInfoSaga,
    getMyPostListSaga,
    setInvitationShieldSaga,
    getUserInfoByTokenSaga,
    doBatchAuditForPostSaga,
}