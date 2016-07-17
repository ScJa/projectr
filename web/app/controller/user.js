/**
 * User Controller
 * @module controller/user
 */

const winston = require("winston");

var express = require("express");
var sequelize = require("sequelize");
var models = require("../models");
var router = express.Router();
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var multer = require('multer');

var config = require("../config");

var loginRequired = require("../middleware/loginRequired");
var registerForm = require("../forms/user/registerForm");
var editForm = require("../forms/user/editForm");
var editHoursForm = require("../forms/user/editHoursForm");
var deleteForm = require("../forms/user/deleteForm");
var projectCreateForm = require("../forms/myprojects/createForm");
var registerDeveloperForm = require("../forms/user/registerDeveloperForm");
var registerDesignerForm = require("../forms/user/registerDesignerForm");
var bcrypt = require("bcryptjs");


const notifications = require("../util/notification.js");

/* for dev/designer registration and edit */
var formAction = {
    reg: {
        dev: "/user/register/develop",
        des: "/user/register/design"
    },
    edit: {
        dev: "/user/edit/develop",
        des: "/user/edit/design"
    }
};

passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

passport.deserializeUser((user_id, callback) => {
    models.User.findOne({where: {id: user_id}, include: [{model: models.Notification}]}).then((user) => {
        user.new_notifications = false;
        for(var i = 0; i < user.Notifications.length; i++) {
            if(!user.Notifications[i].read) {
                user.new_notifications = true;
                break;
            }
        }
        callback(null, user);
    });
});


passport.use(new LocalStrategy(
    (username, password, done) => {
        username = username.trim();
        models.User.findOne({where: {email: username}, include: [{model: models.Notification}]}).then((user) => {
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

var upload = multer({dest: 'app/resources/uploads/avatar', storage: config.AVATAR_STORAGE});

router.get("/notification", loginRequired, (request, response) => {
    request.app.locals.notificationManager.notifyUser(request.user, "qweqwe", "http://localhost:8855");
    response.send("Notification sent to user " + request.user.email);
});

router.get("/conversations", loginRequired, (request, response) => {
    var qry = 'SELECT *, u.id AS user_id FROM "Conversations" c INNER JOIN "Users" u ON (c.user1 = u.id OR c.user2 = u.id) AND u.id != '+request.user.id+' WHERE c.user1 = '+request.user.id+' OR c.user2 = '+request.user.id+';';

    models.sequelize.query(qry, { type: sequelize.QueryTypes.SELECT})
    .then(function(conversations) {
        response.render("user/conversations", {conversations: conversations});
    }); 
});

router.get("/conversations/:id(\\d+)", loginRequired, (request, response) => {
    var recipient_id = request.params.id;

    models.Conversation.findOne({
      where: {
          $or: [
              {user1: request.user.id, user2: recipient_id},
              {user2: request.user.id, user1: recipient_id}
          ]
      },
      include: [{model: models.ChatMessage, order: ["createdAt", "ASC"]}]
    })
    .then((conversation) => {
        models.User.findById(request.params.id).then((other_user) => {
          if(other_user) {
            response.render("user/conversation", {conversation: conversation, other_user: other_user});
          }
          else {
            response.render("error", {status: 404, message: "User not found!"})
          }
        })

    });
});

router.get("/", loginRequired, (request, response) => {
    var data = {
        projectOwner: {projects: 0, openPositions: 0, acceptedPositions: 0, consideringPositions: 0, rejectedPositions: 0},
        developer: {projects: 0, matchRequests: 0, hours: 0},
        designer: {projects: 0, matchRequests: 0, hours: 0}
    };

    var include = [{model: models.Position, required: false}];
    models.Project.findAll({where: {UserId: request.user.id}, include:include}).then(function (projects) {
        projects.forEach(function (project) {
            data.projectOwner.projects = data.projectOwner.projects + 1;
            project.Positions.forEach(function (position) {
                //"open","accepted","consider","rejected"
                if (position.status === 'open') {
                    data.projectOwner.openPositions = data.projectOwner.openPositions + 1;
                } else if (position.status === "accepted") {
                    data.projectOwner.acceptedPositions = data.projectOwner.acceptedPositions + 1;
                } else if (position.status === "consider") {
                    data.projectOwner.consideringPositions = data.projectOwner.consideringPositions + 1;
                } else if (position.status === "rejected") {
                    data.projectOwner.rejectedPositions = data.projectOwner.rejectedPositions + 1;
                }
            });
        });

        return models.Position.findAll({where: {UserId: request.user.id}});
    }).then(function (positions) {
        positions.forEach(function (position) {
            if (position.type === "Developer") {
                data.developer.projects = data.developer.projects + 1;
            } else if (position.type === "Designer") {
                data.designer.projects = data.designer.projects + 1;
            }
        });
        response.render("user/index", data);
    });
});

/* register user */

router.get("/register", (request, response) => {
    if (request.user)
        response.redirect("/user");
    else
        response.render("user/register");
});

router.get("/register/create", loginRequired, (request, response) => {

    var action;

    if(request.user.developer === true){
        action = "/user/register/develop";
    } else if(request.user.designer === true){
        action = "/user/register/design";
    } else {
        action = "/user";
    }

    response.render("user/register/create", {skipAction: action});
});

router.get("/register/develop", loginRequired, (request, response) => {

    var action;

    if(request.user.designer === true){
        action = "/user/register/design";
    } else {
        action = "/user";
    }

    request.session.origin = {path: formAction.reg.dev, skipAction: action};

    response.render("user/register/develop", {
        skipAction: action,
        siteInfo: {
            formAction: formAction.reg.dev,
            submitBtnText: request.i18n.__("Next")
        }
    });
});

router.get("/register/design", loginRequired, (request, response) => {

    request.session.origin = {path: formAction.reg.des};

    response.render("user/register/design", {
        siteInfo: {
            formAction: formAction.reg.des,
            submitBtnText: request.i18n.__("Next")
        }
    });
});


router.post("/register", registerForm, (request, response) => {
    var formData = request.form;
    var error;

    var hash = models.User.hashPassword(formData.password);
    formData.password = undefined;
    formData.passwordhash = hash;

    if (!bcrypt.compareSync(formData.repeatpassword, hash)) {
        // send error message
        error = {};
        error.path = "Password";
        error.message = "Passwords no match";

        winston.error("passwords do not match");
        response.status(400).render("user/register", {errors: [error]});
    } else {

        // check if at least one role is set
        if (formData.owner === false && formData.developer === false && formData.designer === false) {

            // send error message
            error = {};
            error.path = "Roles";
            error.message = "At least one role";

            winston.error("no role chosen");
            response.status(400).render("user/register", {errors: [error]});

        } else {
            models.User.create(formData).then((user) => {
                    // login user after successful registration
                    request.login(user, function (err) {
                        if (err) {
                            console.log(e);
                            response.status(400).render("user/register", {errors: e.errors});
                        }

                        // check user role and redirect accordingly
                        if (user.owner === true) {
                            response.redirect("/user/register/create");
                        } else if (user.developer === true) {
                            response.redirect("/user/register/develop");
                        } else if (user.designer == true) {
                            response.redirect("/user/register/design");
                        } else {
                            response.redirect("/user");
                        }
                    });
                }) .catch((e) => {
                    winston.error(e);
                    response.status(400).render("user/register", {errors: e.errors});
                });
         }
     }
});

router.post("/register/create", loginRequired, projectCreateForm, (request, response) => {
    request.form.UserId = request.user.id;
    request.form.status = "running";

    models.Project.create(request.form).then(() => {

        // check user role and redirect accordingly
        if (request.user.developer === true) {
            response.redirect("/user/register/develop");
        } else if (request.user.designer == true) {
            response.redirect("/user/register/design");
        } else {
            response.redirect("/user");
        }

    }).catch((e) => {
        winston.error(e);

        var action;

        if(request.user.developer === true){
            action = "/user/register/develop";
        } else if(request.user.designer === true){
            action = "/user/register/design";
        } else {
            action = "/user";
        }

        response.status(400).render("user/register/create", {errors: e.errors, skipAction: action});
    });
});

router.post("/register/develop", loginRequired, registerDeveloperForm, (request, response) => {

    /* save user skills */
    var userSkills = skillsToArray(request.body, request.user.id);

    // bulk insert skills
    if (userSkills.length !== 0) {
        models.User_Skill.bulkCreate(userSkills).then((skills) => {

            // check user role and redirect accordingly
            if (request.user.designer == true) {
                response.redirect("/user/register/design");
            } else {
                response.redirect("/user");
            }
        }).catch((e) => {
            winston.error(e);

            var action;

            if(request.user.designer === true){
                action = "/user/register/design";
            } else {
                action = "/user";
            }

            response.status(400).render("user/register/develop", {
                skipAction: action,
                errors: e.errors,
                siteInfo: {formAction: formAction.reg.dev, submitBtnText: request.i18n.__("Next")}
            });
        });
    } else {

        // send error message
        var error = {};
        error.path = "Skills";
        error.message = "Skills not empty";

        var action;

        if(request.user.designer === true){
            action = "/user/register/design";
        } else {
            action = "/user";
        }

        response.status(400).render("user/register/develop", {
            skipAction: action,
            errors: [error],
            siteInfo: {formAction: formAction.reg.dev, submitBtnText: request.i18n.__("Next")}
        });
    }
});

router.post("/register/design", loginRequired, registerDesignerForm, (request, response) => {

    /* save user skills */
    var userSkills = skillsToArray(request.body, request.user.id);

    // bulk insert skills
    if (userSkills.length !== 0) {
        models.User_Skill.bulkCreate(userSkills).then((skills) => {

            response.redirect("/user");

        }).catch((e) => {
            winston.error(e);
            response.status(400).render("user/register/develop", {
                errors: e.errors,
                siteInfo: {formAction: formAction.reg.des, submitBtnText: request.i18n.__("Next")}
            });
        });
    } else {

        // send error message
        var error = {};
        error.path = "Skills";
        error.message = "Skills not empty";

        response.status(400).render("user/register/design", {
            errors: [error],
            siteInfo: {formAction: formAction.reg.des, submitBtnText: request.i18n.__("Next")}
        });
    }
});

/* edit developer/designer */

router.get("/edit/develop", loginRequired, (request, response) => {
    var siteInfo = {
        formAction: formAction.edit.dev,
        submitBtnText: request.i18n.__("Save")
    };

    /* load user skills */
    models.User_Skill.findAll({
        include: [models.Skill],
        where: {UserId: request.user.id}
    }).then((dbSkills) => {

        if (!Array.isArray(dbSkills)) {
            dbSkills = [dbSkills];
        }

        // save skills to new array, because sequelize instances cannot be modified (lame...)
        var skills = [];

        dbSkills.forEach(function (dbSkill) {
            var skill = {};
            skill.id = dbSkill.SkillId;
            skill.level = dbSkill.weight * 4;
            skill.name = dbSkill.Skill.name;
            skills.push(skill);
        });

        request.session.origin = {path: siteInfo.formAction};

        response.render("user/edit/develop", {
            freeHours: request.user.free_hours,
            skills: skills,
            siteInfo: siteInfo
        });

    }).catch((e) => {
        request.session.origin.path = siteInfo.formAction;

        response.render("user/edit/develop", {siteInfo: siteInfo, errors: e.errors});
    });
});

router.get("/edit/design", loginRequired, (request, response) => {
    var siteInfo = {
        formAction: formAction.edit.des,
        submitBtnText: request.i18n.__("Save")
    };

    /* load user skills */
    models.User_Skill.findAll({
        include: [models.Skill],
        where: {UserId: request.user.id}
    }).then((dbSkills) => {

        if (!Array.isArray(dbSkills)) {
            dbSkills = [dbSkills];
        }

        // save skills to new array, because sequelize instances cannot be modified (lame...)
        var skills = [];

        dbSkills.forEach(function (dbSkill) {
            var skill = {};
            skill.id = dbSkill.SkillId;
            skill.level = dbSkill.weight * 4;
            skill.name = dbSkill.Skill.name;
            skills.push(skill);
        });

        request.session.origin = {path: siteInfo.formAction};

        response.render("user/edit/design", {
            freeHours: request.user.free_hours,
            skills: skills,
            siteInfo: siteInfo
        });

    }).catch((e) => {
        request.session.origin.path = siteInfo.formAction;

        response.render("user/edit/design", {siteInfo: siteInfo, errors: e.errors});
    });
});

router.post("/edit/develop", loginRequired, registerDeveloperForm, (request, response) => {

    /* save new skills */
    var newSkills = skillsToArray(request.body, request.user.id);

    /* update skills */
    if (newSkills.length !== 0) {

        /* load old user skills */
        models.User_Skill.findAll({
            include: [models.Skill],
            where: {UserId: request.user.id}
        }).then((dbSkills) => {

            if (!Array.isArray(dbSkills)) {
                dbSkills = [dbSkills];
            }

            // save skills to new array, because sequelize instances cannot be modified (lame...)
            var oldSkills = [];

            dbSkills.forEach(function (dbSkill) {
                var skill = {};
                skill.SkillId = dbSkill.SkillId;
                skill.weight = dbSkill.weight;
                skill.name = dbSkill.Skill.name;
                // for template engine in case of error
                skill.id = dbSkill.SkillId;
                skill.level = dbSkill.weight * 4;
                oldSkills.push(skill);
            });

            /* get skills which have to be deleted */
            var delSkillIDs = getSkillIDsToBeDeleted(newSkills, oldSkills);

            /* get skills which have to be added */
            var addSkills = getSkillsToBeAdded(newSkills, oldSkills);

            /* delete skills */
            models.User_Skill.destroy({
                where: {
                    SkillId: delSkillIDs,
                    UserId: request.user.id
                }
            }).then((rowsDel) => {
                // check if all designated rows have been deleted
                if(rowsDel != delSkillIDs.length){
                    winston.error("number of deleted rows does not match!");
                    winston.error("deleted: " + rowsDel + ", to be deleted: " + delSkillIDs.length);

                    // send error message
                    var error = {};
                    error.path = "Skills";
                    error.message = "Delete error";

                    response.status(400).render("user/edit/develop", {
                        skills: oldSkills,
                        errors: [error],
                        siteInfo: {
                            formAction: formAction.edit.dev,
                            submitBtnText: request.i18n.__("Save")
                        }
                    });

                } else{
                    /* add skills */
                    models.User_Skill.bulkCreate(addSkills).then((skills) => {

                        // redirect and load updated skills
                        response.redirect("/user/edit/develop");

                    }).catch((e) => {
                        response.status(400).render("user/edit/develop", {
                            skills: oldSkills,
                            errors: e.errors,
                            siteInfo: {
                                formAction: formAction.edit.dev,
                                submitBtnText: request.i18n.__("Save")
                            }
                        });
                    });
                }

            }).catch((e) => {
                response.status(400).render("user/edit/develop", {
                    skills: oldSkills,
                    errors: e.errors,
                    siteInfo: {
                        formAction: formAction.edit.dev,
                        submitBtnText: request.i18n.__("Save")
                    }
                });
            });

        }).catch((e) => {
            response.render("user/edit/develop", {
                siteInfo: {
                    formAction: formAction.edit.dev,
                    submitBtnText: request.i18n.__("Save")
                }, errors: e.errors});
        });

    } else {

        // send error message
        var error = {};
        error.path = "Skills";
        error.message = "Skills not empty";

        /* load user skills */
        models.User_Skill.findAll({
            include: [models.Skill],
            where: {UserId: request.user.id}
        }).then((dbSkills) => {

            if (!Array.isArray(dbSkills)) {
                dbSkills = [dbSkills];
            }

            // save skills to new array, because sequelize instances cannot be modified (lame...)
            var skills = [];

            dbSkills.forEach(function (dbSkill) {
                var skill = {};
                skill.id = dbSkill.SkillId;
                skill.level = dbSkill.weight * 4;
                skill.name = dbSkill.Skill.name;
                skills.push(skill);
            });

            response.status(400).render("user/edit/develop", {
                skills: skills,
                errors: [error],
                siteInfo: {
                    formAction: formAction.edit.dev,
                    submitBtnText: request.i18n.__("Save")
                }
            });
        }).catch((e) => {
            response.render("user/edit/develop", {
                siteInfo: {
                    formAction: formAction.edit.dev,
                    submitBtnText: request.i18n.__("Save")
                }, errors: e.errors});
        });
    }
});

router.post("/edit/design", loginRequired, registerDesignerForm, (request, response) => {

    /* save new skills */
    var newSkills = skillsToArray(request.body, request.user.id);

    /* update skills */
    if (newSkills.length !== 0) {

        /* load old user skills */
        models.User_Skill.findAll({
            include: [models.Skill],
            where: {UserId: request.user.id}
        }).then((dbSkills) => {

            if (!Array.isArray(dbSkills)) {
                dbSkills = [dbSkills];
            }

            // save skills to new array, because sequelize instances cannot be modified (lame...)
            var oldSkills = [];

            dbSkills.forEach(function (dbSkill) {
                var skill = {};
                skill.SkillId = dbSkill.SkillId;
                skill.weight = dbSkill.weight;
                skill.name = dbSkill.Skill.name;
                // for template engine in case of error
                skill.id = dbSkill.SkillId;
                skill.level = dbSkill.weight * 4;
                oldSkills.push(skill);
            });

            /* get skills which have to be deleted */
            var delSkillIDs = getSkillIDsToBeDeleted(newSkills, oldSkills);

            /* get skills which have to be added */
            var addSkills = getSkillsToBeAdded(newSkills, oldSkills);

            /* delete skills */
            models.User_Skill.destroy({
                where: {
                    SkillId: delSkillIDs,
                    UserId: request.user.id
                }
            }).then((rowsDel) => {
                // check if all designated rows have been deleted
                if(rowsDel != delSkillIDs.length){
                    winston.error("number of deleted rows does not match!");
                    winston.error("deleted: " + rowsDel + ", to be deleted: " + delSkillIDs.length);

                    // send error message
                    var error = {};
                    error.path = "Skills";
                    error.message = "Delete error";

                    response.status(400).render("user/edit/design", {
                        skills: oldSkills,
                        errors: [error],
                        siteInfo: {
                            formAction: formAction.edit.des,
                            submitBtnText: request.i18n.__("Save")
                        }
                    });

                } else{
                    /* add skills */
                    models.User_Skill.bulkCreate(addSkills).then((skills) => {

                        // redirect and load updated skills
                        response.redirect("/user/edit/design");

                    }).catch((e) => {
                        response.status(400).render("user/edit/design", {
                            skills: oldSkills,
                            errors: e.errors,
                            siteInfo: {
                                formAction: formAction.edit.des,
                                submitBtnText: request.i18n.__("Save")
                            }
                        });
                    });
                }

            }).catch((e) => {
                response.status(400).render("user/edit/design", {
                    skills: oldSkills,
                    errors: e.errors,
                    siteInfo: {
                        formAction: formAction.edit.des,
                        submitBtnText: request.i18n.__("Save")
                    }
                });
            });

        }).catch((e) => {
            response.render("user/edit/design", {
                siteInfo: {
                    formAction: formAction.edit.des,
                    submitBtnText: request.i18n.__("Save")
                }, errors: e.errors});
        });

    } else {

        winston.info(">> no skills given!");

        // send error message
        var error = {};
        error.path = "Skills";
        error.message = "Skills not empty";

        /* load user skills */
        models.User_Skill.findAll({
            include: [models.Skill],
            where: {UserId: request.user.id}
        }).then((dbSkills) => {

            if (!Array.isArray(dbSkills)) {
                dbSkills = [dbSkills];
            }

            // save skills to new array, because sequelize instances cannot be modified (lame...)
            var skills = [];

            dbSkills.forEach(function (dbSkill) {
                var skill = {};
                skill.id = dbSkill.SkillId;
                skill.level = dbSkill.weight * 4;
                skill.name = dbSkill.Skill.name;
                skills.push(skill);
            });

            response.status(400).render("user/edit/design", {
                skills: skills,
                errors: [error],
                siteInfo: {
                    formAction: formAction.edit.des,
                    submitBtnText: request.i18n.__("Save")
                }
            });
        }).catch((e) => {
            response.render("user/edit/design", {
                siteInfo: {
                    formAction: formAction.edit.des,
                    submitBtnText: request.i18n.__("Save")
                }, errors: e.errors});
        });
    }
});
 
router.get("/login", (request, response) => {
    response.render("user/login");
});

router.post("/login", passport.authenticate("local", {successRedirect: "/user", failureRedirect: "/user/login"}));

router.get("/logout", (request, response) => {
    request.logout();
    response.redirect('/');
});

router.get("/edit", loginRequired, (request, response) => {
    models.LinkedServices.findAll({where:{UserId:request.user.id}}).then((services) => {
        response.render("user/edit/general", {linkedServices: services});
    }).catch((e) => {
        response.render("user/edit/general", {errors: e.errors});
    });
});

router.post("/edit", loginRequired, editForm, (request, response) => {
    console.log(request.form);

    models.User.update(request.form, {where:{id:request.user.id}}).then(() => {
        response.redirect("/user/edit");
    }).catch((e) => {
        response.render("user/edit/general", {errors: e.errors});
    });
});

router.post("/edit/hours", loginRequired, editHoursForm, (request, response) => {
    console.log(request.form);

    models.User.update(request.form, {where:{id:request.user.id}}).then(() => {
        response.redirect("/user/edit");
    }).catch((e) => {
        response.render("user/edit/general", {errors: e.errors});
    });
});

router.post("/delete", loginRequired, deleteForm, (request, response) => {
    if (request.user.validPassword(request.form.password)) {
        models.User.findById(request.user.id).then((user) => {
            user.destroy();
            request.logout();
            response.redirect('/');
        }).catch((e) => {
            response.render("user/edit/delete", {errors: e.errors});
        });
    } else {
        response.render("user/edit/delete", {errors: [{message: "Password wrong."}]});
    }
});

router.get("/upload-avatar", loginRequired, (request, response) => {
    response.render("user/uploadAvatar");
});

router.post("/upload-avatar", loginRequired, upload.single('avatar'), (request, response) => {
    request.user.avatar = request.file.filename;
    request.user.save().then(() => {
        response.render("user/uploadAvatar");
    });
});

router.get("/:id(\\d+)/", loginRequired, (request, response, next) => {
    var id = parseInt(request.params.id);

    models.User.findById(id, {
        include: [
            {model: models.User_Skill, include: [models.Skill]},
            {model: models.Project},
            {model: models.Position, include: [models.Project]},
            {model: models.Rating},
            {model: models.LinkedServices}
        ]
    }).then((user) => {
        if (user == null) {
            var err = new Error("user not found")
            err.status = 404;
            return next(err);
        } else {
            var average = 0;
            for (var i = 0; i < user.Ratings.length; i++) {
                average += user.Ratings[i].rating;
            }
            user.average = average / i;
            console.log(user.average);
            response.render("user/profile", {profile_user: user});
        }
    });
});

router.get("/profileShort/:id(\\d+)", loginRequired, (request, response, next) => {
    var id = parseInt(request.params.id);

    models.User.findById(id, {
        include: [
            {model: models.Position},
            {model: models.Rating}
        ]
    }).then((user) => {
        if (user == null) {
            var err = new Error("user not found")
            err.status = 404;
            return next(err);
        } else {
            var average = 0;
            for (var i = 0; i < user.Ratings.length; i++) {
                average += user.Ratings[i].rating;
            }
            user.average = average / i;
            response.render("user/profileShort", {user: user});
        }
    });
});

router.post("/rate", loginRequired, (request, response) => {
    models.Rating.find({where: {PositionId: request.body.positionId}}).then((rating) => {
        if (rating)
            models.Rating.update({
                    rating: request.body.rating,
                    PositionId: request.body.positionId,
                    UserId: request.body.userId,
                    // TODO still needed? has to be not null
                    feedback: "test"
                },
                {
                    where: {PositionId: request.body.positionId}
                }).then((rating) => {
                response.status(200).send(rating);
            }).catch((e) => {
                response.status(400).send(e.errors);
            });
        else
            models.Rating.create({
                rating: request.body.rating,
                PositionId: request.body.positionId,
                UserId: request.body.userId,
                // TODO still needed? has to be not null
                feedback: "test"
            }).then((rating) => {
                response.status(200).send(rating);
            }).catch((e) => {
                response.status(400).send(e.errors);
            });
    });
});

/* puts all the given skills from different levels into one array with according weight */
var skillsToArray = function(levels, userId){
    var userSkills = [];

    var level_4 = levels.level_4;
    var level_3 = levels.level_3;
    var level_2 = levels.level_2;
    var level_1 = levels.level_1;

    // extract and format level 4 skills
    if (level_4 !== undefined) {
        if (!Array.isArray(level_4)) {
            level_4 = [level_4];
        }

        level_4.forEach(function (skill) {
            userSkills.push({weight: 1.0, UserId: userId, SkillId: skill});
        });
    }

    // extract and format level 3 skills
    if (level_3 !== undefined) {
        if (!Array.isArray(level_3)) {
            level_3 = [level_3];
        }

        level_3.forEach(function (skill) {
            userSkills.push({weight: 0.75, UserId: userId, SkillId: skill});
        });
    }

    // extract and format level 2 skills
    if (level_2 !== undefined) {
        if (!Array.isArray(level_2)) {
            level_2 = [level_2];
        }

        level_2.forEach(function (skill) {
            userSkills.push({weight: 0.5, UserId: userId, SkillId: skill});
        });
    }

    // extract and format level 1 skills
    if (level_1 !== undefined) {
        if (!Array.isArray(level_1)) {
            level_1 = [level_1];
        }

        level_1.forEach(function (skill) {
            userSkills.push({weight: 0.25, UserId: userId, SkillId: skill});
        });
    }

    return userSkills;
};

/* compares the new vs old skills and returns an array with skills to be deleted */
var getSkillIDsToBeDeleted = function(newSkills, oldSkills){

    var delSkills = [];

    oldSkills.forEach(function(oldSkill){

        var i = 0;
        newSkills.forEach(function(newSkill){

            if(newSkill.SkillId == oldSkill.SkillId && newSkill.weight == oldSkill.weight){
                return;
            }
            i++;
        });

        /* skill is not in the new skills anymore -> delete it */
        if(newSkills.length === i){
            console.log(">> del: " + oldSkill.SkillId + ", " + oldSkill.name + ", w: " + oldSkill.weight);
            delSkills.push(oldSkill.SkillId);
        }
    });

    return delSkills;
};

var getSkillsToBeAdded = function(newSkills, oldSkills){

    var addSkills = [];

    newSkills.forEach(function(newSkill){

        var i = 0;
        oldSkills.forEach(function(oldSkill){

            if(newSkill.SkillId == oldSkill.SkillId && newSkill.weight == oldSkill.weight){
                return;
            }
            i++;
        });

        /* skill is not in the old skills -> add it */
        if(oldSkills.length === i){
            console.log(">> add: " + newSkill.SkillId + ", w: " + newSkill.weight);
            addSkills.push(newSkill);
        }
    });

    return addSkills;
};

module.exports = router;
