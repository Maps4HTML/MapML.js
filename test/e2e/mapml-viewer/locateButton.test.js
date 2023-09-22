import { test, expect, chromium } from '@playwright/test';

test.use({
  geolocation: { longitude: -73.56766530667056, latitude: 45.5027789304487 },
  permissions: ['geolocation']
});

test.describe('Geolocation control tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await context.grantPermissions(['geolocation']);
    await page.goto('locateButton.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Using geolocation control to control map', async () => {
    await page.click('body > mapml-viewer');
    await page.getByTitle('Show my location - location tracking off').click();

    let locateButton_lat = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lat
    );
    let locateButton_lng = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lon
    );
    locateButton_lat = parseFloat(locateButton_lat).toFixed(3);
    locateButton_lng = parseFloat(locateButton_lng).toFixed(3);
    let tooltip = await page.$eval(
      'body > mapml-viewer',
      (viewer) =>
        viewer._geolocationButton.locateControl._marker._tooltip._content
    );

    expect(locateButton_lat).toEqual('45.503');
    expect(locateButton_lng).toEqual('-73.568');
    expect(tooltip).toEqual('My current location, shown on map');
  });

  test('Geolocation control state changes when pressed', async () => {
    await page.click('body > mapml-viewer');
    await page.getByTitle('Show my location - location tracking on').click();

    let locationOnText = await page.evaluate(
      () => M.options.locale.btnLocTrackOn
    );
    let locationOffText = await page.evaluate(
      () => M.options.locale.btnLocTrackOff
    );
    let lastKnownLocationText = await page.evaluate(
      () => M.options.locale.btnLocTrackLastKnown
    );

    let locateButton_title1 = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a',
      (button) => button.title
    );

    expect(locateButton_title1).toEqual(locationOffText);
    await page.getByTitle('Show my location - location tracking off').click();

    let locateButton_title2 = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a',
      (button) => button.title
    );
    expect(locateButton_title2).toEqual(locationOnText);

    await page.click('body > mapml-viewer');

    await page.mouse.move(600, 300);
    await page.mouse.down();
    await page.mouse.move(1200, 450, { steps: 5 });
    await page.mouse.up();
    let tooltip = await page.$eval(
      'body > mapml-viewer',
      (viewer) =>
        viewer._geolocationButton.locateControl._marker._tooltip._content
    );
    expect(tooltip).toEqual('My last known location, shown on map');
    await page.click('body > mapml-viewer');

    let locateButton_title3 = await page.$eval(
      'div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div > a',
      (button) => button.title
    );
    expect(locateButton_title3).toEqual(lastKnownLocationText);
  });
});
