/**
 * Handlers for all RTM `user_*` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');


/** {@link https://api.slack.com/events/user_typing|user_typing} */
var handleUserTyping = function(dataStore, message) {
  var user = dataStore.getUserByID(message['user']);
  var channel = dataStore.getChannelGroupOrIMByID(message['channel']);

  channel.startedTyping(user.id);
  // TODO(leah): Logs for when channel / user aren't found.

  return {
    user: user,
    channel: channel
  };
};


/** {@link https://api.slack.com/events/pref_change|pref_change} */
var handlePrefChange = function(dataStore, message) {
  //return this.self.prefs[message.name] = message.value;
};


var handlers = [
  [RTM_EVENTS.PREF_CHANGE, handlePrefChange],
  [RTM_EVENTS.USER_TYPING, handleUserTyping],
  [RTM_EVENTS.USER_CHANGE, commonHandlers.handleNewOrUpdatedUser]
];


module.exports = zipObject(handlers);
