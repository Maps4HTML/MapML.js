import { test, expect, chromium } from '@playwright/test';

test.describe("GeoJSON API - geojson2mapml", () => {
    let page;
    let context;
    test.beforeAll(async function() {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      await page.goto("geojson2mapml.html");
      //await page.waitForTimeout(10000);
    });

    test.afterAll(async function () {
      await context.close();
    });

  test("Point Geometry (string json)", async () => {
    const out = await page.$$eval(
      'layer-', 
      (node) => node[0].outerHTML
     );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(1)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });


  test("Line Geometry", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[1].innerHTML//.replace(" ", "")
    );
    const exp = await page.$eval(
        "body > #expected > layer-:nth-child(2)", 
        (node) => node.innerHTML//.replace(" ", "")
      );
    expect(out).toEqual(exp);
  });

  test("Polygon Geometry", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[2].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(3)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiPoint Geometry", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[3].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(4)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiLineString Geometry", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[4].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(5)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiPolygon Geometry", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[5].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(6)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("Geometry Collection", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[6].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(7)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("Feature Collection", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[7].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(8)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("BBOX, Options label, caption + properties string", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[8].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(9)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("BBOX, Options label, caption + properties function", async () => {
    const out = await page.$$eval(
      "layer-", 
      (node) => node[9].outerHTML
    );
    const exp = await page.$eval(
      "body > #expected > layer-:nth-child(10)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });


});
