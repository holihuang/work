"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _antdMobile = require("antd-mobile");

var _platform2 = _interopRequireDefault(require("./platform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  /*
  ** @versionAbove: 比较当前APP版本和目标APP版本高低（>=返回true）
  ** @version：要比较的目标app版本
  */
  versionAbove: function versionAbove() {
    var version = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (typeof version !== 'string') {
      console.error('传入的app版本不是字符串类型！');
      return;
    }

    var _platform = (0, _platform2.default)(),
        _platform$detailInfo$ = _platform.detailInfo.deviceInfo,
        deviceInfo = _platform$detailInfo$ === void 0 ? {} : _platform$detailInfo$;

    var _deviceInfo$appVersio = deviceInfo.appVersion,
        appVersion = _deviceInfo$appVersio === void 0 ? '. .' : _deviceInfo$appVersio;

    if (!appVersion.length) {
      console.warn('当前不是app环境哦，版本比较无意义！');
    }
    /*
    ** @app版本格式
    ** @线上: '3.2.5'
    ** @测试: '3.2.5-debug'
    */


    var currentVersionArr = appVersion.split('.').map(function (item) {
      var reg = /\D/;
      var regG = /\D/g;

      if (reg.test(item)) {
        return item.replace(regG, '');
      }

      return item;
    });
    var checkVersionArr = version.split('.');
    var deltVersionArr = currentVersionArr.map(function (item, index) {
      return +item - +checkVersionArr[index];
    });

    for (var i = 0; i < deltVersionArr.length; i++) {
      if (deltVersionArr[i] > 0) {
        return true;
      } else if (deltVersionArr[i] === 0) {
        if (i === deltVersionArr.length - 1) {
          return true;
        }

        continue;
      } else if (deltVersionArr[i] < 0) {
        return false;
      }
    }
  },

  /*
  ** @appShare: app内分享h5
  ** @opt: { hooks, params },
      hooks: { succeedCallback, failedCallback, canceledCallback }
      params: { title, content, url, imgUrl, channel }
  */
  appShare: function appShare() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _opt$hooks = opt.hooks,
        hooks = _opt$hooks === void 0 ? {} : _opt$hooks,
        params = opt.params;
    var nameSet = {};

    if (typeof JSBridge !== 'undefined') {
      var now = new Date().getTime();
      Object.keys(hooks).forEach(function (item) {
        window["".concat(item).concat(now)] = hooks[item];
        nameSet[item] = "".concat(item).concat(now);
      });
      JSBridge.doAction('actionShare', JSON.stringify({
        succeedCallback: nameSet.succeedCallback,
        failedCallback: nameSet.failedCallback,
        canceledCallback: nameSet.canceledCallback
      }), JSON.stringify(_objectSpread({
        title: '',
        content: '',
        url: '',
        imgUrl: '',
        channel: 14
      }, params)));
    }
  },

  /*
  ** @wxShare: wx内分享h5
  ** @opt: { cfg, data }
  */
  wxShare: function wxShare() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _opt$cfg = opt.cfg,
        cfg = _opt$cfg === void 0 ? {} : _opt$cfg,
        _opt$data = opt.data,
        data = _opt$data === void 0 ? {} : _opt$data; // js sdk是否加载完成

    if (!window.wx) {
      return;
    }

    var content = {
      title: '',
      link: '',
      imgUrl: '',
      success: function success() {}
    };
    wx.config(_objectSpread({
      appId: '',
      timestamp: '',
      nonceStr: '',
      signature: '',
      jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
    }, cfg));
    wx.ready(function () {
      var _cfg$jsApiList = cfg.jsApiList,
          jsApiList = _cfg$jsApiList === void 0 ? [] : _cfg$jsApiList;
      jsApiList.forEach(function (item) {
        wx[item](_objectSpread({}, content, {}, data));
      });
    });
    wx.error(function (res) {
      _antdMobile.Toast.error(res);
    });
  },

  /*
  ** @goToNative: 跳转到native具体页面
  ** @opt: { page, hooks, data, actionType } actionType:默认gotoNative
     hooks: { succeedCallback, failedCallback, canceledCallback } 不限于左边三个参数，succeedCallback肯定有，其他参数不一定有
  */
  goToNative: function goToNative() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _opt$page = opt.page,
        page = _opt$page === void 0 ? '' : _opt$page,
        _opt$hooks2 = opt.hooks,
        hooks = _opt$hooks2 === void 0 ? {} : _opt$hooks2,
        _opt$actionType = opt.actionType,
        actionType = _opt$actionType === void 0 ? 'gotoNative' : _opt$actionType,
        _opt$data2 = opt.data,
        data = _opt$data2 === void 0 ? {} : _opt$data2;
    var dataStr = JSON.stringify(data);

    if (typeof JSBridge !== 'undefined') {
      var _JSBridge;

      var list = [page];

      if (actionType === 'gotoNative') {
        list.push(dataStr);
      } else if (actionType === 'doAction') {
        var nameSet = {};
        var now = new Date().getTime();
        Object.keys(hooks).forEach(function (item) {
          window["".concat(item).concat(now)] = hooks[item];
          nameSet[item] = "".concat(item).concat(now);
        }); // 其他回调参数（succeedCallback，failedCallback，canceledCallback 之外的参数 ）

        var otherHookKeys = Object.keys(hooks).filter(function (item) {
          return item !== 'succeedCallback' && item !== 'failedCallback' && item !== 'canceledCallback';
        });
        var others = otherHookKeys.reduce(function (res, item) {
          return _objectSpread({}, res, _defineProperty({}, item, nameSet[item]));
        }, {});
        list.push(JSON.stringify(_objectSpread({
          succeedCallback: nameSet.succeedCallback,
          failedCallback: nameSet.failedCallback,
          canceledCallback: nameSet.canceledCallback
        }, others)), dataStr);
      }

      (_JSBridge = JSBridge)[actionType].apply(_JSBridge, list);
    }
  }
};
exports.default = _default;
