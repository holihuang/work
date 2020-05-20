import { handleActions } from 'redux-actions';
import {
    GET_VIDEO_DETAIL_SUCCEEDED,
    GET_SUGGESTED_VIDEO_LIST_SUCCEEDED,
    GET_SCHOOL_PAGE_DATA_FAILED,
} from '../constants/school';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_VIDEO_DETAIL_SUCCEEDED](state, action) {
        const {videoDetail} = action;
        return {
            ...state,
            videoDetail
        }
    },
    [GET_SUGGESTED_VIDEO_LIST_SUCCEEDED](state, action) {
        const {suggestedVideoList} = action;
        return {
            ...state,
            suggestedVideoList
        }
    },
    [GET_SCHOOL_PAGE_DATA_FAILED](state, action) {
        const {message} = action;
        Toast.info(message);

        return state;
    }
}, {
    videoDetail: null,
    suggestedVideoList: []
})
