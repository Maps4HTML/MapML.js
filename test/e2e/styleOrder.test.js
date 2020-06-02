const playwright = require("playwright");

let page, browser, context;

describe("Playwright Style Parsed and Implemented Test", () => {
  beforeAll(async () => {
    browser = await playwright["chromium"].launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(PATH + "styleOrder.html");
  });

  afterAll(async function () {
    await browser.close();
  });

  //check the order of inline CSS style tag/link addition
  test("CSS within html page added to inorder to overlay-pane container", async () => {
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
  test("CSS from a retrieved MapML file added inorder inside templated-layer container", async () => {
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

  test("CSS within html page added to overlay-pane container", async () => {
    //ask how the inline styles are added to affect an entire layer
    const foundStyleLink = await page.$("#first");
    const foundStyleTag = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style:nth-child(2)"
    );
    expect(foundStyleTag).toBeTruthy() && expect(foundStyleLink).toBeTruthy();
  });

  test("CSS from a retrieved MapML File added to templated-layer container", async () => {
    const foundStyleLinkOne = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link"
    );
    const foundStyleLinkTwo = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)"
    );
    expect(foundStyleLinkOne).toBeTruthy() &&
      expect(foundStyleLinkTwo).toBeTruthy();
  });

  test("CSS from a retrieved MapML file added inorder inside svg within templated-tile-container", async () => {
    const foundStyleLinkOne = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > svg:nth-child(1) > style"
    );
    expect(foundStyleLinkOne).toBeTruthy();
  });

  test("CSS within html page added inorder to overlay-pane container", async () => {
    const foundStyleLink = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > link"
    );
    const foundStyleTag = await page.$(
      "xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style"
    );
    expect(foundStyleTag).toBeTruthy() && expect(foundStyleLink).toBeTruthy();
  });
});
