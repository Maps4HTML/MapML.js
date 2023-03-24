import { test, expect, chromium } from '@playwright/test';

test.use({ 
  geolocation: { longitude: -73.56766530667056, latitude: 45.5027789304487 },
  permissions: ['geolocation'],
});

test.describe("Locate API Test", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await context.grantPermissions(['geolocation']);
    await page.goto("locateApi.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Using locate API and locate button to find myself", async () => {
    await context.grantPermissions(['geolocation']);
    await page.$eval("body > mapml-viewer",(viewer) => viewer.locate());

    let locateAPI_lat = await page.$eval("body > mapml-viewer", (viewer) => viewer.lat);
    let locateAPI_lng = await page.$eval("body > mapml-viewer", (viewer) => viewer.lon);
    //rounding to three decimal places
    locateAPI_lat = parseFloat(locateAPI_lat).toFixed(3);
    locateAPI_lng  = parseFloat(locateAPI_lng).toFixed(3);
    
    await page.reload();

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

    expect(locateButton_lat).toEqual(locateAPI_lat);
    expect(locateButton_lng).toEqual(locateAPI_lng);
    expect(locateButton_lat).toEqual("45.503");
    expect(locateButton_lng).toEqual("-73.568");
    
  });
});



      