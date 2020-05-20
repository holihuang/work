import { handleActions } from 'redux-actions'
import Constants from '$constants/product-package'

const defaultProdPackage = {
    isInsurance: undefined,
    hasSupplement: -1,
    statusCode: undefined,
}

export default handleActions({
    [Constants.UPDATE_STATE](state, { payload }) {
        return { ...state, ...payload }
    },
    [Constants.RESET](state) {
        return { ...state, prodPackage: { ...defaultProdPackage }, searchPackName: '' }
    },
    [Constants.UPDATE_PRODPACKAGE](state, { payload }) {
        return { ...state, prodPackage: { ...state.prodPackage, ...payload } }
    },
}, {
    searchPackName: undefined,
    prodPackage: { ...defaultProdPackage },
    packageList: [],
    pageNum: 1,
    total: 0,
    pageSize: 10,
})

