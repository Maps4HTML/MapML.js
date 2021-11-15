describe("Playwright zoomin zoomout Projection Change Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "zoomChangeProjection.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("zoomin link changes projections", async () => {
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in");
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > map',
      (map) => map.projection
    );
    const layerValid = await page.$eval(
      'body > map > layer-',
      (layer) => !layer.hasAttribute('disabled')
    )
    expect(newProjection).toEqual("OSMTILE");
    expect(layerValid).toEqual(true);
  });

  test("zoomout link changes projections", async () => {
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out");
    await page.waitForTimeout(1000);
    const newProjection = await page.$eval(
      'body > map',
      (map) => map.projection
    );
    const layerValid = await page.$eval(
      'body > map > layer-',
      (layer) => !layer.hasAttribute('disabled')
    )
    expect(newProjection).toEqual("CBMTILE");
    expect(layerValid).toEqual(true);
  });
});