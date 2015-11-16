/**
 *
 */

var events = require('events');

var WebClient = require('../web/client');
var RtmClient = require('../rtm/client');

var transport = require('../web/transports/request');
var token = process.env.SLACK_API_TOKEN

var webClient = new WebClient(token, transport);

var rtm = new RtmClient(webClient, require('../rtm/sockets/ws'), new events.EventEmitter());
rtm.start();
