/**
 * A simple middleware that redirects the user to the login if he is not logged in. Perfect for requiring a logged in user.
 * @module loginRequired
 */

module.exports = (req, res, next) => {
    if(req.user === undefined) {
        res.redirect("/user/login");
    } else {
        next();
    }
}