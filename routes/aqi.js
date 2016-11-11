var express = require('express');
var router = express.Router();
var aqiRead = require('./aqi/aqiRead');
var db = require('../db');

router.get('/', function (req, res, next) {
    var filter = getQueryParams(req.query);

    aqiRead().then(function(allRecords) {
        res.json(filterResult(allRecords, filter));
    }).catch(function(e) {
        res.json({
            "error" : e
        });
    });
});

router.get('/:id', function (req, res, next) {
    var id = parseInt(req.params.id);
    console.log(req.param.id);
    var filter = {
        where : {sourceid : id},
        order : 'createtime DESC'
    };

    if(req.query.hasOwnProperty('limit')) {
        filter.limit = req.query.limit;
    }

    var result = [];
    db.source.findById(id).then(function(sourceRecord) {
        db.aqiAll.findAll(filter).then(function(allRecords) {
            allRecords.forEach(function(record) {
                result.push({
                    lat : sourceRecord.lat,
                    lng : sourceRecord.lng,
                    aqi : record.aqi,
                    pm25 : record.pm25,
                    pm10 : record.pm10,
                    windspeed : record.windspeed,
                    winddirection : record.winddirection,
                    updatetime : record.createtime
                });
            });

            res.json(result);
        }).catch(function(e){
            res.json({
                "error" : e
            });
        });
    }).catch(function(e) {
        res.json({
            "error" : e
        });
    });
});

module.exports = router;


function getQueryParams(query) {
    var result = {};
    var lat, lng;
    if(query.hasOwnProperty('lat')) {
        lat = parseFloat(query.lat);
    }
    if(query.hasOwnProperty('lng')) {
        lng = parseFloat(query.lng);
    }
    if(lat !== undefined && lng !== undefined) {
        result.lat = lat;
        result.lng = lng;
    }

    if(query.hasOwnProperty('limit')) {
        result.limit = parseInt(query.limit);
    }

    return result;
}

function filterResult(allRecords, filter) {
    var tempResult;
    var result = [];
    //filter all based on lat lng and order appropriately
    if(filter.hasOwnProperty('lat')) {
        tempResult = allRecords.sort(function(a, b) {
            var disa = ((a.lat - filter.lat)*(a.lat - filter.lat)) + ((a.lng - filter.lng)*(a.lng - filter.lng));
            var disb = ((b.lat - filter.lat)*(b.lat - filter.lat)) + ((b.lng - filter.lng)*(b.lng - filter.lng));
            return disa-disb;
        });
    } else {
        tempResult = allRecords;
    }
    //limit the number of results
    if(filter.hasOwnProperty('limit')) {
        for(var i=0; i<allRecords.length && i<filter.limit; i++) {
            result.push(tempResult[i]);
        }
    } else {
        result = tempResult;
    }

    return result;
}