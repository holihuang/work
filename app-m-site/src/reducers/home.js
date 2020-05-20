import { handleActions } from 'redux-actions';
import { GET_POST_BY_TOPIC_SUCCEEDED, GET_POST_BY_TOPIC_FAILED } from '../constants/home';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_POST_BY_TOPIC_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data
        }
    },
    [GET_POST_BY_TOPIC_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    }
}, {
    topicId       : 0,
    topicTitle    : '',
    topicBrief    : '',
    mediaLinks    : '',
    discussCount  : 0,
    resultMessage : {},
    isShow        : true,
})
