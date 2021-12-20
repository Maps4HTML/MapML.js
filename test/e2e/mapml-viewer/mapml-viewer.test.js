//expected topLeft values in the different cs, at the different
//positions the map goes in
let expectedPCRS = [
  { horizontal: -9373489.01871137, vertical: 11303798.154262971 },
  { horizontal: -5059449.140631609, vertical: 10388337.990009308 }];
let expectedGCRS = [
  { horizontal: -128.07848522325827, vertical: -3.3883427348651636 },
  { horizontal: -131.75138842058425, vertical: 18.07246131233218 }];
let expectedFirstTileMatrix = [
  { horizontal: 2.57421875, vertical: 2.8515625 },
  { horizontal: 3.0134698275862073, vertical: 2.944773706896552 }];
let expectedFirstTCRS = [
  { horizontal: 659, vertical: 730 },
  { horizontal: 771.4482758620691, vertical: 753.8620689655173 }];

let controls = ["leaflet-control-zoom leaflet-bar leaflet-control",
  "mapml-reload-button leaflet-bar leaflet-control",
  "leaflet-control-fullscreen leaflet-bar leaflet-control"];
let options = ["nozoom", "noreload", "nofullscreen"];

describe("Playwright mapml-viewer Element Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "mapml-viewer.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Initial map element extent", async () => {
    const extent = await page.$eval(
      "body > mapml-viewer",
      (map) => map.extent
    );

    await expect(extent.projection).toEqual("CBMTILE");
    await expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    await expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
    await expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
    await expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[0]);
    await expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
  });
  test("Panned and zoomed initial map's extent", async () => {
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.zoomTo(81, -63, 1)
    );
    await page.waitForTimeout(1000);
    const extent = await page.$eval(
      "body > mapml-viewer",
      (map) => map.extent
    );

    await expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 25 });
    await expect(extent.topLeft.pcrs).toEqual(expectedPCRS[1]);
    await expect(extent.topLeft.gcrs).toEqual(expectedGCRS[1]);
    await expect(extent.topLeft.tilematrix[0]).toEqual(expectedFirstTileMatrix[1]);
    await expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[1]);
  });

  describe("Attributes Tests", () => {
    for (let i in controls) {
      describe("Controls List " + options[i] + " Attribute Tests", () => {
        test(options[i] + " removes controls", async () => {
          await page.$eval("body > mapml-viewer",
            (layer, context) => layer.setAttribute("controlslist", context.options[context.i]), { options: options, i: i });

          let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left", (div) => div.children),
            found = false;
          for (let [key, value] of Object.entries(children)) {
            if (value.className === controls[i]) found = true;
          }
          await expect(found).toEqual(false);
        });
        test("Toggle controls, controls aren't re-enabled", async () => {
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > button:nth-child(5)");
          await page.click("body > mapml-viewer", { button: "right" });
          await page.click("div > div.mapml-contextmenu > button:nth-child(5)");

          let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-left", (div) => div.children),
            found = false;
          for (let [key, value] of Object.entries(children)) {
            if (value.className === controls[i]) found = true;
          }
          await expect(found).toEqual(false);
        });

      });
    }
    describe("Controls List nolayer Attribute Tests", () => {
      test("Nolayer removes controls", async () => {
        await page.$eval("body > mapml-viewer",
          (layer) => layer.setAttribute("controlslist", "nolayer"));

        let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right", (div) => div.childElementCount);
        await expect(children).toEqual(0);
      });
      test("Toggle controls, controls aren't re-enabled", async () => {
        await page.click("body > mapml-viewer", { button: "right" });
        await page.click("div > div.mapml-contextmenu > button:nth-child(5)");
        await page.click("body > mapml-viewer", { button: "right" });
        await page.click("div > div.mapml-contextmenu > button:nth-child(5)");

        let children = await page.$eval("div > div.leaflet-control-container > div.leaflet-top.leaflet-right", (div) => div.childElementCount);
        await expect(children).toEqual(0);
      });
    });
  });
});