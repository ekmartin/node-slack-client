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


var ALICE_USER_ID = 'U0CJ5PC7L';
var TEST_CHANNEL_ID = 'C0CJ25PDM';


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

        var testBaseChannelMarked = function(event, baseChannelId) {
            var dataStore = getMemoryDataStore();

            var baseChannel = dataStore.getChannelGroupOrDMById(baseChannelId);
            baseChannel.history.push({ts: 1});
            baseChannel.history.push({ts: 2});

            var originalUnreads = baseChannel.recalcUnreads();
            expect(originalUnreads).to.equal(2);

            clientEventHandlers[event](dataStore, getRTMMessageFixture(event));
            var newUnreads = baseChannel.recalcUnreads();

            expect(newUnreads).to.equal(0);
        };

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
                testBaseChannelMarked('im_marked', 'D0CHZQWNP');
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
                var channel = dataStore.getChannelById(TEST_CHANNEL_ID);
                expect(channel.isArchived).to.equal(expected);
            };

            it('sets isArchived to true on a channel when a `channel_archive` message is received', function() {
                isArchivedChange('channel_archive', true);
            });

            it('sets isArchived to false on a channel when a `channel_unarchive` message is received', function() {
                isArchivedChange('channel_unarchive', false);
            });

            it('renames a channel when a `channel_rename` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['channel_rename'](dataStore, getRTMMessageFixture('channel_rename'));
                var channel = dataStore.getChannelById(TEST_CHANNEL_ID);
                expect(channel.name).to.equal('test-channel-rename');
            });

            it('creates a new channel when a `channel_created` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['channel_created'](dataStore, getRTMMessageFixture('channel_created'));
                var channel = dataStore.getChannelById('C0F3Q8LH5');
                expect(channel).to.not.be.undefined;
            });

            it('deletes a channel when a `channel_deleted` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['channel_deleted'](dataStore, getRTMMessageFixture('channel_deleted'));
                var channel = dataStore.getChannelById(TEST_CHANNEL_ID);
                expect(channel).to.be.undefined;
            });

            it('creates a new channel object and replaces the old one when a `channel_joined` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['channel_joined'](dataStore, getRTMMessageFixture('channel_joined'));
                var channel = dataStore.getChannelById(TEST_CHANNEL_ID);
                expect(channel.members).to.have.length(2);
                expect(channel).to.have.deep.property('members[1]', 'U0F3LFX6K');
            });

            it('removes the user from a channel when a `channel_left` message is received', function() {
                var dataStore = getMemoryDataStore();

                clientEventHandlers['channel_left'](ALICE_USER_ID, '', dataStore, getRTMMessageFixture('channel_left'));
                var channel = dataStore.getChannelById(TEST_CHANNEL_ID);
                expect(channel.members).to.not.contain(ALICE_USER_ID);
            });
            
            it('marks the channel as read when a `channel_marked` message is received', function() {
                testBaseChannelMarked('channel_marked', TEST_CHANNEL_ID);
            });

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
                clientEventHandlers['pref_change'](ALICE_USER_ID, '', dataStore, prefChangeMsg);

                var user = dataStore.getUserById(ALICE_USER_ID);
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