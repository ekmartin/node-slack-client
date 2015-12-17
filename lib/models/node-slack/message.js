/**
 *
 */

var inherits = require('inherits');

var Model = require('../model');


var Message = function (opts) {
    Model.call(this, 'Message', opts);
};

inherits(Message, Model);


Message.prototype.setProperties = function(opts) {
    Message.super_.prototype.setProperties.call(this, opts);

    this.type = opts['type'];
    this.channel = opts['channel'];
    this.user = opts['user'];
    this.text = opts['text'];
    this.ts = opts['ts'];

    this.reactions = opts.reactions || [];
};


/**
 *
 * @param reactionName
 */
Message.prototype.getReaction = function(reactionName) {
    forEach(this.reactions, function(reaction) {
        if (reaction.name === reactionName) {
            return reaction;
        }
    });
};


module.exports = Message;
