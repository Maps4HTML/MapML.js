import { test, expect, chromium } from '@playwright/test';

test.describe("GeoJSON API - geojson2mapml", () => {
    let page;
    let context;
    test.beforeAll(async function() {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      await page.goto("geojson2mapml.html");
    });

    test.afterAll(async function () {
      await context.close();
    });

  test("Point Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(1)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(1)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });


  test("Line Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(2)", 
      (node) => node.innerHTML//.replace(" ", "")
    );
    const exp = await page.$eval(
        "body > mapml-viewer#expected > layer-:nth-child(2)", 
        (node) => node.innerHTML//.replace(" ", "")
      );
    expect(out).toEqual(exp);
  });

  test("Polygon Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(3)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(3)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiPoint Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(4)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(4)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiLineString Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(5)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(5)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("MultiPolygon Geometry", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(6)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(6)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("Geometry Collection", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(7)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(7)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });

  test("Feature Collection", async () => {
    const out = await page.$eval(
      "body > mapml-viewer#output > layer-:nth-child(8)", 
      (node) => node.outerHTML
    );
    const exp = await page.$eval(
      "body > mapml-viewer#expected > layer-:nth-child(8)", 
      (node) => node.outerHTML
    );
    expect(out).toEqual(exp);
  });


});
