import { test, expect, chromium } from '@playwright/test';

test.describe('map-projectionchange test ', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());

  });
  
  test.beforeEach(async function() {
    await page.goto('events/map-projectionchange.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Multiple map-extents in different projections adapt to map-projectionchange', async () => {
    const viewer = await page.locator('mapml-viewer');
    expect(await viewer.evaluate((v) => v.projection)).toEqual('OSMTILE');
    expect(
      await viewer.evaluate((v) => {
        return v.querySelector('map-extent[units=OSMTILE]').disabled;
      })
    ).toBe(false);
    expect(
      await viewer.evaluate((v) => {
        return v.querySelector('map-extent[units=CBMTILE]').disabled;
      })
    ).toBe(true);
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(500);
    expect(await viewer.evaluate((v) => v.projection)).toEqual('CBMTILE');
    expect(
      await viewer.evaluate((v) => {
        return v.querySelector('map-extent[units=OSMTILE]').disabled;
      })
    ).toBe(true);
    expect(
      await viewer.evaluate((v) => {
        return v.querySelector('map-extent[units=CBMTILE]').disabled;
      })
    ).toBe(false);
  });
  test('History is empty after map-projectionchange', async () => {
    const viewer = await page.locator('mapml-viewer');
    expect(await viewer.evaluate((v) => v.projection)).toEqual('OSMTILE');
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(1000);
    expect(await viewer.evaluate((v) => v.projection)).toEqual('CBMTILE');
    const reload = await page.getByLabel('Reload');
    expect(await reload.evaluate((button)=>button.ariaDisabled)).toBe('true');

  });
});
