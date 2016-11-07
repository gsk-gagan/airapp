var path = require('path');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect' : 'sqlite',
    'storage' : path.join(__dirname, 'data', 'air-app-database.sqlite')
});
var db = {};

//Table Definitions
db.indiaSpendCrawler = sequelize.import(path.join(__dirname, 'models', 'indiaSpendCrawler.js'));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;