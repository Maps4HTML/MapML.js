exports.test = (path, expectedPCRS, expectedGCRS) => {
  describe(`<Layer>.extent Property Tests for ${path.split(".")[0]}`, () => {
    beforeAll(async () => {
      await page.goto(PATH + path);
    });

    test("<layer->.extent test", async () => {
      const extent = await page.$eval(
        "body > map > layer-:nth-child(1)",
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty("zoom")).toBeTruthy();
      expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
      expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
      expect(extent.hasOwnProperty("projection")).toBeTruthy();
      expect(extent.topLeft.pcrs).toEqual(expectedPCRS.topLeft);
      expect(extent.bottomRight.pcrs).toEqual(expectedPCRS.bottomRight);
      expect(extent.topLeft.gcrs).toEqual(expectedGCRS.topLeft);
      expect(extent.bottomRight.gcrs).toEqual(expectedGCRS.bottomRight);
    });
    test("2nd <layer->.extent test", async () => {
      const extent = await page.$eval(
        "body > map > layer-:nth-child(2)",
        (layer) => layer.extent
      );
      expect(extent.hasOwnProperty("zoom")).toBeTruthy();
      expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
      expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
      expect(extent.hasOwnProperty("projection")).toBeTruthy();
    });
  });
};