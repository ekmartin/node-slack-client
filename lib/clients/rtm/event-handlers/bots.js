/**
 * Handlers for all RTM `bot_*` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;


/** {@link https://api.slack.com/events/bot_added|bot_added} */
var handleBotAdded = function(dataStore, message) {
  //return this.bots[message.bot.id] = new Bot(this, message.bot);
};


/** {@link https://api.slack.com/events/bot_changed|bot_changed} */
var handleBotChanged = function(dataStore, message) {
  //return this.bots[message.bot.id] = new Bot(this, message.bot);
};


var handlers =   [
  [RTM_EVENTS.BOT_ADDED, handleBotAdded],
  [RTM_EVENTS.BOT_CHANGED, handleBotChanged]
];


module.exports = zipObject(handlers);
