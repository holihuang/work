import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { GET_POST_BY_SUBJECT_REQUESTED, GET_POST_BY_SUBJECT_SUCCEEDED, GET_POST_BY_SUBJECT_FAILED } from '../constants/subject'

function* fetchSubjectListData(action) {
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
        const data = yield call(getJSON, URLS.GET_SUBJECT_DETAIL_URL, params, options);
        const listData = yield call(getJSON, URLS.GET_POST_BY_SUBJECT_URL, params, options);

        yield put({
            type: GET_POST_BY_SUBJECT_SUCCEEDED, 
            data: { subjectDetail: data.resultMessage, topicResult: listData.resultMessage }
        })
    } catch(e) {
        yield put({type: GET_POST_BY_SUBJECT_FAILED, message: e});
    }
}

function* fetchSubjectListDataSaga() {
    yield* takeEvery(GET_POST_BY_SUBJECT_REQUESTED, fetchSubjectListData);
}

export {
    fetchSubjectListDataSaga
}
