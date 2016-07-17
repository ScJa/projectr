var form = require("express-form"),
    field = form.field;

module.exports = form(
    field("name").trim(),
    field("short_description").trim(),
    field("public_description").trim(),
    field("private_description").trim(),
    field("budget").required().toFloat()
);