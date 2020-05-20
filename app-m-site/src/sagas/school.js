import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { 
    GET_VIDEO_DETAIL_REQUESTED,
    GET_VIDEO_DETAIL_SUCCEEDED,
    GET_VIDEO_DETAIL_FAILED,
    GET_SUGGESTED_VIDEO_LIST_REQUESTED,
    GET_SUGGESTED_VIDEO_LIST_SUCCEEDED,
    GET_SUGGESTED_VIDEO_LIST_FAILED,
    GET_SCHOOL_PAGE_DATA_REQUESTED,
    GET_SCHOOL_PAGE_DATA_FAILED,
} from '../constants/school';

function format(params) {
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

    return options;
}

function* fetchSchoolPageData(action) {
    try {
        const {videoId} = action;
        let options = format({videoId, userId: -1});
        const data = yield call(getJSON, URLS.VIDEO_DETAIL_URL, {videoId, userId: -1}, options);
        const {resultMessage: videoDetail} = data;

        yield put({
            type: GET_VIDEO_DETAIL_SUCCEEDED,
            videoDetail
        });

        const {videoType} = videoDetail;
        options = format({videoId, videoType, userId: -1});
        const data1 = yield call(getJSON, URLS.GET_SUGGESTED_VIDEO_LIST_URL, {videoId, videoType, userId: -1}, options);
        yield put({
            type: GET_SUGGESTED_VIDEO_LIST_SUCCEEDED, 
            suggestedVideoList: data1.resultMessage
        })
    } catch(e) {
        yield put({type: GET_SCHOOL_PAGE_DATA_FAILED, message: e});
    }
}

function* fetchSchoolPageDataSaga() {
    yield* takeEvery(GET_SCHOOL_PAGE_DATA_REQUESTED, fetchSchoolPageData);
}

export {
    fetchSchoolPageDataSaga
}
