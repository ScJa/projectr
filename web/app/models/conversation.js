"use strict";

module.exports = (sequelize, DataTypes) => {
    var Conversation = sequelize.define('Conversation', {

        user1: {
          type: DataTypes.INTEGER,
          allowNull: false
        },

        user2: {
          type: DataTypes.INTEGER,
          allowNull: false
        }

    },
    {
        deletedAt: 'deletedAt',
        paranoid: true,

        classMethods: {
            associate: (models) => {
                Conversation.hasMany(models.ChatMessage);
            }
        }

    }
    );
    return Conversation;
};
