describe("Playwright Map Element Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "debugMode.html");
  });

  afterAll(async function () {
    await context.close();
  });


  test("Debug elements added to map", async () => {
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.toggleDebug()
    );

    const panel = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel",
      (panelElem) => panelElem.childElementCount
    );

    const banner = await page.$eval(
      "div > table.mapml-debug > caption.mapml-debug-banner",
      (bannerElem) => bannerElem.innerText
    );

    const grid = await page.$eval(
      "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid",
      (gridElem) => gridElem.childElementCount
    )

    expect(panel).toEqual(6);
    expect(banner).toEqual("DEBUG MODE");
    expect(grid).toEqual(1);

  });

  test("Reasonable debug layer extent created", async () => {
    const feature = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(2)",
      (tile) => tile.getAttribute("d")
    );
    expect(feature).toEqual("M82.51724137931035 332.27586206896535L347.34482758620686 332.27586206896535L347.34482758620686 -38.48275862068965L82.51724137931035 -38.48275862068965z");
  });

  test("Large debug layer extent created", async () => {
    const feature = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(3)",
      (tile) => tile.getAttribute("d")
    );
    expect(feature).toEqual("M-659 500L365 500L365 -780L-659 -780z");
  });

  test("Debug layer extent beyond ((0,0), (5,5))  created", async () => {
    const feature = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
      (tile) => tile.getAttribute("d")
    );
    expect(feature).toEqual("M-1683 1268L1133 1268L1133 -1292L-1683 -1292z");
  });

  test("Accurate debug coordinates", async () => {
    await page.hover("body > mapml-viewer");
    const tile = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(1)",
      (tileElem) => tileElem.innerText
    );
    const matrix = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(2)",
      (matrixElem) => matrixElem.innerText
    );
    const map = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(3)",
      (mapElem) => mapElem.innerText
    );
    const tcrs = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(4)",
      (tcrsElem) => tcrsElem.innerText
    );
    const pcrs = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(5)",
      (pcrsElem) => pcrsElem.innerText
    );
    const gcrs = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel > tr:nth-child(6)",
      (gcrsElem) => gcrsElem.innerText
    );

    expect(tile).toEqual("tile: i: 141, j: 6");
    expect(matrix).toEqual("tilematrix: column: 3, row: 4");
    expect(map).toEqual("map: i: 250, j: 250");
    expect(tcrs).toEqual("tcrs: x: 909, y: 1030");
    expect(pcrs).toEqual("pcrs: easting: 217676.00, northing: -205599.86");
    expect(gcrs).toEqual("gcrs: lon: -92.152897, lat: 47.114275");
  });

  test("Layer disabled attribute update when controls are toggled off", async () => {
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.toggleDebug()
    );

    await page.$eval(
      "body > mapml-viewer",
      (map) => map.zoomTo(-51, 170, 0)
    );

    await page.waitForTimeout(1000);

    const layer = await page.$eval(
      "body > mapml-viewer > layer-:nth-child(1)",
      (elem) => elem.hasAttribute("disabled")
    );

    expect(layer).toEqual(true);
  });

  test("Debug mode correctly re-enabled after disabling", async () => {
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.back()
    );
    await page.$eval(
      "body > mapml-viewer",
      (map) => map.toggleDebug()
    );

    const panel = await page.$eval(
      "div > table.mapml-debug > tbody.mapml-debug-panel",
      (panelElem) => panelElem.childElementCount
    );

    const banner = await page.$eval(
      "div > table.mapml-debug > caption.mapml-debug-banner",
      (bannerElem) => bannerElem.innerText
    );

    const grid = await page.$eval(
      "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-layer.mapml-debug-grid",
      (gridElem) => gridElem.childElementCount
    )

    expect(panel).toEqual(6);
    expect(banner).toEqual("DEBUG MODE");
    expect(grid).toEqual(1);

  });

  test("Layer deselected then reselected", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span");
    const feature = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g",
      (tile) => tile.childElementCount
    );
    expect(feature).toEqual(3);
  });

  test("Layer deselected then reselected", async () => {
    await page.hover(".leaflet-top.leaflet-right");
    await page.click("div > div.leaflet-control-container > div.leaflet-top.leaflet-right > div > section > div.leaflet-control-layers-overlays > fieldset:nth-child(1) > div:nth-child(1) > label > span");
    const feature = await page.$eval(
      "xpath=//html/body/mapml-viewer >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path:nth-child(4)",
      (tile) => tile.getAttribute("d")
    );
    expect(feature).toEqual("M82.51724137931035 332.27586206896535L347.34482758620686 332.27586206896535L347.34482758620686 -38.48275862068965L82.51724137931035 -38.48275862068965z");
  });
});