/**
 * Created by bernd on 29.04.16.
 * Route: /github
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
var GITHUB_CLIENT_ID = config.GITHUB_CONFIG.clientId;
var GITHUB_CLIENT_SECRET = config.GITHUB_CONFIG.clientSecret;
var OAuth2 = require("oauth").OAuth2;
var request = require('request');
var fuckNodeJs = require("../util/fuckNodeJs");

const serviceId = "GitHub";
var githubOauth = new OAuth2(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, "https://github.com", "/login/oauth/authorize", "/login/oauth/access_token");

router.get('/skills/github', loginRequired, function(req,res){
    res.writeHead(303, {
        Location: githubOauth.getAuthorizeUrl({
            redirect_uri: 'http://'+config.LISTEN_HOST+':'+config.LISTEN_PORT+'/github/auth/github/callback/skills',
            scope: "user,repo",
            state: req.user.id
        })
    });
    res.end();
});

router.get('/auth/github/callback/login', function (req, res) {
    winston.info("/auth/github/callback/login");
    getAccessToken(req, res, function (req, res, access_token, refresh_token) {
        registerLS.loginOrCreateUser(req, res, access_token, refresh_token, serviceId, getUserData);
    });
});


router.get('/auth/github', function(req,res){
    res.writeHead(303, {
        Location: githubOauth.getAuthorizeUrl({
            redirect_uri: 'http://'+config.LISTEN_HOST+':'+config.LISTEN_PORT+'/github/auth/github/callback/login',
            scope: "user,repo",
            state: "UserIdUndefined-->LoginWithGithub"
        })
    });
    res.end();
});

router.get('/auth/github/callback/skills', loginRequired, function (req, res) {
    winston.info("/auth/github/callback/skills");
    getAccessToken(req, res, function (req, res, access_token, refresh_token) {
        registerLS.loadSkills(req, res, access_token, refresh_token, serviceId, getUserData);
    });
});


function getAccessToken(req, res, callback) {
    //noinspection JSUnresolvedFunction
    githubOauth.getOAuthAccessToken(req.query.code, {},
        function (error, access_token, refresh_token, results) {
            if (error) {
                winston.error(error);
                winston.error(results);
            } else {
                req.session[serviceId] = {};
                req.session[serviceId].access_token = access_token;
                req.session[serviceId].refresh_token = refresh_token;
                callback(req, res, access_token, refresh_token);
            }
        }
    );
}

function getUserData(access_token, refresh_token, callback) {
    winston.debug(refresh_token);

    getGitHubUserData(access_token, function (allData) {
        getGitHubRepoData(access_token, function (languages) {
            var serviceUserId = ""+allData.id;
            var userData = {
                first_name: allData.name,
                last_name: "",
                owner: true,
                designer: true,
                developer: true,
                password: ""+serviceUserId,
                email: allData.email
            };

            if (allData.name != null && fuckNodeJs.strContains(allData.name , " ")) {
                userData.first_name = allData.name.split(" ")[0];
                userData.last_name = allData.name.split(" ")[1];
            }

            callback(serviceUserId, userData, allData, languages);
        });
    });
}

function getGitHubUserData(token, callback){
    request({
        headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'},
        'method': 'GET',
        'uri': "https://api.github.com/user",
        'auth': {'bearer': token}
    }, function(error, res, body) {
        if(res.statusCode == 200){
            callback(JSON.parse(body));
        } else {
            winston.error('error: '+ res.statusCode);
            winston.error(body);
        }
    });
}

function getGitHubRepoData(token, callback){
    request({
        headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'},
        'method': 'GET',
        'uri': "https://api.github.com/user/repos",
        'auth': {'bearer': token}
    }, function(error, res, body) {
        if(res.statusCode == 200){
            var json = JSON.parse(body);
            var result = [];
            for(var i = 0; i < json.length; i++) {
                var obj = json[i];
                if (obj != null && obj.language != null) {
                    result.push(obj.language);
                }
            }
            callback(result);
        } else {
            winston.error('error: '+ res.statusCode);
            winston.error(body);
        }
    });
}

module.exports = router;