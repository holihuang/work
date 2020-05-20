import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import { GET_POST_BY_TOPIC_REQUESTED, GET_POST_BY_TOPIC_SUCCEEDED, GET_POST_BY_TOPIC_FAILED } from '../constants/home'

function* fetchTopicListData(action) {
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
        const data = yield call(getJSON, URLS.GET_POST_BY_TOPIC_URL, params, options);
        yield put({
            type: GET_POST_BY_TOPIC_SUCCEEDED, 
            data
        })
    } catch(e) {
        yield put({type: GET_POST_BY_TOPIC_FAILED, message: e});
    }
}

function* fetchTopicListDataSaga() {
    yield* takeEvery(GET_POST_BY_TOPIC_REQUESTED, fetchTopicListData);
}

export {
    fetchTopicListDataSaga
}
