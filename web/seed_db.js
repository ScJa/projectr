//const models = require("./app/models");
"use strict";
const models = require("./app/models");
const fixtures = require("./app/tests/data/sampledata")

var sequelize_fixtures = require("sequelize-fixtures"),
    modelDict = {
        User: require("./app/models/user"),
        LinkedServices: require("./app/models/linkedServices"),
        Position: require("./app/models/position"),
        Position_Skill: require("./app/models/position_skill"),
        Project: require("./app/models/project"),
        Rating: require("./app/models/rating"),
        Skill: require("./app/models/skill"),
        User_Skill: require("./app/models/user_skill")
    };

models.sequelize.sync( {force:true} ).then(() => {
    sequelize_fixtures.loadFixtures(fixtures, models).then(function(){
        console.dir("Data created succesfully");
    });
});