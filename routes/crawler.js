var express = require('express');
var storage = require('node-persist');
var moment = require('moment');
var router = express.Router();
var crawlerFunction = require('./crawler/indiaspend');
var db = require('../db');
var constants = require('../commons/constants');

storage.initSync();

var i=0;
var errors = [];
var success = [];
var hasInserted = false;
var recentRequest = false;

router.get('/indiaspend', function(req, res, next) {
    i=0;
    errors=[];
    success=[];
    hasInserted = false;
    recentRequest = false;

    var lastCrawlTime = storage.getItemSync(constants.INDIA_SPEND_CRAWL_TIME);
    if(lastCrawlTime != undefined && lastCrawlTime < moment().add(1, 'minutes'))
        recentRequest = true;

    if(recentRequest) {
        res.json({
            "error" : "Last crawl not more than 15 minutes ago. So, not crawling again"
        });
        return;
    }

    //Added so that newer crawl does not start before 15 minutes
    recentRequest = true;
    storage.setItemSync(constants.INDIA_SPEND_CRAWL_TIME, moment());

    db.source.findAll({
        where : {
            sourcetype : constants.INDIA_SPEND
        }
    }).then(function(allRecords) {
        allRecords.forEach(function(record) {
            crawlerFunction(record.sourcecode).then(function(data) {
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