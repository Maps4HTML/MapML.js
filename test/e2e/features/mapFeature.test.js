import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright map-feature tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('features/mapFeature.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('test', async () => {
    // expect the map to start at initial lat/lon/zoom
    await expect(page.getByTestId('viewer')).toHaveJSProperty('lat', 45.4);
    await expect(page.getByTestId('viewer')).toHaveJSProperty('lon', -75.7);
    await expect(page.getByTestId('viewer')).toHaveJSProperty('zoom', 10);

    // click the polygon link to zoom
    await page.getByLabel('Click me!').click();

    // traversing the link, expect the new map location to be centered #15, -75.699, 45.420
    await expect(page.getByTestId('viewer')).toHaveJSProperty('lat', 45.42);
    await expect(page.getByTestId('viewer')).toHaveJSProperty('lon', -75.699);
    await expect(page.getByTestId('viewer')).toHaveJSProperty('zoom', 15);

    // remove this to fail on click
    // await page.getByTestId('points').evaluate((layer)=>layer._layer._setLayerElExtent());

    // click the first point on the map
    await page.getByRole('button', { name: 'Point 1' }).click();
    // expect the popup for Point 1 to have specific content
    await page.getByRole('heading', { name: 'Point 1' });
    // expect the popup to have a Zoom to here link
    await page.getByRole('link', { name: 'Zoom to here' }).click();

    // traversing the link, expect the new map location to be centered #24,-75.6978309903406,45.42022684737822 because it is zooming to the map-feature, and it has no map-meta value set, or a map-feature zoom attribute
    await expect(page.getByTestId('viewer')).toHaveJSProperty(
      'lat',
      45.42022684737822
    );
    await expect(page.getByTestId('viewer')).toHaveJSProperty(
      'lon',
      -75.6978309903406
    );
    // we expect the zoomTo() link to use the map-feature.getZoomToZoom() api
    // which respects the layer's map-meta zoom information, which has a min=14
    // in this case
    await expect(page.getByTestId('viewer')).toHaveJSProperty('zoom', 14);
    // click the first point on the map
    await page.getByRole('button', { name: 'Point 1' }).click();
    // expect the popup for Point 1 to have specific content
    await page.getByRole('heading', { name: 'Point 1' });
    // expect the popup to have a Zoom to here link
    await page.getByRole('link', { name: 'Zoom to here' });
    // close the popup
    await page.getByRole('button', { name: 'Close popup' }).click();
  });
});
