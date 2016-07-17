"use strict";

module.exports = (sequelize, DataTypes) => {
    var Notification = sequelize.define('Notification',
        {
            content: {
                type: DataTypes.STRING,
                allowNull: false
            },

            read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            url: {
                type: DataTypes.STRING,
                allowNull: false
            }

        },
        {
            deletedAt: 'deletedAt',
            paranoid: true,

            instanceMethods: {
                getFormattedDate: function () {
                    return this.createdAt.toDateString();
                }
            },

            classMethods: {
                associate: (models) => {
                    Notification.belongsTo(models.User, {as: 'parent_User', foreignKey:'UserId'});
                }
            }
        }
    );

    return Notification;
};
