/**
 *
 */

var InfoValue = require('./info-value');
var Message = require('./message');


var setChannelGroupProperties = function (obj, opts) {
    obj.id = opts['id'];
    obj.name = opts['name'];
    obj.created = opts['created'];
    obj.creator = opts['creator'];
    obj.isArchived = opts['is_archived'];
    obj.members = opts['members'];
    obj.topic = new InfoValue(opts['topic']);
    ;
    obj.purpose = new InfoValue(opts['purpose']);
    ;
    obj.lastRead = opts['last_read'];
    obj.latest = new Message(opts['latest']);
    obj.unreadCount = opts['unread_count'];
    obj.unreadCountDisplay = opts['unread_count_display'];
};


module.exports.setChannelGroupProperties = setChannelGroupProperties;
