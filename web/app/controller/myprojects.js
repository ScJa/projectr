/**
 * Projects Controller
 * @module controller /user/myprojects
 */

var express = require("express");
var models = require("../models");
var router = express.Router();
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var notification = require("../util/notification");
var loginRequired = require("../middleware/loginRequired");
var createForm = require("../forms/myprojects/createForm");
var editForm = require("../forms/myprojects/editForm");
var addPositionForm = require("../forms/myprojects/addPositionForm");
var editPositionForm = require("../forms/myprojects/editPositionForm");
var config = require("../config.js");
var requestLib = require("request");
var winston = require("winston");



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
    models.Project.findAll({ where: { UserId: request.user.id }, include: [{ model: models.Position, include: models.User }] }).then(function(myprojects) {
        response.render("myprojects/index", {projects: myprojects});
    });
});

router.get("/create", loginRequired, (request, response) => {
    response.render("myprojects/createProject");
});

router.post("/create", loginRequired, createForm, (request, response) => {
    request.form.UserId = request.user.id;
    request.form.status = "running";
    models.Project.create(request.form).then((project) => {
        response.redirect("/user/myprojects/");

    }).catch((e) => {
        console.log(e);
        response.render("myprojects/createProject", {errors: e.errors});
    })
});

router.get("/project/:id", loginRequired, (request, response) => {
    models.Project.findById(request.params.id).then((project) => {
        response.render("myprojects/project/edit", {project: project});
    });
});

router.get("/project/:id/edit", loginRequired, (request, response) => {
    models.Project.findById(request.params.id).then((project) => {
        response.render("myprojects/project/edit", {project: project});
    });
});

router.post("/project/:id/edit", loginRequired, editForm, (request, response) => {
    if (request.form.action == "delete") {
        models.Project.findById(request.params.id).then((project) => {
            project.destroy();
            response.redirect("/user/myprojects/");
        }).catch((e) => {
            response.render("myprojects/project/edit", {project: request.form, errors: e.errors});
        });
    } else {
        models.Project.update(request.form, {where:{id:request.params.id}}).then((project) => {
            response.redirect("/user/myprojects/project/" + request.params.id);
        }).catch((e) => {
            request.form.id = request.params.id;
            response.render("myprojects/project/edit", {project: request.form, errors: e.errors});
        });
    }
});

router.get("/project/:id/delete", loginRequired, (request, response) => {
    models.Project.findById(request.params.id).then((project) => {
        project.destroy();
        response.redirect("/user/myprojects/");
    });
});

router.get("/project/:id/positions", loginRequired, (request, response) => {
    var include = [
        {model: models.User, required: false},
        {model: models.Position_Skill, required: false, include: [models.Skill]},
        {model: models.Rating, required: false}
    ];
    models.Position.findAll({where: {ProjectId: parseInt(request.params.id)}, include: include}).then(
        (positions) => {
            response.render("myprojects/project/positions", {
                positions: positions,
                projectId: parseInt(request.params.id)
            });
        }
    );
});


router.get("/project/:id/positionsShortInfo", loginRequired, (request, response) => {
    var include = [{model: models.User, required: false}];
    models.Position.findAll({where: {ProjectId: parseInt(request.params.id)}, include: include}).then(
        (positions) => {
            response.render("myprojects/positionsShortInfo", {positions: positions, projectId: parseInt(request.params.id)});
        }
    );
});

router.get("/project/:id/positionsShortInfoProjectProfile", loginRequired, (request, response) => {
    var include = [{model: models.User, required: false}];
    models.Position.findAll({where: {ProjectId: parseInt(request.params.id)}, include: include}).then(
        (positions) => {
            response.render("myprojects/positionsShortInfoProjectProfile", {positions: positions});
        }
    );
});

router.get("/project/:id/position/add", loginRequired, (request, response) => {
    response.render("myprojects/project/position/add", {projectId: parseInt(request.params.id)});
});

router.post("/project/:id/position/add", loginRequired, addPositionForm, (request, response) => {
    request.form.UserId = null;
    request.form.status = "open";
    request.form.ProjectId = parseInt(request.params.id);
    models.Position.create(request.form).then(() => {
        response.redirect("/user/myprojects/project/" + request.params.id + "/positions");
    }).catch((e) => {
        console.log(e);
        response.render("myprojects/project/position/add", {projectId: parseInt(request.params.id), errors: e.errors});
    })
});

router.get("/project/:id/position/delete/:posId", loginRequired, (request, response) => {
    models.Position.findById(parseInt(request.params.posId)).then((position) => {
        position.destroy();
        response.redirect("/user/myprojects/project/" + request.params.id + "/positions");
    }).catch((e) => {
        console.log(e);
        response.redirect("/user/myprojects/project/" + request.params.id, [{errors: e.errors}]);
    })
});

router.get("/project/:id/position/edit/:posId", loginRequired, (request, response) => {
    var posId = parseInt(request.params.posId);
    var projectId = parseInt(request.params.id);

    var include = [
        {model: models.Position_Skill, include: [models.Skill]},
        {model: models.User}
    ];

    winston.info("load for position " + posId);
    models.Position.findById(request.params.posId, {include: include}).then((position) => {

        // save skills to new array, because sequelize instances cannot be modified (lame...)
        var skills = [];

        position.Position_Skills.forEach(function (dbSkill) {
            var skill = {};
            skill.id = dbSkill.SkillId;
            skill.level = dbSkill.weight * 4;
            skill.name = dbSkill.Skill.name;
            winston.info("skill: " + skill.id + ", " + skill.name);
            skills.push(skill);
        });

        response.render("myprojects/project/position/edit", {
            position: position,
            projectId: projectId,
            skills: skills
        });

    }).catch((e) => {
        response.render("myprojects/project/position/edit", {
            projectId: projectId,
            errors: e.errors
        });
    });
});

router.post("/project/:id/position/edit/:posId", loginRequired, editPositionForm, (request, response) => {
    var data = request.form;

    var posId = parseInt(request.params.posId);
    var projectId = parseInt(request.params.id);

    winston.info("Editing position " + request.params.posId + "(" + posId + ")");
    var include = [{model: models.Position_Skill, required: false, include: [models.Skill]}];

    models.Position.findById(posId, {include: include}).then((position) => {

        var errors = [];

        if(data.name == ""){
            // send error message
            var error = {};
            error.path = "name";
            error.message = "Validation notEmpty failed";

            errors.push(error);
        }

        if(data.hours == ""){
            // send error message
            var error = {};
            error.path = "free_hours";
            error.message = "Validation notEmpty failed";

            errors.push(error);
        }

        if(data.budget == ""){
            // send error message
            var error = {};
            error.path = "budget";
            error.message = "Validation notEmpty failed";

            errors.push(error);
        }

        if(data.level_1.length == 0 && data.level_2.length == 0 &&
            data.level_3.length == 0 && data.level_4.length == 0){
            // send error message
            var error = {};
            error.path = "Skills";
            error.message = "Skills not empty";

            errors.push(error);
        }

        // check for errors
        if(errors.length != 0){

            winston.info("errors!");

            // save skills to new array, because sequelize instances cannot be modified (lame...)
            var skills = [];

            position.Position_Skills.forEach(function (dbSkill) {
                var skill = {};
                skill.id = dbSkill.SkillId;
                skill.level = dbSkill.weight * 4;
                skill.name = dbSkill.Skill.name;
                skills.push(skill);
            });

            response.render("myprojects/project/position/edit", {
                position: position,
                projectId: projectId,
                skills: skills,
                errors: errors
            });

        } else {
            
            /* assign user manually to position
            if (data.email) {
                assignUserManually(data.email, position);
            }*/

            winston.info("Found position with id " + position.id);
            position.updateAttributes(data).then((position) => {

                winston.info("Updated attributes with " + data);
                data.level_1.forEach(function (skill) {
                    models.Position_Skill.upsert({weight: 0.25, PositionId: posId, SkillId: skill});
                });
                data.level_2.forEach(function (skill) {
                    models.Position_Skill.upsert({weight: 0.5, PositionId: posId, SkillId: skill});
                });
                data.level_3.forEach(function (skill) {
                    models.Position_Skill.upsert({weight: 0.75, PositionId: posId, SkillId: skill});
                });
                data.level_4.forEach(function (skill) {
                    models.Position_Skill.upsert({weight: 1.0, PositionId: posId, SkillId: skill});
                });

                models.Position_Skill.findAll({where: {PositionId: posId}}).then(
                    (positionSkills) => {
                        positionSkills.forEach(function (positionSkill) {
                            if (data.level_1.indexOf(positionSkill.SkillId) != -1 || data.level_2.indexOf(positionSkill.SkillId) != -1 ||
                                data.level_3.indexOf(positionSkill.SkillId) != -1 || data.level_4.indexOf(positionSkill.SkillId) != -1) {
                                winston.info("Ok " + positionSkill.SkillId);
                            } else {
                                winston.info("Deleting position skill " + positionSkill.SkillId);
                                positionSkill.destroy();
                            }
                        });
                        winston.info("Rendering edit html for postion " + position.id);
                        response.redirect("/user/myprojects/project/" + projectId + "/position/edit/" + posId);
                    }
                ).catch(
                    (e) => {
                        winston.error(e);
                        response.redirect(200, "/user/myprojects/project/" + request.params.id, [{errors: e.errors}]);
                    }
                );

            }).catch((e) => {

                // save skills to new array, because sequelize instances cannot be modified (lame...)
                var skills = [];

                position.Position_Skills.forEach(function (dbSkill) {
                    var skill = {};
                    skill.id = dbSkill.SkillId;
                    skill.level = dbSkill.weight * 4;
                    skill.name = dbSkill.Skill.name;
                    skills.push(skill);
                });

                response.render("myprojects/project/position/edit", {
                    projectId: projectId,
                    position: position,
                    skills: skills,
                    errors: e.errors
                });
            });
        }

    }).catch((e) => {
        response.render("myprojects/project/position/edit", {
            projectId: projectId,
            errors: e.errors
        });
    });
});

router.get("/project/:id/recommend", loginRequired, (request, response) => {
    var url = "/user/myprojects/project/"+request.params.id+"/allpositions/recommend";
    response.render("myprojects/project/recommend/loading", {url: url});
});

router.get("/project/:id/recommend/:posId", loginRequired, (request, response) => {
    var url = "/user/myprojects/project/"+request.params.id+"/position/"+request.params.posId+"/recommend";
    response.render("myprojects/project/recommend/loading", {url: url});
});

router.get("/project/:id/allpositions/recommend", loginRequired, (request, response) => {
    // get recommendations for all positions
    var url = "http://" + config.RECOMMENDER_HOST + ":" + config.RECOMMENDER_PORT + "/recommend/project/" + request.params.id;
    winston.info("Calling recommender at " + url);

    var include = [{model: models.User, required: false}];
    models.Position.findAll({where: {ProjectId: parseInt(request.params.id), status: "open"}, include: include}).then(
        (positions) => {
            requestLib({url: url, json: true}, function (httpError, httpResponse, httpBody) {
                if (!httpError && httpResponse.statusCode === 200) {
                    winston.info(JSON.stringify(httpBody, null, 4)); // Print the json response
                    var json = JSON.parse(JSON.stringify(httpBody, null, 4));
                    response.render("myprojects/project/recommend/result", {recommendations: json, positions: positions});
                } else {
                    response.render("myprojects/project/recommend/result", {recommendations: {}, positions: positions});
                }
            });
        }
    );
});

router.get("/project/:id/position/:posId/recommend", loginRequired, (request, response) => {
    // get recommendations for a single position
    var url = "http://" + config.RECOMMENDER_HOST + ":" + config.RECOMMENDER_PORT + "/recommend/position/" + request.params.posId;
    winston.info("Calling recommender at " + url);

    var include = [{model: models.User, required: false}];
    models.Position.findAll({where: {id: parseInt(request.params.posId)}, include: include}).then(
        (positions) => {
            requestLib({url: url, json: true}, function (httpError, httpResponse, httpBody) {
                if (!httpError && httpResponse.statusCode === 200) {
                    winston.info(JSON.stringify(httpBody, null, 4)); // Print the json response
                    var json = JSON.parse(JSON.stringify(httpBody, null, 4));
                    var data = {};
                    data[""+request.params.posId] = json;
                    response.render("myprojects/project/recommend/result", {recommendations: data, positions: positions});
                } else {
                    response.render("myprojects/project/recommend/result", {recommendations: {}, positions: positions});
                }
            });
        }
    );
});

router.get("/recommendation/:posId/accept/:userId/:score", loginRequired, (request, response) => {
    var posId = parseInt(request.params.posId);
    var userId = parseInt(request.params.userId);
    var score = parseFloat(request.params.score);

    models.Position.update({UserId: userId, status: "consider", matchScore:score}, {where:{id:posId}}).then(() => {
        models.User.findById(userId).then((user) => {
            models.Position.findById(posId).then((position) => {
                var url = "http://"+config.LISTEN_HOST+":"+config.LISTEN_PORT+"/user/" + position.type.toLowerCase();
                request.app.locals.notificationManager.notifyUser(user, "You have been elected for a new position!", url);
            });
        });
        response.redirect("/user/myprojects");
    });
});

router.get("/project/:id/public", (request, response, next) => {
    var id = parseInt(request.params.id);

    models.Project.findById(id, {
        include: [
            {
                model: models.Position,
                include: [{model: models.Position_Skill, include: [models.Skill]}, {model: models.User}]
            },
            {model: models.User}
        ]
    }).then((project) => {
        if (project == null) {
            var err = new Error("project not found")
            err.status = 404;
            return next(err);
        } else {
            response.render("myprojects/project/profile", {project: project});
        }
    });
});

router.get("/project/:id/profilecontent", (request, response, next) => {
    var id = parseInt(request.params.id);

    models.Project.findById(id, {
        include: [
            {model: models.Position},
            {model: models.User}
        ]
    }).then((project) => {
        if (project == null) {
            var err = new Error("project not found")
            err.status = 404;
            return next(err);
        } else {
            response.render("myprojects/project/profilecontent", {project: project});
        }
    });
});

function inArray(arr, search) {
    for (var elem in arr) {
        if (elem === search) return true;
    }
    return false;
}

function assignUserManually(emailaddress, position) {
    models.User.findOne({
        where: {
            email: emailaddress
        }
    }).then((user) => {
        if (user && position) {
            position.updateAttributes({
                status: 'consider',
                UserId: user.id
            }).catch((e) => {
                winston.error(e);
            });
        } else {
            winston.error("assignUserManually failed!");
        }
    });
}

module.exports = router;