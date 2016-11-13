var crawlers = require('./crawlers');

module.exports.startScheduler = function(interval) {
    console.log('Starting scheduled tasks in ' + interval/60000 + ' minutes');

    setInterval(function() {
        crawlers.indiaSpendCrawler();
    }, interval);

    setInterval(function() {
        crawlers.waqiCrawler();
    }, interval);
};
