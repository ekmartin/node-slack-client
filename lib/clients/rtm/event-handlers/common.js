/**
 *
 */

var models = require('../../../models');


/**
 * {@link https://api.slack.com/events/channel_marked|channel_marked}
 * {@link https://api.slack.com/events/group_marked|group_marked}
 * {@link https://api.slack.com/events/im_marked|im_marked}
 */
var handleChannelGroupOrDMMarked = function (dataStore, message) {
    var channel = dataStore.getChannelGroupOrDMById(message.channel);

    if (channel) {
      channel.lastRead = message.ts;
      channel.recalcUnreads();
    }
};


/**
 * {@link https://api.slack.com/events/team_join|team_join}
 * {@link https://api.slack.com/events/user_change|user_change}
 */
var handleNewOrUpdatedUser = function (dataStore, message) {
    var user = new models.User(message.user);
    dataStore.setUser(user);
};


module.exports.handleChannelGroupOrDMMarked = handleChannelGroupOrDMMarked;
module.exports.handleNewOrUpdatedUser = handleNewOrUpdatedUser;
