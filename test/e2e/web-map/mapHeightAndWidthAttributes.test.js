import { test, expect, chromium } from '@playwright/test';

test.describe("Adding Width and Height Attribute to mapml-viewer", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("mapHeightAndWidthAttributes.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Setting Width and Height Attibute to mapml-viewer", async () => {
    //height and width attribute value in the mapml-viewer tag
    let height_attribute_value = await page.$eval("body > map",(viewer) => viewer.getAttribute("height"));
    let width_attribute_value = await page.$eval("body > map",(viewer) => viewer.getAttribute("width"));
    //actual height and width value of the map
    let height_with_px = await page.$eval("body > map", (viewer) => viewer._container.style.height);
    let width_with_px = await page.$eval("body > map", (viewer) => viewer._container.style.width);
    expect(height_with_px).toEqual(height_attribute_value+"px");
    expect(width_with_px).toEqual(width_attribute_value+"px");
  });
});



      