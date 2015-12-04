var WebClient = require('../lib/web/client');
var RtmClient = require('../lib/rtm/client');

var transport = require('../web/transports/request');
var token = '' || process.env.SLACK_API_TOKEN;

var webClient = new WebClient(token, transport);

var wsMaker = require('../rtm/sockets/ws');
var rtm = new RtmClient(webClient, wsMaker, {logLevel: 'debug'});
rtm.start();
