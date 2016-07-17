"use strict";

var bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define("User", {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        passwordhash: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        owner: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        designer: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        developer: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        free_hours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                len: [1,10]
            }
        },

        avg_rating_owner: {
            type: DataTypes.FLOAT,
            allowNull: true

        },

        avg_rating_developer: {
            type: DataTypes.FLOAT,
            allowNull: true

        },

        avg_rating_designer: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                isDecimal: true,
                min: 0.01,
                len: [1,10]
            }
        },

        price_per_hour: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                len: [1,10]
            }
        }
    },

    {
        deletedAt: 'deletedAt',
        paranoid: true,

        instanceMethods: {
            validPassword: function (password) {
                return bcrypt.compareSync(password, this.passwordhash);
            },

            isAnonymous: function() {
                return false;
            },

            getAvatar: function(height, width) {
                var fallback = "/images/default.png";
                var url = fallback;
                if(this.avatar && this.avatar !== "") {
                    url = "/uploads/avatar/" + this.avatar;
                }
                var style = 'class="circle" style="height: '+height+'px; width: '+width+'px"';
                return '<object data="'+url+'" type="image/png" '+style+'><img src="'+fallback+'" '+style+'></object>';
            }
        },

        classMethods: {
            associate: (models) => {
                User.hasMany(models.LinkedServices);
                User.hasMany(models.Position);
                User.hasMany(models.User_Skill);
                User.hasMany(models.Rating);
                User.hasMany(models.Project);
                User.hasMany(models.Notification);
                User.hasMany(models.ChatMessage);
            },

            hashPassword: (password) => {
                if(password == "") {
                    return "";
                }

                return bcrypt.hashSync(password, 10);
            }
        }
    }

    );


    return User;
};
