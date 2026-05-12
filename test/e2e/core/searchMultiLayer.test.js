import { test, expect, chromium } from '@playwright/test';

test.describe('Search multi-layer tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('searchMultiLayer.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });
  test.afterAll(async () => {
    await context.close();
  });

  test('Suggestions aggregate results from both layers', async () => {
    // Open the panel
    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    // Type a query
    await page.fill('.mapml-search-input', 'test');
    // Wait for results from both layers (5 total)
    // Use waitForSelector (pierces shadow DOM) then poll count via $$eval
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(500);
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // Layer 1 returns 3 items (Ottawa, Arctic Ocean, Atlantic Ocean)
    // Layer 2 returns 2 items (Toronto, Montreal)
    expect(texts).toEqual([
      'Ottawa',
      'Arctic Ocean',
      'Atlantic Ocean',
      'Toronto',
      'Montreal'
    ]);
  });

  test('Suggestion results carry correct layer attribution', async () => {
    let layers = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.dataset.layer)
    );
    // First 3 from layer 1, last 2 from layer 2
    expect(layers[0]).toBe('Geonames Layer 1');
    expect(layers[1]).toBe('Geonames Layer 1');
    expect(layers[2]).toBe('Geonames Layer 1');
    expect(layers[3]).toBe('Geonames Layer 2');
    expect(layers[4]).toBe('Geonames Layer 2');
  });

  test('Event detail responses array has entries from each layer', async () => {
    // Close panel from previous test
    await page.evaluate(() => {
      const viewer = document.querySelector('[data-testid=viewer]');
      const panel = viewer.shadowRoot.querySelector('.mapml-search-panel');
      if (panel) {
        panel.classList.remove('mapml-search-panel-open');
        panel.setAttribute('hidden', '');
      }
    });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const viewer = document.querySelector('[data-testid=viewer]');
      viewer.addEventListener(
        'mapsuggestions',
        (e) => {
          viewer._testResponseCount = e.detail.responses.length;
          viewer._testLayerLabels = e.detail.responses.map((r) =>
            r.layer.getAttribute('label')
          );
        },
        { once: true }
      );
    });

    await page.click('.mapml-search-button');
    await page.waitForTimeout(400);
    await page.fill('.mapml-search-input', 'multi');
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid=viewer]')._testResponseCount !==
        undefined,
      { timeout: 5000 }
    );

    let responseCount = await page.$eval(
      '[data-testid=viewer]',
      (v) => v._testResponseCount
    );
    let layerLabels = await page.$eval(
      '[data-testid=viewer]',
      (v) => v._testLayerLabels
    );

    expect(responseCount).toBe(2);
    expect(layerLabels).toEqual(['Geonames Layer 1', 'Geonames Layer 2']);
  });

  test('Search (Enter) aggregates results from both layers', async () => {
    // Clear input and search
    await page.fill('.mapml-search-input', 'search-multi');
    await page.press('.mapml-search-input', 'Enter');
    // Wait for search results
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(500);
    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    expect(texts).toEqual(['Ottawa', 'Toronto']);
  });

  test('Search results carry correct layer attribution', async () => {
    let layers = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.dataset.layer)
    );
    expect(layers[0]).toBe('Geonames Layer 1');
    expect(layers[1]).toBe('Geonames Layer 2');
  });

  test('Unchecking a layer excludes it from results', async () => {
    // Uncheck layer 2
    await page.evaluate(() => {
      document.querySelector('[data-testid=layer2]').removeAttribute('checked');
    });
    await page.waitForTimeout(500);

    // Clear and re-type to trigger new suggestions
    await page.fill('.mapml-search-input', '');
    await page.fill('.mapml-search-input', 'filtered');
    await page.waitForSelector('.mapml-search-result', { timeout: 5000 });
    await page.waitForTimeout(500);

    let texts = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.textContent)
    );
    // Only layer 1 results (Ottawa, Arctic Ocean, Atlantic Ocean)
    expect(texts).toEqual(['Ottawa', 'Arctic Ocean', 'Atlantic Ocean']);

    let layers = await page.$$eval('.mapml-search-result', (btns) =>
      btns.map((b) => b.dataset.layer)
    );
    for (let label of layers) {
      expect(label).toBe('Geonames Layer 1');
    }
  });
});
