import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Layer Context Menu Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('layerContextMenu.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('Enter activates layer context menu item', async () => {
    let lat = await page.evaluate(
      () => +document.querySelector('mapml-viewer').lat
    );
    let lon = await page.evaluate(
      () => +document.querySelector('mapml-viewer').lon
    );
    let zoom = await page.evaluate(
      () => +document.querySelector('mapml-viewer').zoom
    );

    // expect something to do with center and zoom level of map
    await expect(lat).toBe(47);
    await expect(lon).toBe(-92);
    await expect(zoom).toBe(0);

    await page.locator('mapml-viewer').press('Tab');
    await page.getByLabel('Zoom in').press('Tab');
    await page.getByLabel('Zoom out').press('Tab');
    await page.getByLabel('Reload').press('Tab');
    await page.getByRole('button', { name: 'View Fullscreen' }).press('Tab');

    // layer control is next tab stop, opened by hover or Enter key
    await page.locator('a[role="button"]').nth(3).press('Enter');
    // Shift+F10 generates contextmenu event
    // CBMT layer is first in layer control, wait for it, display context menu
    await page
      .locator('text=CBMT - INLINE✕ >> input[type="checkbox"]')
      .press('Shift+F10');
    // trigger the Zoom to layer function by hitting enter or spacebar
    await page.locator('text=Zoom To Layer (Z)').press('Enter');
    await page.waitForTimeout(2000);

    lat = await page.evaluate(
      () => +document.querySelector('mapml-viewer').lat
    );
    lon = await page.evaluate(
      () => +document.querySelector('mapml-viewer').lon
    );
    zoom = await page.evaluate(
      () => +document.querySelector('mapml-viewer').zoom
    );

    // expect something to do with center and zoom level of map
    await expect(lat).toBe(78.35553458202789);
    await expect(lon).toBe(-151.71482148855017);
    await expect(zoom).toBe(0);
  });
  test('Space bar activates layer context menu item', async () => {
    await page.locator('mapml-viewer').press('Tab');

    await page.locator('[aria-label="Zoom in"]').press('Tab');

    await page.locator('[aria-label="Zoom out"]').press('Tab');

    await page.locator('[aria-label="Reload"]').press('Tab');
    await page.getByRole('button', { name: 'View Fullscreen' }).press('Tab');
    // Press Enter on layer control
    await page.locator('a[role="button"]').nth(3).press('Enter');
    // Press Shift+F10 to bring up layer context menu on first layer
    await page
      .locator('text=CBMT - INLINE✕ >> input[type="checkbox"]')
      .press('Shift+F10');
    // Press ArrowDown
    await page.locator('text=Zoom To Layer (Z)').press('ArrowDown');
    // Press spacebar
    await page.locator('text=Copy Layer (L)').press(' ');
    // Click textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').click();
    // Fill textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').press('Control+v');

    const result = await page.evaluate(() => {
      let p = new DOMParser();
      let t = document.querySelector('[name="messageExtent"]').value;
      if (t !== '') {
        let l = p.parseFromString(t, 'text/html');
        return l.querySelector('map-layer').getAttribute('label');
      }
      return '';
    });

    expect(result).toBe('CBMT - INLINE');
  });
  test('Tab can be used to move between layer context menu items', async () => {
    await page.locator('mapml-viewer').press('Tab');
    await page.locator('[aria-label="Zoom in"]').press('Tab');
    await page.locator('[aria-label="Zoom out"]').press('Tab');
    await page.locator('[aria-label="Reload"]').press('Tab');
    await page.getByRole('button', { name: 'View Fullscreen' }).press('Tab');
    // Press Enter on layer control
    await page.locator('a[role="button"]').nth(3).press('Enter');
    // Press Shift+F10 to bring up layer context menu on first layer
    await page
      .locator('text=CBMT - INLINE✕ >> input[type="checkbox"]')
      .press('Shift+F10');

    // first item in menu is zoom
    await page.locator('text=Zoom To Layer (Z)').press('Tab');
    // when second (last) item in menu is selected, tab should go back to first
    await page.locator('text=Copy Layer (L)').press('Tab');
    // tab again to get to second / last item
    await page.locator('text=Zoom To Layer (Z)').press('Tab');
    // Press Enter to activate layer copy operation
    await page.locator('text=Copy Layer (L)').press('Enter');
    // Click textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').click();
    // Fill textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').press('Control+v');

    const result = await page.evaluate(() => {
      let p = new DOMParser();
      let t = document.querySelector('[name="messageExtent"]').value;
      if (t !== '') {
        let l = p.parseFromString(t, 'text/html');
        return l.querySelector('map-layer').getAttribute('label');
      }
      return '';
    });

    expect(result).toBe('CBMT - INLINE');
  });
  test('Shift+Tab can be used to move between layer context menu items', async () => {
    await page.locator('mapml-viewer').press('Tab');
    await page.locator('[aria-label="Zoom in"]').press('Tab');
    await page.locator('[aria-label="Zoom out"]').press('Tab');
    await page.locator('[aria-label="Reload"]').press('Tab');
    await page.getByRole('button', { name: 'View Fullscreen' }).press('Tab');
    // Press Enter on layer control
    await page.locator('a[role="button"]').nth(3).press('Enter');
    // Press Shift+F10 to bring up layer context menu on first layer
    await page
      .locator('text=CBMT - INLINE✕ >> input[type="checkbox"]')
      .press('Shift+F10');

    // first item in menu is zoom
    await page.locator('text=Zoom To Layer (Z)').press('Tab');
    // when second (last) item in menu is selected, tab should go back to first
    await page.locator('text=Copy Layer (L)').press('Shift+Tab');
    // tab again to get to second / last item
    await page.locator('text=Zoom To Layer (Z)').press('Shift+Tab');
    // Press Enter to activate layer copy operation
    await page.locator('text=Copy Layer (L)').press('Enter');
    // Click textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').click();
    // Fill textarea[name="messageExtent"]
    await page.locator('textarea[name="messageExtent"]').press('Control+v');

    const result = await page.evaluate(() => {
      let p = new DOMParser();
      let t = document.querySelector('[name="messageExtent"]').value;
      if (t !== '') {
        let l = p.parseFromString(t, 'text/html');
        return l.querySelector('map-layer').getAttribute('label');
      }
      return '';
    });

    expect(result).toBe('CBMT - INLINE');
  });
});
