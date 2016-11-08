var express = require('express');
var router = express.Router();
var crawlerFunction = require('../crawlers/indiaspend');
var db = require('../db');

var i=0;
var errors = [];
var success = [];
var hasInserted = false;

router.get('/indiaspend', function(req, res, next) {


    db.indiaSpendCrawler.findAll().then(function(allRecords) {
        i=0;
        errors=[];
        success=[];
        hasInserted = false;
        allRecords.forEach(function(record) {
            crawlerFunction(record.imei).then(function(data) {
                success.push({
                    sourceid : record.id,
                    aqi : data.aqi,
                    pm25 : data.pm25,
                    pm10 : data.pm10,
                    windspeed : data.windspeed,
                    winddirection : data.winddirection,
                    createtime : data.createtime
                });
                i++;

                console.log('Completed ' + i + '/' + allRecords.length);
                if(i >= allRecords.length && !hasInserted) {
                    res.json({
                        "errors" : errors,
                        "success" : success
                    });
                    insertAQI();
                    hasInserted = true;
                }
            }).catch(function(e) {
                errors.push({
                    imei : record.imei,
                    error : e
                });
                i++;

                console.log('Completed ' + i + '/' + allRecords.length);
                if(i >= allRecords.length && !hasInserted) {
                    res.json({
                        "errors" : errors,
                        "success" : success
                    });
                    insertAQI();
                    hasInserted = true;
                }
            });


        });
    }).catch(function(e) {
        console.log('ERROR Reading records');
    });
});

module.exports = router;

function insertAQI() {
    console.log('Starting Insert to DB');

    db.aqiAll.bulkCreate(success).then(function(records) {
        //console.log('Insert to Source Success');
        //console.log(records);
        insertLatestAQI(0);
    }).catch(function(e) {
        //console.log('Insert Error');
        //console.log(e);
        insertLatestAQI(0);
    });


}

function insertLatestAQI(index) {
    if(index >= success.length)
        return;
    db.aqiLatest.upsert(success[index]).then(function(record) {
        console.log('Insert to Latest AQI');
        console.log(record);
        insertLatestAQI(++index);
    }).catch(function(e) {
        console.log('Unable to UPSERT!!!');
        console.log(e);
        insertLatestAQI(++index);
    });
}