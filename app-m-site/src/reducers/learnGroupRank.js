import { handleActions } from 'redux-actions';
import { 
    GET_GROUP_RANK_DETAIL_SUCCEEDED,
    GET_GROUP_RANK_DETAIL_FAILED,
} from '../constants/learnGroupRank';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_GROUP_RANK_DETAIL_SUCCEEDED](state, action) {
        const { rankList, dateRange, overAMonth } = action;
        return {
            ...state,
            rankList,
            dateRange,
            overAMonth,
            renderFlag: true,
        }
    },
    [GET_GROUP_RANK_DETAIL_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
}, {
    rankList: [],
    dateRange: '',
    renderFlag: false,
    overAMonth: false,
})
