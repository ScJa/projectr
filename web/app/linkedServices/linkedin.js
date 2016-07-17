/**
 * Created by bernd on 29.04.16.
 * Route: /linkedin
 */
"use strict";

var express = require('express');
var passport = require('passport');
var sequelize = require("sequelize");
var models = require("../models");
var session = require('express-session');
var partials = require('express-partials');
var router = express.Router();
var config = require("../config.js");
var loginRequired = require("../middleware/loginRequired");
var winston = require("winston");
var registerLS = require("../linkedServices/registerLS");
var request = require("request");
var OAuth2 = require("oauth").OAuth2;
// var linkedinScraper = require("linkedin-scraper2");

var LINKEDIN_SERVICE_ID = "LinkedIn";
var LINKEDIN_CLIENT_ID = config.LinkedIn_CONFIG.clientId;
var LINKEDIN_CLIENT_SECRET = config.LinkedIn_CONFIG.clientSecret;
var LINKEDIN_CALLBACK = 'http://'+config.LISTEN_HOST+':'+config.LISTEN_PORT+'/linkedin/auth/linkedin/callback';

var linkedinOauth = new OAuth2(LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET,
    "https://linkedin.com", "/oauth/v2/authorization", "/oauth/v2/accessToken");


router.get('/skills/linkedin', loginRequired, function(req,res){
    res.writeHead(303, {
        Location: linkedinOauth.getAuthorizeUrl({
            redirect_uri: LINKEDIN_CALLBACK,
            scope: "r_basicprofile r_emailaddress",
            response_type: "code",
            state: "skills"
        })
    });
    res.end();
});


router.get('/auth/linkedin', function(req,res){
    res.writeHead(303, {
        Location: linkedinOauth.getAuthorizeUrl({
            redirect_uri: LINKEDIN_CALLBACK,
            scope: "r_basicprofile r_emailaddress",
            response_type: "code",
            state: "login"
        })
    });
    res.end();
});


router.get('/auth/linkedin/callback', function (req, res) {
    if (req.query.state == "login") {
        getAccessToken(req, res, function (req, res, access_token, refresh_token) {
            registerLS.loginOrCreateUser(req, res, access_token, refresh_token, LINKEDIN_SERVICE_ID, getUserData);
        });
    } else if (req.query.state == "skills") {
        getAccessToken(req, res, function (req, res, access_token, refresh_token) {
            registerLS.loadSkills(req, res, access_token, refresh_token, LINKEDIN_SERVICE_ID, getUserData);
        });
    } else {
        res.end();
    }
});


function getAccessToken(req, res, callback) {
    var params = {
        grant_type: "authorization_code",
        redirect_uri: LINKEDIN_CALLBACK,
        code: req.query.code,
        client_id: linkedinOauth._clientId,
        client_secret: linkedinOauth._clientSecret
    };

    request.post({
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        url: "https://www.linkedin.com/oauth/v2/accessToken",
        form: params
    }, function(error, postResponse, body) {
        if (error) {
            winston.error(error);
        } else if(postResponse.statusCode == 200){
            var accessToken = JSON.parse(body).access_token;
            req.session[LINKEDIN_SERVICE_ID] = {};
            req.session[LINKEDIN_SERVICE_ID].access_token = accessToken;
            req.session[LINKEDIN_SERVICE_ID].refresh_token = null;
            callback(req, res, accessToken, null);
        } else {
            winston.error('error: '+ res.statusCode);
            winston.error(body);
        }
    });
}

function getUserData(access_token, refresh_token, callback) {
    winston.debug(access_token);
    winston.debug(refresh_token);
    request({
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
            'Authorization': 'Bearer '+access_token,
            'Connection': 'Keep-Alive'
        },
        'method': 'GET',
        'uri': "https://api.linkedin.com/v1/people/~:(id,first-name,last-name,public-profile-url,email-address)?format=json",
        'auth': {'bearer': access_token}
    }, function(error, res, body) {
        if (error) {
            winston.error(error);
        } else if(res.statusCode == 200){
            var apiData = JSON.parse(body);

            linkedinScraper(apiData.publicProfileUrl, function (err, profile) {
                profile.id = apiData.id;
                profile.emailAddress = apiData.emailAddress;
                profile.firstName = apiData.firstName;
                profile.lastName = apiData.lastName;
                profile.publicProfileUrl = apiData.publicProfileUrl;

                var serviceUserId = ""+profile.id;
                var userData = {
                    first_name: profile.firstName,
                    last_name: profile.lastName,
                    owner: true,
                    designer: true,
                    developer: true,
                    password: ""+serviceUserId,
                    email: profile.emailAddress
                };
                callback(serviceUserId, userData, profile, profile.skills);
            });

        } else {
            winston.error('error: '+ res.statusCode);
            winston.error(body);
        }
    });
}

module.exports = router;