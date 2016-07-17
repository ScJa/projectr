const passportSocketIo = require("passport.socketio");
const models = require("../models");

var Chat = function (socketIO) {
    this.socketIO = socketIO;
};

Chat.prototype.newMessage = function(conversation, msg, user) {
  models.ChatMessage.create({content: msg.content, ConversationId: conversation.id, UserId: user.id}).then((message) => {
      console.log("sent");
      console.log(msg);
      passportSocketIo.filterSocketsByUser(this.socketIO, function(socketUser){
          return socketUser.id === parseInt(msg.receiver);
      }).forEach(function(socket){
          console.log("qweqweqwe");
          socket.emit("chat-message", message);
      });
  });
};

Chat.prototype.sendMessage = function (user, message) { // the user is sending, the receiver-id is in message
    models.Conversation.findOne({where:{
        $or: [
            {user1: user.id, user2: message.receiver},
            {user2: user.id, user1: message.receiver}
        ]
    }})
    .then((conversation) => {
        console.log(conversation);
        if(!conversation) {
            models.Conversation.create({user1: user.id, user2: message.receiver}).then((conversation) => {
                this.newMessage(conversation, message, user);
            });
        } else {
            this.newMessage(conversation, message, user);
        }
    });
};

module.exports = Chat;
