
var winston = require("winston");

module.exports = function (err, req, res, next) {
    if (err.status === undefined) {
        winston.error(err);
        res.status(403).render("error", {status: 403, message: "Internal Server Error"})
    }
    else {
        res.status(err.status).render("error", {status: err.status, message: err.message})
    }
};