import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { 
    GET_MAJOR_INFO_REQUESTED,
    GET_MAJOR_INFO_SUCCEEDED,
    GET_MAJOR_INFO_FAILED,

    GET_SCHOOL_INTRODUCTION_REQUESTED,
    GET_SCHOOL_INTRODUCTION_SUCCEEDED,
    GET_SCHOOL_INTRODUCTION_FAILED,

    GET_ALL_COURSE_LIST_REQUESTED,
    GET_ALL_COURSE_LIST_SUCCEEDED,
    GET_ALL_COURSE_LIST_FAILED,

    GET_POST_BY_MAJORID_REQUESTED,
    GET_POST_BY_MAJORID_SUCCEEDED,
    GET_POST_BY_MAJORID_FAILED,
 } from '../constants/course'

function* fetchMajorInfo(action) {
    try {
        const { params } = action;
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
        const majorInfo = yield call(getJSON, URLS.GET_APP_MAJOR_INFO_LIST_URL, params, options);
        const otherMajorInfo = yield call(getJSON, URLS.GET_MAJOR_OTHER_INFO_URL, params, options);

        yield put({
            type: GET_MAJOR_INFO_SUCCEEDED, 
            data: { ...majorInfo.resultMessage, ...otherMajorInfo.resultMessage }
        })
    } catch(e) {
        yield put({type: GET_MAJOR_INFO_FAILED, message: e});
    }
}

function* fetchMajorInfoSaga() {
    while (true) {
        const { payload } = yield take(GET_MAJOR_INFO_REQUESTED)
        yield call(fetchMajorInfo, payload)
    }
}

function* fetchPostByMajorId(action) {
    try {
        const { params, cb } = action
        const topicList = yield call(getJSON, URLS.GET_POST_BY_MAJOR_URL, params)

        yield put({
            type: GET_POST_BY_MAJORID_SUCCEEDED, 
            data: { 
                ...topicList.resultMessage,
            },
            cb,
        })
    } catch(e) {
        yield put({type: GET_POST_BY_MAJORID_FAILED, message: e});
    }
}

function* fetchPostByMajorIdSaga() {
    while (true) {
        const { payload } = yield take(GET_POST_BY_MAJORID_REQUESTED)
        yield call(fetchPostByMajorId, payload)
    }
}

function* fetchCourseList(action) {
    try {
        const { params } = action
        const data = yield call(getJSON, URLS.GET_ALL_COURSE_LIST_URL, params)

        yield put({
            type: GET_ALL_COURSE_LIST_SUCCEEDED, 
            data: data.resultMessage,
        })
    } catch(e) {
        yield put({type: GET_ALL_COURSE_LIST_FAILED, message: e});
    }
}

function* fetchCourseListSaga() {
    while (true) {
        const { payload } = yield take(GET_ALL_COURSE_LIST_REQUESTED)
        yield call(fetchCourseList, payload)
    }
}

function* fetchSchoolIntro(action) {
    try {
        const { params } = action
        const schoolInfo = yield call(getJSON, URLS.GET_SCHOOL_INTRO_URL, params)

        yield put({
            type: GET_SCHOOL_INTRODUCTION_SUCCEEDED, 
            data: schoolInfo.resultMessage,
        })
    } catch(e) {
        yield put({type: GET_SCHOOL_INTRODUCTION_FAILED, message: e});
    }
}

function* fetchSchoolIntroSaga() {
    while (true) {
        const { payload } = yield take(GET_SCHOOL_INTRODUCTION_REQUESTED)
        yield call(fetchSchoolIntro, payload)
    }
}

export {
    fetchMajorInfoSaga,
    fetchPostByMajorIdSaga,
    fetchCourseListSaga,
    fetchSchoolIntroSaga,
}
