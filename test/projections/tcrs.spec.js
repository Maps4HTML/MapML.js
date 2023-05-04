/* global assert, M */
describe('TCRS Tests', function () {
  describe('CBMTILE Tests', function () {
    var cbmtile;
    test('M.CBMTILE origin', async () => {
      cbmtile = M.CBMTILE;
      await expect(cbmtile.options.origin[0]).toBe(-34655800);
      await expect(cbmtile.options.origin[1]).toBe(39310000);
    });
  });
  // for (OSMTILE, CBMTILE, WGS84, APSTILE)
  // options.origin at expected location
  // options.bounds equal to expected bounds
  // options.resolutions has exactly the same number of zoom levels as expected
  // options.resolutions[zoom] === to expexted value
  // if it exists, .scales[] has the same dimension as options.resolutions
  // .scales[zoom] is equal to the inverse of options.resolutions[zoom]
  // for (crs in tcrs,pcrs,gcrs,map,tile,tilematrix)
  //   options.crs.(tcrs,pcrs,gcrs,map,tile,tilematrix) are deep equal to expected
});
