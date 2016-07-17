/**
 * Created by bernd on 12.04.16.
 */

"use strict";

module.exports = (sequelize, DataTypes) => {
    var User_Skill = sequelize.define('User_Skill', {
        weight: {
            type: DataTypes.FLOAT,
            allowNull: false,

        }
    },
        {
            classMethods: {

                associate: (models) => {
                    User_Skill.belongsTo(models.User, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false,
                            unique: "userSkillUnique"
                        }
                    });
                    User_Skill.belongsTo(models.Skill, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false,
                            unique: "userSkillUnique"
                        }
                    });
                }
            }
        }
    );


    return User_Skill;
}