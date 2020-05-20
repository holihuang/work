"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Filter = _interopRequireDefault(require("./Filter"));

var _Body = _interopRequireDefault(require("./Body"));

require("../styles/page.css");

var _platform = _interopRequireDefault(require("../util/platform"));

var _appUtils = _interopRequireDefault(require("../util/appUtils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Page = /*#__PURE__*/function (_React$Component) {
  _inherits(Page, _React$Component);

  var _super = _createSuper(Page);

  function Page(props) {
    var _this;

    _classCallCheck(this, Page);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "insertEnvInfo", function (_) {
      _this.platform = (0, _platform.default)();
      var updatePlatformFlag = _this.state.updatePlatformFlag;

      _this.setState({
        updatePlatformFlag: !updatePlatformFlag
      });
    });

    _defineProperty(_assertThisInitialized(_this), "insertPlatformToBodyProps", function (_) {
      var _this$props$body = _this.props.body,
          body = _this$props$body === void 0 ? {} : _this$props$body;
      var _body$bodyProps = body.bodyProps,
          bodyProps = _body$bodyProps === void 0 ? {} : _body$bodyProps;
      return _objectSpread({}, body, {
        bodyProps: _objectSpread({}, bodyProps, {
          platform: _this.platform,
          appUtils: _appUtils.default
        })
      });
    });

    _defineProperty(_assertThisInitialized(_this), "renderFilter", function (_) {
      var _this$props = _this.props,
          useDefaultFilter = _this$props.useDefaultFilter,
          filter = _this$props.filter;
      var _filter$tabs = filter.tabs,
          tabs = _filter$tabs === void 0 ? [] : _filter$tabs,
          Component = filter.component,
          _filter$filterProps = filter.filterProps,
          filterProps = _filter$filterProps === void 0 ? {} : _filter$filterProps;
      var filterWrapperStyle = {
        display: 'flex'
      };

      var defaultFilterProps = _objectSpread({}, filter, {
        platform: _this.platform,
        appUtils: _appUtils.default
      });

      var diyFilterProps = _objectSpread({}, filterProps, {
        platform: _this.platform,
        appUtils: _appUtils.default
      });

      return useDefaultFilter ? tabs.length ? /*#__PURE__*/_react.default.createElement("div", {
        style: filterWrapperStyle
      }, /*#__PURE__*/_react.default.createElement(_Filter.default, defaultFilterProps)) : null : Component && /*#__PURE__*/_react.default.createElement(Component, diyFilterProps);
    });

    _this.state = {
      updatePlatformFlag: false
    };
    return _this;
  }

  _createClass(Page, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.insertEnvInfo();
    }
  }, {
    key: "render",
    value: function render() {
      var selectedTabBarIndex = this.props.selectedTabBarIndex;
      var pageWrapperStyle = {
        display: 'flex',
        flexDirection: 'column'
      };
      var bodyProps = {
        body: this.insertPlatformToBodyProps(),
        selectedTabBarIndex: selectedTabBarIndex
      };
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "frame-page_root",
        style: pageWrapperStyle
      }, this.renderFilter(), /*#__PURE__*/_react.default.createElement("div", {
        className: "frame-page_body"
      }, /*#__PURE__*/_react.default.createElement(_Body.default, bodyProps)));
    }
  }]);

  return Page;
}(_react.default.Component);

Page.propTypes = {
  useDefaultFilter: _propTypes.default.bool,
  filter: _propTypes.default.object,
  body: _propTypes.default.object,
  selectedTabBarIndex: _propTypes.default.object
};
Page.defaultProps = {
  useDefaultFilter: true,
  filter: {},
  body: {},
  selectedTabBarIndex: 0
};
var _default = Page;
exports.default = _default;
