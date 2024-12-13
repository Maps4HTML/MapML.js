import { test, expect, chromium } from '@playwright/test';

test.describe('map-link disabled', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link-disabled.html');
  });
  test.afterAll(async function () {
    await context.close();
  });
  test('rel=stylesheet disabled attribute', async () => {
    const viewer = page.getByTestId('viewer');
    const featuresLink = page.getByTestId('restaurants_templated_link');
    // test that a templated content link can be disabled by the HTML author at
    // page load, and the bounds of the extent do not include the disabled link
    await expect(featuresLink).toHaveAttribute('disabled');
    const featuresLinkExtent = await featuresLink.evaluate((l) => l.extent);
    expect(featuresLinkExtent).toBeNull();
    await expect(viewer).toHaveScreenshot('blank_map.png', {
      maxDiffPixels: 20
    });
    await featuresLink.evaluate((fl) => (fl.disabled = false));
    // there's a problem when attempting to select this link by testid. The map-link
    // code copies all the attributes of the map-link element onto the generated
    // <link> element it uses to render the content, including the data-testid,
    // resulting in duplicate ids that mess up the getByTestId algorithm.
    //
    // selecting it this way seems unambiguous at least
    const stylesheetLink = page.locator(
      'map-link[rel=stylesheet][href="restaurants/restaurants.css"]'
    );
    await expect(stylesheetLink).not.toHaveAttribute('disabled');
    await expect(viewer).toHaveScreenshot('restaurants_css_style.png', {
      maxDiffPixels: 20
    });
    await stylesheetLink.evaluate((l) => (l.disabled = true));
    await expect(viewer).toHaveScreenshot('default_style.png', {
      maxDiffPixels: 20
    });
    // enable the stylesheet, ensure it styles again
    await stylesheetLink.evaluate((l) => (l.disabled = false));
    await expect(viewer).toHaveScreenshot('restaurants_css_style.png', {
      maxDiffPixels: 20
    });
  });
  test.skip('rel=stylesheet type="application/pmtiles+stylesheet" disable attribute', async () => {});
  // map-link.disabled works for pmtilesRules stylesheets, but not the same way as css,
  // because it's the templated layer map-link that picks up the associated
  // map-link[rel=stylesheet] and applies the loaded rules to content as it loads
  // probably not worth making it seem like it works like CSS at this time. Skipping.

  test('rel=features disabled attribute', async () => {
    const viewer = page.getByTestId('viewer');
    const stylesheetLink = page.locator(
      'map-link[rel=stylesheet][href="restaurants/restaurants.css"]'
    );
    await expect(stylesheetLink).not.toHaveAttribute('disabled');
    await expect(viewer).toHaveScreenshot('restaurants_css_style.png', {
      maxDiffPixels: 20
    });
    const featuresLink = page.getByTestId('restaurants_templated_link');
    await featuresLink.evaluate((fl) => (fl.disabled = true));
    await expect(viewer).toHaveScreenshot('blank_map.png', {
      maxDiffPixels: 20
    });
    await featuresLink.evaluate((fl) => (fl.disabled = false));
    await expect(viewer).toHaveScreenshot('restaurants_css_style.png', {
      maxDiffPixels: 20
    });
  });

  test('rel=tile disabled attribute', async () => {
    const viewer = page.getByTestId('viewer');
    const stylesheetLink = page.locator(
      'map-link[rel=stylesheet][href="restaurants/restaurants.css"]'
    );
    await expect(stylesheetLink).not.toHaveAttribute('disabled');
    const restaurantsLayer = page.getByTestId('inline_templated_features');
    await restaurantsLayer.evaluate((l) => (l.checked = false));
    const osm = page.getByTestId('inline_tiles');
    osm.evaluate((l) => l.zoomTo());
    // disable the map-link
    await expect(viewer).toHaveScreenshot('osm_overview.png', {
      maxDiffPixels: 20
    });
    const tt = page.getByTestId('tile_template');
    await tt.evaluate((tl) => (tl.disabled = true));
    await expect(viewer).toHaveScreenshot('blank_map.png', {
      maxDiffPixels: 20
    });
    await tt.evaluate((tl) => (tl.disabled = false));
    await expect(viewer).toHaveScreenshot('osm_overview.png', {
      maxDiffPixels: 20
    });
  });
  test('rel=image disabled attribute', async () => {
    const viewer = page.getByTestId('viewer');
    // turn off the first two layers
    const osm = page.getByTestId('inline_tiles');
    await osm.evaluate((l) => (l.checked = false));
    const restaurantsLayer = page.getByTestId('inline_templated_features');
    await restaurantsLayer.evaluate((l) => (l.checked = false));
    const toporama = page.getByTestId('inline_image');
    await toporama.evaluate((l) => {
      l.zoomTo();
      l.checked = true;
    });
    await expect(viewer).toHaveScreenshot('toporama.png', {
      maxDiffPixels: 500
    });
    // disable the map-link
    const imageTemplateLink = page.getByTestId('inline-link1');
    await imageTemplateLink.evaluate((l) => (l.disabled = true));
    await expect(viewer).toHaveScreenshot('blank_map.png', {
      maxDiffPixels: 20
    });
    await imageTemplateLink.evaluate((l) => (l.disabled = false));
    await expect(viewer).toHaveScreenshot('toporama.png', {
      maxDiffPixels: 500
    });
  });
  test('rel=query disabled attribute', async () => {
    const viewer = page.getByTestId('viewer');
    // turn off the first three layers
    const osm = page.getByTestId('inline_tiles');
    await osm.evaluate((l) => (l.checked = false));
    const restaurantsLayer = page.getByTestId('inline_templated_features');
    await restaurantsLayer.evaluate((l) => (l.checked = false));
    const toporama = page.getByTestId('inline_image');
    await toporama.evaluate((l) => (l.checked = false));
    const queryableLayer = page.getByTestId('remote-queryable');
    await queryableLayer.evaluate((l) => {
      l.checked = true;
      l.zoomTo();
    });
    await viewer.click();
    // query returns a feature
    const queriedFeature = queryableLayer.getByTestId('hareg');
    await expect(queriedFeature).toHaveCount(1);
    const queryLink = queryableLayer.getByTestId('query-link');
    await queryLink.evaluate((l) => (l.disabled = true));
    const queryLinkIsEmpty = await queryLink.evaluate(
      (l) => l.shadowRoot.querySelector('*') === null
    );
    await expect(queryLinkIsEmpty).toBe(true);
    await viewer.click();
    await expect(queriedFeature).toHaveCount(0);
    // enable the query link, should return features again
    await queryLink.evaluate((l) => (l.disabled = false));
    await viewer.click();
    await expect(queriedFeature).toHaveCount(1);
  });
});
