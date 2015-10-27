var expect = require('chai').expect;

var isOK = require('../lib/middleware/is-ok');
var json = require('../lib/middleware/json');


describe('middleware', function() {

  describe('isOK', function() {

    it('throws an error when ok is false', function() {
      var fn = function() {
        isOK(null, {ok: false, error: 'api error'});
      };
      expect(fn).to.throw(/api error/);
    });

  });

  describe('json', function() {

    it('parses a JSON object', function() {
      var body = json(null, '{"ok": true, "name": "test"}');
      expect(body).to.have.property('name').that.equals('test');
    });

    it('throws an error for invalid JSON', function() {
      var fn = function() {
        json(null, '{');
      };
      expect(fn).to.throw(Error);
    });

  });

});
