import { test, expect, chromium } from '@playwright/test';

test.use({
  geolocation: { longitude: -73.56766530667056, latitude: 45.5027789304487 },
  permissions: ['geolocation']
});

test.describe('Locate API Test', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await context.grantPermissions(['geolocation']);
    await page.goto('locateApi.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Using locate API to find myself', async () => {
    await page.$eval('body > mapml-viewer', (viewer) => viewer.locate());

    let locateAPI_lat = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lat
    );
    let locateAPI_lng = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lon
    );
    //rounding to three decimal places
    locateAPI_lat = parseFloat(locateAPI_lat).toFixed(3);
    locateAPI_lng = parseFloat(locateAPI_lng).toFixed(3);

    expect(locateAPI_lat).toEqual('45.503');
    expect(locateAPI_lng).toEqual('-73.568');
  });

  test('Testing maplocationfound event', async () => {
    const latlng = await page.evaluate(() => {
      const viewer = document.querySelector('body > mapml-viewer');
      return new Promise((resolve) => {
        viewer.addEventListener(
          'maplocationfound',
          (e) => {
            resolve(e.detail.latlng);
          },
          { once: true }
        );
        viewer.locate();
      });
    });
    expect(latlng.lat).toEqual(45.5027789304487);
    expect(latlng.lng).toEqual(-73.56766530667056);
  });

  test('Testing locationerror event', async () => {
    const error = await page.evaluate(() => {
      const viewer = document.querySelector('body > mapml-viewer');
      return new Promise((resolve) => {
        viewer.addEventListener(
          'locationerror',
          (e) => {
            resolve(e.detail.error);
          },
          { once: true }
        );
        const errorEvent = new CustomEvent('locationerror', {
          detail: { error: 'Your location could not be determined.' }
        });
        viewer.dispatchEvent(errorEvent);
        viewer.locate();
      });
    });
    expect(error).toEqual('Your location could not be determined.');
  });

  test('Testing API when the button is used', async () => {
    await page.reload();
    await page.click('body > mapml-viewer');
    await page.getByTitle('Show my location - location tracking off').click();

    await page.mouse.move(600, 300);
    await page.mouse.down();
    await page.mouse.move(1200, 450, { steps: 5 });
    await page.mouse.up();
    await page.$eval('body > mapml-viewer', (viewer) => viewer.locate());

    let locateAPI_lat = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lat
    );
    let locateAPI_lng = await page.$eval(
      'body > mapml-viewer',
      (viewer) => viewer.lon
    );

    locateAPI_lat = parseFloat(locateAPI_lat).toFixed(1);
    locateAPI_lng = parseFloat(locateAPI_lng).toFixed(1);

    expect(locateAPI_lat).toEqual('45.5');
    expect(locateAPI_lng).toEqual('-73.6');
  });
});
