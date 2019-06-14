/**
 * Created by obzerg on 16/1/5.
 */
var Promise = require('bluebird');

var Request = require('../lib/LeakyBucketRequest');
var Yhsd = require('../index');
var reqCountMap = {};
var token = '5e242b4b41d14a2d8f4d80a9c6b05bea';

describe('test/LeakBucketRequest.test.js', function () {
  describe('api request', function () {
    var _request = new Request({
      getRequestCount: function () {
        return Promise.resolve(reqCountMap[token] || 0);
      },
      saveRequestCount: function (count) {
        reqCountMap[token] = count;
        return Promise.resolve(count);
      },
    });

    it('should return ok', function (done) {
      var i = 0;

      function request() {
        _request.request({
          hostname: Yhsd.config.apiHost,
          path: '/v1/shop',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-ACCESS-TOKEN': token
          }
        })
          .then(function () {
            // if (i < 200) {
            //   request();
            //   return;
            // }
            done();
          });
        i++;
      }

      request();
    });
  });
});
