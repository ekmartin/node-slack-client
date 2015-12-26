var expect = require('chai').expect;
var nock = require('nock');
var sinon = require('sinon');

var RtmAPIClient = require('../../../lib/clients/rtm/client');
var MockWSServer = require('../../utils/mock-ws-server');
var WebAPIClient = require('../../../lib/clients/web/client');
var clientEvents = require('../../../lib/clients/rtm/events/client-events');


describe('RTM API Client', function () {

    var wss;
    var webClient;
    before(function () {
        webClient = new WebAPIClient('fake-token');
        wss = new MockWSServer({port: 5221});
    });

    beforeEach(function () {
        // Mock the RTM API response
        nock('https://slack.com/api')
            .post('/rtm.start')
            .times(2)
            .reply(200, require('../../fixtures/rtm.start.json'));
    });

    it('should reconnect when a pong is not received within the max interval', function (done) {
        var opts = {
            wsPingInterval: 1,
            maxPongInterval: 2,
            reconnectionBackoff: 1
        };
        var rtm = new RtmAPIClient(webClient, opts);
        sinon.spy(rtm, 'reconnect');
        rtm.start();

        var rtmConnCount = 0;
        rtm.on(clientEvents.OPENED_RTM_CONNECTION, function () {
            rtmConnCount++;
            if (rtmConnCount === 2) {
                expect(rtm.reconnect.calledOnce).to.be.true;
                rtm.disconnect();
                rtm = null;
                done();
            }
        });
    });

    it('should reconnect when the websocket closes and autoreconnect is true', function (done) {
        wss.makeClosingWSS();
        var opts = {
            reconnectionBackoff: 1
        };
        var rtm = new RtmAPIClient(webClient, opts);
        sinon.spy(rtm, 'reconnect');
        rtm.start();

        var rtmConnCount = 0;
        rtm.on(clientEvents.OPENED_RTM_CONNECTION, function () {
            rtmConnCount++;
            if (rtmConnCount === 1) {
                rtm.send({type: 'close_socket'});
            }

            if (rtmConnCount === 2) {
                expect(rtm.reconnect.calledOnce).to.be.true;
                done();
            }
        });
    });

    it('should not attempt to reconnect while a connect is in progress', function (done) {
        wss.makeClosingWSS();
        var opts = {
            reconnectionBackoff: 1
        };
        var rtm = new RtmAPIClient(webClient, opts);
        sinon.spy(rtm, 'reconnect');

        rtm.on(clientEvents.CONNECTING, function () {
            var attemptStub = sinon.stub();
            rtm.on(clientEvents.ATTEMPTING_RECONNECT, attemptStub);
            rtm.reconnect();
            expect(attemptStub.called).to.be.false;
            done();
        });

        rtm.start();
    });

    it('should not attempt to reconnect while a reconnection is in progress', function (done) {
        wss.makeClosingWSS();
        var rtm = new RtmAPIClient(webClient);
        var attemptStub = sinon.stub();
        sinon.spy(rtm, 'reconnect');
        rtm.on(clientEvents.ATTEMPTING_RECONNECT, attemptStub);
        rtm.on(clientEvents.OPENED_RTM_CONNECTION, function () {
            rtm.reconnect();
            rtm.reconnect();
            expect(rtm._connecting).to.be.false;
            expect(attemptStub.callCount).to.equal(1);
            done();
        });

        rtm.start();
    });

    it('should reconnect when a `team_migration_started` event is received');

});
