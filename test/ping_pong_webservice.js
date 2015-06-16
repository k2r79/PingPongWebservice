var request = require('supertest');
var app = require('../app.js');

describe('The ping pong webservice', function() {
    it('should return a 200 status code', function(done) {
        request(app)
            .get('/api')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                done();
            });
    });
});
