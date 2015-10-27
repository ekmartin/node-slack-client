/**
 * {@link https://api.slack.com/types/channel|Channel}
 */

var create = require('lodash.create');

var Model = require('./model');
var utils = require('./utils');


var Channel = function(opts) {
  Model.call(this, 'Channel', opts);
};


Channel.prototype = create(Model.prototype, {
  constructor: Channel
});


Channel.prototype.setProperties = function(opts) {
  this.isChannel = opts['is_channel'];
  this.isGeneral = opts['is_general'];
  utils.setChannelGroupProperties(this, opts);
};


module.exports = Channel;
