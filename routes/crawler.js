var express = require('express');
var router = express.Router();
var crawlerFunction = require('../crawlers/indiaspend');
var db = require('../db');

var i=0;
var errors = [];
var success = [];

router.get('/indiaspend', function(req, res, next) {


    db.indiaSpendCrawler.findAll().then(function(allRecords) {
        allRecords.forEach(function(record) {
            crawlerFunction(record.imei).then(function(data) {
                success.push({
                    imei : record.imei,
                    data : data
                });
                i++;
            }).catch(function(e) {
                errors.push({
                    imei : record.imei,
                    error : e
                });
                i++;
            });
            if(i >= allRecords.length) {
                res.json({
                    "errors" : errors,
                    "success" : success
                });
            }
            console.log('Completed ' + i + '/' + allRecords.length);
        });
    }).catch(function(e) {
        console.log('ERROR Reading records');
    });
});

module.exports = router;
