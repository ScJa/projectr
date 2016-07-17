/**
 * This initializes and configures all things needed for the application. Also serves the index route.
 * @module app
 */

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const nunjucks = require("express-nunjucks");
const winston = require("winston");
const i18n = require("i18n-2");

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const templateUser = require("./middleware/templateUser");
const errorHandler = require("./middleware/errorHandler");
const models = require("./models");
const config = require("./config.js");
const NotificationManager = require("./util/notification.js");
const ChatManager = require("./util/chat.js");
const passportSocketIo = require("passport.socketio");
const RedisStore = require('connect-redis')(session);

const sessionStore = new RedisStore({
    host: "",
    port: 6379,
    pass: ""
});

const app = express();

i18n.expressBind(app, {locales: ["en", "de"], directory: __dirname + "/resources/locales", extension: ".json"});

// i18n object in requests
app.use(function(req, res, next) {
    req.i18n.setLocaleFromCookie();
    next();
});

// Log Settings
winston.level = config.LOG_LEVEL;
winston.add(winston.transports.File, {filename: "logs/app.log", json: false});
winston.info("App started");

// Misc Middlewares
app.use(methodOverride());

// Static files
app.use(express.static(__dirname + "/resources"));

// Template Setup
app.set("view engine", "html");
app.set("views", __dirname + "/templates");
nunjucks.setup(config.NUNJUCKS_CONFIG, app);

// Body Parsing
app.use(bodyParser.urlencoded({extended: true}));

// Sessions & Users
app.use(cookieParser());
sessionMiddleware = session({
      secret: "thisissupersecrettotallyrandomgenerated",
      resave: false,
      saveUninitialized: false,
      store: sessionStore
  });
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(templateUser);

// Index Route
app.get("/", (req, res) => {
    res.render("index");
});

// Module Loading
app.use("/user", require("./controller/user"));
app.use("/user/myprojects", require("./controller/myprojects"));
app.use("/user/developer", require("./controller/developer"));
app.use("/user/designer", require("./controller/designer"));
app.use("/skills", require("./controller/skills"));
app.use("/admin", require("./controller/admin"));
app.use("/xing", require("./linkedServices/xingNew"));
app.use("/linkedin", require("./linkedServices/linkedin"));
app.use("/github", require("./linkedServices/github"));
app.use("/deviantart", require("./linkedServices/deviantart"));

// Error Handling
app.use(errorHandler);

// Start DB & Server
var server = app.listen(config.LISTEN_PORT, () => {
    winston.info("App started: http://localhost:" + config.LISTEN_PORT); // eslint-disable-line no-console
    winston.info("Express server listening on port " + server.address().port);
});

// Websockets
const io = require('socket.io').listen(server);
io.use(passportSocketIo.authorize({
    key:    'connect.sid',       //the cookie where express (or connect) stores its session id.
    secret: 'thisissupersecrettotallyrandomgenerated', //the session secret to parse the cookie
    store:   sessionStore,     //the session store that express uses
    fail: function(data, message, error, accept) {
        accept(null, false);
    },
    success: function(data, accept) {
        accept(null, true);
    }
}));

var chatManager = new ChatManager(io);
io.on("connection", (socket) => {
    socket.on("message-sent", (message) => {
        chatManager.sendMessage(socket.request.user, message);
    });
    socket.on("clearNotifications", (_) => {
        models.Notification.destroy({
            where: {UserId: socket.request.user.id}
        });
    });
    socket.on("readNotifications", (_) => {
        models.Notification.update(
            { read: true },
            { 
                fields: ['read'],
                where: {UserId: socket.request.user.id}
            }
        );
    });
});

app.locals.notificationManager = new NotificationManager(io);

process.on('uncaughtException', function (err) {
    winston.error("An uncaught exception occurred. Node.js was prevented from exiting. The error was:\n"+err.stack);
});

module.exports = server;
