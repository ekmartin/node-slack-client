var expect = require('chai').expect;
var forEach = require('lodash.foreach');
var humps = require('humps');
var lodash = require('lodash');

var RTM_EVENTS = require('../../../lib/clients/rtm/events/rtm-events').EVENTS;
var MemoryDataStore = require('../../../lib/data-store').MemoryDataStore;
var clientEventHandlers = require('../../../lib/clients/rtm/event-handlers');
var getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
var getRtmClient = require('../../utils/client').getRtmClient;
var models = require('../../../lib/models');
var transport = require('../../../lib/clients/web/transports/request');

var getRTMMessageFixture = require('../../fixtures').getRTMMessage;
var rtmStartFixture = require('../../fixtures/rtm.start');


describe('RTM API Event Handlers', function () {

    describe('Raw Events', function () {
        it('should emit raw messages with all lower case keys unchanged', function (done) {
            var rtmClient = getRtmClient();
            rtmClient.on('raw::im_open', function (rawMsg) {
                expect(rawMsg).to.deep.equal(getRTMMessageFixture('im_open', true));
                done();
            });
            rtmClient.handleWsMessage(getRTMMessageFixture('im_open', true));
        });

        it('should emit raw messages with snake case keys unchanged');
    });

    describe('Parsed Events', function () {

        describe('`im_xxx` events', function () {

            var testDMOpenStatus = function (isOpen, event) {
                var dataStore = getMemoryDataStore();
                dataStore.getDMById(rtmStartFixture.ims[0].id).isOpen = isOpen;
                clientEventHandlers[event](dataStore, getRTMMessageFixture(event));

                expect(dataStore.getDMById(rtmStartFixture.ims[0].id).isOpen).to.equal(isOpen);
            };

            it('sets isOpen to true on a DM channel when an `im_open` message is received', lodash.partial(testDMOpenStatus, true, RTM_EVENTS.IM_OPEN));

            it('sets isOpen to false on a DM channel when an `im_close` message is received', lodash.partial(testDMOpenStatus, false, RTM_EVENTS.IM_CLOSE));

            it('adds a new DM object when an `im_created` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['im_created'](dataStore, getRTMMessageFixture('im_created'));
                var dmChannel = dataStore.getDMById('D0CHZQWNP');
                expect(dmChannel).to.not.be.undefined;
            });

            it('marks the DM channel as read when an `im_marked` message is received', function() {
                var dataStore = getMemoryDataStore();

                var dmChannel = dataStore.getDMById('D0CHZQWNP');
                dmChannel.history.push({ts: 1});
                dmChannel.history.push({ts: 2});
                var originalUnreads = dmChannel.recalcUnreads();
                expect(originalUnreads).to.equal(2);

                clientEventHandlers['im_marked'](dataStore, getRTMMessageFixture('im_marked'));
                var newUnreads = dmChannel.recalcUnreads();

                expect(newUnreads).to.equal(0);
            });

        });

        describe('`bot_xxx` events', function () {

            var testBotUpserted = function (event) {
                var dataStore = getMemoryDataStore();
                var botMsg = getRTMMessageFixture('bot_added');
                clientEventHandlers[event](dataStore, botMsg);

                expect(dataStore.getBotById(botMsg.bot.id)).to.have.property('name', botMsg.bot.name);
            };

            it('adds a new bot to the data store when a `bot_added` message is received', function () {
                testBotUpserted('bot_added');
            });

            it('updates an existing bot in the data store when a `bot_changed` message is received', function () {
                testBotUpserted('bot_changed');
            });

        });

        describe('`channel_xxx` events', function () {

            var isArchivedChange = function (event, expected) {
                var dataStore = getMemoryDataStore();

                clientEventHandlers[event](dataStore, getRTMMessageFixture(event));
                var channel = dataStore.getChannelById('C0CJ25PDM');
                expect(channel.isArchived).to.equal(expected);
            };

            it('sets isArchived to true on a channel when a `channel_archive` message is received', function() {
                isArchivedChange('channel_archive', true);
            });

            it('sets isArchived to false on a channel when a `channel_unarchive` message is received', function() {
                isArchivedChange('channel_unarchive', false);
            });

            it('renames a channel when a `channel_rename` message is received');

            it('creates a new channel when a `channel_created` message is received');

            it('deletes a channel when a `channel_deleted` message is received');

            it('`channel_joined`');
            it('`channel_left`');
            it('`channel_marked`');

        });

        describe('`group_xxx` events', function () {

        });


        describe('`presence_xxx` events', function () {

        });


        describe('stars_xxx`` events', function () {

        });


        describe('`team_xxx` events', function () {

            it('updates the team domain when a `team_domain_change` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['team_domain_change']('', 'T0CHZBU59', dataStore, getRTMMessageFixture('team_domain_change'));
                var team = dataStore.getTeamById('T0CHZBU59');

                expect(team.url).to.equal('https://sslack-api-test.slack.com');
                expect(team.domain).to.equal('sslack-api-test');
            });

            it('updates the team name when a `team_rename` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['team_rename']('', 'T0CHZBU59', dataStore, getRTMMessageFixture('team_rename'));
                var team = dataStore.getTeamById('T0CHZBU59');

                expect(team.name).to.equal('slack-api-test-test');
            });

            it('updates a team preference when a `team_pref_change` message is received', function() {
                var dataStore = getMemoryDataStore();
                var prefChangeMsg = getRTMMessageFixture('team_pref_change');
                clientEventHandlers['team_pref_change']('', 'T0CHZBU59', dataStore, prefChangeMsg);

                var team = dataStore.getTeamById('T0CHZBU59');
                expect(team.prefs[humps.camelize(prefChangeMsg.name)]).to.equal(prefChangeMsg.value);
            });

            it('adds a new user to a team when a `team_join` message is received', function() {
                var dataStore = getMemoryDataStore();
                var teamJoinMsg = getRTMMessageFixture('team_join');
                clientEventHandlers['team_join'](dataStore, teamJoinMsg);

                var user = dataStore.getUserById('U0EV582MU');
                expect(user).to.be.an.instanceof(models.User);
            });

        });


        describe('user events', function () {

            it('updates a user preference when `pref_change` is received', function () {
                var dataStore = getMemoryDataStore();
                var prefChangeMsg = getRTMMessageFixture('pref_change');
                clientEventHandlers['pref_change']('U0CJ5PC7L', '', dataStore, prefChangeMsg);

                var user = dataStore.getUserById('U0CJ5PC7L');
                expect(user.prefs[humps.camelize(prefChangeMsg.name)]).to.equal(prefChangeMsg.value);
            });

            it('updates a channel, marking a user as typing when `user_typing` is received', function () {
                var dataStore = getMemoryDataStore();
                var channel = dataStore.getChannelById('C0CHZA86Q');
                var userTypingMsg = getRTMMessageFixture('user_typing');
                clientEventHandlers['user_typing'](dataStore, userTypingMsg);

                expect(channel._typing[userTypingMsg.user]).to.not.be.undefined;
            });

            it('adds a new user or updates an existing user when a `user_change` event is received', function() {
                var dataStore = getMemoryDataStore();
                clientEventHandlers['user_change'](dataStore, getRTMMessageFixture('user_change'));

                var user = dataStore.getUserById('U0CJ1TWKX');
                expect(user.profile.email).to.equal('leah+slack-api-test-user-change-test@slack-corp.com');
            });

        });

    });

});
