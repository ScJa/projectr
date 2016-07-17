var should = require("should"); // eslint-disable-line no-unused-vars
var request = require("supertest")(require("../app"));
var agent = require('superagent').agent();
var testAccount = {"username": "imoreno8@shutterfly.com", "password": "test"};

exports.login = function (done) {
    request.post('/user/login').set('Content-Type', 'application/x-www-form-urlencoded').send(testAccount).end(function (err, res) {
        if (err) throw err;
        agent.saveCookies(res);
        done();
    });
};

exports.logout = function (done) {
    var req = request.get('/user/logout');
    agent.attachCookies(req);
    req.expect(302).end(function (err, res) {
        if (err) throw err;
        done();
    });
};

exports.assert = require('chai').assert;
exports.request = request;
exports.agent = agent;

exports.get = function (path) {
    var req = request.get(path);
    agent.attachCookies(req);
    return req;
};

exports.post = function (path, dataDict) {
    var req = request.post(path).send(dataDict);
    agent.attachCookies(req);
    return req;
};