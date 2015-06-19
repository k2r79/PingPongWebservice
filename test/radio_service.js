var proxyquire = require('proxyquire')
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var spy = sinon.spy;
var stub = sinon.stub;

var radioService;
var nrfStub = stub();
var EventEmitter = require('events').EventEmitter;
var nrfEventEmitterSpy = stub();
var rxEventEmitter;

describe('The Radio Service', function() {
    before(function(done) {
        // Settings variables
        var channelValue, dataRateValue, crcBytesValue, autoRetransmitValue;

        // Stub the event emitter's functions
        nrfEventEmitterSpy.channel = function(value) {
            channelValue = value;

            return nrfEventEmitterSpy;
        };

        nrfEventEmitterSpy.dataRate = function(value) {
            dataRateValue = value;

            return nrfEventEmitterSpy;
        };

        nrfEventEmitterSpy.crcBytes = function(value) {
            crcBytesValue = value;

            return nrfEventEmitterSpy;
        };

        nrfEventEmitterSpy.autoRetransmit = function(value) {
            autoRetransmitValue = value;

            return nrfEventEmitterSpy;
        };

        // Mock the RX channel
        rxEventEmitter = new EventEmitter();
        var openRXPipeStub = stub();
        openRXPipeStub.withArgs('rx', 0xF0F0F0F0E1).returns(rxEventEmitter);

        nrfEventEmitterSpy.openPipe = openRXPipeStub;

        // Mock the main communication functions
        nrfEventEmitterSpy.begin = function(callback) {
            callback();
        };

        nrfStub.connect = function() {
            return nrfEventEmitterSpy;
        };

        // Load the game listener
        var RadioService = proxyquire('../services/radio_service', {
            nrf: nrfStub
        });

        // Start the radio service
        radioService = new RadioService();
        radioService.open();

        done();

        // Check that communication settings have been done
        expect(channelValue).to.equal(0x4c);
        expect(dataRateValue).to.equal('1Mbps');
        expect(crcBytesValue).to.equal(2);
        expect(autoRetransmitValue.count).to.equal(15);
        expect(autoRetransmitValue.delay).to.equal(4000);
    });

    it('should emit an event when data is received', function(done) {
        var testData = '! olleH';

        // Stub de RX stream data (Arduino's library sends an inversed String)
        rxEventEmitter.read = stub();
        rxEventEmitter.read.returns(testData);

        // Subscribe to the RXData event
        radioService.on('RXData', function(data) {
            expect(data).to.equal(testData.split('').reverse().join('').toString());

            done();
        });

        // Simulate an RX input
        rxEventEmitter.emit('readable');
    });

    after(function(done) {
        // Stub the radio end method
        nrfEventEmitterSpy.end = function() {
            done();
        };

        // Close the radio streams
        radioService.close();
    });
});