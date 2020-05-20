import { handleActions } from 'redux-actions';
import { GET_GROUP_BATCH_SUCCEEDED, GET_GROUP_BATCH_FAILED,
         GET_TEACHER_MSG_DETAIL_SUCCEEDED, GET_TEACHER_MSG_DETALI_FAILED,
         GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_SUCCEEDED, GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_FAILED
 } from '../constants/notice';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_GROUP_BATCH_SUCCEEDED](state, action) {
        let stateChange = {}

        if (action.data.resultMessage == null) {
            stateChange = {
                ...state,
                // content: '<p>您是非付费用户，暂时无法查看班主任通知</p>''
                showOptTips: true,
            }
        } else {
            stateChange = {
                ...state,
                ...action.data.resultMessage,
            }
        }

        return stateChange
    },
    [GET_GROUP_BATCH_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_TEACHER_MSG_DETAIL_SUCCEEDED](state, action) {

        let stateChange = {}

        if (action.data.resultMessage == null) {
            stateChange = {
                ...state,
                // content: '<p>您是非付费用户，暂时无法查看班主任通知</p>''
                showOptTips: true,
            }
        } else {
            stateChange = {
                ...state,
                ...action.data.resultMessage,
            }
        }

        return stateChange
    },
    [GET_TEACHER_MSG_DETALI_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data.resultMessage
        }
    },
    [GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    }
}, {
    content: '',
    showOptTips: false, // 是否有权限（实质是否content返回）
})
