var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;

var gameService;
var radioServiceStub;
var EventEmitter = require('events').EventEmitter;

describe('The Game Service', function() {
    beforeEach(function(done) {
        radioServiceStub = new EventEmitter();
        radioServiceStub.open = spy();
        radioServiceStub.close = spy();

        var GameService = proxyquire('../services/game_service', {
            './radio_service': radioServiceStub
        });

        gameService = new GameService();
        gameService.start();

        expect(radioServiceStub.open.calledOnce).to.be.true;

        done();
    });

    it('can receive a score increment and save it', function(done) {
        incrementBothScores();

        console.log();
        done();
    });

    it('can receive a score decrement and save it', function(done) {
        incrementBothScores();

        radioServiceStub.emit('RXData', '1-');

        expect(gameService.scores[0]).to.equal(1);
        expect(gameService.scores[1]).to.equal(0);

        radioServiceStub.emit('RXData', '0-');

        expect(gameService.scores[0]).to.equal(0);
        expect(gameService.scores[1]).to.equal(0);

        done();
    });

    function incrementBothScores() {
        radioServiceStub.emit('RXData', '1+');

        expect(gameService.scores[0]).to.equal(0);
        expect(gameService.scores[1]).to.equal(1);

        radioServiceStub.emit('RXData', '0+');

        expect(gameService.scores[0]).to.equal(1);
        expect(gameService.scores[1]).to.equal(1);
    }

    afterEach(function(done) {
        gameService.stop();

        expect(radioServiceStub.close.calledOnce).to.be.true;

        done();
    });
});