/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var Message = function (opts) {
    Model.call(this, 'Message', opts);
};


Message.prototype = create(Model.prototype, {
    constructor: Message
});


Message.prototype.setProperties = function (opts) {
    this.type = opts['type'];
    this.channel = opts['channel'];
    this.user = opts['user'];
    this.text = opts['text'];
    this.ts = opts['ts'];
};


module.exports = Message;
