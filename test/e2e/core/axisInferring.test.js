describe("UI Drag&Drop Test", () => {
  beforeAll(async () => {
    await page.goto(PATH + "axisInferring.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("TileMatrix inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(1)",
      (layer) => layer.extent
    );

    await expect(layerExtent.topLeft.tilematrix[0]).toEqual({ horizontal: 0, vertical: 1 });
    await expect(layerExtent.bottomRight.tilematrix[0]).toEqual({ horizontal: 4, vertical: 5 });
  });

  test("TCRS inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(2)",
      (layer) => layer.extent
    );

    await expect(layerExtent.topLeft.tcrs[0]).toEqual({ horizontal: 0, vertical: 256 });
    await expect(layerExtent.bottomRight.tcrs[0]).toEqual({ horizontal: 256, vertical: 512 });
  });

  test("PCRS inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(3)",
      (layer) => layer.extent
    );
    await expect(layerExtent.topLeft.pcrs).toEqual({ horizontal: 100, vertical: 600 });
    await expect(layerExtent.bottomRight.pcrs).toEqual({ horizontal: 500, vertical: 150 });
  });

  test("GCRS inferring", async () => {
    const EPSILON = 0.0000001;
    const expectedTopLeftLongitude = -92.0;
    const expectedTopLeftLatitude = 52.999999999993484;
    const expectedBottomRightLongitude = -62.0;
    const expectedBottomRightLatitude = 33.99999999999964;
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(4)",
      (layer) => layer.extent
    );
    await expect(Math.abs(layerExtent.topLeft.gcrs.horizontal - expectedTopLeftLongitude) < EPSILON);
    await expect(Math.abs(layerExtent.topLeft.gcrs.vertical - expectedTopLeftLatitude) < EPSILON);
    await expect(Math.abs(layerExtent.bottomRight.gcrs.horizontal - expectedBottomRightLongitude) < EPSILON);
    await expect(Math.abs(layerExtent.bottomRight.gcrs.vertical - expectedBottomRightLatitude) < EPSILON);
  });
});
