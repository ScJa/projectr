"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");

var config = require("../config.js");
var sequelize = new Sequelize(config.DATABASE_NAME, config.DATABASE_USER, config.DATABASE_PASSWORD, config.DATABASE_CONFIG);
var db = {};

fs
    .readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach((file) => {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;