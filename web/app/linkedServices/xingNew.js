/**
 * Route: /xing
 */
"use strict";

var express = require('express');
var passport = require('passport');
var sequelize = require("sequelize");
var models = require("../models");
var session = require('express-session');
var partials = require('express-partials');
var config = require("../config.js");
var loginRequired = require("../middleware/loginRequired");
var winston = require("winston");
var registerLS = require("../linkedServices/registerLS");
var OAuth = require("oauth").OAuth;
var request = require('request');

var router = express.Router();

const callbackUrl = "http://"+config.LISTEN_HOST+":" + config.LISTEN_PORT + "/xing/auth/xing/callback";

const serviceId = "XING";
const requestTokenUrl = "https://api.xing.com/v1/request_token";
const accessTokenUrl = "https://api.xing.com/v1/access_token";
const consumerKey = config.XING_CONFIG.consumerKey;
const consumerSecret = config.XING_CONFIG.consumerSecret;

var xingOauth = new OAuth(requestTokenUrl, accessTokenUrl, consumerKey, consumerSecret, '1.0', null, 'HMAC-SHA1');


router.get('/auth/xing', function(req,res){
    getApiAccess(req, res, callbackUrl+"/login");
});

router.get('/auth/xing/callback/login', function (req, res) {
    winston.info("/auth/xing/callback/login");
    getAccessToken(req, res, req.query.oauth_token, req.query.oauth_verifier, function (req, res, access_token, oauth_access_token_secret) {
        registerLS.loginOrCreateUser(req, res, access_token, oauth_access_token_secret, serviceId, getUserData);
    });
});

router.get('/skills/xing', loginRequired, function(req,res){
    getApiAccess(req, res, callbackUrl+"/skills");
});

router.get('/auth/xing/callback/skills', loginRequired, function (req, res) {
    //http://localhost:8855/xing/auth/xing/callback/skills?oauth_token=25a66382263652ad9b14&oauth_verifier=8519
    winston.info("/auth/xing/callback/skills");
    getAccessToken(req, res, req.query.oauth_token, req.query.oauth_verifier, function (req, res, access_token, oauth_access_token_secret) {
        registerLS.loadSkills(req, res, access_token, oauth_access_token_secret, serviceId, getUserData);
    });
});

function getApiAccess(req, res, callbackUrl) {
    xingOauth.getOAuthRequestToken({"oauth_callback": callbackUrl}, function (error, oauth_token, oauth_token_secret, results) {
        if(error) {
            winston.error(results);
            winston.error(error);
        } else {
            req.session.oauth_token_secret = oauth_token_secret;
            res.redirect("https://api.xing.com/v1/authorize?oauth_token="+oauth_token+"&oauth_token_secret="+oauth_token_secret);
        }
    });
}

function getAccessToken(req, res, oauth_token, oauth_verifier, callback) {
    var oauth_token_secret = req.session["oauth_token_secret"];
    //noinspection JSUnresolvedFunction
    xingOauth.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier,
        function (error, access_token, oauth_access_token_secret, results) {
            if (error) {
                winston.error(error);
                winston.error(results);
            } else {
                req.session.access_token = access_token;
                req.session.oauth_access_token_secret = oauth_access_token_secret;
                callback(req, res, access_token, oauth_access_token_secret);
            }
        }
    );
}

function getUserData(oauth_token, oauth_token_secret, callback) {
    xingOauth.get("https://api.xing.com/v1/users/me", oauth_token, oauth_token_secret, function (error, data) {
        var allData = JSON.parse(data)["users"][0];
        var serviceUserId = allData["id"];
        var userData = {
            first_name: allData["first_name"],
            last_name: allData["last_name"],
            owner: true,
            designer: true,
            developer: true,
            password: ""+serviceUserId,
            email: allData["active_email"]
        };
        var languages = allData["haves"].split(",");
        callback(serviceUserId, userData, allData, languages);
    });
}

module.exports = router;