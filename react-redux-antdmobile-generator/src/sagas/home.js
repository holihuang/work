import { takeEvery, isCancelError } from 'redux-saga';
import { take, call, put, fork, cancel } from 'redux-saga/effects';
import {getJSON} from '@sunl-fe/dataservice';
import URLS from '../constants/URLS';
import { MYROOM_SUMMARY_REQUESTED, MYROOM_SUMMARY_SUCCEEDED, MYROOM_SUMMARY_FAILED
        ,MYROOM_DELETE_REQUESTED, MYROOM_DELETE_SUCCEEDED, MYROOM_DELETE_FAILED } from '../constants/home'
function* fetchMyRoomData(action) {
    try {
        const { params } = action;
        const data = yield call(getJSON, URLS.GET_MYROOM_SUMMARY_URL);
        const { rows } = data;
        yield put({type: MYROOM_SUMMARY_SUCCEEDED, roomList: rows});
    } catch(e) {
        yield put({type: MYROOM_SUMMARY_FAILED, message: e});
    }
}

function* fetchMyRoomDataSaga() {
    yield takeEvery( MYROOM_SUMMARY_REQUESTED, fetchMyRoomData)
}

function* deleteRoom(action) {
    try {
        const { params } = action;
        const data = yield call(getJSON, URLS.DELETE_MYROOM_URL, params);
        yield put({type: MYROOM_DELETE_SUCCEEDED, deleteId: params.reserveId});
    } catch(e) {
        yield put({type: MYROOM_DELETE_FAILED, message: e});
    }
}

function* deleteRoomSaga() {
    yield takeEvery( MYROOM_DELETE_REQUESTED, deleteRoom)
}

export {
    fetchMyRoomDataSaga,
    deleteRoomSaga
}