describe("Simple query by select values without map extent filter tests", () => {
  beforeEach(async () => {
    await page.goto(PATH + "mapMLTemplatedFeaturesFilter.html");
    await page.waitForTimeout(200);
  });
  afterAll(async function () {
    await context.close();
  });
  test("All features loaded at start", async () => {
    const features = await page.$$("css= body > mapml-viewer >> css= div > .mapml-templatedlayer-container > div > div > svg > g > g");
    await expect(features.length).toEqual(8);
  });
  test("User can select/filter features by category", async () => {
      const restaurants = await page.$$("css= body > mapml-viewer >> css= div > .mapml-templatedlayer-container > div > div > svg > g > g");
      await expect(restaurants.length).toEqual(8);

      await page.hover("css= body > mapml-viewer >> css= div > .leaflet-control-container .leaflet-top.leaflet-right > div");
      await page.click("css= body > mapml-viewer >> css= div > button.mapml-layer-item-settings-control.mapml-button");
      await page.click("css= body > mapml-viewer >> css= div > details:nth-child(2).mapml-control-layers");
      await page.selectOption("css= body > mapml-viewer >> css= details:nth-child(2).mapml-control-layers select", "italian");
      await page.waitForTimeout(250);

      const features = await page.$$("css= body > mapml-viewer >> css= div > .mapml-templatedlayer-container > div > div > svg > g > g");
      await expect(features.length).toEqual(1);
  });
  test("<map-select> <map-option> attributes are copied to layer control <option> elements", async () => {
    const firstOptionSelected = await page.$eval('css= mapml-viewer details.mapml-control-layers select option:nth-child(1)', (option) => option.selected);
    await expect(firstOptionSelected).toBeTruthy();
    const firstOptionLabel = await page.$eval('css= mapml-viewer details.mapml-control-layers select option:nth-child(1)', (option) => option.label);
    await expect(firstOptionLabel).toEqual("All cuisines");
    const firstOptionValue = await page.$eval('css= mapml-viewer details.mapml-control-layers select option:nth-child(1)', (option) => option.value);
    await expect(firstOptionValue).toEqual("restaurants");
    const thirdOptionValue = await page.$eval('css= mapml-viewer details.mapml-control-layers select option:nth-child(3)', (option) => option.value);
    await expect(thirdOptionValue).toEqual("african");

  });
});
