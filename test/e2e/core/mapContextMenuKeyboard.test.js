import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Map Context Menu Keyboard Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('mapml-viewer.html');
  });

  test.afterAll(async function () {
    await context.close();
  });
  test('Tab forward works like ArrowDown to navigate map context menu items', async () => {
    await page.locator('mapml-viewer').click();
    // display map context menu
    await page.locator('mapml-viewer').press('Shift+F10');
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.locator('text=Copy (C)').press('Tab');
    await page.locator('text=Paste (P)').press('Tab');
    await page.locator('text=Toggle Controls (T)').press('Tab');
    await page.locator('text=Toggle Debug Mode (D)').press('Tab');
    await page.locator('text=View Map Source (V)').press('Tab');
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.locator('text=Copy (C)').press('Tab');
    await page.locator('text=Paste (P)').press('Tab');
    await page.locator('text=Toggle Controls (T)').press('Enter');

    let controls = await page.evaluate(() => {
      return document.querySelector('mapml-viewer').controls ? true : false;
    });
    expect(controls).toBe(false);
  });
  test('Shift+Tab works like ArrowUp to navigate map context menu items', async () => {
    await page.goto('mapml-viewer.html'); // reset needed
    await page.locator('mapml-viewer').click();
    // display map context menu
    await page.locator('mapml-viewer').press('Shift+F10');
    // View Fullscreen should be selected item
    await page.locator('text=View Fullscreen (F)').press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // should be at toggle controls here
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // back to toggle controls, in theory
    await page.keyboard.press('Enter');
    //await page.locator('text=Toggle Controls (T)').press('Enter');
    let controls = await page.evaluate(() => {
      return document.querySelector('mapml-viewer').controls ? true : false;
    });
    expect(controls).toBe(false);
  });
  test('Shift+F10 on feature does not throw', async () => {
    // check for error messages in console
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    await page.goto('mapContextMenu.html');
    const viewer = await page.locator('mapml-viewer');
    await viewer.evaluate((viewer) => viewer.whenLayersReady());
    await viewer.press('Tab');
    await page
      .locator('[aria-label="The Man With Two Hats"]')
      .press('Shift+F10');
    // check for error messages in console
    expect(errorLogs.length).toBe(0);
  });
  test('Arrow key navigation of context menu does not scroll document', async () => {
    await page.goto('mapContextMenu.html');
    const mapPosition1 = await page.evaluate(() => {
      return document.querySelector('mapml-viewer').getBoundingClientRect().y;
    });
    await page.locator('mapml-viewer').click();
    await page.locator('mapml-viewer').press('Shift+F10');
    await page.locator('text=View Fullscreen (F)').press('ArrowDown');
    await page.locator('text=Copy (C)').press('ArrowDown');
    await page.locator('text=Paste (P)').press('ArrowDown');
    await page.locator('text=Toggle Controls (T)').press('ArrowDown');
    const mapPosition2 = await page.evaluate(() => {
      return document.querySelector('mapml-viewer').getBoundingClientRect().y;
    });
    expect(mapPosition2).toEqual(mapPosition1);
  });
});
