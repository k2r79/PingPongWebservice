var Player = require('../models/player');
var radioService = require('./radio_service');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var GameService = function(players) {

    var self = this;

    var players = players;

    this.start = function() {
        radioService.open();

        radioService.on('RXData', function(data) {
            Player.update({ _id: players[data[0]]._id }, { $inc: { score: (data[1] == "+") ? 1 : -1 } }, function(err) {
                if (err) {
                    throw err;
                }

                self.emit('Score');
            });
        });
    };

    this.stop = function() {
        radioService.close();
    };

    this.players = players;
};

util.inherits(GameService, EventEmitter);

module.exports = GameService;