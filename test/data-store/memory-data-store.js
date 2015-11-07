var expect = require('chai').expect;

var MemoryDataStore = require('../../lib/data-store/memory-data-store');


describe('MemoryDataStore', function() {

  var dataStore;
  before(function(){
    dataStore = new MemoryDataStore();
    dataStore.cacheRtmStart(require('../fixtures/rtm.start.json'));
  });

  describe('#cacheRtmStart()', function() {

     it('caches the RTM start response', function() {
        //expect(dataStore.self.name).to.equal('alice');
        //expect(dataStore.team.name).to.equal('slack-api-test');
        expect(dataStore.users['U0CJ5PC7L'].name).to.equal('alice');
        expect(dataStore.channels['C0CJ25PDM'].name).to.equal('test');
        expect(dataStore.dms['D0CHZQWNP'].latest.text).to.equal('hi alice!');
        expect(dataStore.groups['G0CHZSXFW'].name).to.equal('private');
        expect(dataStore.bots['B0CJ5FF1P'].name).to.equal('gdrive');
     });

  });

  describe('#getChannelByName()', function() {
    it('should get a channel by name or #name', function() {
      var channel = dataStore.getChannelByName('test');
      expect(channel.name).to.equal('test');
    });
  });

  describe('#getChannelGroupOrIMByID()', function() {
    it('should get a channel by id', function() {
      expect(dataStore.getChannelGroupOrDMByID('C0CJ25PDM')).to.not.be.undefined;
    });

    it('should get a group by id', function() {
      expect(dataStore.getChannelGroupOrDMByID('G0CHZSXFW')).to.not.be.undefined;
    });

    it('should get an IM by id', function() {
      expect(dataStore.getChannelGroupOrDMByID('D0CHZQWNP')).to.not.be.undefined;
    });
  });

  describe('#clear()', function() {
    it('should re-set the indices when clear() is called', function() {
      var ds = new MemoryDataStore();
      ds.setChannel({id: 'C1', name: 'test'});
      expect(ds._indices).to.have.deep.property('channels.name.test', 'C1');
      ds.clear();
      expect(ds._indices.channels).to.deep.equal({name: {}});
    });
  });

});
