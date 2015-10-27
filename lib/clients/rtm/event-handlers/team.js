/**
 * Handlers for all RTM `team_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');


/** {@link https://api.slack.com/events/team_domain_change|team_domain_change} */
var handleTeamDomainChange = function(dataStore, message) {
  dataStore.team.domain = message['domain'];
  dataStore.team.url = message['url'];

  return dataStore.team;
};


/** {@link https://api.slack.com/events/team_rename|team_rename} */
var handleTeamRename = function(dataStore, message) {
  dataStore.team.domain = message['name'];
  return dataStore.team.domain;
};


/** {@link https://api.slack.com/events/team_pref_change|team_pref_change} */
var handleTeamPrefChange = function(dataStore, message) {
  //return this.team.prefs[message.name] = message.value;
};


var handlers = [
  [RTM_EVENTS.TEAM_DOMAIN_CHANGE, handleTeamDomainChange],
  [RTM_EVENTS.TEAM_RENAME, handleTeamRename],
  [RTM_EVENTS.TEAM_PREF_CHANGE, handleTeamPrefChange],
  [RTM_EVENTS.TEAM_JOIN, commonHandlers.handleNewOrUpdatedUser]
];


module.exports = zipObject(handlers);

