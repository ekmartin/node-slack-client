/**
 *
 */

var findIndex = require('lodash').findIndex;
var isUndefined = require('lodash').isUndefined;
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
    this.isStarred = isUndefined(opts.isStarred) ? false : opts.isStarred;
};


Message.prototype.getReactionIndex = function(reactionName) {
    return findIndex(this.reactions, {name: reactionName});
};


/**
 *
 * @param reactionName
 */
Message.prototype.getReaction = function(reactionName) {
    return this.reactions[this.getReactionIndex(reactionName)];
};


module.exports = Message;
