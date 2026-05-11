import { test, expect, chromium } from '@playwright/test';

test.describe('Search i18n tests (Japanese)', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('searchI18n.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });
  test.afterAll(async () => {
    await context.close();
  });

  test('Japanese query in suggestions displays CJK results', async () => {
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type Japanese characters directly (simulates committed IME input)
    await page.fill('.mapml-search-input', '東京');
    // Wait for debounce + fetch
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts[0]).toBe('東京都, 日本');
    expect(texts[1]).toBe('東京タワー, 東京都, 日本');
    expect(texts[2]).toBe('東京駅, 東京都, 日本');
  });

  test('Japanese query via Enter performs search', async () => {
    await page.fill('.mapml-search-input', '東京');
    await page.press('.mapml-search-input', 'Enter');
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(300);
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts).toEqual(['東京都, 日本']);
  });

  test('Clicking Japanese result moves map to correct location', async () => {
    await page.click('.mapml-search-result:first-child');
    await page.waitForTimeout(500);
    let center = await page.$eval('[data-testid=viewer]', (viewer) => {
      let map = viewer._map;
      return { lat: map.getCenter().lat, lng: map.getCenter().lng };
    });
    // Tokyo bbox center is roughly (35.7, 139.4)
    expect(center.lat).toBeCloseTo(35.7, 0);
    expect(center.lng).toBeCloseTo(139.4, 0);
  });

  test('Search query is properly URL-encoded for non-Latin characters', async () => {
    // Intercept the network request to verify encoding
    let requestUrl = '';
    page.on('request', (request) => {
      if (request.url().includes('/search/ja/suggestions')) {
        requestUrl = request.url();
      }
    });
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    await page.fill('.mapml-search-input', '東京');
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    // The query should be percent-encoded
    expect(requestUrl).toContain(encodeURIComponent('東京'));
  });
});
