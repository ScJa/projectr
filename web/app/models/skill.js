/**
 * Created by bernd on 12.04.16.
 */

"use strict";

module.exports = (sequelize, DataTypes) => {
    var Skill = sequelize.define("Skill", {

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "skillNameUnique"
        }
    },
        {
            deletedAt: "deletedAt",
            paranoid: true,
            instanceMethods: {
                getShortName: function (maxLength) {
                    if (this.name.length > maxLength) {
                        return this.name.substring(1, maxLength)+"...";
                    } else {
                        return this.name;
                    }
                }
            },
            classMethods: {
                associate: (models) => {
                    Skill.hasMany(models.User_Skill);
                    Skill.hasMany(models.Position_Skill);
                    Skill.belongsTo(Skill, {as: "parent_Skill", foreignKey:"parent_Skill_id"});
                }
            }
        }
    );


    return Skill;
}