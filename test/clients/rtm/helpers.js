var expect = require('chai').expect;

var rtmHelpers = require('../../../lib/clients/rtm/helpers');


describe('RTM Client helpers', function() {
  describe('#parseRTMMessage()', function() {
    it('should process a raw message object, converting it to JSON with camelcased keys', function() {
      var testMsg = {
        "ok": true,
        "reply_to": 1,
        "ts": "1355517523.000005",
        "text": "Hello world"
      };
      var message = rtmHelpers.parseRTMMessage(JSON.stringify(testMsg));
      expect(message).to.deep.equal({
        ok: true,
        replyTo: 1,
        ts: "1355517523.000005",
        text: "Hello world"
      });
    });
  });
});

