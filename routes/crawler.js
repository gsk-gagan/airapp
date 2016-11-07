var express = require('express');
var router = express.Router();
var crawlerFunction = require('../crawlers/indiaspend');

router.get('/indiaspend', function(req, res, next) {
    crawlerFunction('868004027010993').then(function(data) {
        console.log(data);
        res.send(data);
    }).catch(function(e) {
        res.json({
            "error-msg" : e
        });
    });
});

module.exports = router;
