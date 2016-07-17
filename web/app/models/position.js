
"use strict";

module.exports = (sequelize, DataTypes) => {
    var Position = sequelize.define('Position', {
        hours: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                len: [1,10]
            }
        },
        name: {
            type:DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type:DataTypes.ENUM("Owner","Developer","Designer"),
            allowNull: false,
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
            type: DataTypes.ENUM("open","accepted","consider","rejected"),
            allowNull: false,
        },
        matchScore: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        }
    },
        {
            deletedAt: 'deletedAt',
            paranoid: true,

            classMethods: {
                associate: (models) => {
                    Position.hasMany(models.Position_Skill);
                    Position.hasOne(models.Rating);
                    Position.belongsTo(models.User, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: true
                        }
                    });
                    Position.belongsTo(models.Project,{
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                }
            }
        }
    );


    return Position;
}