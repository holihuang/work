"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(props) {
  var _props$body = props.body,
      Component = _props$body.component,
      _props$body$bodyProps = _props$body.bodyProps,
      bodyProps = _props$body$bodyProps === void 0 ? {} : _props$body$bodyProps,
      selectedTabBarIndex = props.selectedTabBarIndex;

  if (Component && !(Component instanceof Object)) {
    console.error('page 不是组件');
    return;
  }

  var defaultStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  };
  return Component ? /*#__PURE__*/_react.default.createElement(Component, bodyProps) : /*#__PURE__*/_react.default.createElement("div", {
    style: defaultStyle
  }, "Page ", selectedTabBarIndex + 1);
}
