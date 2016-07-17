const passportSocketIo = require("passport.socketio");
const models = require("../models");

var Notification = function (socketIO) {
    this.socketIO = socketIO;
};

Notification.prototype.notifyUser = function (user, message, url) {
    models.Notification.create({content: message, UserId: user.id, url: url}).then((notification) => {
        passportSocketIo.filterSocketsByUser(this.socketIO, function(socketUser){
            return socketUser.id === user.id;
        }).forEach(function(socket){
            socket.emit("notification", message);
        });
    });
};

module.exports = Notification;
