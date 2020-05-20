import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { GET_QUESTION_DETAIL_REQUESTED, GET_QUESTION_DETAIL_SUCCEEDED, GET_QUESTION_DETAIL_FAILED,
         GET_ANSWER_DETAIL_REQUESTED, GET_ANSWER_DETAIL_SUCCEEDED, GET_ANSWER_DETAIL_FAILED
        } from '../constants/question'

function* fetchQuestionData(action) {
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
        const data = yield call(getJSON, URLS.GET_QUESTION_LIST_URL, params, options);
        yield put({
            type: GET_QUESTION_DETAIL_SUCCEEDED,
            data
        })
    } catch(e) {
        yield put({type: GET_QUESTION_DETAIL_FAILED, message: e});
    }
}

function* fetchAnswerData(action) {
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
        const data = yield call(getJSON, URLS.GET_ANSWER_LIST_URL, params, options);
        yield put({
            type: GET_ANSWER_DETAIL_SUCCEEDED,
            data
        })
    } catch(e) {
        yield put({type: GET_ANSWER_DETAIL_FAILED, message: e});
    }
}

function* fetchQuestionDataSaga() {
    yield* takeEvery(GET_QUESTION_DETAIL_REQUESTED, fetchQuestionData);
}

function* fetchAnswerDataSaga() {
    yield* takeEvery(GET_ANSWER_DETAIL_REQUESTED, fetchAnswerData);
}


export {
    fetchQuestionDataSaga,
    fetchAnswerDataSaga
}
