"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "H5Frame", {
  enumerable: true,
  get: function get() {
    return _H5_frame.default;
  }
});
Object.defineProperty(exports, "platform", {
  enumerable: true,
  get: function get() {
    return _platform.default;
  }
});
Object.defineProperty(exports, "appUtils", {
  enumerable: true,
  get: function get() {
    return _appUtils.default;
  }
});
exports.default = void 0;

var _H5_frame = _interopRequireDefault(require("./component/H5_frame"));

var _platform = _interopRequireDefault(require("./util/platform"));

var _appUtils = _interopRequireDefault(require("./util/appUtils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _H5_frame.default;
exports.default = _default;
