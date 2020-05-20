import 'babel-polyfill';

import 'react-id-swiper/src/styles/css/swiper.css'
import './styles/less/reset.less';

import 'core-js/fn/object/assign';
import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, Link, hashHistory  } from 'react-router';
// import logger from 'bragi-browser';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { syncHistoryWithStore, routerReducer as routing } from 'react-router-redux';
import reducers from './reducers/index';
import sagas from './sagas/index';
import routes from './routes.jsx';
import global from './common/global';
import util from './common/util'
import './flexible.js';

// import VConsole from 'vconsole'
// new VConsole()

//////////////////////
// Store


const middlewares = [createSagaMiddleware(sagas)];

//FIXME for test
if (module.hot) {
  const createLogger = require(`redux-logger`);
  const logger = createLogger();
  // middlewares.push(logger);
}

const initialState = {};
const enhancer = compose(
  applyMiddleware(...middlewares)
);

const store = createStore(combineReducers({
  ...reducers, routing
}), initialState, enhancer);

global.store = store;
// 环境信息注入到全局变量
// (tip: 安卓jsBridge异步，这里不能加载jsBridge获取安卓环境信息, 异步的在业务组件didmount内部调用)
global.platformInfo = util.platformInfo(0)

//////////////////////
// Render
const history = syncHistoryWithStore(hashHistory, store);

const rootEl =document.getElementById('app');

// window.$=$;
ReactDom.render(
    <Provider store={store}>
      <Router routes={routes} history={history}/>
    </Provider>
     , rootEl
);
function initSlog() {
  let src = ''
  // slog.base.js 记录不包括性能统计数据
  // slog.base.js 记录不包括性能统计数据
  const testSrc = 'http://172.16.140.50:21001/slog/2.2.0/slog.all.js' // 测试 slog.all.js 地址
  // const testSrc= 'http://172.16.140.50:21001/slog/2.1.2/slog.base.js'; // 测试 slog.base.js 地址
  const prodSrc = '//assorted.sunlands.com/slog/2.2.0/slog.all.js' // 线上 slog.all.js 地址
  // var src = '//assorted.sunlands.com/slog/2.1.2/slog.base.js'; // 线上 slog.base.js 地址
  if (process.env.NODE_ENV === 'production') { // 见 dist目录下webpack DefinePlugin中常量
      src = prodSrc
  } else {
      src = testSrc
  }
  const slog = document.createElement('script')
  slog.src = src
  slog.setAttribute('name', 'SLS1')
  slog.setAttribute('sid', '10048')// 此处sid需要手动添加
  const s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(slog, s)
}
initSlog()

// // 微信环境注入js sdk
// function initWxJsSdk() {
//     const { navigator: { userAgent } } = window
//     const ua = userAgent.toLowerCase()
//     if (/MicroMessenger/i.test(ua)) {
//         const WX_JS_SDK_CDN = 'http://res.wx.qq.com/open/js/jweixin-1.4.0.js'
//         const wxjssdk = document.createElement('script')
//         wxjssdk.src = WX_JS_SDK_CDN
//         const app = document.getElementById('app')
//         app.parentNode.insertBefore(wxjssdk, app.nextElementSibling)
//     }
// }

// initWxJsSdk()

// 天网精灵客户端 jsSDK
function initSkyNetPc() {
  const { platformInfo: { env } } = global
  // tip：线上的路径入口community-pc-war，后端转发到appmsite目录
  const pathPrefix = process.env.NODE_ENV === 'dev' ? '.' : '../m'
  if(env === 'skynet') {
    const skynetPcSdkPath = `${pathPrefix}/scripts/qwebchannel.js`
    const sdk = document.createElement('script')
    sdk.src = skynetPcSdkPath
    const app = document.getElementById('app')
    app.parentNode.insertBefore(sdk, app.nextElementSibling)
  }
}

initSkyNetPc()
