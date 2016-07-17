var form = require("express-form"),
    field = form.field;

module.exports = form(
    field("name").trim(),
    field("hours").trim(),
    field("type").trim(),
    field("budget").trim(),
    field("level_4").array().toInt(),
    field("level_3").array().toInt(),
    field("level_2").array().toInt(),
    field("level_1").array().toInt(),
    field("email").trim()
);