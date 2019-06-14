var Promise = require('bluebird');
var http = require('http');
var querystring = require('querystring');

var Request = function (protocol) {
  this.client = protocol === 'https' ? require('https') : http;
  this.beforeHookFn = Promise.resolve();
  this.afterHookFn = Promise.resolve();
};

Request.prototype = {
  request(options, params) {
    return Promise.each([
      this.beforeHook(),
      this._request(options, params),
      this.afterHook(),
    ]);
  },
  /**
   * 请求操作
   * @param options
   * @param params
   */
  _request: function (options, params) {
    console.log('step', 2);
    var client = this.client;
    // 请求 Promise
    return new Promise(function (resolve, reject) {
      var req = client.request(options, function (res) {
        var buf = [];
        console.log('step', 3.5);

        res.on('end', function () {
          var data = Buffer.concat(buf).toString();
          console.log('step', 4, data);
          resolve(data, res);
        });

        res.on('data', function (data) {
          buf.push(data);
        });
      });

      req.on('error', reject);

      // 发送参数
      if (params) {
        var stringify = genStringify(options);
        req.write(stringify(params));
      }

      req.end();
    });
  },
  beforeHook: function () {
    console.log('step', 1);
    return this.beforeHookFn;
  },
  afterHook: function () {
    console.log('step', 3);
    return this.afterHookFn;
  },
  /**
   * 设置请求前钩子函数
   * @param fn
   */
  onBefore: function (fn) {
    this.beforeHookFn = Promise.cast(fn);
  },
  /**
   * 设置请求后钩子函数
   * @param fn
   */
  onAfter: function (fn) {
    this.afterHookFn = Promise.cast(fn);
  },
};


module.exports = Request;


/**
 * stringify 参数
 * @param options
 * @returns {*}
 */
function genStringify(options) {
  var stringifyFn;
  if (options.headers['Content-Type'] &&
    options.headers['Content-Type'].toLowerCase() === 'application/x-www-form-urlencoded') {
    stringifyFn = querystring.stringify;
  } else {
    switch (options.method.toUpperCase()) {
      case 'POST':
      case 'PUT':
        stringifyFn = JSON.stringify;
        break;
    }
  }
  return stringifyFn;
}