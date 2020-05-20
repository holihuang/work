import { handleActions } from 'redux-actions';
import { GET_POST_BY_SUBJECT_SUCCEEDED, GET_POST_BY_SUBJECT_FAILED } from '../constants/subject';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_POST_BY_SUBJECT_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data
        }
    },
    [GET_POST_BY_SUBJECT_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    }
}, {
    subjectDetail: {
        subjectName    : '',
        subjectAbstract    : '',
        subjectImageUrl    : '',
    },
    topicResult: {
        resultList: []
    },
    isShow        : true,
})
