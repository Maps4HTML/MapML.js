import { test, expect, chromium } from '@playwright/test';
//expected topLeft values in the different cs, at the different
//positions the map goes in

let expectedPCRS = [
  { horizontal: -9373489.01871137, vertical: 11303798.154262971 },
  { horizontal: -5059449.140631609, vertical: 10388337.990009308 }
];
let expectedGCRS = [
  { horizontal: -128.07848522325827, vertical: -3.3883427348651636 },
  { horizontal: -131.75138842058425, vertical: 18.07246131233218 }
];
let expectedFirstTileMatrix = [
  { horizontal: 2.57421875, vertical: 2.8515625 },
  { horizontal: 3.0134698275862073, vertical: 2.944773706896552 }
];
let expectedFirstTCRS = [
  { horizontal: 659, vertical: 730 },
  { horizontal: 771.4482758620691, vertical: 753.8620689655173 }
];

test.describe('Playwright Map Element Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapElement.html');
    await page.waitForTimeout(250);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Initial map element extent', async () => {
    await page.waitForTimeout(1000);
    const map = await page.getByTestId('firstmap');
    expect(await map.evaluate((map) => map.extent.projection)).toEqual(
      'CBMTILE'
    );
    expect(await map.evaluate((map) => map.extent.zoom.minZoom)).toEqual(0);
    expect(await map.evaluate((map) => map.extent.zoom.maxZoom)).toEqual(3);
    expect(await map.evaluate((map) => map.extent.topLeft.pcrs)).toEqual(
      expectedPCRS[0]
    );
    expect(await map.evaluate((map) => map.extent.topLeft.gcrs)).toEqual(
      expectedGCRS[0]
    );
    expect(
      await map.evaluate((map) => map.extent.topLeft.tilematrix[0])
    ).toEqual(expectedFirstTileMatrix[0]);
    expect(await map.evaluate((map) => map.extent.topLeft.tcrs[0])).toEqual(
      expectedFirstTCRS[0]
    );
  });
  test("Panned and zoomed initial map's extent", async () => {
    const map = await page.getByTestId('firstmap');
    await map.evaluate((map) => map.zoomTo(81, -63, 1));
    await page.waitForTimeout(1000);

    expect(await map.evaluate((map) => map.extent.projection)).toEqual(
      'CBMTILE'
    );
    expect(await map.evaluate((map) => map.extent.zoom.minZoom)).toEqual(0);
    expect(await map.evaluate((map) => map.extent.zoom.maxZoom)).toEqual(3);
    expect(await map.evaluate((map) => map.extent.topLeft.pcrs)).toEqual(
      expectedPCRS[1]
    );
    expect(await map.evaluate((map) => map.extent.topLeft.gcrs)).toEqual(
      expectedGCRS[1]
    );
    expect(
      await map.evaluate((map) => map.extent.topLeft.tilematrix[0])
    ).toEqual(expectedFirstTileMatrix[1]);
    expect(await map.evaluate((map) => map.extent.topLeft.tcrs[0])).toEqual(
      expectedFirstTCRS[1]
    );
  });

  test('Reload button takes you back to initial state', async () => {
    await page.click(
      'div > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.mapml-reload-button.leaflet-bar.leaflet-control > button'
    );
    await page.waitForTimeout(1000);
    const extent = await page.$eval('body > map', (map) => map.extent);

    const history = await page.$eval('body > map', (map) => map._history);

    await expect(history.length).toEqual(1);
    await expect(extent.projection).toEqual('CBMTILE');
    await expect(extent.zoom).toEqual({ minZoom: 0, maxZoom: 3 });
    await expect(extent.topLeft.pcrs).toEqual(expectedPCRS[0]);
    await expect(extent.topLeft.gcrs).toEqual(expectedGCRS[0]);
    await expect(extent.topLeft.tilematrix[0]).toEqual(
      expectedFirstTileMatrix[0]
    );
    await expect(extent.topLeft.tcrs[0]).toEqual(expectedFirstTCRS[0]);
  });

  test('Default projection, when no projection attribute, is OSMTILE', async () => {
    const projection = await page.$eval(
      'body > map[id=default-projection]',
      (map) => map.projection
    );

    await expect(projection).toEqual('OSMTILE');
  });
  test("Ensure attribution control has role='group' aria-label='Map data attribution'", async () => {
    let role = await page.evaluate(
      `document.querySelector('map')._map.attributionControl.getContainer().getAttribute('role')`
    );
    await expect(role).toEqual('group');
    let arialabel = await page.evaluate(
      `document.querySelector('map')._map.attributionControl.getContainer().getAttribute('aria-label')`
    );
    await expect(arialabel).toEqual('Map data attribution');
  });
});
