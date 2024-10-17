import { test, expect, chromium } from '@playwright/test';

test.describe('Simple query by select values without map extent filter tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page = await context.newPage();
    await page.goto('templatedFeaturesFilter.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('All features loaded at start', async () => {
    const features = await page.locator('map-feature');
    expect(features).toHaveCount(8);
  });
  test('User can select/filter features by category', async () => {
    const restaurants = await page.locator('map-feature');
    expect(restaurants).toHaveCount(8);

    await page.hover('.leaflet-top.leaflet-right > div');
    await page.click(
      'css= body > mapml-viewer >> css= div > button.mapml-layer-item-settings-control.mapml-button'
    );
    await page.getByRole('button', { name: 'Sub-layer Settings' }).click();
    await page.locator('summary').filter({ hasText: 'cuisine' }).click();
    await page.selectOption(
      'css= body > mapml-viewer >> css= details:nth-child(2).mapml-control-layers select',
      'italian'
    );
    await page.waitForTimeout(250);
    expect(restaurants).toHaveCount(1);
  });
  test('<map-select> <map-option> attributes are copied to layer control <option> elements', async () => {
    await page.selectOption(
      'css= body > mapml-viewer >> css= details:nth-child(2).mapml-control-layers select',
      'restaurants'
    );
    await page.waitForTimeout(250);
    const firstOptionSelected = await page.$eval(
      'css= mapml-viewer details.mapml-control-layers select option:nth-child(1)',
      (option) => option.selected
    );
    expect(firstOptionSelected).toBeTruthy();
    const firstOptionLabel = await page.$eval(
      'css= mapml-viewer details.mapml-control-layers select option:nth-child(1)',
      (option) => option.label
    );
    expect(firstOptionLabel).toEqual('All cuisines');
    const firstOptionValue = await page.$eval(
      'css= mapml-viewer details.mapml-control-layers select option:nth-child(1)',
      (option) => option.value
    );
    expect(firstOptionValue).toEqual('restaurants');
    const thirdOptionValue = await page.$eval(
      'css= mapml-viewer details.mapml-control-layers select option:nth-child(3)',
      (option) => option.value
    );
    expect(thirdOptionValue).toEqual('african');
  });
});
