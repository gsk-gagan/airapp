var express = require('express');
var router = express.Router();
var aqiRead = require('../db/aqiRead');

/* GET home page. */
router.get('/', function (req, res, next) {
    aqiRead(true).then(function(allRecords) {
        res.json(allRecords);
    }).catch(function(e) {
        res.json({
            "error" : e
        });
    });
});

router.get('/all', function (req, res, next) {
    aqiRead(false).then(function(allRecords) {
        res.json(allRecords);
    }).catch(function(e) {
        res.json({
            "error" : e
        });
    });
});

module.exports = router;
