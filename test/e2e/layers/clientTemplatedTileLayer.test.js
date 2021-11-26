describe("Playwright Client Tile Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "clientTemplatedTileLayer.html");
  });

  afterAll(async function () {
    await browser.close();
  });

  test("Custom Tiles Loaded In, Accurate Coordinates", async () => {
    const one = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(1) > p",
      (tile) => tile.textContent
    );
    const two = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(2) > p",
      (tile) => tile.textContent
    );
    const three = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(3) > p",
      (tile) => tile.textContent
    );
    const four = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(4) > p",
      (tile) => tile.textContent
    );
    const five = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(5) > p",
      (tile) => tile.textContent
    );
    const six = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(6) > p",
      (tile) => tile.textContent
    );
    const seven = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(7) > p",
      (tile) => tile.textContent
    );
    const eight = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(8) > p",
      (tile) => tile.textContent
    );

    await expect(one).toEqual("101");
    await expect(two).toEqual("001");
    await expect(three).toEqual("201");
    await expect(four).toEqual("111");
    await expect(five).toEqual("011");
    await expect(six).toEqual("211");
    await expect(seven).toEqual("301");
    await expect(eight).toEqual("311");

  });
});