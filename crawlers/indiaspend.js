var http = require('http');
var moment = require('moment');

module.exports = function(imei) {
    return new Promise(function(resolve, reject) {
        if(imei) {
            var startTime = moment().subtract(1, 'hours').format('YYYYMMDDhhmmss');
            console.log(startTime);
            var endTime = moment().format('YYYYMMDDhhmmss');
            var url = 'http://api.indiaspend.org/dashboard/dashboard?imei=' +
                imei + '&hrs=1&sdate=' + startTime.toString() + '&edate=' + endTime.toString() + '&type=graphJson&flag=graphdata';

            console.log(url);

            var request = http.get(url, function(response) {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject({'error': 'Failed to load page, status code: ' + response.statusCode});
                }

                var body = [];

                response.on('data', function(chunk) {
                    body.push(chunk);
                });
                response.on('end', function() {
                    var jsonData = JSON.parse(body.join(''));
                    var result = insertToDB(jsonData.graphData);

                    if(result) {
                        console.log('Converted to Custom Data Record');
                        console.log(result);
                        resolve(result);
                    } else {
                        reject({"error" : "Unable to convert data"});
                    }
                    // resolve(body.join(''));
                });
            });

        } else {
            reject({"error" : "IMEI number not provided"});
        }
    });
};

function insertToDB(data) {
    var resultData = {};
    data.forEach(function(record) {
        switch (record.label) {
            case "AQI":
                resultData.aqi = Math.trunc(record.data[0][1]);
                resultData.createtime = new Date(record.data[0][0]);
                break;
            case "PM25":
                resultData.pm25 = Math.trunc(record.data[0][1]);
                break;
            case "PM10":
                resultData.pm10 = Math.trunc(record.data[0][1]);
                break;
            case "WindSpeed":
                resultData.windspeed = record.data[0][1];
                break;
            case "WindDir":
                resultData.winddirection = record.data[0][1];
                break;
        }
    });
    return resultData;
}
