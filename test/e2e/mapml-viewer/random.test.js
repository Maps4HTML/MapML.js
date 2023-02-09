import { test, expect, chromium } from '@playwright/test';

test.describe("Adding Width and Height Attribute to mapml-viewer", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.setViewportSize({ width: 400, height: 400 });
    await page.goto("random.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Window Size Change", async () => {
    
    //change size of the map
    let _height = await page.$eval("body > mapml-viewer", (viewer) => window.getComputedStyle(viewer).height);
    let _width = await page.$eval("body > mapml-viewer", (viewer) => window.getComputedStyle(viewer).width);
    _height.replace('px','');
    _width.replace('px','');
    // await page.$eval("body > mapml-viewer", (viewer) => viewer.setAttribute("height", "399.9"));
    // await page.$eval("body > mapml-viewer", (viewer) => viewer.setAttribute("width", "399.9"));
    //actual height and width value of the map
    let map_height = await page.$eval("body > mapml-viewer", (viewer) => viewer.height);
    let map_width = await page.$eval("body > mapml-viewer", (viewer) => viewer.width);
    expect(map_height).toEqual(_height);
    expect(map_width).toEqual(_width);
  });
});



      