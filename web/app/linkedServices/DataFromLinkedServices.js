/**
 * Created by bernd on 04.05.16.
 */
"use strict";

var exports = module.exports = {};
const config = require("../config.js");
const winston = require("winston");
var request = require('request');

function getDataByTokenAndRequests(token,hostname,path){
    request({
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
        },
        'method': 'GET',
        'uri': hostname+path,
        'auth': {
            'bearer': token
        }
    }, function(error, res, body) {
        if(res.statusCode == 200){
            winston.info(hostname + " " + path);
            winston.info("200");
            winston.info(body);
            winston.info("====================================================================================");
        } else {
            winston.info(hostname + " " + path);
            winston.info('error: '+ res.statusCode);
            winston.info(body);
            winston.info("====================================================================================");
        }
    })
}


function getDataByTokenAndRequestsXing(consumerSecret, tokenSecret, oauth_token, oauth_consumer_key, hostname, path){
    var request = require('request');
    var oauthSignature=require('oauth-signature');
    var httpMethod='GET';
    var url= hostname+path;
    var nonce=Math.random().toString(36).substring(5);
    var timestamp=Date.now();

    var parameters = {
        'fields':'',
        'oauth_consumer_key': oauth_consumer_key,
        'oauth_token': oauth_token,
        'oauth_signature_method':'HMAC-SHA1',
        'oauth_timestamp':timestamp,
        'oauth_nonce':nonce,
        'oauth_version':'1.0'
    };
    var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
    parameters['oauth_signature']=signature;

//Lets configure and request
    request({
        url: url, //URL to hit
        qs: {
            'fields': '',
            'oauth_consumer_key': oauth_consumer_key,
            'oauth_token': oauth_token,
            'oauth_signature_method':'HMAC-SHA1',
            'oauth_timestamp':timestamp,
            'oauth_nonce':nonce,
            'oauth_version':'1.0',
            'oauth_signature' : signature
        }, //Query string data
        method: 'GET'
        //Lets post the following key/values as form

        }, function(error, response, body){
            if(error) {
                winston.info(hostname + " " + path);
                winston.info(error);
                winston.info("-------------end xing-----------");
            } else {
                winston.info(hostname + " " + path);
                winston.info(response.statusCode, body);
                winston.info("-------------end xing-----------");
            }
        }
    );
}

function getDataByTokenAndRequestsDevianArt(token,tokenSecret,hostname,path) {
    var skills;

    request({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',

        },
        'method': 'GET',
        'uri': hostname + path,
        'auth': {
            'bearer': token
        }
    }, function (error, res, body) {
        if (res.statusCode == 200) {
            winston.info(hostname + " " + path);
            winston.info("200");
            winston.info(body);
            winston.info("====================================================================================");
        } else {
            winston.info(hostname + " " + path);
            winston.info('error: ' + res.statusCode);
            winston.info(body);
            winston.info("====================================================================================");
        }
    })

}

//empty result, skills is a special field, we need more permissions from LinkedIn
getDataByTokenAndRequests(config.LinkedIn_CONFIG.testToken,
   "https://api.linkedin.com", "/v1/people/~:(skills)?format=json");

//only basicprofile
getDataByTokenAndRequests(config.LinkedIn_CONFIG.testToken,
    "https://api.linkedin.com", "/v1/people/~?format=json");

// ok
getDataByTokenAndRequests(config.GITHUB_CONFIG.testToken,
    "https://api.github.com", "/user/repos");

getDataByTokenAndRequestsXing(config.XING_CONFIG.consumerSecret,
    config.XING_CONFIG.tokenSecret,
    config.XING_CONFIG.testToken,
    config.XING_CONFIG.consumerKey,
    config.XING_CONFIG.apiURL, "/v1/users/me");





getDataByTokenAndRequestsDevianArt(config.DevianArt_CONFIG.token,config.DevianArt_CONFIG.tokenSecret,
    "https://www.deviantart.com/api", "/v1/oauth2/placebo");


var help= "/v1/oauth2/gallery/all" ;
getDataByTokenAndRequestsDevianArt(config.DevianArt_CONFIG.token,config.DevianArt_CONFIG.tokenSecret,
    "https://www.deviantart.com/api",help );
