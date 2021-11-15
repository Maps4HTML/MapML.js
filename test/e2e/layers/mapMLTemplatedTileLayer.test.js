const isVisible = require('./general/isVisible');
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");

let expectedPCRS = {
  topLeft: {
    horizontal: -180,
    vertical: 90,
  },
  bottomRight: {
    horizontal: 180,
    vertical: -270,
  },
}, expectedGCRS = {
  topLeft: {
    horizontal: -180,
    vertical: 90,
  },
  bottomRight: {
    horizontal: 180,
    vertical: -270,
  },
};

describe("Playwright mapMLTemplatedTile Layer Tests", () => {
  isVisible.test("mapMLTemplatedTileLayer.html", 2, 2);
  zoomLimit.test("mapMLTemplatedTileLayer.html", 1, 0);
  extentProperty.test("mapMLTemplatedTileLayer.html", expectedPCRS, expectedGCRS);
  describe("General Tests ", () => {
    beforeAll(async () => {
      await page.goto(PATH + "mapMLTemplatedTileLayer.html");
    });

    afterAll(async function () {
      await context.close();
    });

    test("SVG tiles load in on default map zoom level", async () => {
      const tiles = await page.$eval(
        "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div",
        (tileGroup) => tileGroup.getElementsByTagName("svg").length
      );
      expect(tiles).toEqual(2);
    });
  });

});