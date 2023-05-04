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
    // Press Tab
    await page.locator('text=View Fullscreen (F)').press('Tab');
    // Press Tab
    await page.locator('text=Copy (C)').press('Tab');
    // Press Tab
    await page.locator('text=Paste (P)').press('Tab');
    // Press Tab
    await page.locator('text=Toggle Controls (T)').press('Tab');
    // Press Tab
    await page.locator('text=Toggle Debug Mode (D)').press('Tab');
    // Press Tab
    await page.locator('text=View Map Source (V)').press('Tab');
    // Press Tab
    await page.locator('text=View Fullscreen (F)').press('Tab');
    // Press Tab
    await page.locator('text=Copy (C)').press('Tab');
    // Press Tab
    await page.locator('text=Paste (P)').press('Tab');
    // Press Enter
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
    // Press Tab
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
});
