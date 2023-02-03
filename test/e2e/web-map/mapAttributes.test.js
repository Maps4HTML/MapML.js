import { test, expect, chromium } from '@playwright/test';

test.describe("Adding Width and Height Attribute to mapml-viewer", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("mapAttributes.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Setting Width and Height Attibute to mapml-viewer", async () => {
    let height_attribute_value = await page.$eval("body > map",(val) => val.getAttribute("height"));
    let width_attribute_value = await page.$eval("body > map",(val) => val.getAttribute("width"));
    let height = await page.$eval("body > map", (val) => val._container.style.height);
    let width = await page.$eval("body > map", (val) => val._container.style.width);
    expect(height).toEqual(height_attribute_value+"px");
    expect(width).toEqual(width_attribute_value+"px");
  });
});



      