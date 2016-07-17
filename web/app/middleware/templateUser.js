/**
 * A simple middleware that passes the current user to the templates.
 * @module templateUser
 */

module.exports = (req, res, next) => {
    if(req.user !== undefined) {
      res.locals.user = req.user;
    }
    else {
      res.locals.user = {
          isAnonymous: () => {return true}
      }
    }
    next();
}