import { test, expect, chromium } from '@playwright/test';

test.describe('Style Parsed and Implemented Test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('styleParsing.html');
    await page.waitForTimeout(250);
  });

  test.beforeEach(async () => {
    await page.waitForTimeout(250);
  });

  test.afterAll(async function () {
    await context.close();
  });

  //tests using the 1st map in the page
  test('CSS within html page added to inorder to overlay-pane container', async () => {
    const styleContent = await page.$eval(
      'css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div',
      (styleE) => styleE.innerHTML
    );
    await expect(styleContent.indexOf('first')).toBeLessThan(
      styleContent.indexOf('.second')
    );
    await expect(styleContent.indexOf('.second')).toBeLessThan(
      styleContent.indexOf('.third')
    );
    await expect(styleContent.indexOf('.third')).toBeLessThan(
      styleContent.indexOf('fourth')
    );
  });

  test('CSS from a retrieved MapML file added inorder inside templated-layer container', async () => {
    const firstStyle = await page.$eval(
      // this div                                                                                                                                                         *
      'css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-extentlayer-container > .mapml-features-container.mapml-vector-container > link:nth-child(1)',
      // no longer exists, (the svg is now the child of the first div)
      // but the link isn't created either, and it should be
      (styleE) => styleE.outerHTML
    );
    const secondStyle = await page.$eval(
      'css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-extentlayer-container > .mapml-features-container.mapml-vector-container > link:nth-child(2)',
      (styleL) => styleL.outerHTML
    );
    await expect(firstStyle).toMatch('canvec_cantopo');
    await expect(secondStyle).toMatch('canvec_feature');
  });

  test('CSS within html page added to overlay-pane container', async () => {
    const map1 = await page.getByTestId('map1');
    const foundStyleLinks = await map1.locator('#first');
    const foundStyleTags = await map1.locator(
      '.mapml-layer:nth-child(1) > style'
    );
    // expect the map-link#first to have been reflected as a <link> into the shadow root
    expect(foundStyleLinks).toHaveCount(2);
    expect(foundStyleTags).toHaveCount(2);
  });

  test('CSS from a retrieved MapML File added to templated-layer container', async () => {
    const foundStyleLinkOne = await page.$(
      'css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-extentlayer-container > .mapml-features-container.mapml-vector-container > link'
    );
    const foundStyleLinkTwo = await page.$(
      'css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div:nth-child(2) > div.leaflet-layer.mapml-extentlayer-container > .mapml-features-container.mapml-vector-container > link:nth-child(2)'
    );
    await expect(foundStyleLinkOne).toBeTruthy();
    await expect(foundStyleLinkTwo).toBeTruthy();
  });

  //testing done on 2nd map in the page
  test('CSS from a retrieved MapML file added inorder inside svg within templated-tile-container', async () => {
    const firstStyle = await page.$eval(
      'xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container .mapml-tile-group > style:nth-child(1)',
      (styleE) => styleE.innerHTML
    );
    const secondStyle = await page.$eval(
      'xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container .mapml-tile-group > style:nth-child(2)',
      (styleE) => styleE.innerHTML
    );
    const foundStyleLink = await page.$(
      'xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-extentlayer-container .mapml-tile-group > link'
    );
    await expect(firstStyle).toMatch('refStyleOne');
    await expect(secondStyle).toMatch('refStyleTwo');
    await expect(foundStyleLink).toBeTruthy();
  });

  test('CSS within html page added inorder to overlay-pane container', async () => {
    const foundStyleLink = await page.$(
      'xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > link'
    );
    const foundStyleTag = await page.$(
      'xpath=//html/body/map[2]/div >> css=div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > style'
    );
    await expect(foundStyleTag).toBeTruthy();
    await expect(foundStyleLink).toBeTruthy();
  });
});
