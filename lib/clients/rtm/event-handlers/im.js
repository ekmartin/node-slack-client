/**
 * Handlers for all RTM `im_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');


/** {@link https://api.slack.com/events/im_created|im_created} */
var handleIMCreated = function(dataStore, message) {
  //return this.dms[message.channel.id] = new DM(this, message.channel);
};


/** {@link https://api.slack.com/events/im_close|im_close} */
var handleIMClose = function(dataStore, message) {
  //if (this.dms[message.channel]) {
  //  return this.dms[message.channel].is_open = false;
  //}
};


var handleIMOpen = function(dataStore, message) {
  //if (this.dms[message.channel]) {
  //  return this.dms[message.channel].is_open = true;
  //}
};


var handlers = [
  [RTM_EVENTS.IM_CREATED, handleIMCreated],
  [RTM_EVENTS.IM_MARKED, commonHandlers.handleChannelGroupOrDMMarked],
  [RTM_EVENTS.IM_OPEN, handleIMClose],
  [RTM_EVENTS.IM_CLOSE, handleIMClose]
];


module.exports = zipObject(handlers);
