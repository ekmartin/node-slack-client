var expect = require('chai').expect;
var forEach = require('lodash.foreach');
var humps = require('humps');
var lodash = require('lodash');

var RTM_EVENTS = require('../../../lib/clients/rtm/events/rtm-events').EVENTS;
var MemoryDataStore = require('../../../lib/data-store').MemoryDataStore;
var clientEventHandlers = require('../../../lib/clients/rtm/event-handlers');
var getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
var getRtmClient = require('../../utils/client').getRtmClient;
var transport = require('../../../lib/clients/web/transports/request');

var getRTMMessageFixture = require('../../fixtures').getRTMMessage;
var rtmStartFixture = require('../../fixtures/rtm.start');


describe('RTM API Event Handlers', function() {

  describe('Raw Events', function() {
    it('should emit raw messages with all lower case keys unchanged', function(done) {
        var rtmClient = getRtmClient();
        rtmClient.on('raw::im_open', function(rawMsg) {
          expect(rawMsg).to.deep.equal(getRTMMessageFixture('im_open', true));
          done();
        });
        rtmClient.handleWsMessage(getRTMMessageFixture('im_open', true));
    });

    it('should emit raw messages with snake case keys unchanged');
  });

  describe('Parsed Events', function(){

    describe('`im_xxx` events', function() {

      var testDMOpenStatus = function(isOpen, event) {
        var dataStore = getMemoryDataStore();
        dataStore.getDMByID(rtmStartFixture.ims[0].id).isOpen = isOpen;
        var updatedMessage = clientEventHandlers[event](dataStore, getRTMMessageFixture(event));
        expect(updatedMessage).to.deep.equal({
          'type': event,
          'user': 'USLACKBOT',
          'channel': 'D0CJ1P4JJ'
        });
        expect(dataStore.getDMByID(rtmStartFixture.ims[0].id).isOpen).to.equal(isOpen);
      };

      it('sets isOpen to true on a DM channel when an `im_open` message is received', lodash.partial(testDMOpenStatus, true, RTM_EVENTS.IM_OPEN));
      it('sets isOpen to false on a DM channel when an `im_close` message is received', lodash.partial(testDMOpenStatus, false, RTM_EVENTS.IM_CLOSE));

      it('adds a new DM object when an `im_created` message is received and updates the `channel` property of the message');
      it('marks the DM channel as read when an `im_marked` message is received and updates the `channel` properties to match');

    });

    describe('`bot_xxx` events', function() {

      var testBotUpserted = function(event) {
        var dataStore = getMemoryDataStore();
        var botMsg = getRTMMessageFixture('bot_added');
        clientEventHandlers[event](dataStore, botMsg);

        expect(dataStore.getBotById(botMsg.bot.id)).to.have.property('name', botMsg.bot.name);
      };

      it('adds a new bot to the data store when a `bot_added` message is received', function() {
        testBotUpserted('bot_added');
      });

      it('updates an existing bot in the data store when a `bot_changed` message is received', function() {
        testBotUpserted('bot_changed');
      });

    });

    describe('`channel_xxx` events', function() {

    });

    describe('`group_xxx` events', function() {

    });


    describe('`presence_xxx` events', function() {

    });


    describe('stars_xxx`` events', function() {

    });


    describe('`team_xxx` events', function() {

    });


    describe('user events', function() {

      it('updates a user preference when `pref_change` is received', function() {
        var dataStore = getMemoryDataStore();
        var prefChangeMsg = getRTMMessageFixture('pref_change');
        var updatedMessage = clientEventHandlers['pref_change']('U0CJ5PC7L', '', dataStore, prefChangeMsg);
        expect(updatedMessage).to.deep.equal(prefChangeMsg);

        var user = dataStore.getUserByID('U0CJ5PC7L');
        expect(user.prefs[humps.camelize(prefChangeMsg.name)]).to.equal(prefChangeMsg.value);
      });

      it('updates a channel, marking a user as typing when `user_typing` is received', function() {
        var dataStore = getMemoryDataStore();
        var channel = dataStore.getChannelByID('C0CHZA86Q');
        var userTypingMsg = getRTMMessageFixture('user_typing');
        var updatedMessage = clientEventHandlers['user_typing'](dataStore, userTypingMsg);
        expect(updatedMessage).to.deep.equal(userTypingMsg);

        expect(channel._typing[userTypingMsg.user]).to.not.be.undefined;
      });

      it('adds a new user or updates an existing user when a `user_change` event is received');

    });

  });

});
