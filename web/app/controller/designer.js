/**
 * Created by Jakob on 22/05/2016.
 */
/**
 * Projects Controller
 * @module controller/user/designer
 */

var express = require("express");
var models = require("../models");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var loginRequired = require("../middleware/loginRequired");

passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

passport.deserializeUser((user_id, callback) => {
    models.User.findById(user_id).then((user) => {
        callback(null, user);
    });
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        username = username.trim();
        models.User.findOne({where: {email: username}}).then((user) => {
            if (!user) {
                return done(null, false, {message: "Incorrect username."});
            }

            if (!user.validPassword(password)) {
                return done(null, false, {message: "Incorrect password."});
            }

            return done(null, user);
        });
    }
));

router.get("/", loginRequired, (request, response) => {
    models.Position.findAll(
        {
            where: {UserId: request.user.id, type: "Designer"},
            include: models.Project
        }
    ).then((positions) => {
        response.render("designerhub/index", {positions: positions});
    });
});

router.get("/accept/:id", loginRequired, (request, response) => {
    models.Position.find({
        where: {
            UserId: request.user.id,
            type: "Designer",
            id: request.params.id
        }
    }).then((position) => {
        position.update({status: "accepted"}).then(() => {
            response.redirect("/user/designer")
        })
    });
});

router.get("/decline/:id", loginRequired, (request, response) => {
    models.Position.find({
        where: {
            UserId: request.user.id,
            type: "Designer",
            id: request.params.id
        }
    }).then((position) => {
        position.update({status: "rejected"}).then(() => {
            response.redirect("/user/designer")
        })
    });
});

router.get("/leave/:id", loginRequired, (request, response) => {
    models.Position.find({
        where: {
            UserId: request.user.id,
            type: "Designer",
            id: request.params.id
        }
    }).then((position) => {
        position.update({status: "consider"}).then(() => {
            response.redirect("/user/designer")
        })
    });
});

module.exports = router;