
"use strict";

module.exports = (sequelize, DataTypes) => {
    var Project = sequelize.define('Project', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        short_description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        private_description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        public_description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        budget: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 1,
                len: [1,10]
            }
        },

        status: {
            type: DataTypes.ENUM("running","stopped","closed"),
            allowNull: false
        }
    },
        {

            deletedAt: 'deletedAt',
            paranoid: true,

            instanceMethods: {
                getUpperCaseStatus: function () {
                    return this.status.toUpperCase();
                },

                getFormattedDate: function () {
                    return this.createdAt.toDateString();
                }
            },

            classMethods: {
                associate: (models) => {
                    Project.hasMany(models.Position)
                    Project.belongsTo(models.User, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                }
            }
        }
    );


    return Project;
}