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
});
