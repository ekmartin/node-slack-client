/**
 *
 */

var events = require('events');

var WebClient = require('../web/client');
var RtmClient = require('../rtm/client');

var transport = require('../web/transports/request');
var token = 'xoxp-12611402179-12617794258-12626187174-36d24ae96a';

var webClient = new WebClient(token, transport);

var rtm = new RtmClient(webClient, require('../rtm/sockets/ws'), new events.EventEmitter());
rtm.start();
