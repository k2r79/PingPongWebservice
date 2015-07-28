var express = require('express');
var app = express();

var config = require('./config');

var mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));

app.use('/api', require('./controllers/webservice'));

mongoose.connect(config.db.test, function(err) {
    if (err) {
        throw err;
    }

    console.log('Connected to database...');
});

var server = app.listen(8080, function() {
    console.log('Server listening at %s:%s...', server.address().address, server.address().port);
});

module.exports = app;