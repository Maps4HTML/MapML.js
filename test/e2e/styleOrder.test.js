//TEST IS CURRENTLY UNSTABLE AS IT RELIES ON THE SERVER RESPONSE TIME WHERE
//CANVEC MAPML FILE IS HOSTED

const playwright = require("playwright");

let page, browser, context;

describe("Playwright Style Parsed and Implemented Test", () => {
  beforeEach(async () => {
    browser = await playwright["chromium"].launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(PATH + "styleOrder.html");
    jest.setTimeout(10000);
  });

  afterEach(async function () {
    //await page.screenshot({ path: `${this.currentTest.title.replace(/\s+/g, '_')}.png` })
    await browser.close();
  });

  //check the order of inline CSS style tag/link addition
  test("Inline CSS order", async () => {
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
  test("Referenced CSS order", async () => {
    //has to wait since it takes awhile to load in large Canvec layer
    function wait(ms) {
      var start = new Date().getTime();
      var end = start;
      while (end < start + ms) {
        end = new Date().getTime();
      }
    }
    await wait(3000);
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

  test("Inline style tag & link added layer container", async () => {
    //ask how the inline styles are added to affect an entire layer
    const foundStyleLink = await page.$("#first");
    const foundStyleTag = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style:nth-child(2)"
    );
    expect(foundStyleTag).toBeTruthy() && expect(foundStyleLink).toBeTruthy();
  });

  test("Referenced style tag & link added to layer vector container", async () => {
    function wait(ms) {
      var start = new Date().getTime();
      var end = start;
      while (end < start + ms) {
        end = new Date().getTime();
      }
    }
    await wait(3000);
    const foundStyleLinkOne = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link"
    );
    const foundStyleLinkTwo = await page.$(
      "css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-templatedlayer-container > div > div > link:nth-child(2)"
    );
    expect(foundStyleLinkOne).toBeTruthy() &&
      expect(foundStyleLinkTwo).toBeTruthy();
  });
});
