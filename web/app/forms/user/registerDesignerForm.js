var form = require("express-form"),
    field = form.field;

module.exports = form(
    field("free_hours").trim()
);