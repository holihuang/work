import { message } from 'antd'
import { take, call, put, select } from 'redux-saga/effects'
import { getJSON } from '@sunl-fe/dataservice'
import merge from 'lodash/merge'

import Constants from '$constants/product-package'
import URLS from '../constants/URLS'

function* getPackages() {
    while (true) {
        const { payload = {} } = yield take(Constants.DO_SEARCH)

        yield put({
            type: Constants.UPDATE_STATE,
            payload,
        })

        const {
            common: {
                proj2ndId,
            },
            'product-package': {
                searchPackName,
                prodPackage,
                pageNum,
                pageSize,
            },
        } = yield select(state => state)

        const param = {
            searchPackName,
            prodPackage: {
                proj2ndId: proj2ndId,
                ...prodPackage,
            },
            pageNum,
            pageSize,
        }

        merge(param, param)

        try {
            const {
                list,
                pageNum: pageNumResult,
                pageSize: pageSizeResult,
                total,
            } = yield call(getJSON, URLS.GET_PACKAGE_LIST, param)
            yield put({
                type: Constants.UPDATE_STATE,
                payload: {
                    pageNum: pageNumResult,
                    pageSize: pageSizeResult,
                    total,
                    packageList: list,
                },
            })
        } catch (e) {
            message.error(`${e}`)
        }
    }
}

function* updatePackageStatus() {
    while (true) {
        const { payload } = yield take(Constants.UPDATE_PACKAGE_STATUS)
        try {
            yield call(getJSON, URLS.UPDATE_PACKAGE_STATUS, payload)
            let prefix
            switch (payload.statusCode) {
            case Constants.OFFTABLE_STATUS_CODE:
                prefix = '下架'
                break
            case Constants.ONTABLE_STATUS_CODE:
                prefix = '上架'
                break
            default:
            }
            message.success(`产品包${prefix}成功。`)
            yield put({
                type: Constants.DO_SEARCH,
            })
        } catch (e) {
            message(`${e}`)
        }
    }
}

export {
    getPackages,
    updatePackageStatus,
}
