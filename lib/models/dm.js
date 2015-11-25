/**
 * {@link https://api.slack.com/types/im|DM}
 */

var create = require('lodash.create');

var BaseChannel = require('./base-channel');
var Message = require('./message');


var DM = function(opts) {
    BaseChannel.call(this, 'DM', opts);
};


DM.prototype = create(BaseChannel.prototype, {
    constructor: DM,
    parent: BaseChannel.prototype
});


DM.prototype.setProperties = function(opts) {
    this.parent.setProperties.call(this, opts);

    //this.id = opts['id'];
    //this.isDM = opts['is_im'];
    //this.user = opts['user'];
    //this.created = opts['created'];
    //this.isUserDeleted = opts['is_user_deleted'];
    //this.isOpen = opts['is_open'];
    //this.unreadCount = opts['unread_count'];
    //this.latest = new Message(opts['latest']);
};


module.exports = DM;
