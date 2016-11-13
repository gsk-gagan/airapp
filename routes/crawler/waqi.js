var https = require('https');
var moment = require('moment');
var constants = require('../../commons/constants');
var db = require('../../db');

var exp = {};

var timeMs = moment.utc();
var processedCount = 0;
var results = [];
var errors = [];

exp.getSources = function() {
    return new Promise(function (resolve, reject) {
        timeMs = moment.utc();
        processedCount = 0;
        results = [];
        errors = [];

        for(var i=0; i<constants.WAQI_CRAWLER.LIMIT; i++) {
            var url = 'https://wind.waqi.info/mapq/block/' + i + '/500/?_=' + timeMs;

            try {
                var request = https.get(url, function(response) {
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject({'error': 'Failed to load page, status code: ' + response.statusCode});
                    }

                    var body = [];

                    response.on('data', function(chunk) {
                        body.push(chunk);
                    });



                    response.on('end', function() {
                        console.log('Completed ' + processedCount + '/' + constants.WAQI_CRAWLER.LIMIT);
                        var jsonData = JSON.parse(body.join(''));

                        jsonData.cities.forEach(function(datum) {
                            var indiana = datum.n.indexOf('Indiana');
                            var india = datum.n.indexOf('India');

                            if(indiana == -1 && india != -1) {
                                if(datum.a != '-')
                                results.push({
                                    x: datum.x,
                                    name: datum.n,
                                    lat: datum.g[0],
                                    lng: datum.g[1],
                                    aqi: parseInt(datum.a),
                                    readTime: moment.utc(datum.u, 'YYYY-MM-DD HH:mm:ss').toDate()
                                    //As we are getting india time and we have said that it's UTC so we don't have to add anything
                                });
                            }
                        });

                        ++processedCount;

                        if(processedCount >= constants.WAQI_CRAWLER.LIMIT) {
                            resolve({
                                data : results,
                                errors : errors
                            });
                        }
                    });
                });
                //To handel connection timeout
                request.on('error', function(err) {
                    console.log('error');
                    errors.push(err);

                    ++processedCount;

                    if(processedCount >= constants.WAQI_CRAWLER.LIMIT) {
                        resolve({
                            data : results,
                            errors : errors
                        });
                    }
                });
            } catch (e) {
                console.log('Error');
                errors.push(e);

                ++processedCount;

                if(processedCount >= constants.WAQI_CRAWLER.LIMIT) {
                    resolve({
                        data : results,
                        errors : errors
                    });
                }
            }
        }
    });
};

exp.insertToWaqi = function(allRecords) {
    return new Promise(function(resolve, reject) {
        db.waqiCrawler.bulkCreate(allRecords).then(function(insertedRecords) {
            resolve(insertedRecords);
        }).catch(function(err) {
            reject(err);
        });
    });
};

exp.insertToSource = function() {
    return new Promise(function(resolve, reject) {
        db.source.findAll({                                 //Read data from source table
            attributes: ['sourcecode'],
            where: {
                sourcetype: constants.WAQI_CRAWLER.NAME
            }
        }).then(function(allSource) {                       //Segegrate waqiCrawl table data into the ones which are not present in the source
            console.log('--GSK: Found Source : ' + allSource.length);
            var notIn = [];
            allSource.forEach(function(source) {
                notIn.push(source.sourcecode);
            });
            if(allSource.length === 0) {
                return db.waqiCrawler.findAll();
            }
            return db.waqiCrawler.findAll({
                where: {
                    x: {
                        $notIn: notIn
                    }
                }
            });
        }).then(function(allWaqi) {                         //Insert the ones not present to the source table
            console.log('--GSK: Found Waqi to Insert : ' + allWaqi.length);
            var toInsert = [];
            allWaqi.forEach(function(waqi) {
                toInsert.push({
                    sourcecode: waqi.x,
                    sourcetype: constants.WAQI_CRAWLER.NAME,
                    lat: waqi.lat,
                    lng: waqi.lng
                });
            });
            return db.source.bulkCreate(toInsert);
        }).then(function(insertedSource) {
            console.log('--GSK: Inserted to Source : ' + insertedSource.length);
            resolve(insertedSource);
        }).catch(function(err) {
            reject(err);
        });
    });
};

//Becoming too complicated so will use the data from above source for now and Erroneous
//var crawlSuccess = [];
//var crawlErrors = [];
//var crawlCount = 0;

//exp.crawlData = function() {
//    return new Promise(function(resolve, reject) {
//        crawlSuccess = [];
//        crawlErrors = [];
//        crawlCount = 0;
//
//        db.source.findAll({
//            where: {
//                sourcetype: 'waqi'
//            }
//        }).then(function(allRecords) {
//            allRecords = [allRecords[0]];
//            allRecords.forEach(function(record) {
//                var url = 'https://waqi.info/api/widget/@' + record.sourcecode + '/widget.v1.json';
//                console.log(url);
//
//                try {
//                    var request = https.get(url, function(response) {
//                        if (response.statusCode < 200 || response.statusCode > 299) {
//                            reject({'error': 'Failed to load page, status code: ' + response.statusCode});
//                        }
//
//                        var body = [];
//
//                        response.on('data', function(chunk) {
//                            body.push(chunk);
//                        });
//
//                        response.on('end', function() {
//
//                            try {
//                                var receivedData = body.join('');
//
//                                console.log('\n\n\n\n\n');
//                                console.log(receivedData);
//                                console.log('\n\n\n\n\n');
//
//                                var jsonData = JSON.parse(receivedData).rxs.obs[0].msg.model;
//                                var timeStamp = moment(jsonData.time.v, moment.ISO_8601);
//                                console.log(jsonData.time.v);
//                                //console.log(timeStamp);
//                                var successRecord = {
//                                    sourceid: record.id,
//                                    aqi: jsonData.aqi,
//                                    createtime: timeStamp.toDate()
//                                };
//
//                                jsonData.iaqi.forEach(function(datum) {
//                                    if(datum.p == 'pm25')
//                                        successRecord.pm25 = datum.v[0];
//                                });
//
//                                crawlSuccess.push(successRecord);
//                            } catch(e) {
//                                crawlErrors.push(e);
//                            }
//
//                            ++crawlCount;
//                            console.log('Completed ' + crawlCount + '/' + allRecords.length);
//                            if(crawlCount >= allRecords.length) {
//                                resolve({
//                                    "success": crawlSuccess,
//                                    "error": crawlErrors
//                                });
//                            }
//                        });
//                    });
//
//                    //To handel connection timeout
//                    request.on('error', function(err) {
//                        crawlErrors.push(err);
//                        ++crawlCount;
//                        console.log('Completed ' + crawlCount + '/' + allRecords.length);
//                        if(crawlCount >= allRecords.length) {
//                            resolve({
//                                "success": crawlSuccess,
//                                "error": crawlErrors
//                            });
//                        }
//                    });
//
//                } catch (e) {
//                    crawlErrors.push(e);
//                    ++crawlCount;
//                    console.log('Completed ' + crawlCount + '/' + allRecords.length);
//                    if(crawlCount >= allRecords.length) {
//                        resolve({
//                            "success": crawlSuccess,
//                            "error": crawlErrors
//                        });
//                    }
//                }
//            });
//
//        }).catch(function(error) {
//            crawlErrors.push(error);
//            ++crawlCount;
//            console.log('Completed ' + crawlCount + '/' + allRecords.length);
//            if(crawlCount >= allRecords.length) {
//                resolve({
//                    "success": crawlSuccess,
//                    "error": crawlErrors
//                });
//            }
//        });
//    });
//};

module.exports = exp;