import {takeEvery, isCancelError} from 'redux-saga';
import {take, call, put, fork, cancel} from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import {
    GET_POST_DETAIL_REQUESTED,
    GET_POST_DETAIL_SUCCEEDED,
    GET_POST_DETAIL_FAILED,
    GET_PRAISE_USER_LIST_REQUESTED,
    GET_PRAISE_USER_LIST_SUCCEEDED,
    GET_PRAISE_USER_LIST_FAILED
} from '../constants/examinePost';

function* fetchPostDetailData(action) {
    try {
        const {params, otherParams} = action;
        var sBoundary = "---------------------------" + Date.now().toString(16);
        var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(params) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
        var options = {
            data: fd,
            contentType: "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData: false,
            crossDomain: false,
        };
        const data = yield call(getJSON, URLS.GET_POST_DETAIL_URL, params, options);
        yield put({
            type: GET_POST_DETAIL_SUCCEEDED,
            data,
            otherParams,
        })
    } catch (e) {
        yield put({type: GET_POST_DETAIL_FAILED, message: e});
    }
}

function* fetchPraiseUserList(action) {
    try {
        const { params, otherParams } = action;
        var sBoundary = "---------------------------" + Date.now().toString(16);
        var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(params) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
        var options = {
            data: fd,
            contentType: "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData: false,
            crossDomain: false,
        };
        const data = yield call(getJSON, URLS.GET_PRAISE_LIST_URL, params, options);
        yield put({
            type: GET_PRAISE_USER_LIST_SUCCEEDED,
            data,
            otherParams,
        })
    } catch (e) {
        yield put({type: GET_PRAISE_USER_LIST_FAILED, message: e});
    }
}

function* fetchPostDetailDataSaga() {
    yield* takeEvery(GET_POST_DETAIL_REQUESTED, fetchPostDetailData);
}

function* fetchPraiseUserListSaga() {
    yield* takeEvery(GET_PRAISE_USER_LIST_REQUESTED, fetchPraiseUserList)
}

export {
    fetchPostDetailDataSaga,
    fetchPraiseUserListSaga,
}
