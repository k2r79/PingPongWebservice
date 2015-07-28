var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;
var async = require('async');

var mongoose = require('mongoose');
var config = require('../config');

var Player = require('../models/player');

var players;
var gameService;
var radioServiceStub;
var EventEmitter = require('events').EventEmitter;

describe('The Game Service', function() {
    beforeEach(function(done) {
        // Empty the database
        for (var collectionIndex in mongoose.connection.collections) {
            mongoose.connection.collections[collectionIndex].remove(function() {});
        }

        createPlayers(function() {
            createGameService(done);
        });
    });

    function createPlayers(callback) {
        players = [ new Player(), new Player() ];
        players[0].name = 'First player';
        players[1].name = 'Second player';

        // Save each player asynchronously
        async.each(players, function(player, finished) {
            player.save(function(err, savedPlayer) {
                if (err) {
                    finished(err);
                }

                finished();
            });
        }, function(err) {
            if (err) {
                throw err;
            }

            callback();
        });
    }

    function createGameService(callback) {
        // Stub the radio service
        radioServiceStub = new EventEmitter();
        radioServiceStub.open = spy();
        radioServiceStub.close = spy();

        // Inject the stubbed radio service
        var GameService = proxyquire('../services/game_service', {
            './radio_service': radioServiceStub
        });

        gameService = new GameService(players);
        expect(gameService.players.length).to.equal(2);

        gameService.start();

        expect(radioServiceStub.open.calledOnce).to.be.true;

        callback();
    }

    it('can receive a score increment and save it', function(done) {
        incrementBothScores(done);
    });

    it('can receive a score decrement and save it', function(done) {
        incrementBothScores(function() {
            decrementBothScores(done);
        });
    });

    function incrementBothScores(callback) {
        async.series([
            function(finished) {
                radioServiceStub.emit('RXData', '1+');

                gameService.once('Score', function() {
                    checkPlayerScore(0, 0);
                    checkPlayerScore(1, 1);

                    finished();
                });
            },
            function(finished) {
                radioServiceStub.emit('RXData', '0+');

                gameService.once('Score', function() {
                    checkPlayerScore(0, 1);
                    checkPlayerScore(1, 1);

                    finished();
                });
            }
        ], function(err, results) {
            if (err) {
                throw err;
            }

            callback();
        });
    }

    function decrementBothScores(callback) {
        async.series([
            function(finished) {
                radioServiceStub.emit('RXData', '1-');

                gameService.once('Score', function() {
                    checkPlayerScore(0, 1, finished);
                    checkPlayerScore(1, 0, finished);

                    finished();
                });
            },
            function(finished) {
                radioServiceStub.emit('RXData', '0-');

                gameService.once('Score', function() {
                    checkPlayerScore(0, 0, finished);
                    checkPlayerScore(1, 0, finished);

                    finished();
                });
            }
        ], function(err, results) {
            if (err) {
                throw err;
            }

            callback();
        });
    }

    function checkPlayerScore(index, score) {
        Player.findOne({ "_id": players[index]._id }, function(err, player) {
            if (err) {
                throw err;
            }

            expect(player.score).to.equal(score);
        });
    }

    afterEach(function(done) {
        gameService.stop();

        expect(radioServiceStub.close.calledOnce).to.be.true;

        done();
    });
});