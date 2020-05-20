"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _antdMobile = require("antd-mobile");

require("antd-mobile/lib/tab-bar/style/index.css");

require("../styles/bottomNav.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var _ref = _antdMobile.TabBar || {},
    Item = _ref.Item;

var BottomNav = /*#__PURE__*/function (_React$Component) {
  _inherits(BottomNav, _React$Component);

  var _super = _createSuper(BottomNav);

  function BottomNav(props) {
    var _this;

    _classCallCheck(this, BottomNav);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "renderIconDom", function (iconPic) {
      var style = {
        background: "url(".concat(iconPic, ") no-repeat"),
        backgroundSize: '100% 100%'
      };
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "frame-nav_icon",
        style: style
      });
    });

    _defineProperty(_assertThisInitialized(_this), "handlePress", function (pressedKey) {
      _this.setState({
        selectedKey: pressedKey
      });
    });

    _this.state = {
      selectedKey: props.tabBarList[0].key
    };
    return _this;
  }

  _createClass(BottomNav, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          tabBarList = _this$props.tabBarList,
          style = _this$props.style,
          onBottomPress = _this$props.onBottomPress;
      var selectedKey = this.state.selectedKey;
      return /*#__PURE__*/_react.default.createElement("div", {
        style: style
      }, /*#__PURE__*/_react.default.createElement(_antdMobile.TabBar, null, tabBarList.map(function (item, index) {
        var _item$key = item.key,
            key = _item$key === void 0 ? '' : _item$key,
            _item$title = item.title,
            title = _item$title === void 0 ? '' : _item$title,
            _item$icon = item.icon,
            icon = _item$icon === void 0 ? '' : _item$icon,
            _item$selectedIcon = item.selectedIcon,
            selectedIcon = _item$selectedIcon === void 0 ? '' : _item$selectedIcon;
        var itemProps = {
          key: key,
          title: title,
          icon: _this2.renderIconDom(icon),
          selectedIcon: _this2.renderIconDom(selectedIcon),
          selected: selectedKey === key,
          onPress: function onPress() {
            _this2.handlePress(key);

            onBottomPress({
              key: key,
              index: index
            });
          }
        };
        return /*#__PURE__*/_react.default.createElement(Item, itemProps);
      })));
    }
  }]);

  return BottomNav;
}(_react.default.Component);

var _default = BottomNav;
exports.default = _default;
