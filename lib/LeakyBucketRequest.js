var Promise = require('bluebird');
var assert = require('assert');
var querystring = require('querystring');

var config = require('./config');
var Request = require('./_Request');

var MINUEND = 1; // 每次漏出的数量
var SUMMAND = 1; // 每次恢复数量
var API_CALL_LIMIT = 'x-yhsd-shop-api-call-limit'; // yhsd 接口返回的请求量 header

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

/**
 * 增加1个请求
 * @param count
 * @returns {*}
 */
function increment(count) {
  count = count || 0;
  count += SUMMAND;
  return count;
}

/**
 * 释放1个请求
 */
function decrement(count) {
  count = count || 0;
  if (count <= MINUEND) {
    count = 0;
  } else {
    count -= MINUEND;
  }
  return count;
}

/**
 * 排队
 * @returns {Promise|*|PromiseLike<T | never>|Promise<T | never>}
 */
function queue(fn) {
  //如果请求数超过限制则 setTimeout 排队
  if (this.count >= config.requestLimit) {
    return Promise.delay(config.requestTimeout).then(fn);
  }
}


var LeakyBucketRequest = function (option) {
  assert(option);
  assert(option.getRequestCount);
  assert(option.saveRequestCount);
  this.getCount = Promise.resolve(option && option.getRequestCount);
  this.saveCount = Promise.resolve(option && option.saveRequestCount);
  this.count = 0;
};

LeakyBucketRequest.prototype = {
  /**
   * 请求操作
   * @param options
   * @param params
   */
  request: function (options, params) {
    var req = new Request();
    req.onBefore(this.push);
    console.log('step', 0);
    return req.request(options, params).then(this.response);
  },
  /**
   * response 操作
   * @param data
   * @param res
   * @returns {*}
   */
  response: function (data, res) {
    console.log(arguments)
    console.log('step', 5)
     try {
       data = JSON.parse(data);
       return data;
     } catch (err) {
       throw err;
     } finally {
       //释放当前请求数
       this.count = +(config.requestLimit * (eval(res.headers[API_CALL_LIMIT]) + 1e-6)).toFixed(0);
     }

  },
  /**
   * 推进队列
   */
  push: function () {
    return this.getCount()
      .then(queue(this.push))
      .then(increment)
      .then(this.saveCount);
  },
  /**
   * 漏出
   * @param count
   */
  leak: function () {
    var delayMs = this.count * config.requestTimeout;

    return this.saveCount(this.count)
      .delay(delayMs)
      .then(this.getCount)
      .then(decrement)
      .then(this.saveCount);
  }
};


module.exports = LeakyBucketRequest;
