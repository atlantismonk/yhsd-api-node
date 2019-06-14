var config = require('./config');

module.exports = {
  isPromise: function (object) {
    return object && this.isObject(object) && this.isFunction(object.then);
  },
  isObject: function (object) {
    return typeof object === 'object';
  },
  isFunction: function (fn) {
    return typeof fn === 'function';
  },
  /**
   * 计算服务器请求数
   * @param callLimitStr
   * @returns {Function}
   */
  computeCallLimit: function (callLimitStr) {
    var callLimit = eval(callLimitStr);
    return +(config.requestLimit * (callLimit + 1e-6)).toFixed(0);
  }
};