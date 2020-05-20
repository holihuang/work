import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { GET_GROUP_BATCH_REQUESTED, GET_GROUP_BATCH_SUCCEEDED, GET_GROUP_BATCH_FAILED,
         GET_TEACHER_MSG_DETAIL_REQUESTED, GET_TEACHER_MSG_DETAIL_SUCCEEDED, GET_TEACHER_MSG_DETAIL_FAILED,
         GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_REQUESTED, GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_SUCCEEDED, GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_FAILED
 } from '../constants/notice'

function* fetchGroupBatchData(action) {
    try {
        const {params} = action;
        var sBoundary = "---------------------------" + Date.now().toString(16);
        var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(params) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
        var options = {
            data: fd,
            contentType:  "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData:false,
            crossDomain: false,
        };
        const data = yield call(getJSON, URLS.GET_GROUP_BATCH_URL, params, options);
        yield put({
            type: GET_GROUP_BATCH_SUCCEEDED, 
            data
        })
    } catch(e) {
        yield put({type: GET_GROUP_BATCH_FAILED, message: e});
    }
}

function* fetchGroupBatchDataSaga() {
    yield* takeEvery(GET_GROUP_BATCH_REQUESTED, fetchGroupBatchData);
}

function* fetchTeacherMsgDetail(action) {
    try {
        const {params} = action;
        var sBoundary = "---------------------------" + Date.now().toString(16);
        var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(params) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
        var options = {
            data: fd,
            contentType:  "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData:false,
            crossDomain: false,
        };
        const data = yield call(getJSON, URLS.GET_TEACHER_MSG_DETAIL_URL, params, options);
        yield put({
            type: GET_TEACHER_MSG_DETAIL_SUCCEEDED, 
            data
        })
    } catch(e) {
        yield put({type: GET_TEACHER_MSG_DETAIL_FAILED, message: e});
    }
}

function* fetchTeacherMsgDetailSaga() {
    yield* takeEvery(GET_TEACHER_MSG_DETAIL_REQUESTED, fetchTeacherMsgDetail);
}

function* fetchSysMessageData(action) {
    try {
        const {params} = action;
        var sBoundary = "---------------------------" + Date.now().toString(16);
        var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(params) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
        var options = {
            data: fd,
            contentType:  "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData:false,
            crossDomain: false,
        };
        const data = yield call(getJSON, URLS.GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_URL, params, options);
        yield put({
            type: GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_SUCCEEDED, 
            data
        })
    } catch(e) {
        yield put({type: GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_FAILED, message: e});
    }
}

function* fetchSysMessageSaga() {
    yield* takeEvery(GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_REQUESTED, fetchSysMessageData)
}

export {
    fetchGroupBatchDataSaga,
    fetchTeacherMsgDetailSaga,
    fetchSysMessageSaga
}
