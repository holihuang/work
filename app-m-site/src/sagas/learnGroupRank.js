import {takeEvery, isCancelError} from 'redux-saga';
import {take, call, put, fork, cancel} from 'redux-saga/effects';
import getJSON from '../common/dataService';
import URLS from '../constants/URLS';
import {
    GET_GROUP_RANK_DETAIL_REQUESTED,
    GET_GROUP_RANK_DETAIL_SUCCEEDED,
    GET_GROUP_RANK_DETAIL_FAILED,
} from '../constants/learnGroupRank';

function* getGroupRankDetail(action) {
    try {
        const { payload: {
            params,
            cb,
        } } = action
        const data = yield call(getJSON, URLS.GET_STUDY_QUICK_RANK_LIST, params)
        yield put({
            type: GET_GROUP_RANK_DETAIL_SUCCEEDED,
            rankList: data.resultMessage.resultList,
            dateRange: data.resultMessage.dateRange,
            overAMonth: data.resultMessage.overAMonth || false,
        })
    } catch (e) {
        yield put({type: GET_GROUP_RANK_DETAIL_FAILED, message: e});
    }
}

function* getGroupRankDetailSaga() {

    yield* takeEvery(GET_GROUP_RANK_DETAIL_REQUESTED, getGroupRankDetail)
}

export {
    getGroupRankDetailSaga,
}
