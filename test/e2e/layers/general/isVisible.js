import { test, expect, chromium } from '@playwright/test';

exports.test = (path, zoomIn, zoomOut) => {
  test.describe(`isVisible Property Tests for ${path.split('.')[0]}`, () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('', { slowMo: 250 });
      page = await context.newPage();
      await page.goto(path);
    });

    test('isVisible property false when zoomed out of bounds (zooming in)', async () => {
      for (let i = 0; i < zoomIn; i++) {
        await page.click('.leaflet-control-zoom-in');
        await page.waitForTimeout(300);
      }
      await page.hover('.leaflet-top.leaflet-right');
      const layerLabelItalic = await page.$eval(
        '.leaflet-control-layers-overlays > fieldset:nth-child(1) .mapml-layer-item-properties label',
        (layerLabel) => layerLabel.style.fontStyle === 'italic'
      );

      expect(layerLabelItalic).toEqual(true);
    });
    test('isVisible property false when zoomed out of bounds (zooming out)', async () => {
      for (let i = 0; i < zoomOut + zoomIn - 1; i++) {
        await page.click('.leaflet-control-zoom-out');
        await page.waitForTimeout(300);
      }
      const layerLabelItalic = await page.$eval(
        '.leaflet-control-layers-overlays > fieldset:nth-child(1) .mapml-layer-item-properties label',
        (layerLabel) => layerLabel.style.fontStyle === 'italic'
      );

      expect(layerLabelItalic).toEqual(true);
    });
  });
};
