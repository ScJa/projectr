/**
 * A simple middleware that redirects the user to the frontpage if he is not an admin
 * @module loginRequired
 */

module.exports = (req, res, next) => {
    if(req.user === undefined || req.user.admin === false) {
        res.status(403).render("error", {message: "Not an admin or not logged in!", status: 403})
    }
    else {
        next();
    }
}