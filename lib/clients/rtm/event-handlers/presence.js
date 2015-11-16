/**
 * Event handlers for RTM presence change events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;


/** {@link https://api.slack.com/events/manual_presence_changed|manual_presence_changed} */
var handleManualPresenceChange = function(dataStore, message) {
  var user = dataStore.getUserByID(message['user']);

  if (user) {
    user.presence = message['presence'];
  }

  return user;
};


/** {@link https://api.slack.com/events/presence_changed|presence_changed} */
var handlePresenceChange = function(dataStore, message) {
  //dataStore.self.presence = message['presence'];
  //return this.dataStore.self;
};


var handlers = [
  [RTM_EVENTS.MANUAL_PRESENCE_CHANGE, handleManualPresenceChange],
  [RTM_EVENTS.PRESENCE_CHANGE, handlePresenceChange]
];


module.exports = zipObject(handlers);
