var express = require('express');
var testDB = require('../manual/tempInsert');
var router = express.Router();

/* GET home page. */
router.get('/manual', function (req, res, next) {
    testDB().then(function(record) {
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

module.exports = router;
