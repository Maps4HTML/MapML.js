import { test, expect, chromium } from '@playwright/test';

test.describe('matchMedia prefers-color-scheme tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {});
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('prefers-color-scheme.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('matchMedia recognizes light scheme', async () => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('prefers-color-scheme.html');
    const preferredColor = await page.locator('#preferred-color').textContent();
    expect(preferredColor).toBe('Prefers light');
  });

  test('matchMedia recognizes dark scheme', async () => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('prefers-color-scheme.html');
    const preferredColor = await page.locator('#preferred-color').textContent();
    expect(preferredColor).toBe('Prefers dark');
  });
});
