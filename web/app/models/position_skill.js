/**
 * Created by bernd on 12.04.16.
 */

"use strict";

module.exports = (sequelize, DataTypes) => {
    var Position_Skill = sequelize.define('Position_Skill', {
        weight: {
            type: DataTypes.FLOAT,
            allowNull: false,

        }
    },
        {
            classMethods: {
                associate: (models) => {
                    Position_Skill.belongsTo(models.Position, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false,
                            unique: "posSkillUnique"
                        }
                    });
                    Position_Skill.belongsTo(models.Skill, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false,
                            unique: "posSkillUnique"
                        }
                    });
                }
            }
        }
    );


    return Position_Skill;
}