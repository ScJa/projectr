/**
 * Created by stefan on 10.06.16.
 */

var sequelize = require("sequelize");
var models = require("../models");
var winston = require("winston");

function findOrCreateAndLogin(userData, serviceId, serviceUserId, access_token, refreshToken, serviceData, request, response) {
    var linkedServiceData = {
        service_id:serviceId, token: access_token, refreshToken: refreshToken,
        serviceUserId: serviceUserId, data: JSON.stringify(serviceData)
    };

    if (request.user) {
        updateLinkedServiceLogin(request.user, request, response, false, linkedServiceData);

    } else {
        //noinspection JSUnresolvedFunction
        // models.User.findOne({ where: {email: userData.email}}).then((user) => {
        //     if (user) { // exists -> login
        //         updateLinkedServiceLogin(user, request, response, false, linkedServiceData);
        //
        //     } else {  // look in linked services table
        models.LinkedServices.findOne({ where: {serviceUserId: serviceUserId}, include: models.User}).then((linkedAccount) => {
            if (linkedAccount) { // exists -> login
                updateLinkedServiceLogin(linkedAccount.User, request, response, false, linkedServiceData);
            } else {// no user exists -> create -> login
                createUserUpdateLinkedServiceLogin(userData, linkedServiceData, access_token, request, response);
            }
        });
        //     }
        // });
    }
}

function createUserUpdateLinkedServiceLogin(userData, linkedServiceData, accessToken, request, response) {
    userData.passwordhash = accessToken;
    models.User.create(userData).then((user) => {
        winston.info(user);
        updateLinkedServiceLogin(user, request, response, true, linkedServiceData);
    }).catch((e) => {
        winston.error(e);
        response.status(400).render("user/register");
    });
}

function updateLinkedServiceLogin(user, request, response, newUser, linkedServiceData) {
    var serviceId = linkedServiceData.serviceId;
    linkedServiceData.UserId = user.id;

    models.LinkedServices.findOne({where: {UserId: user.id, service_id: serviceId}}).then((linkedService) => {
        if(linkedService) {
            models.LinkedServices.update(linkedServiceData, {where: {UserId: user.id, service_id: serviceId}}).then(()=>{
                login(user, request, response, newUser);
            });
        } else {
            models.LinkedServices.create(linkedServiceData).then(() => {
                login(user, request, response, newUser);
            });
        }
    }).catch((e) => {
        winston.error(e);
        response.status(400).render("user/register");
    });
}

function login(user, request, response, newUser) {
    // login user after successful registration
    request.login(user, function (err) {
        if (err) {
            winston.error(err);
            response.status(400).render("user/register", {errors: err.errors});

        } else if (newUser) {
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

        } else {
            response.redirect("/user");
        }
    });
}

function insertUserSkills(user, serviceId, serviceUserId, serviceData, accessToken, languages, callback){
    winston.info("serviceUserId: " + serviceUserId);

    models.LinkedServices.update(
        {token: accessToken, serviceUserId: serviceUserId, data: JSON.stringify(serviceData)},
        {where:{UserId: user.id, service_id: serviceId}}
    );

    winston.info("languages array in Callback: " + JSON.stringify(languages));

    // remove duplicates with use of set
    var langs = Array.from(new Set(languages));
    var skills = [];
    var count = 0;
    /* create or find imported skill */
    langs.forEach(function (lang) {
        if(lang != null || lang != "") {
            models.Skill.findOrCreate({where: {name: lang}}).spread(function(skill, created){
                console.log(skill.get({
                    plain: true
                }));
                console.log(created);

                skills.push({id: skill.id, name: skill.name});
                count++;

                if(count == langs.length){
                    returnImportedSkills(callback, skills);
                }
            }).catch((e) => {
                winston.error(e);
            });
        }
    });
}

function returnImportedSkills(callback, skills){
    console.log(skills);

    callback(skills);
}


function loginOrCreateUser(req, res, access_token, oauth_access_token_secret, serviceId, getUserDataFunction) {
    getUserDataFunction(access_token, oauth_access_token_secret, function(serviceUserId, userData, allData, languages){
        winston.debug(languages);
        findOrCreateAndLogin(userData, serviceId, serviceUserId, access_token, oauth_access_token_secret, allData, req, res);
    });
}

function loadSkills(req, res, access_token, oauth_access_token_secret, serviceId, getUserDataFunction) {
    var user = req.user;

    models.LinkedServices.findOne({where: {UserId: user.id, service_id: serviceId}}).then((linkedService) => {
        if(!linkedService) {
            var newLS = {UserId: user.id, token: access_token, service_id: serviceId};
            models.LinkedServices.create(newLS).then((linkedService) => {});
        } else {
            models.LinkedServices.update({token: access_token}, {where: {UserId: user.id, service_id: serviceId}});
        }

        getUserDataFunction(access_token, oauth_access_token_secret, function (serviceUserId, userData, allData, languages) {
            insertUserSkills(user, serviceId, serviceUserId, allData, access_token, languages, function (skills) {

                // choose template to render
                console.log(req.session.origin);
                var formAction = req.session.origin.path;

                var submitBtnText = (formAction.indexOf("register") == -1) ? req.i18n.__("Save") : req.i18n.__("Next");

                var skipAction = (req.session.origin.skipAction == undefined) ? "" : req.session.origin.skipAction;

                /* load user skills */
                models.User_Skill.findAll({
                    include: [models.Skill, models.User],
                    where: {UserId: user.id}
                }).then((dbSkills) => {

                    if (!Array.isArray(dbSkills)) {
                        dbSkills = [dbSkills];
                    }

                    // save skills to new array, because sequelize instances cannot be modified (lame...)
                    var userSkills = [];

                    dbSkills.forEach(function (dbSkill) {
                        userSkills.push({id: dbSkill.SkillId, level: dbSkill.weight * 4, name: dbSkill.Skill.name});
                    });

                    console.log(userSkills);

                    /* send all the data to the front-end */
                    res.render(req.session.origin.path.substr(1), {
                        skipAction: skipAction,
                        importedSkills: skills,
                        skills: userSkills,
                        siteInfo: {
                            formAction: formAction,
                            submitBtnText: submitBtnText
                        }
                    });

                }).catch((e) => {
                    winston.error(e);

                    res.render("user/edit/develop", {
                        skipAction: skipAction,
                        importedSkills: skills,
                        siteInfo: {
                            formAction: formAction,
                            submitBtnText: submitBtnText
                        },
                        errors: e.errors
                    });
                });
            });
        });
    });
}


module.exports = {
    loadSkills,
    loginOrCreateUser
};