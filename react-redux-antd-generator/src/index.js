import BJ_REPORT from '@sunl-fe/badjs-report'

import React from 'react'
import ReactDom from 'react-dom'

import {
    ConnectedRouter,
    routerReducer,
    routerMiddleware,
} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import logger from 'redux-logger'

import { Modal, LocaleProvider } from 'antd'
import { getJSON } from '@sunl-fe/dataservice'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import URLS from '$constants/URLS'
import reducers from '$reducers/index'
import sagas from '$sagas/index'
import global from '$common/global'
import Main from './main'

import './styles/less/index.less'
// eslint-disable-next-line
import '@sunl-fe/sunl-antd-theme/less/sunl-antd-theme.less'
// import './styles/less/reset-antd.less'


const history = createHistory()

// ////////////////////
// Store

// 建立 saga middleware
// debugger
const middleware = [createSagaMiddleware()]

middleware.push(routerMiddleware(history))

middleware.push(logger)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(...middleware))
// 將 saga middleware mount 在 Store 上
const initialState = {
    router: {},
}
const store = createStore(combineReducers({ ...reducers, router: routerReducer }), initialState, enhancer)

// 然後執行 saga
middleware[0].run(sagas)

global.store = store

// Render

const App = () => (
    <Provider store={store}>
        <LocaleProvider locale={zhCN}>
            <ConnectedRouter history={history}>
                <Main />
            </ConnectedRouter>
        </LocaleProvider>
    </Provider>
)

// eslint-disable-next-line
BJ_REPORT.init({
    id: 12, // 上报 id, 不指定 id 将不上报 12为公共上报id
    delay: 1000, // 当 combo 为 true 可用，延迟多少毫秒，合并缓冲区中的上报（默认）
    url: 'http://sa.fe.sunlands.com/badjs', // 指定上报地址
    ignore: [/Script error/i], // 忽略某个错误
    random: 1, // 抽样上报，1~0 之间数值，1为100%上报（默认 1）
    repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报) 避免出现单个用户同一错误上报过多的情况
    offlineLog: true, // 是否启离线日志 [默认 true]
    offlineLogExp: 5, // 离线有效时间，默认最近5天
})


getJSON.initHttpDTO({
    badStatus: [
        {
            status: 401,
            callback() {
                Modal.info({
                    title: '您的登录已超时',
                    onOk() {
                        if (process.env.COMPILE_ENV === 'dev') {
                            window.location.href = '/dev_login'
                        } else {
                            window.location.href = `${URLS.LOGIN_URL}?origin-page=${window.location.href}`
                        }
                    },
                })
            },
        },
    ],
})

// Render

const rootEl = document.getElementById('app')
ReactDom.render(
    <App />,
    rootEl,
)
