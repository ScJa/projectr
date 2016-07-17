/**
 * Created by bernd on 12.04.16.
 */

"use strict";

module.exports = (sequelize, DataTypes) => {
    var Rating = sequelize.define('Rating', {
            rating: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            feedback: {

                type: DataTypes.TEXT,
                allowNull: true,
            }
        },
        {
            deletedAt: 'deletedAt',
            paranoid: true,

            classMethods: {
                associate: (models) => {
                    Rating.belongsTo(models.User,
                        {
                            onDelete: "CASCADE",
                            foreignKey: {
                                allowNull: false
                            }
                        });
                    Rating.belongsTo(models.Position, {
                        onDelete: "CASCADE",
                        foreignKey: {
                            allowNull: false
                        }
                    });
                }
            }
        }
    );


    return Rating;
}