import { test, expect, chromium } from '@playwright/test';

test.describe('map-a loaded inline or remote, directly or via templated map-link tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-a.html');
    await page.waitForTimeout(500);
  });

  const contentLocations = ['inline', 'remote'];
  for (const inlineOrRemote of contentLocations) {
    test(`${inlineOrRemote} map-a-wrapped-map-geometry loaded directly creates a hyperlink`, async () => {
      const directlyLoadedFeaturesLayer = await page.getByTestId(
        `${inlineOrRemote}-features`
      );
      const directlyLoadedFeaturesCount =
        await directlyLoadedFeaturesLayer.evaluate((l) => {
          let node = l.hasAttribute('src') ? l.shadowRoot : l;
          return node.querySelectorAll('map-feature').length;
        });
      expect(directlyLoadedFeaturesCount).toBe(2);
      // one of them contains a map-a wrapping its map-geometry
      const directlyLoadedHyperlinksCount =
        await directlyLoadedFeaturesLayer.evaluate((l) => {
          let node = l.hasAttribute('src') ? l.shadowRoot : l;
          return node.querySelectorAll('map-feature:has(map-a)').length;
        });
      expect(directlyLoadedHyperlinksCount).toBe(1);
      // all features should have a _groupEl prop (i.e. all features are rendered)
      const directlyLoadedFeaturesRenderedCount =
        await directlyLoadedFeaturesLayer.evaluate((l) => {
          let node = l.hasAttribute('src') ? l.shadowRoot : l;
          const hasRendering = (f) => Boolean(f._groupEl);
          return Array.from(node.querySelectorAll('map-feature')).filter(
            hasRendering
          ).length;
        });
      expect(directlyLoadedFeaturesRenderedCount).toEqual(
        directlyLoadedFeaturesCount
      );
    });
    test(`${inlineOrRemote} map-a-wrapped-map-geometry loaded via templated map-link creates a hyperlink`, async () => {
      const templatedLoadedFeaturesContainer = await page.getByTestId(
        `${inlineOrRemote}-templated-link`
      );
      const templatedLoadedFeaturesCount =
        await templatedLoadedFeaturesContainer.evaluate((l) => {
          return l.shadowRoot.querySelectorAll('map-feature').length;
        });
      expect(templatedLoadedFeaturesCount).toBe(2);
      // one of them contains a map-a wrapping its map-geometry
      const templatedLoadedHyperlinksCount =
        await templatedLoadedFeaturesContainer.evaluate((l) => {
          return l.shadowRoot.querySelectorAll('map-feature:has(map-a)').length;
        });
      expect(templatedLoadedHyperlinksCount).toBe(1);
      // all features should have a _groupEl prop (i.e. all features are rendered)
      const templatedLoadedFeaturesRenderedCount =
        await templatedLoadedFeaturesContainer.evaluate((l) => {
          const hasRendering = (f) => Boolean(f._groupEl);
          return Array.from(
            l.shadowRoot.querySelectorAll('map-feature')
          ).filter(hasRendering).length;
        });
      expect(templatedLoadedFeaturesRenderedCount).toEqual(
        templatedLoadedFeaturesCount
      );
    });
  }
});
