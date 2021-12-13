const playwright = require("playwright");

let expectedPCRSFirstLayer = {
  topLeft: {
    horizontal: -3263369.215138428,
    vertical: 4046262.80585894,
  },
  bottomRight: {
    horizontal: 3823752.959105924,
    vertical: -1554448.395563461,
  },
}, expectedGCRSFirstLayer = {
  topLeft: {
    horizontal: -125.78104358919225,
    vertical: 56.11474703973131,
  },
  bottomRight: {
    horizontal: -5.116088318047697,
    vertical: 28.87016583287855,
  },
};

let expectedPCRSSecondLayer = {
  topLeft: {
    horizontal: -7786477,
    vertical: 7928344,
  },
  bottomRight: {
    horizontal: 7148753,
    vertical: -927808,
  },
}, expectedGCRSSecondLayer = {
  topLeft: {
    horizontal: -155.3514099767017,
    vertical: 22.2852694215843,
  },
  bottomRight: {
    horizontal: 32.23057852696884,
    vertical: 10.170068283825733,
  },
};

describe("Playwright Missing Min Max Attribute, Meta Default Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "metaDefault.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Inline layer extent test", async () => {
    const extent = await page.$eval(
      "body > mapml-viewer > layer-:nth-child(1)",
      (layer) => layer.extent
    );
    await expect(extent.hasOwnProperty("zoom")).toBeTruthy();
    await expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
    await expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
    await expect(extent.hasOwnProperty("projection")).toBeTruthy();
    await expect(extent.topLeft.pcrs).toEqual(expectedPCRSFirstLayer.topLeft);
    await expect(extent.bottomRight.pcrs).toEqual(expectedPCRSFirstLayer.bottomRight);
    await expect(extent.topLeft.gcrs).toEqual(expectedGCRSFirstLayer.topLeft);
    await expect(extent.bottomRight.gcrs).toEqual(expectedGCRSFirstLayer.bottomRight);
  });
  test("Fetched layer extent test", async () => {
    const extent = await page.$eval(
      "body > mapml-viewer > layer-:nth-child(2)",
      (layer) => layer.extent
    );

    await expect(extent.hasOwnProperty("zoom")).toBeTruthy();
    await expect(extent.hasOwnProperty("topLeft")).toBeTruthy();
    await expect(extent.hasOwnProperty("bottomRight")).toBeTruthy();
    await expect(extent.hasOwnProperty("projection")).toBeTruthy();
    await expect(extent.topLeft.pcrs).toEqual(expectedPCRSSecondLayer.topLeft);
    await expect(extent.bottomRight.pcrs).toEqual(expectedPCRSSecondLayer.bottomRight);
    await expect(extent.topLeft.gcrs).toEqual(expectedGCRSSecondLayer.topLeft);
    await expect(extent.bottomRight.gcrs).toEqual(expectedGCRSSecondLayer.bottomRight);
  });
});