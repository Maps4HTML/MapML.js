const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");

let expectedPCRS = {
  topLeft: {
    horizontal: 1501645.2210838948,
    vertical: -66110.70639331453,
  },
  bottomRight: {
    horizontal: 1617642.4028044068,
    vertical: -222452.18449031282,
  },
}, expectedGCRS = {
  topLeft: {
    horizontal: -76,
    vertical: 45.999999999999936,
  },
  bottomRight: {
    horizontal: -74,
    vertical: 44.99999999999991,
  },
};

describe("Playwright mapMLTemplatedFeatures Layer Tests", () => {
  isVisible.test("mapMLTemplatedFeatures.html", 3, 2);
  zoomLimit.test("mapMLTemplatedFeatures.html", 2, 1);
  extentProperty.test("mapMLTemplatedFeatures.html", expectedPCRS, expectedGCRS);

  beforeAll(async () => {
    await page.goto(PATH + "mapMLTemplatedFeatures.html");
  });
  afterAll(async function () {
    await context.close();
  });
  
  describe("Retreived Features Loading Tests", () => {

    test("Loading in tilematrix feature", async () => {
      await page.waitForTimeout(200);
      const feature = await page.$eval(
        "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(3) > path.leaflet-interactive",
        (tile) => tile.getAttribute("d")
      );
      await expect(feature).toEqual("M382 -28L809 -28L809 399L382 399z");
    });

    test("Loading in pcrs feature", async () => {
      const feature = await page.$eval(
        "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(1) > path.leaflet-interactive",
        (tile) => tile.getAttribute("d")
      );
      await expect(feature).toEqual("M88 681L21 78L-436 201L-346 561z");
    });

    test("Loading in tcrs feature", async () => {
      const feature = await page.$eval(
        "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg > g > g:nth-child(2) > path.leaflet-interactive",
        (tile) => tile.getAttribute("d")
      );
      await expect(feature).toEqual("M307 456L599 467L612 629L381 599z");
    });
  });
  describe("Simple query by select values without map extent filter tests", () => {
    beforeEach(async () => {
      await page.goto(PATH + "mapMLTemplatedFeatures.html");
      await page.waitForTimeout(200);
    });
    test("All features loaded at start", async () => {
      const features = await page.$$("css= body > map:nth-child(2) > .mapml-web-map >> css= div > .mapml-templatedlayer-container > div > div > svg > g > g");
      await expect(features.length).toEqual(8);
    });
    test("User can select/filter features by category", async () => {
        const restaurants = await page.$$("css= map:nth-child(2) .mapml-templatedlayer-container g > g");
        await expect(restaurants.length).toEqual(8);

        await page.hover("css= map:nth-child(2) .leaflet-control-container .leaflet-top.leaflet-right > div");
        await page.click("css= map:nth-child(2) button.mapml-layer-item-settings-control.mapml-button");
        await page.click("css= map:nth-child(2) details.mapml-control-layers");
        await page.selectOption('css= map:nth-child(2) details.mapml-control-layers select', 'italian');
        await page.waitForTimeout(250);
        
        const features = await page.$$("css= map:nth-child(2) .mapml-templatedlayer-container g > g");
        await expect(features.length).toEqual(1);
    });
    test("<map-select> <map-option> attributes are copied to layer control <option> elements", async () => {
      const firstOptionSelected = await page.$eval('css= map:nth-child(2) details.mapml-control-layers select option:nth-child(1)', (option) => option.selected);
      await expect(firstOptionSelected).toBeTruthy();
      const firstOptionLabel = await page.$eval('css= map:nth-child(2) details.mapml-control-layers select option:nth-child(1)', (option) => option.label);
      await expect(firstOptionLabel).toEqual("All cuisines");
      const firstOptionValue = await page.$eval('css= map:nth-child(2) details.mapml-control-layers select option:nth-child(1)', (option) => option.value);
      await expect(firstOptionValue).toEqual("restaurants");
      const thirdOptionValue = await page.$eval('css= map:nth-child(2) details.mapml-control-layers select option:nth-child(3)', (option) => option.value);
      await expect(thirdOptionValue).toEqual("african");
      
    });
  });
});
