var radioService = require('./radio_service');

var GameService = function() {

    var self = this;

    var scores = [ 0, 0 ];

    this.start = function() {
        radioService.open();

        radioService.on('RXData', function(data) {
            scores[data[0]] += (data[1] == "+") ? 1 : -1;
        });
    };

    this.scores = scores;
};

module.exports = GameService;