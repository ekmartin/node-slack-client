var expect = require('chai').expect;
var lodash = require('lodash');

var WebAPIClient = require('../../../lib/clients/web/client');
var facets = require('../../../lib/clients/web/facets');


var mockTransport = function (args, cb) {
    cb(args.form.err, args.form.headers, args.form.statusCode, args.form.body);
};


describe('Web API Client', function () {

    it('should accept supplied defaults when present', function () {
        var opts = {
            slackAPIUrl: 'test',
            userAgent: 'test',
            transport: lodash.noop
        };
        var client = new WebAPIClient('test-token', opts);

        expect(client.slackAPIUrl).to.equal('test');
        expect(client.userAgent).to.equal('test');
    });

    it('should register facets  during construction', function () {
        var client = new WebAPIClient('test-token', {transport: lodash.noop});
        expect(client.auth).to.not.be.undefined;
    });

    it('should make API calls via the transport function', function (done) {
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

});
