import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Custom TCRS Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('customTCRS.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Simple Custom TCRS, tiles load, mismatched layer disabled', async () => {
    await page.waitForTimeout(500);
    const misMatchedLayerDisabled = await page.$eval(
      'body > mapml-viewer:nth-child(1)',
      (map) => map.querySelectorAll('map-layer')[0].hasAttribute('disabled')
    );

    const matchedLayerEnabled = await page.$eval(
      'body > mapml-viewer:nth-child(1)',
      (map) => map.querySelectorAll('map-layer')[1].hasAttribute('disabled')
    );

    await expect(
      page.locator('mapml-viewer:nth-child(1) map-tile')
    ).toHaveCount(2);
    expect(misMatchedLayerDisabled).toEqual(true);
    expect(matchedLayerEnabled).toEqual(false);
  });
  test('A projection name containing a colon is invalid', async () => {
    const message = await page.$eval(
      'body > p',
      (message) => message.innerHTML
    );
    expect(message).toEqual('passing');
  });
  test('Complex Custom TCRS, static features loaded, templated features loaded', async () => {
    const staticFeaturesLayerDisabled = await page
      .getByTestId('map2')
      .evaluate((map) =>
        map.querySelectorAll('map-layer')[0].hasAttribute('disabled')
      );
    const templatedFeaturesLayerDisabled = await page
      .getByTestId('map2')
      .evaluate((map) =>
        map.querySelectorAll('map-layer')[1].hasAttribute('disabled')
      );

    const featureOne = await page
      .getByTestId('pcrsgeometry')
      .evaluate((f) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureTwo = await page
      .getByTestId('tcrsgeometry')
      .evaluate((f) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureThree = await page
      .getByTestId('tilematrixgeometry')
      .evaluate((f) => f._groupEl.firstElementChild.getAttribute('d'));
    const featureFour = await page
      .getByTestId('defaultcsgeometry')
      .evaluate((f) => f._groupEl.firstElementChild.getAttribute('d'));

    expect(featureOne).toEqual('M88 681L21 78L-436 201L-346 561z');
    expect(featureTwo).toEqual('M307 456L599 467L612 629L381 599z');

    expect(featureThree).toEqual('M382 -28L809 -28L809 399L382 399z');
    expect(featureFour).toEqual(
      'M150 429L171 426L175 438L181 457L183 461L185 463L185 465L187 465L185 468L185 470L184 472L186 477L186 481L188 485L182 486L154 490L154 492L157 494L157 497L158 498L156 501L154 501L151 499L150 495L149 495L148 498L148 501L144 501L141 477L141 448L141 431L139 430L150 429z'
    );

    expect(staticFeaturesLayerDisabled).toEqual(true);
    expect(templatedFeaturesLayerDisabled).toEqual(false);
  });
});
