import { test, expect, chromium } from '@playwright/test';

test.describe('Search default handler tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('searchDefault.html', { waitUntil: 'networkidle' });
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

  test('Typing in search input fetches suggestions after debounce', async () => {
    // Open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type a query
    await page.fill('.mapml-search-input', 'Ottawa');
    // Wait for debounce + fetch
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    let count = await page.$$eval(
      '.mapml-search-result',
      (btns) => btns.length
    );
    expect(count).toBe(3);
  });

  test('Suggestion results display correct text', async () => {
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts[0]).toBe('Ottawa, Ontario, Canada');
    expect(texts[1]).toBe('Ottawa River, Canada');
    expect(texts[2]).toBe('Gatineau, Quebec, Canada');
  });

  test('Clicking a result with bbox fits bounds and closes panel', async () => {
    // Click the first result (Ottawa — has bbox)
    await page.click('.mapml-search-result:first-child');
    await page.waitForTimeout(500);
    // Panel should be closed
    let hasOpenClass = await page.$eval('.mapml-search-panel', (panel) =>
      panel.classList.contains('mapml-search-panel-open')
    );
    expect(hasOpenClass).toBe(false);
    // Check the map center moved toward Ottawa (lat ~45.4, lon ~-75.65)
    let center = await page.$eval('[data-testid=viewer]', (viewer) => {
      let map = viewer._map;
      return { lat: map.getCenter().lat, lng: map.getCenter().lng };
    });
    expect(center.lat).toBeCloseTo(45.4, 0);
    expect(center.lng).toBeCloseTo(-75.65, 0);
  });

  test('Pressing Enter in input performs search', async () => {
    // Re-open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Clear input and type new query
    await page.fill('.mapml-search-input', 'Ottawa');
    // Press Enter
    await page.press('.mapml-search-input', 'Enter');
    // Wait for search results (search endpoint returns 1 result)
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(300);
    let count = await page.$$eval(
      '.mapml-search-result',
      (btns) => btns.length
    );
    expect(count).toBe(1);
  });

  test('mapsuggestions event is cancelable', async () => {
    // Close panel from previous test
    await page.click('.mapml-search-close');
    await page.waitForTimeout(400);

    // Add event listener that cancels suggestions
    await page.evaluate(() => {
      let viewer = document.querySelector('[data-testid=viewer]');
      viewer.addEventListener(
        'mapsuggestions',
        (e) => {
          e.preventDefault();
          viewer._suggestionsDefaultPrevented = true;
        },
        { once: true }
      );
    });
    // Open panel and type
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    await page.fill('.mapml-search-input', 'test');
    // Wait for the event to fire
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid=viewer]')
          ._suggestionsDefaultPrevented,
      { timeout: 5000 }
    );
    let prevented = await page.$eval(
      '[data-testid=viewer]',
      (viewer) => viewer._suggestionsDefaultPrevented
    );
    expect(prevented).toBe(true);
    // No results rendered (default was prevented, panel was freshly opened)
    let count = await page.$$eval(
      '.mapml-search-result',
      (btns) => btns.length
    );
    expect(count).toBe(0);
  });

  test('mapsearch event is cancelable', async () => {
    // Add event listener that cancels search
    await page.evaluate(() => {
      let viewer = document.querySelector('[data-testid=viewer]');
      viewer.addEventListener(
        'mapsearch',
        (e) => {
          e.preventDefault();
          viewer._searchDefaultPrevented = true;
        },
        { once: true }
      );
    });
    await page.fill('.mapml-search-input', 'Cancel me');
    await page.press('.mapml-search-input', 'Enter');
    // Wait for event
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid=viewer]')._searchDefaultPrevented,
      { timeout: 5000 }
    );
    let prevented = await page.$eval(
      '[data-testid=viewer]',
      (viewer) => viewer._searchDefaultPrevented
    );
    expect(prevented).toBe(true);
    // No search results rendered (default was prevented)
    let count = await page.$$eval(
      '.mapml-search-result',
      (btns) => btns.length
    );
    expect(count).toBe(0);
  });

  test('Closing panel clears pending operations', async () => {
    // Close panel
    await page.click('.mapml-search-close');
    await page.waitForTimeout(400);
    // Panel should be hidden after transition
    let hidden = await page.$eval('.mapml-search-panel', (panel) =>
      panel.hasAttribute('hidden')
    );
    expect(hidden).toBe(true);
  });
});
