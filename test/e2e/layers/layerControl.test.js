import { test, expect, chromium } from '@playwright/test';

test.describe("Playwright layerControl Tests", () => {
  test.describe("Control Layer Panel Tests", () => {
    let page;
    let context;
    test.beforeAll(async function() {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      await page.goto("layerControl.html");
    });

    test.afterAll(async function () {
      await context.close();
    });

    test("Control panel hidden when no layers/all layers hidden", async () => {
      const controlsHidden = await page.$eval(
        "css=body > mapml-viewer:nth-child(1) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
        (elem) => elem.hasAttribute("hidden")
      );
      expect(controlsHidden).toEqual(true);
    });

    test("Control panel shown when layers are on map", async () => {
      const controlsHidden = await page.$eval(
        "css=body > mapml-viewer:nth-child(2) >> css=div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div",
        (elem) => elem.hasAttribute("hidden")
      );
      expect(controlsHidden).toEqual(false);
    });
  });
});