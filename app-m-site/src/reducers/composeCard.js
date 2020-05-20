
import { handleActions } from 'redux-actions'
import Constants from '../constants/examTask'
import { Toast } from 'antd-mobile'
import lodash from 'lodash'

const defaultStoreData = {
    activeInfo: {
        activityStartTime: '00-00-00 00:00:00',
        activityEndTime: '00-00-00 00:00:00',
        completedCnt: 0,
        moneyTime: '00-00-00 00:00:00',
        getCardMark: 0,
        getMoneyMark: 2,
        getResultMark: 0,
    },
    stuCard: [],
    oppoCnt: 0,
    cardMessage: {},
    carouselList: [],
    bonusStatus: {},
    nickName: '',
}

export default handleActions({
    [Constants.GET_ACTIVITY_INFO_SUCCEEDED](state, action) {
        const { data } = action
        console.log(data)
        return {
            ...state,
            activeInfo: data,
        }
    },
    [Constants.GET_ACTIVITY_INFO_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_STU_CARDS_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            stuCard: data,
        }
    },
    [Constants.GET_STU_CARDS_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_CARD_CNT_SUCCEEDED](state, action) {
        const { data } = action
        // console.log('data.oppoCnt', data.oppoCnt)
        return {
            ...state,
            oppoCnt: data.oppoCnt,
        }
    },
    [Constants.GET_CARD_CNT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_CARD_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            cardMessage: data,
        }
    },
    [Constants.GET_CARD_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_STU_CARDS_BY_TAG_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            carouselList: data,
        }
    },
    [Constants.GET_STU_CARDS_BY_TAG_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.SYNTHESIZE_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
        }
    },
    [Constants.SYNTHESIZE_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_RESULT_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            bonusStatus: data,
        }
    },
    [Constants.GET_RESULT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_WEIXIN_ACCOUNT_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            nickName: data.nickName,
        }
    },
    [Constants.GET_WEIXIN_ACCOUNT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.BIND_WECHAT_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            // nickName: data.nickName,
        }
    },
    [Constants.BIND_WECHAT_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.WITHDRAW_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
        }
    },
    [Constants.WITHDRAW_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
}, defaultStoreData)