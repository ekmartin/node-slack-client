var expect = require('chai').expect;
var forEach = require('lodash.foreach');
var lodash = require('lodash');

var MemoryDataStore = require('../../../lib/data-store').MemoryDataStore;
var clientEventHandlers = require('../../../lib/clients/rtm/event-handlers');
var RTM_EVENTS = require('../../../lib/clients/rtm/events/rtm-events').EVENTS;
var getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
var getRtmClient = require('../../utils/client').getRtmClient;
var transport = require('../../../lib/clients/web/transports/request');

var eventFixtures = require('../../fixtures/client-events');
var rtmStartFixture = require('../../fixtures/rtm.start');


describe('RTM API Event Handlers', function() {

  describe('Raw Events', function() {
    it('should emit raw messages with all lower case keys unchanged', function(done) {
      var rtmClient = getRtmClient();
      rtmClient.on('raw::im_open', function(rawMsg) {
        expect(rawMsg).to.deep.equal(eventFixtures['im_open']);
        done();
      });
      rtmClient.handleWsMessage(eventFixtures['im_open']);
    });

    it('should emit raw messages with snake case keys unchanged');
  });

  describe('Parsed Events', function(){

    describe('`im_xxx` events', function() {

      var testDMOpenStatus = function(isOpen, event) {
        var dataStore = getMemoryDataStore();
        dataStore.getDMByID(rtmStartFixture.ims[0].id).isOpen = isOpen;
        var updatedMessage = clientEventHandlers[event](dataStore, eventFixtures[event]);
        expect(updatedMessage).to.deep.equal({
          'type': event,
          'user': 'USLACKBOT',
          'channel': 'D0CJ1P4JJ'
        });
        expect(dataStore.getDMByID(rtmStartFixture.ims[0].id).isOpen).to.equal(isOpen);
      };

      it('sets isOpen to true on a DM channel when an `im_open` message is received', lodash.partial(testDMOpenStatus, true, RTM_EVENTS.IM_OPEN));
      it('sets isOpen to false on a DM channel when an `im_close` message is received', lodash.partial(testDMOpenStatus, false, RTM_EVENTS.IM_CLOSE));

    });

  });

});
