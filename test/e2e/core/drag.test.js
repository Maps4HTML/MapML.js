import { test, expect, chromium } from '@playwright/test';

test.describe("UI Drag&Drop Test", () => {
  let page;
  let context;
  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    page = await context.newPage();
    await page.goto("drag.html");
  });

  test.afterAll(async function () {
    await context.close();
  });

  test("Drag and drop of invalid HTML page", async () => {
    const dataTransfer = await page.evaluateHandle(() =>
      new DataTransfer().setData("text/uri-list", "http://example.com")
    );
    await page.dispatchEvent(".leaflet-control-zoom-in", "dragstart", {
      dataTransfer
    });

    await page.dispatchEvent("map", "drop", {
      dataTransfer
    });
    await page.hover(".leaflet-top.leaflet-right");
    let vars = await page.$$(".leaflet-control-layers-overlays > fieldset");
    expect(vars.length).toBe(3);
  });

  test("Drag and drop of layers", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    let control = await page.$(".leaflet-control-layers-overlays > fieldset:nth-child(1)");
    let controlBBox = await control.boundingBox();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(50, 50);
    await page.mouse.up();
    await page.hover(".leaflet-top.leaflet-right");
    let vars = await page.$$(".leaflet-control-layers-overlays > fieldset");
    expect(vars.length).toBe(3);
  });

  test("Moving layer down one in control overlay", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    let control = await page.$(".leaflet-control-layers-overlays > fieldset:nth-child(1)");
    let controlBBox = await control.boundingBox();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) + 48);
    await page.mouse.up();
    await page.hover(".leaflet-top.leaflet-right");

    const controlText = await page.$eval(
      ".leaflet-control-layers-overlays > fieldset:nth-child(2) > div:nth-child(1) > label > span",
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      ".leaflet-pane.leaflet-overlay-pane > div:nth-child(1)",
      (div) => div.style.zIndex
    );
    const domLayer = await page.$eval(
      "body > map > layer-:nth-child(4)",
      (div) => div.label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual("2");
    expect(controlText).toBe("Canada Base Map - Transportation (CBMT)");
  });

  test("Moving layer up one in control overlay", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    let control = await page.$(".leaflet-control-layers-overlays > fieldset:nth-child(2)");
    let controlBBox = await control.boundingBox();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, controlBBox.y + controlBBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(controlBBox.x + controlBBox.width / 2, (controlBBox.y + controlBBox.height / 2) - 48);
    await page.mouse.up();
    await page.hover(".leaflet-top.leaflet-right");

    const controlText = await page.$eval(
      ".leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span",
      (span) => span.innerText
    );
    const layerIndex = await page.$eval(
      ".leaflet-overlay-pane > div:nth-child(2)",
      (div) => div.style.zIndex
    );
    const domLayer = await page.$eval(
      "map > layer-:nth-child(3)",
      (div) => div.label
    );

    expect(controlText.toLowerCase()).toContain(domLayer.toLowerCase());
    expect(layerIndex).toEqual("1");
    expect(controlText).toBe("Static MapML with tiles");
  });

});