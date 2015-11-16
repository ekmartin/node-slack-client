/**
 *
 */

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var forEach = require('lodash.foreach');


var handlerModules = [
  require('./bots'),
  require('./channels'),
  require('./groups'),
  require('./dm'),
  require('./presence'),
  require('./stars'),
  require('./team'),
  require('./user')
];

var handleMessage = function() {
  //m = new Message(this, message);
  //this.emit('message', m);
  //channel = this.getChannelGroupOrDMByID(message.channel);
  //if (channel) {
  //  return channel.addMessage(m);
  //}
};


var handleError = function() {
  //return this.emit('error', message.error);
};


var handlers = {};
handlers[RTM_EVENTS.MESSAGE] = handleMessage;

forEach(handlerModules, function(mod) {
  forEach(mod, function(val, key) {
    handlers[key] = val;
  });
});


module.exports = handlers;
