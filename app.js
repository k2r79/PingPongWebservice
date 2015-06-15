var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var server = app.listen(8080, function() {
    console.log('Server listening at %s:%s', server.address().address, server.address().port);
});

app.get('/', function(req, res) {
    res.send({
        firstname: 'Coucou',
        lastname: 'Toi !'
    });
});