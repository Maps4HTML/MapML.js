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
      await expect(extent.hasOwnProperty("zoom")).toBeTruthy();
      await expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
      await expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
      await expect(extent.hasOwnProperty("projection")).toBeTruthy();
      await expect(extent.topLeft.pcrs).toEqual(expectedPCRS.topLeft);
      await expect(extent.bottomRight.pcrs).toEqual(expectedPCRS.bottomRight);
      await expect(extent.topLeft.gcrs).toEqual(expectedGCRS.topLeft);
      await expect(extent.bottomRight.gcrs).toEqual(expectedGCRS.bottomRight);
    });
    test("2nd <layer->.extent test", async () => {
      const extent = await page.$eval(
        "body > map > layer-:nth-child(2)",
        (layer) => layer.extent
      );
      await expect(extent.hasOwnProperty("zoom")).toBeTruthy();
      await expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
      await expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
      await expect(extent.hasOwnProperty("projection")).toBeTruthy();
    });
  });
};