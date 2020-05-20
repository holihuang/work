import { handleActions } from 'redux-actions'
import Constants from '$constants/common'

export default handleActions({
    [Constants.UPDATE_STATE](state, { payload }) {
        return { ...state, ...payload }
    },
    [Constants.GLOBAL_LOADING](state, { payload }) {
        return { ...state, globalLoading: payload.loading }
    },
}, {
    collegeList: [],
    projectFirstList: [],
    projectSecondList: [],
    collegeId: undefined,
    projectId: undefined,
    proj2ndId: undefined,
})

