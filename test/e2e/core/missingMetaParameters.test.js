const playwright = require("playwright");
describe("Missing Parameters Test", () => {
  beforeEach(async () => {
    await page.goto(PATH + "missingMetaParameters.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Static features with missing <map-meta name='zoom'></map-meta> & <map-meta name='extent'></map-meta>", async () => {
    const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(1)",
      (controller) => controller.extent);

    await expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -34655800,
      vertical: 39310000,
    });
    await expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 14450964.88019643,
      vertical: -39260823.80831429,
    });
    await expect(layerController.zoom).toEqual({
      maxNativeZoom: 4,
      minNativeZoom: 2,
      minZoom: 0,
      maxZoom: 25
    });
  });

  test("Static tiles with missing <map-meta name='zoom'></map-meta>", async () => {
    const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(3)",
      (controller) => controller.extent);

    await expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -4175739.0398780815,
      vertical: 5443265.599864535,
    });
    await expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 5984281.280162558,
      vertical: -1330081.280162558,
    });
    await expect(layerController.zoom).toEqual({
      maxNativeZoom: 3,
      minNativeZoom: 2,
      minZoom: 1,
      maxZoom: 4,
      nativeZoom: 2,
    });
  });

  test("Templated features with missing <map-meta name='zoom'></map-meta>", async () => {
    const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(2)",
      (controller) => controller.extent);

    await expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453,
    });
    await expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282,
    });
    await expect(layerController.zoom).toEqual({
      maxNativeZoom: 18,
      minNativeZoom: 2,
      minZoom: 0,
      maxZoom: 25
    });
  });

  test("Templated tiles with missing <map-meta name='zoom'></map-meta> & extent", async () => {
    const layerController = await page.$eval("body > map:nth-child(2) > layer-",
      (controller) => controller.extent);

    await expect(layerController.topLeft.pcrs).toEqual({
      horizontal: -180,
      vertical: 90,
    });
    await expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 180,
      vertical: -90,
    });
    await expect(layerController.zoom).toEqual({
      maxNativeZoom: 2,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 21
    });
  });

  test("Templated image with missing <map-meta name='zoom'></map-meta>", async () => {
    const layerController = await page.$eval("body > map:nth-child(1) > layer-:nth-child(4)",
      (controller) => controller.extent);

    await expect(layerController.topLeft.pcrs).toEqual({
      horizontal: 28448056,
      vertical: 42672085,
    });
    await expect(layerController.bottomRight.pcrs).toEqual({
      horizontal: 38608077,
      vertical: 28448056,
    });
    await expect(layerController.zoom).toEqual({
      maxNativeZoom: 19,
      minNativeZoom: 0,
      minZoom: 0,
      maxZoom: 25
    });
  });
});