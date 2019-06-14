/**
 * Created by obzerg on 16/1/5.
 */
var Promise = require('bluebird');
var should = require('should');

var Request = require('../lib/_Request');
var Yhsd = require('../index');
var token = '5e242b4b41d14a2d8f4d80a9c6b05bea';

describe('test/_Request.test.js', function () {
  var _request = new Request();

  it('should return token', function (done) {
    _request.request({
      hostname: Yhsd.config.appHost,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic NGQwYzZkMmMxMjQ1NDI4NGJjYzVjNDViMTQyODZkOTM6ZWQ5NDY5NDI2MGEwNGZmY2EwMTVhNzVmM2Q4MmUzMDA=',
      }
    }, {
      grant_type: 'client_credentials',
    }).then(function (data) {
      should.ok(data);
      token = data;
      done();
    });
  });
});
