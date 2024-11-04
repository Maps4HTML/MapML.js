import { test, expect, chromium } from '@playwright/test';

test.describe('mapml-viewer matchMedia API tests', () => {
  test('Test prefers-lang: en media feature', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ locale: 'en-CA' });
    const page = await context.newPage();

    await page.goto('prefers-lang.html');
    let layer = await page.locator('map-layer[lang=fr]');
    await expect(layer).toHaveAttribute('hidden');

    await context.close();
  });

  test('Test prefers-lang: fr media feature', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ locale: 'fr-CA' });
    const page = await context.newPage();

    await page.goto('prefers-lang.html');
    let layer = await page.locator('map-layer[lang=en]');
    await expect(layer).toHaveAttribute('hidden');

    await context.close();
  });
});
