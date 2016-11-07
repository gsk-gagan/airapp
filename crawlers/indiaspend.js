var http = require('http');

module.exports = function(imei) {
    return new Promise(function(resolve, reject) {
        if(imei) {
            var startTime = '20161107182742';
            var endTime = '20161107192742';
            var url = 'http://api.indiaspend.org/dashboard/dashboard?imei=' +
                imei + '&hrs=1&sdate=' + startTime + '&edate=' + endTime + '&type=graphJson&flag=graphdata';

            var request = http.get(url, function(response) {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject({'error': 'Failed to load page, status code: ' + response.statusCode});
                }

                var body = [];

                response.on('data', function(chunk) {
                    body.push(chunk);
                });
                response.on('end', function() {
                    resolve(body.join(''));
                });
            });

        } else {
            reject({"error" : "IMEI number not provided"});
        }
    });
};
