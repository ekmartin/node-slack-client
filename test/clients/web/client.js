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
            userAgent: 'test'
        };
        var client = new WebAPIClient('test-token', lodash.noop, opts);

        expect(client.slackAPIUrl).to.equal('test');
        expect(client.userAgent).to.equal('test');
    });

    it('should not throw an error when registering an unregistered facet', function () {
        var opts = {facets: [facets.ApiFacet]};
        var client = new WebAPIClient('test-token', lodash.noop, opts);
        var authFacet = new facets.AuthFacet(lodash.noop);
        var fn = function () {
            client.registerFacet(authFacet);
        };
        expect(fn).to.not.throw(Error);
    });

    it('should throw an error when re-registering an registered facet', function () {
        var opts = {facets: [facets.AuthFacet]};
        var client = new WebAPIClient('test-token', lodash.noop, opts);
        var authFacet = new facets.AuthFacet(lodash.noop);
        var fn = function () {
            client.registerFacet(authFacet);
        };
        expect(fn).to.throw(Error);
    });

    it('should create facets and prune the opts.facet object', function () {
        var opts = {facets: [facets.AuthFacet]};
        var client = new WebAPIClient('test-token', lodash.noop, opts);
        expect(client).to.have.property('auth');
    });

    it('should make API calls via the transport function', function (done) {
        var args = {
            headers: {},
            statusCode: 200,
            body: '{"test": 10}'
        };

        var client = new WebAPIClient('test-token', mockTransport);

        client.makeAPICall('test', args, function(err, res) {
            expect(res).to.deep.equal({'test': 10});
            done();
        });
    });

});
