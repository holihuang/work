import {handleActions} from 'redux-actions';
import {
    GET_POST_DETAIL_SUCCEEDED,
    GET_POST_DETAIL_FAILED,
    GET_PRAISE_USER_LIST_SUCCEEDED,
    GET_PRAISE_USER_LIST_FAILED,
    ON_RESET_POST_STORE,
} from '../constants/examinePost';
import {Toast} from 'antd-mobile';


const defaultPostStore = {
    pageIndex: 1,
    countPerPage: 10,
    postMaster: {},
    resultList: [],
    noMoreData: false,
    pointsInfo: {
        noMoreData: false,
        pageIndex: 1,
        countPerPage: 10,
    },
}

function formatList(opt) {
    const { prevList, newList, fromProfile = 0 } = opt
    let res = newList
    if (+fromProfile) {
        res = prevList.concat(newList)
    }
    return res
}

export default handleActions({
    [GET_POST_DETAIL_SUCCEEDED](state, action) {
        const { resultList = [] } = state
        const { otherParams: { fromProfile }, data: { resultMessage } } = action
        return {
            ...state,
            ...action.data.resultMessage,
            resultList: formatList({ prevList: resultList, newList: resultMessage.resultList, fromProfile }),
            noMoreData: !resultMessage.resultList.length,
        }
    },
    [GET_POST_DETAIL_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_PRAISE_USER_LIST_SUCCEEDED](state, action) {
        const { pointsInfo: { resultList = [] } } = state
        const { otherParams: { fromProfile }, data: { resultMessage } } = action
        return {
            ...state,
            pointsInfo: {
                ...action.data.resultMessage,
                resultList: formatList({ prevList: resultList, newList: resultMessage.resultList, fromProfile }),
                noMoreData: !resultMessage.resultList.length,
            }
        }
    },
    [GET_PRAISE_USER_LIST_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [ON_RESET_POST_STORE](state, action) {
        return defaultPostStore
    },
}, defaultPostStore)
