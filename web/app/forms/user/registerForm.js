var form = require("express-form"),
    field = form.field;

module.exports = form(
    field("first_name").trim(),
    field("last_name").trim(),
    field("email").trim(),
    field("owner").toBoolean(),
    field("designer").toBoolean(),
    field("developer").toBoolean(),
    field("password").trim(),
    field("repeatpassword").trim()
);