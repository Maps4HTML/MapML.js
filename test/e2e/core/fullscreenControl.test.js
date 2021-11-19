//expected topLeft values in the different cs, at the different
//positions the map goes in
const playwright = require("playwright");

describe("Playwright mapml-viewer fullscreen tests", () => {
  let context, page;
  beforeAll(async () => {
    context = await playwright["chromium"].launchPersistentContext("",{
      headless: false,
      slowMo: 250
    });
    page = await context.newPage();
  });
  afterAll(async () => {
    await context.close();
  });
  beforeEach(async () => {
    await page.goto(PATH + "fullscreenControlMapmlViewer.html");
  });
  test("Fullscreen button makes mapml-viewer element the fullscreen element", async () => {
    await page.click("xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    let fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    // the first mapml-viewer should be returned by document.fullscreen
    expect(fullscreenElement).toEqual("map1");
    await page.click("xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    fullscreenElement = await page.evaluate( `document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
    await page.click("xpath=/html/body/mapml-viewer[2] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    fullscreenElement = await page.evaluate( `document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual("map2");
    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await page.click("xpath=/html/body/mapml-viewer[1] >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a",
      {timeout: 500});
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate( `document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual("map2");
  });
});

describe("Playwright mapml-viewer fullscreen tests", () => {
  let context, page;
  beforeAll(async () => {
    context = await playwright["chromium"].launchPersistentContext("",{
      headless: false,
      slowMo: 250
    });
    page = await context.newPage();
  });
  afterAll(async () => {
    await context.close();
  });
  beforeEach(async () => {
    await page.goto(PATH + "fullscreenControlWebMap.html");
  });
  test("Fullscreen button makes map element the fullscreen element", async () => {
    await page.click("xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    let fullscreenElement = await page.evaluate(`document.fullscreenElement.id`);
    // the first map element should be returned by document.fullscreen
    expect(fullscreenElement).toEqual("map1");
    await page.click("xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    fullscreenElement = await page.evaluate( `document.fullscreenElement`);
    expect(fullscreenElement).toBeFalsy();
    await page.click("xpath=/html/body/map[2]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a");
    fullscreenElement = await page.evaluate( `document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual("map2");
    try {
      // try to click the fullscreen button of the other map that is not in fullscreen
      await page.click("xpath=/html/body/map[1]/div >> css= div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a",
      {timeout: 500});
    } catch (e) {
      if (e instanceof playwright.errors.TimeoutError) {
        // all is well
      }
    }
    // fullscreen element should not have changed
    fullscreenElement = await page.evaluate( `document.fullscreenElement.id`);
    expect(fullscreenElement).toEqual("map2");
  });
});