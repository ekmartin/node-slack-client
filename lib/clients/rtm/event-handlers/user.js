/**
 * Handlers for all RTM `user_*` events.
 */

var humps = require('humps');
var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');


/** {@link https://api.slack.com/events/user_typing|user_typing} */
var handleUserTyping = function (dataStore, message) {
    var user = dataStore.getUserByID(message.user);
    var channel = dataStore.getChannelByID(message.channel);

    if (channel && user) {
        channel.startedTyping(user.id);
    } else {
        // TODO(leah): Logs for when channel / user aren't found.
    }

    return message;
};


/** {@link https://api.slack.com/events/pref_change|pref_change} */
var handlePrefChange = function (activeUserId, activeTeamId, dataStore, message) {
    var user = dataStore.getUserByID(activeUserId);
    var camelPrefName = humps.camelize(message.name);
    user.prefs[camelPrefName] = message.value;

    return message;
};


var handlers = [
    [RTM_EVENTS.PREF_CHANGE, handlePrefChange],
    [RTM_EVENTS.USER_TYPING, handleUserTyping],
    [RTM_EVENTS.USER_CHANGE, commonHandlers.handleNewOrUpdatedUser]
];


module.exports = zipObject(handlers);
