/**
 * {@link https://api.slack.com/types/im|DM}
 */

var create = require('lodash.create');

var Model = require('./model');
var Message = require('./message');


var DM = function(opts) {
  Model.call(this, 'DM', opts);
};


DM.prototype = create(Model.prototype, {
  constructor: DM
});


DM.prototype.setProperties = function(opts) {
  this.id = opts['id'];
  this.isDM = opts['is_im'];
  this.user = opts['user'];
  this.created = opts['created'];
  this.isUserDeleted = opts['is_user_deleted'];
  this.isOpen = opts['is_open'];
  this.lastRead = opts['last_read'];
  this.unreadCount = opts['unread_count'];
  this.latest = new Message(opts['latest']);
};


module.exports = DM;
