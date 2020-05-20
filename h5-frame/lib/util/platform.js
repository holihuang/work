"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _getUrlParams = _interopRequireDefault(require("./getUrlParams"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var envSetArr = [{
  key: 'sunlandapp',
  text: '主版app',
  from: 'jsBridge'
}, {
  key: 'liteapp',
  text: '极速版app',
  from: 'jsBridge'
}, {
  key: 'empapp',
  text: '员工版app',
  from: 'jsBridge'
}, {
  key: 'wx',
  text: '微信',
  from: 'ua'
}, {
  key: 'web',
  text: 'web',
  from: 'url' // 从ur中获取具体的系统名称

}, {
  key: 'skynet',
  text: '天网精灵PC客户端',
  from: 'url'
}];

function _default() {
  var ua = navigator.userAgent.toLowerCase();
  var urlParams = (0, _getUrlParams.default)();
  var envInfo = {
    env: 'web',
    envName: 'web',
    detailInfo: {
      sys: ''
    }
  };

  for (var i = 0; i < envSetArr.length; i++) {
    var _envSetArr$i = envSetArr[i],
        key = _envSetArr$i.key,
        text = _envSetArr$i.text,
        from = _envSetArr$i.from; // url

    if (from === 'url') {
      if (key === urlParams.env) {
        return _objectSpread({}, envInfo, {
          env: key,
          envName: text,
          detailInfo: {}
        });
      } else {
        return _objectSpread({}, envInfo, {
          detailInfo: {
            sys: urlParams.env
          }
        });
      }
    } else if (from === 'ua') {
      // 微信环境
      if (/MicroMessenger/i.test(ua)) {
        return _objectSpread({}, envInfo, {
          env: key
        });
      }
    } else if (from === 'jsBridge') {
      // app环境
      if (typeof JSBridge !== 'undefined') {
        if (JSBridge.getData) {
          var deviceInfo = JSON.parse(JSBridge.getData('deviceInfo')) || {};
          var userInfo = JSON.parse(JSBridge.getData('userInfo')) || {};
          return _objectSpread({}, envInfo, {
            env: key,
            envName: text,
            detailInfo: {
              deviceInfo: deviceInfo,
              userInfo: userInfo
            }
          });
        }
      }
    }
  }
}
