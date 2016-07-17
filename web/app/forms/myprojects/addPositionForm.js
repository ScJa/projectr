var form = require("express-form"),
    field = form.field;

module.exports = form(
    field("name").required().trim(),
    field("hours").required().toInt(),
    field("type").required().trim(),
    field("budget").required().toFloat()
);