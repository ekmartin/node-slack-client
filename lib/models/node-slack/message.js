/**
 *
 */

var inherits = require('inherits');

var Model = require('../model');


var Message = function (opts) {
    Model.call(this, 'Message', opts);
};

inherits(Message, Model);


Message.prototype.setProperties = function (opts) {
    Message.super_.prototype.setProperties.call(this, opts);

    this.type = opts['type'];
    this.channel = opts['channel'];
    this.user = opts['user'];
    this.text = opts['text'];
    this.ts = opts['ts'];
};


module.exports = Message;
