var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;

var gameService;
var EventEmitter = require('events').EventEmitter;
var radioServiceStub = new EventEmitter();

describe('The Game Service', function() {
    before(function(done) {
        radioServiceStub.open = spy();

        var GameService = proxyquire('../services/game_service', {
            './radio_service': radioServiceStub
        });

        gameService = new GameService();
        gameService.start();

        expect(radioServiceStub.open.calledOnce).to.be.true;

        done();
    });

    it('can receive a new score and save it', function(done) {
        radioServiceStub.emit('RXData', '1');

        expect(gameService.scores[0]).to.equal(0);
        expect(gameService.scores[1]).to.equal(1);

        radioServiceStub.emit('RXData', '1');

        expect(gameService.scores[0]).to.equal(0);
        expect(gameService.scores[1]).to.equal(2);

        radioServiceStub.emit('RXData', '0');

        expect(gameService.scores[0]).to.equal(1);
        expect(gameService.scores[1]).to.equal(2);

        done();
    });
});