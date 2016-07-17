"use strict";

module.exports = (sequelize, DataTypes) => {
    var ChatMessage = sequelize.define('ChatMessage', {
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        deletedAt: 'deletedAt',
        paranoid: true,

        classMethods: {
            associate: (models) => {
                ChatMessage.belongsTo(models.Conversation, {as: 'conversation', foreignKey:'ConversationId'});
                ChatMessage.belongsTo(models.User, {as: 'user', foreignKey:'UserId'});
            }
        }
    }
    );
    return ChatMessage;
};
