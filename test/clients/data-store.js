var expect = require('chai').expect;

var DataStore = require('../../lib/clients/data-store');


describe('DataStore', function() {
  var dataStore = new DataStore();
  dataStore.cacheRtmStart(require('../fixtures/rtm.start.json'));

  describe('#cacheRtmStart()', function() {

     it('caches the RTM start response', function() {
        expect(dataStore.self.name).to.equal('alice');
        expect(dataStore.team.name).to.equal('slack-api-test');
        expect(dataStore.users['U0CJ5PC7L'].name).to.equal('alice');
        expect(dataStore.channels['C0CJ25PDM'].name).to.equal('test');
        expect(dataStore.ims['D0CHZQWNP'].latest.text).to.equal('hi alice!');
        expect(dataStore.groups['G0CHZSXFW'].name).to.equal('private');
        expect(dataStore.bots['B0CJ5FF1P'].name).to.equal('gdrive');
     });

  });

  describe('#getItemByProperty()', function() {
    it('should get an item from an object by property', function() {
      var obj = {
        'U1': {test: 'test', check: 'expected'},
        'U2': {test: 'test2', check: 'unexpected!'}
      };
      var item = dataStore.getItemByProperty('test', 'test', obj);
      expect(item).to.deep.equal({test: 'test', check: 'expected'});
    });
  });

  describe('#getChannelByName()', function() {
    it('should get a channel by name or #name', function() {
      var channel = dataStore.getChannelByName('#test');
      expect(channel.name).to.equal('test');
    });
  });

  describe('#getChannelGroupOrIMByID()', function() {
    it('should get a channel by id', function() {
      expect(dataStore.getChannelGroupOrIMByID('C0CJ25PDM')).to.not.be.undefined;
    });

    it('should get a group by id', function() {
      expect(dataStore.getChannelGroupOrIMByID('G0CHZSXFW')).to.not.be.undefined;
    });

    it('should get an IM by id', function() {
      expect(dataStore.getChannelGroupOrIMByID('D0CHZQWNP')).to.not.be.undefined;
    });
  });

});
