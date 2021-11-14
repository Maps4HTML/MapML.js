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

    expect(layerExtent.topLeft.tilematrix[0]).toEqual({ horizontal: 0, vertical: 1 });
    expect(layerExtent.bottomRight.tilematrix[0]).toEqual({ horizontal: 4, vertical: 5 });
  });

  test("TCRS inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(2)",
      (layer) => layer.extent
    );

    expect(layerExtent.topLeft.tcrs[0]).toEqual({ horizontal: 0, vertical: 256 });
    expect(layerExtent.bottomRight.tcrs[0]).toEqual({ horizontal: 256, vertical: 512 });
  });

  test("PCRS inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(3)",
      (layer) => layer.extent
    );
    expect(layerExtent.topLeft.pcrs).toEqual({ horizontal: 100, vertical: 600 });
    expect(layerExtent.bottomRight.pcrs).toEqual({ horizontal: 500, vertical: 150 });
  });

  test("GCRS inferring", async () => {
    const layerExtent = await page.$eval(
      "body > map > layer-:nth-child(4)",
      (layer) => layer.extent
    );
    expect(layerExtent.topLeft.gcrs).toEqual({ horizontal: -92, vertical: 52.999999999993484 });
    expect(layerExtent.bottomRight.gcrs).toEqual({ horizontal: -62, vertical: 33.99999999999964 });
  });
});
