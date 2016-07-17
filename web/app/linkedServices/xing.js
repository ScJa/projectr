"use strict";

var exports = module.exports = {};

var express = require('express');
var router = express.Router();

var passport = require('passport');
var XingStrategy = require('passport-xing').Strategy;
var session = require('express-session');
var loginRequired = require("../middleware/loginRequired");

const config = require("../config.js");
const winston = require("winston");

//XING API keys
var XING_API_KEY = config.XING_CONFIG.consumerKey;
var XING_SECRET_KEY = config.XING_CONFIG.consumerSecret;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Xing profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


// Use the XingStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Xing profile), and
//   invoke a callback with a user object.
passport.use(new XingStrategy({
        consumerKey: XING_API_KEY,
        consumerSecret: XING_SECRET_KEY,
        callbackURL: "http://localhost:" + config.LISTEN_PORT + "/xing/auth/xing/callback",
        state: "abc"
    },

    function (token, tokenSecret, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's Xing profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Xing account with a user record in your database,
            // and return that user instead.
            winston.info(JSON.stringify(profile));
            winston.info(profile.displayName);
            winston.info(profile.resourceTags);

            console.log("xing token: " + token);
            console.log("xing tokenSecret: " + tokenSecret);
            return done(null, false);// profile);

            //1. user + serviceUserId exists -> no problem
            //2. no user -> no problem
            //3. user but no serviceUserId -> !?!?!?
        });
    }
));

router.get('/', loginRequired, function (req, res) {
    winston.info("xing /");
    res.render('linkedService/xing', {user: req.user});
});

router.get('/account', loginRequired, function (req, res) {
    winston.info("xing /account");
    winston.info(req.getAllInfo());
    res.render('linkedService/xing', {user: req.user});
});

router.get('/login', loginRequired, function (req, res) {
    winston.info("xing /login");
    res.render('linkedService/xing', {user: req.user});
});

// GET /auth/xing
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Xing authentication will involve
//   redirecting the user to xing.com.  After authorization, Xing will
//   redirect the user back to this application at /auth/xing/callback
router.get('/auth/xing', loginRequired,
    passport.authenticate('xing'),
    function (req, res) {
        winston.info("xing /auth/xing");
        // The request will be redirected to Xing for authentication, so this
        // function will not be called.
    });

// GET /auth/xing/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/xing/callback', function (req, res) {
    console.log("adada");
});

router.get('/logout', loginRequired, function (req, res) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('linkedService/xing');
}


module.exports = router;