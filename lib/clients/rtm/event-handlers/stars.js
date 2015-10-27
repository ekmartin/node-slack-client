/**
 * Handlers for all RTM `star_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;


/** {@link https://api.slack.com/events/star_removed|star_removed} */
var handleStarRemoved = function(dataStore, message) {

};


/** {@link https://api.slack.com/events/star_added|star_added} */
var handleStarAdded = function(dataStore, message) {

};


var handlers =   [
  [RTM_EVENTS.STAR_ADDED, handleStarAdded],
  [RTM_EVENTS.STAR_REMOVED, handleStarRemoved]
];


module.exports = zipObject(handlers);
