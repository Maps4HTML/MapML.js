import { test, expect, chromium } from '@playwright/test';

test.describe('Search custom handler tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('searchCustomHandler.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });
  test.afterAll(async () => {
    await context.close();
  });

  test('Search button is enabled when layer has search link', async () => {
    let disabled = await page.$eval('.mapml-search-button', (btn) =>
      btn.getAttribute('aria-disabled')
    );
    expect(disabled).toBe('false');
  });

  test('Custom suggestions handler renders geonames item names', async () => {
    // Open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type a query
    await page.fill('.mapml-search-input', 'Ottawa');
    // Wait for debounce + fetch + custom handler
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts).toEqual(['Ottawa', 'Arctic Ocean', 'Atlantic Ocean']);
  });

  test('Default suggestions handler does NOT run', async () => {
    // If default handler ran, results would show display_name (GeoJSON format)
    // Custom handler shows just the name from geonames items
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // None should contain comma-separated address (default handler pattern)
    for (let text of texts) {
      expect(text).not.toContain(',');
    }
  });

  test('Clicking a suggestion result with bbox fits bounds', async () => {
    // Click Ottawa (first result — has bbox)
    await page.click('.mapml-search-result:first-child');
    await page.waitForTimeout(500);
    // Panel should be closed
    let hasOpenClass = await page.$eval('.mapml-search-panel', (panel) =>
      panel.classList.contains('mapml-search-panel-open')
    );
    expect(hasOpenClass).toBe(false);
    // Map center should be roughly Ottawa area
    let center = await page.$eval('[data-testid=viewer]', (viewer) => {
      let map = viewer._map;
      return { lat: map.getCenter().lat, lng: map.getCenter().lng };
    });
    expect(center.lat).toBeCloseTo(45.24, 0);
    expect(center.lng).toBeCloseTo(-75.8, 0);
  });

  test('Custom search handler renders geonames items on Enter', async () => {
    // Re-open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type and press Enter for search
    await page.fill('.mapml-search-input', 'Ottawa');
    await page.press('.mapml-search-input', 'Enter');
    // Wait for search results
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(300);
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // Search endpoint returns 1 result
    expect(texts).toEqual(['Ottawa']);
  });

  test('Clicking a search result moves the map', async () => {
    await page.click('.mapml-search-result:first-child');
    await page.waitForTimeout(500);
    let center = await page.$eval('[data-testid=viewer]', (viewer) => {
      let map = viewer._map;
      return { lat: map.getCenter().lat, lng: map.getCenter().lng };
    });
    // Ottawa bbox center is roughly (45.24, -75.8)
    expect(center.lat).toBeCloseTo(45.24, 0);
    expect(center.lng).toBeCloseTo(-75.8, 0);
  });
});
