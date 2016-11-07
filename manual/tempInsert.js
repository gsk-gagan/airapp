var db = require('../db');

module.exports = function() {
    return new Promise(function(resolve, reject) {
        console.log('Starting to insert Data');

        var testData = {
            "imei" : "234234",
            "name" : "test Location",
            "lat" : 332.234,
            "lng" : 23423.13
        };

        db.indiaSpendCrawler
            .create(testData)
            .then(function(record) {
                resolve(record);
            })
            .catch(function(error) {
                reject(error);
            });
    });
};
