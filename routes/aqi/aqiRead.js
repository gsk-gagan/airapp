var db = require('../../db');

module.exports = function(isLatest) {
    return new Promise(function(resolve, reject) {
        console.log('Starting to read Data from AQI');

        db.source.findAll().then(function(allRecords) {
            console.log('Total Sources : ' + allRecords.length);
            var sourceMap = {};
            allRecords.forEach(function(record) {
                sourceMap[record.id] = {
                    lat : record.lat,
                    lng : record.lng
                };
            });

            var aqiConn = isLatest ? db.aqiLatest : db.aqiAll;

            aqiConn.findAll().then(function(allData) {
                console.log('Total Records : ' + allData.length);
                var result = [];
                allData.forEach(function(datum) {
                    var res = {
                        lat : sourceMap[datum.sourceid].lat,
                        lng : sourceMap[datum.sourceid].lng,
                        aqi : datum.aqi,
                        pm25 : datum.pm25,
                        pm10 : datum.pm10,
                        windspeed : datum.windspeed,
                        winddirection : datum.winddirection,
                        updatetime : datum.createtime
                    };
                    result.push(res);
                });

                resolve(result);

            }).catch(function(e) {
                reject(e);
            });

        }).catch(function(e) {
            reject(e);
        });
    });
};