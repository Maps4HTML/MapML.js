const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");

let expectedPCRS = {
  topLeft: {
    horizontal: -4175739.0398780815,
    vertical: 5443265.599864535,
  },
  bottomRight: {
    horizontal: 5984281.280162558,
    vertical: -1330081.280162558,
  },
}, expectedGCRS = {
  topLeft: {
    horizontal: -133.75137103791573,
    vertical: 36.915777752306546,
  },
  bottomRight: {
    horizontal: 13.251318374931316,
    vertical: 26.63127363018255,
  },
};

describe("Playwright mapMLStaticTile Layer Tests", () => {
  isVisible.test("mapMLStaticTileLayer.html", 3, 3);
  zoomLimit.test("mapMLStaticTileLayer.html", 2, 2);
  extentProperty.test("mapMLStaticTileLayer.html", expectedPCRS, expectedGCRS);
  describe("General Tests ", () => {
    beforeAll(async () => {
      await page.goto(PATH + "mapMLStaticTileLayer.html");
    });

    afterAll(async function () {
      await context.close();
    });

    test("Tiles load in on default map zoom level", async () => {
      const tiles = await page.$eval(
        "xpath=//html/body/map/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-static-tile-layer > div",
        (tileGroup) => tileGroup.getElementsByTagName("map-tile").length
      );
      expect(tiles).toEqual(1);
    });
  });
});
