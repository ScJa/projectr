/**
 * User Controller
 * @module controller/admin
 */

var express = require("express");
var models = require("../models");
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var adminRequired = require("../middleware/adminRequired");

router.use(adminRequired);

router.get("/", (req, res) => {
    res.render("admin/index");
});

router.get("/skills", (req, res) => {
    models.Skill.findAll().then((skills) => {
        res.render("admin/skills", {skills : skills});
    })
});

router.post("/addSkill", (req, res) => {
    parent = isNaN(parseInt(req.body.parentSkillId)) ? null : parseInt(req.body.parentSkillId);

    models.Skill.findOne(
        {where: {name: req.body.name.toUpperCase()}}

    ).then((skill) => {

        if (skill === null) {
            models.Skill.create(
                {"name": req.body.name.toUpperCase(), "parent_Skill_id": parent}
            ).then(
                () => {res.redirect(201, "/admin/skills");}
            );

        } else {
            skill.update(
                {"parent_Skill_id": parent}
            ).then(
                () => { res.redirect(201, "/admin/skills");}
            );
        }

    });

});

module.exports = router;