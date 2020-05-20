import { handleActions } from 'redux-actions'
import Constants from '../constants/publicBenefit'
import { Toast } from 'antd-mobile'

const defaultData = {
    userInfo: {
        sunlandCoin: 0, // 尚德元数
        kindnessCount: 0, // 剩余爱心数
        donatedKindnessCount: 0, // 已捐赠爱心数
        donatedTimesCount: 0, // 已经捐赠爱心次数
    },
    commonInfo: {
        userAuth: '', // App 的userAuth
        channelSource: '', // 设备渠道
    },
    projectHomeInfo: {
        dataSource: [],
    },
    projectListInfo: {
        dataSource: [],
    },
    personRankInfo: {
        rankNo: -1,
    },
    donationRankListInfo: {
        dataSource: [],
    },
    projectDetailInfo: {
        title: '',
        coverImageUrl: '',
        content: '',
        targetKindnessCount: 0,
        donatedKindnessCount: 0,
        completeStatus: '',
    },
}

function formatData(...args) {
    const [state, data, params, listName] = args
    const { pageNo } = params
    const { dataSource } = state[listName]
    let list = dataSource
    /*
    ** storySet组件使用的pageNo作为是否是从详情页跳转到列表页的，
    ** 列表页只有一页数据时，列表页->详情页->列表页，需要先清除store列表数据
    */
    if (+pageNo === 1) {
        list = []
    }
    return list.concat(data.data)
}

export default handleActions({
    [Constants.SAVE_COMMON_INFO](state, action) {
        const { payload: { params, cb } } = action
        if (cb && typeof cb === 'function') {
            cb(params)
        }
        return {
            ...state,
            commonInfo: {
                ...params,
            },
        }
    },
    [Constants.GET_SUT_DIND_NESS_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            userInfo: data,
        }
    },
    [Constants.GET_SUT_DIND_NESS_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_PROJECT_LIST_SUCCEEDED](state, action) {
        const { data, source, params } = action
        if (source === 'home') {
            return {
                ...state,
                projectHomeInfo: {
                    ...data,
                    dataSource: data.data,
                },
            }
        }
        if (source === 'list') {
            const dataSource = formatData(state, data, params, 'projectListInfo')
            return {
                ...state,
                projectListInfo: {
                    ...data,
                    dataSource,
                },
            }
        }
    },
    [Constants.GET_PROJECT_LIST_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_MY_DONATION_RANK_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            personRankInfo: {
                rankNo: data,
            },
        }
    },
    [Constants.GET_MY_DONATION_RANK_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_DONATION_RANK_SUCCEEDED](state, action) {
        const { data, params } = action
        const dataSource = formatData(state, data, params, 'donationRankListInfo')
        return {
            ...state,
            donationRankListInfo: {
                ...data,
                dataSource,
            },
        }
    },
    [Constants.GET_DONATION_RANK_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.EXCHANGE_KINDNESS_SUCCEEDED](state, action) {
        Toast.success('兑换成功')
        return {
            ...state,
        }
    },
    [Constants.EXCHANGE_KINDNESS_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_PROJECT_DETAIL_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            projectDetailInfo: data,
        }
    },
    [Constants.GET_PROJECT_DETAIL_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.DONATE_KINDNESS_SUCCEEDED](state, action) {
        const { cb = () => {} } = action
        Toast.success('捐献成功')
        cb()
        return {
            ...state,
        }
    },
    [Constants.DONATE_KINDNESS_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
}, {
    ...defaultData,
})