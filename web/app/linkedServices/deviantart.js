/**
 * Created by bernd on 15.05.16.
 */
"use strict";

var express = require('express');
var router = express.Router();
const config = require("../config.js");
var request = require("request");
var passport = require('passport');
var loginRequired = require("../middleware/loginRequired");
var sequelize = require("sequelize");
var models = require("../models");
var OAuth2 = require("oauth").OAuth2;
var winston = require("winston");
var registerLS = require("../linkedServices/registerLS");

var DEVIANTART_CLIENT_ID = config.DevianArt_CONFIG.clientId;
var DEVIANTART_CLIENT_SECRET = config.DevianArt_CONFIG.clientSecret;

var DEVIANTART_SERVICE_ID = "DeviantArt";
var DEVIANTART_CALLBACK = 'http://'+config.LISTEN_HOST+':'+config.LISTEN_PORT+'/deviantart/auth/deviantart/callback';

var deviantartOauth = new OAuth2(DEVIANTART_CLIENT_ID, DEVIANTART_CLIENT_SECRET,
    "https://www.deviantart.com", "/oauth2/authorize", "/oauth2/token");


router.get('/skills/deviantart', loginRequired, function(req,res){
    res.writeHead(303, {
        Location: deviantartOauth.getAuthorizeUrl({
            redirect_uri: DEVIANTART_CALLBACK,
            scope: "basic browse",
            response_type: "code",
            state: "skills"
        })
    });
    res.end();
});


router.get('/auth/deviantart', function(req,res){
    res.writeHead(303, {
        Location: deviantartOauth.getAuthorizeUrl({
            redirect_uri: DEVIANTART_CALLBACK,
            scope: "basic browse",
            response_type: "code",
            state: "login"
        })
    });
    res.end();
});

router.get('/auth/deviantart/callback', function (req, res) {
    if (req.query.state == "login") {
        getAccessToken(req, res, function (req, res, access_token, refresh_token) {
            registerLS.loginOrCreateUser(req, res, access_token, refresh_token, DEVIANTART_SERVICE_ID, getUserData);
        });
    } else if (req.query.state == "skills") {
        getAccessToken(req, res, function (req, res, access_token, refresh_token) {
            registerLS.loadSkills(req, res, access_token, refresh_token, DEVIANTART_SERVICE_ID, getUserData);
        });
    } else {
        res.end();
    }
});


function getAccessToken(req, res, callback) {
    var params = {
        grant_type: "authorization_code",
        redirect_uri: DEVIANTART_CALLBACK,
        code: req.query.code,
        client_id: deviantartOauth._clientId,
        client_secret: deviantartOauth._clientSecret
    };

    deviantartOauth.getOAuthAccessToken(req.query.code, params,
        function (error, access_token, refresh_token, results) {
            if (error) {
                winston.error(error);
                winston.error(results);
            } else {
                req.session[DEVIANTART_SERVICE_ID] = {};
                req.session[DEVIANTART_SERVICE_ID].access_token = access_token;
                req.session[DEVIANTART_SERVICE_ID].refresh_token = refresh_token;
                callback(req, res, access_token, refresh_token);
            }
        }
    );
}


function getUserData(access_token, refresh_token, callback) {
    winston.debug(refresh_token);
    var data = {};
    var uri = "https://www.deviantart.com/api/v1/oauth2/user/whoami?expand=user.details,user.geo,user.profile,user.stats";
    winston.info(uri);

    deviantartOauth.get(uri, access_token, function (error, res) {
        if (error) {
            winston.error(error);

        } else {
            data["whoami"] = JSON.parse(res);
            var username = encodeURIComponent(data.whoami.username);

            uri = "https://www.deviantart.com/api/v1/oauth2/user/profile/"+username;
            winston.info(uri);

            deviantartOauth.get(uri, access_token, function (error, res) {
                if (error) {
                    console.log(error);
                    
                } else {
                    data["profile"] = JSON.parse(res);
                    recursiveGallerySearch(access_token, Array.from(new Set()), 0, username, function (skills) {
                        data["skills"] = skills;
                        var serviceUserId = ""+data.whoami.userid;
                        var userData = {
                            first_name: ""+data.whoami.username,
                            last_name: "",
                            owner: true,
                            designer: true,
                            developer: true,
                            password: serviceUserId,
                            email: null
                        };
                        callback(serviceUserId, userData, data, skills);
                    });
                }
            });

        }
    });
}


function recursiveGallerySearch(access_token, skills, offset, encodedUserName, finalCallback) {
    var uri = "https://www.deviantart.com/api/v1/oauth2/gallery/all?expand=category&limit=24&offset="+offset+"&username="+encodedUserName;

    deviantartOauth.get(uri, access_token, function (error, res) {
        if (error) {
            console.log(error);
            finalCallback(skills);
        } else {
            var data = JSON.parse(res);
            
            data.results.forEach(function (elem) {
                skills.push(elem.category);
            });

            if (data.has_more) {
                recursiveGallerySearch(access_token, skills, data.next_offset, encodedUserName, finalCallback)
            } else {
                finalCallback(skills);
            }
        }
    });
}


module.exports = router;