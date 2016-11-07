module.exports = function(sequelize, DataTypes) {
    return sequelize.define('source', {
        sourceid : {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        sourcetype : {
            type: DataTypes.STRING,
            allowNull: false
        },
        lat : {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: -1.0
        },
        lng : {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: -1.0
        },
        createtime : {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};