"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _global = _interopRequireDefault(require("../common/global"));

var _Page = _interopRequireDefault(require("./Page"));

var _BottomNav = _interopRequireDefault(require("./BottomNav"));

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

var H5Frame = /*#__PURE__*/function (_React$Component) {
  _inherits(H5Frame, _React$Component);

  var _super = _createSuper(H5Frame);

  function H5Frame(props) {
    var _this;

    _classCallCheck(this, H5Frame);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "handleBottomPress", function (e) {
      var index = e.index;

      _this.setState({
        selectedTabBarIndex: index
      });

      _global.default.selectedTabBarIndex = index;
    });

    _this.state = {
      selectedTabBarIndex: 0
    };
    return _this;
  }

  _createClass(H5Frame, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          _this$props$useTabBar = _this$props.useTabBar,
          useTabBar = _this$props$useTabBar === void 0 ? true : _this$props$useTabBar,
          _this$props$tabBarLis = _this$props.tabBarList,
          tabBarList = _this$props$tabBarLis === void 0 ? [] : _this$props$tabBarLis,
          _this$props$pageList = _this$props.pageList,
          pageList = _this$props$pageList === void 0 ? [] : _this$props$pageList,
          page = _this$props.page;
      var rootStyle = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      };
      var selectedTabBarIndex = this.state.selectedTabBarIndex;
      var pageProps = page ? _objectSpread({}, page, {
        selectedTabBarIndex: selectedTabBarIndex
      }) : _objectSpread({}, pageList[selectedTabBarIndex], {
        selectedTabBarIndex: selectedTabBarIndex
      });
      var bottomNavProps = {
        tabBarList: tabBarList,
        onBottomPress: this.handleBottomPress,
        style: {
          width: '100%'
        }
      };
      return /*#__PURE__*/_react.default.createElement("div", {
        style: rootStyle
      }, /*#__PURE__*/_react.default.createElement(_Page.default, pageProps), !page && useTabBar && tabBarList.length ? /*#__PURE__*/_react.default.createElement(_BottomNav.default, bottomNavProps) : null);
    }
  }]);

  return H5Frame;
}(_react.default.Component);

var _default = H5Frame;
exports.default = _default;
