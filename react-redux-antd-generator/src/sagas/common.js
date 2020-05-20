import { message, Modal } from 'antd'
import { take, call, put, select } from 'redux-saga/effects'
import { getJSON } from '@sunl-fe/dataservice'
import Constants from '../constants/common'
import URLS from '../constants/URLS'


function* logout() {
    while (true) {
        yield take(Constants.LOGOUT)
        try {
            const data = yield call(getJSON, URLS.GET_LOGOUT_URL)
            window.location.href = data.logOutUrl
        } catch (e) {
            message.error(`${e}`)
        }
    }
}

function* logTimeout() {
    yield take(Constants.LOG_TIMEOUT)
    yield Modal.info({
        title: '您的登录已超时',
        onOk() {
            window.location.reload(true)
        },
    })
}

function* getAllColleges() {
    while (true) {
        yield take(Constants.GET_COLLEGES)
        const { collegeList } = yield select(state => state.common)
        if (collegeList.length) {
            continue
        }
        try {
            const { list } = yield call(getJSON, URLS.COMMON_GET_COLLEGES)
            yield put({
                type: Constants.UPDATE_STATE,
                payload: {
                    collegeList: list,
                },
            })
        } catch (e) {
            message.error(`${e}`)
        }
    }

}

function* selectCollege() {
    while (true) {
        const { payload: { collegeId } } = yield take(Constants.SELECT_COLLEGE)
        try {
            const { list: projectFirstList } = yield call(getJSON, URLS.COMMON_GET_PROJECT_FIRST, { collegeId })
            yield put({
                type: Constants.UPDATE_STATE,
                payload: {
                    projectFirstList,
                    projectSecondList: [],
                    collegeId,
                    projectId: undefined,
                    proj2ndId: undefined,
                },
            })
        } catch (e) {
            message.error(`${e}`)
        }
    }
}

function* selectProjectFirst() {
    while (true) {
        const { payload: { projectId } } = yield take(Constants.SELECT_PROJECT_FIRST)
        const { collegeId } = yield select(state => state.common)
        try {
            const { list: projectSecondList } = yield call(getJSON, URLS.COMMON_GET_PROJECT_SECOND, {
                collegeId,
                projectId,
            })
            yield put({
                type: Constants.UPDATE_STATE,
                payload: {
                    projectSecondList,
                    projectId,
                    proj2ndId: undefined,
                },
            })
        } catch (e) {
            message.error(`${e}`)
        }
    }
}

export {
    logout,
    logTimeout,
    getAllColleges,
    selectCollege,
    selectProjectFirst,
}
