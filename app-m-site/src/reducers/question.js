import { handleActions } from 'redux-actions';
import { GET_QUESTION_DETAIL_SUCCEEDED, GET_QUESTION_DETAIL_FAILED, GET_ANSWER_DETAIL_SUCCEEDED, GET_ANSWER_DETAIL_FAILED  } from '../constants/question';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_QUESTION_DETAIL_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data.resultMessage
        }
    },
    [GET_QUESTION_DETAIL_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_ANSWER_DETAIL_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data.resultMessage
        }
    },
    [GET_ANSWER_DETAIL_FAILED](state,action) {
        Toast.info(action.message);
        return state;
    }
}, {
    resultList: [],
    metadata: {},
})
