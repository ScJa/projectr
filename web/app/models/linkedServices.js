/**
 * Created by bernd on 12.04.16.
 */

"use strict";

module.exports = (sequelize, DataTypes) => {
    var LinkedServices = sequelize.define('LinkedServices', {
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },

        service_id: {
            type: DataTypes.ENUM("GitHub","DeviantArt","LinkedIn","XING"),
            allowNull: false
        },

        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true
        },

        serviceUserId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: true
        }

    },
        {
            deletedAt: 'deletedAt',
            paranoid: true,

            classMethods: {
                associate: (models) => {
                    LinkedServices.belongsTo(models.User, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });

                }
            },

            instanceMethods: {
                getProfileUrl: function() {
                    var json = this.getDataJson();
                    if (json == null) {
                        return null;

                    } else if (this.service_id === "GitHub") {
                        return "https://github.com/"+json["login"];

                    } else if (this.service_id === "DeviantArt") {
                        return "http://deviantart.com";

                    } else if (this.service_id === "LinkedIn") {
                        return "https://at.linkedin.com/";

                    } else if (this.service_id === "XING") {
                        return "https://www.xing.com/";

                    } else {
                        return null;
                    }
                },
                
                getDataJson: function () {
                    if (this.data && this.data != "") {
                        return JSON.parse(this.data);
                    } else {
                        return null;
                    }
                },
                
                getCustomData: function () {
                    var json = this.getDataJson();
                    var data = {};
                    if (json == null) return data;

                    if (this.service_id === "GitHub") {
                        if ("public_repos" in json) data["Repositories"] = json["public_repos"];
                        if ("followers" in json) data["Followers"] = json["followers"];
                    } else if (this.service_id === "DeviantArt") {

                    } else if (this.service_id === "LinkedIn") {

                    } else if (this.service_id === "XING") {

                    }
                    console.log(data);
                    return data;
                }
                
            }
        }
    );

    return LinkedServices;
};