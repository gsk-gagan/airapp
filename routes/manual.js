var express = require('express');
var writeTable = require('../manual/tempInsert');
var readTable = require('../manual/tempRead');
var router = express.Router();

/* GET home page. */
router.get('/manual', function (req, res, next) {
    writeTable().then(function(record) {
        console.log('Inserted Successfully');
        console.log(record);
        res.status(200);
        res.json({
            "status" : "Success",
            "record" : record
        });
    }).catch(function(error) {
        console.log('ERROR!');
        console.log(error);
        res.status(400);
        res.json({
            "status" : "Failure",
            "error-msg" : error
        });
    });
});

router.get('/manual/read', function(req, res, next) {
    readTable().then(function(records) {
        res.json(records);
    }).catch(function(e) {
        res.json(e);
    });
});

module.exports = router;
