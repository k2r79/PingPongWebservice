var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.use('/api', require('./controllers/webservice'));

var server = app.listen(8080, function() {
    console.log('Server listening at %s:%s', server.address().address, server.address().port);
});

module.exports = app;