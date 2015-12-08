var expect = require('chai').expect;
var lodash = require('lodash');
var nock = require('nock');
var sinon = require('sinon');

var WebAPIClient = require('../../../lib/clients/web/client');
var events = require('../../../lib/clients/web/events');
var facets = require('../../../lib/clients/web/facets');


var mockTransport = function(args, cb) {
    cb(args.data.err, args.headers, args.data.statusCode, args.data.body);
};


describe('Web API Client', function() {

    it('should accept supplied defaults when present', function() {
        var opts = {
            slackAPIUrl: 'test',
            userAgent: 'test',
            transport: lodash.noop
        };
        var client = new WebAPIClient('test-token', opts);

        expect(client.slackAPIUrl).to.equal('test');
        expect(client.userAgent).to.equal('test');
    });

    it('should register facets  during construction', function() {
        var client = new WebAPIClient('test-token', {transport: lodash.noop});
        expect(client.auth).to.not.be.undefined;
    });

    it('should make API calls via the transport function', function(done) {
        var args = {
            headers: {},
            statusCode: 200,
            body: '{"test": 10}'
        };

        var client = new WebAPIClient('test-token', {transport: mockTransport});

        client.makeAPICall('test', args, function(err, res) {
            expect(res).to.deep.equal({'test': 10});
            done();
        });
    });

    it('should pause job execution in response to a 429 header', function(done) {
        nock('https://slack.com/api')
            .post('/test')
            .reply(429, '{}', {'X-Retry-After': 0});

        nock('https://slack.com/api')
            .post('/test')
            .reply(200, '{}');

        var client = new WebAPIClient('test-token');
        sinon.spy(client, 'transport');

        client.makeAPICall('test', {}, function() {
            expect(client.transport.callCount).to.equal(2);
            done();
        });
    });

});
