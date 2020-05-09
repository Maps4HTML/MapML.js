/* global assert, M */
describe('TCRS Tests', function() {
  describe('CBMTILE Tests', function() {
    var cbmtile;
    before(function() {
      cbmtile = M.CBMTILE;
    });
    it('M.CBMTILE origin', function () {
      assert.equal(cbmtile.options.origin[0], -34655800, 'should be at [-34655800, 39310000]');
      assert.equal(cbmtile.options.origin[1], 39310000, 'should be at [-34655800, 39310000]');
    });
    
  });
});
