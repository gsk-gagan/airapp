var express = require('express');
var router = express.Router();
var crawlerFunction = require('../crawlers/indiaspend');
var db = require('../db');

var i=0;
var errors = [];
var success = [];

router.get('/indiaspend', function(req, res, next) {


    db.indiaSpendCrawler.findAll().then(function(allRecords) {
        i = 0;
        errors = [];
        success = [];
        crawlerHelper(allRecords);

    }).catch(function(e) {
        console.log('ERROR Reading records');
    });
});

module.exports = router;

function crawlerHelper(allRecords) {
    console.log(i);
    if(i >= allRecords.length)
        return;

    crawlerFunction(allRecords[i].imei).then(function(data) {
        console.log(data);
        success.push(data);
        ++i;
        crawlerHelper(allRecords);
    }).catch(function(e) {
        console.log(e);
        errors.push(e);
    });
}
