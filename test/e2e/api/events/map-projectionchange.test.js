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

  test.beforeEach(async function () {
    await page.goto('events/map-projectionchange.html');
    await page.waitForTimeout(1000);
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
  test.skip('History is empty after map-projectionchange', async () => {
    // history api needs a complete review; test can't pass without many
    // odd hacks, so skip for now.
    const viewer = await page.locator('mapml-viewer');
    expect(await viewer.evaluate((v) => v.projection)).toEqual('OSMTILE');
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(500);
    expect(await viewer.evaluate((v) => v.projection)).toEqual('CBMTILE');
    const reload = await page.getByLabel('Reload');
    expect(await reload.evaluate((button) => button.ariaDisabled)).toBe('true');
  });
  test('Opacity is maintained on map-layer and map-extent after map-projectionchange', async () => {
    const viewer = await page.locator('mapml-viewer');
    const layer = await page.locator('map-layer');
    await page.pause();
    await layer.evaluate((layer) => (layer.opacity = 0.5));
    expect(
      await layer.evaluate((layer) => {
        return layer.opacity;
      })
    ).toBe(0.5);
    const osmtileExtent = await page.locator('map-extent[units=OSMTILE]');
    await osmtileExtent.evaluate((e) => (e.opacity = 0.4));
    const cbmtileExtent = await page.locator('map-extent[units=CBMTILE]');
    await cbmtileExtent.evaluate((e) => (e.opacity = 0.3));
    await viewer.evaluate(() => changeProjection());
    await page.waitForTimeout(1000);
    expect(await osmtileExtent.evaluate((e) => e.opacity)).toBe(0.4);
    expect(await cbmtileExtent.evaluate((e) => e.opacity)).toBe(0.3);
    expect(
      await layer.evaluate((layer) => {
        return layer.opacity;
      })
    ).toBe(0.5);
  });
});
