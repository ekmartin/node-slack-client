/**
 * Handlers for all RTM `bot_*` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;
var models = require('../../../models');


var upsertBot = function(dataStore, bot) {
  var bot = new models.Bot(bot);
  dataStore.setBot(bot);
  return bot;
};


/** {@link https://api.slack.com/events/bot_added|bot_added} */
var handleBotAdded = function(dataStore, message) {
  message.bot = upsertBot(dataStore, message.bot);
  return message;
};


/** {@link https://api.slack.com/events/bot_changed|bot_changed} */
var handleBotChanged = function(dataStore, message) {
  message.bot = upsertBot(dataStore, message.bot);
  return message;
};


var handlers =   [
  [RTM_EVENTS.BOT_ADDED, handleBotAdded],
  [RTM_EVENTS.BOT_CHANGED, handleBotChanged]
];


module.exports = zipObject(handlers);
