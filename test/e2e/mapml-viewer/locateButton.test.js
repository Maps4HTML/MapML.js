import { test, expect, chromium } from '@playwright/test';

test.use({ 
  geolocation: { longitude: -73.56766530667056, latitude: 45.5027789304487 },
  permissions: ['geolocation'],
});

test.describe("Locate Button Test", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await context.grantPermissions(['geolocation']);
    await page.goto("locateButton.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Using locate button to find myself", async () => {
    await page.click("body > mapml-viewer");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    let locateButton_lat = await page.$eval("body > mapml-viewer", (viewer) => viewer.lat);
    let locateButton_lng = await page.$eval("body > mapml-viewer", (viewer) => viewer.lon);
    locateButton_lat = parseFloat(locateButton_lat).toFixed(3);
    locateButton_lng  = parseFloat(locateButton_lng).toFixed(3);

    expect(locateButton_lat).toEqual("45.503");
    expect(locateButton_lng).toEqual("-73.568");
    
  });

  test("Locate button state changes", async () => {
    await page.click("body > mapml-viewer");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    let locateButton_title1 = await page.$eval("div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a", (button) => button.title);

    expect(locateButton_title1).toEqual("Show my location - location off");
    await page.keyboard.press("Enter");

    let locateButton_title2 = await page.$eval("div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a", (button) => button.title);
    expect(locateButton_title2).toEqual("Show my location control - location tracking mode");

    await page.click("body > mapml-viewer");
    
    await page.mouse.move(600, 300);
    await page.mouse.down();
    await page.mouse.move(1200, 450, {steps: 5}); 
    await page.mouse.up();
    await page.click("body > mapml-viewer");
    await page.pause();
    let locateButton_title3 = await page.$eval("div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a", (button) => button.title);
    expect(locateButton_title3).toEqual("Show my location - last known location mode");
  });
});



      