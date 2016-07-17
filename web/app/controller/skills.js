/**
 * Skills Controller
 * @author Johannes
 * @module controller/user/skills
 */

const winston = require("winston");

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
    models.Skill.findAll().then((skills) => {
        response.setHeader('Content-Type', 'application/json');
        response.status(200).send(skills);
    });
});

router.get("/:name", loginRequired, (request, response) => {
    models.Skill.findAll({
        where: {
            name: {
                    $iLike: "%" + request.params.name + "%"
                }
        }
    }).then((skills) => {
        response.setHeader('Content-Type', 'application/json');
        response.status(200).send(skills);
    });
});

router.post("/add", loginRequired, (request, response) => {

    winston.info("adding skill");

    var parentSkill = parseInt(request.body.parent_id);
    var skillName = request.body.skill_name;

    parentSkill = (isNaN(parentSkill) || parentSkill === 0) ? null : parentSkill;

    models.Skill.create(
        {"name": skillName, "parent_Skill_id": parentSkill}
    ).then((skill) => {
        response.status(200).send(skill);
    });
});

module.exports = router;