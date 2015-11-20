/**
 * Deserializes a Slack API response.
 */


var deserialize = function (responseArgs, data) {
    try {
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
};


module.exports = deserialize;
