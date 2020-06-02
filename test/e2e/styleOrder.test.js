const playwright = require("playwright");

let page, browser, context;

describe("Playwright Style Parsed and Implemented Test", () => {
  beforeEach(async () => {
    browser = await playwright["chromium"].launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(PATH + "styleOrder.html");
  });

  afterEach(async function () {
    //await page.screenshot({ path: `${this.currentTest.title.replace(/\s+/g, '_')}.png` })
    await browser.close();
  });

  //check the order of inline CSS style tag/link addition
  test("Inline CSS added inorder for feature", async () => {
    const styleContent = await page.$eval(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div",
      (styleE) => styleE.innerHTML
    );
    expect(styleContent.indexOf("first")).toBeLessThan(
      styleContent.indexOf(".second")
    ) &&
      expect(styleContent.indexOf(".third")).toBeLessThan(
        styleContent.indexOf("forth")
      );
  });

  //check the order of referenced CSS style tag/link addition
  test("Referenced CSS added inorder for feature", async () => {
    //has to wait since it takes awhile to load in large Canvec layer
    const firstStyle = await page.$eval(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link",
      (styleE) => styleE.outerHTML
    );
    const secondStyle = await page.$eval(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)",
      (styleL) => styleL.outerHTML
    );
    expect(firstStyle).toMatch("canvec_cantopo") &&
      expect(secondStyle).toMatch("canvec_feature");
  });

  test("Inline CSS added for feature", async () => {
    //ask how the inline styles are added to affect an entire layer
    const foundStyleLink = await page.$("#first");
    const foundStyleTag = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style:nth-child(2)"
    );
    expect(foundStyleTag).toBeTruthy() && expect(foundStyleLink).toBeTruthy();
  });

  test("Referenced CSS added for feature", async () => {
    const foundStyleLinkOne = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link"
    );
    const foundStyleLinkTwo = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)"
    );
    expect(foundStyleLinkOne).toBeTruthy() &&
      expect(foundStyleLinkTwo).toBeTruthy();
  });

  test("Referenced CSS added inorder for vector tile", async () => {
    const foundStyleLinkOne = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(1) > div.leaflet-layer.mapml-templatedlayer-container > div > div > style"
    );
    expect(foundStyleLinkOne).toBeTruthy();
  });

  test("Inline CSS added inorder for vector tile", async () => {
    const foundStyleLink = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > link"
    );
    const foundStyleTag = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style"
    );
    expect(foundStyleTag).toBeTruthy() && expect(foundStyleLink).toBeTruthy();
  });
});
