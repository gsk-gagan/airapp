module.exports = function(sequelize, DataTypes) {
    return sequelize.define('aqilatest', {
        sourceid : {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        aqi : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pm25 : {
            type: DataTypes.INTEGER
        },
        pm10 : {
            type: DataTypes.INTEGER
        },
        windspeed : {
            type: DataTypes.FLOAT
        },
        winddirection : {
            type: DataTypes.FLOAT
        },
        createtime : {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};
