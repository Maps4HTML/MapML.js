import { test, expect, chromium } from '@playwright/test';

test.describe('Search button disabled state tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('searchDisabled.html', {waitUntil: 'networkidle'});
    await page.waitForTimeout(1000);
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('search button disabled when no layer has map-link rel=search', async () => {
    let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
      btn.getAttribute('aria-disabled')
    );
    expect(ariaDisabled).toEqual('true');
  });

  test.describe('Local layer — dynamic add/remove', () => {
    test('search button enabled after adding map-link rel=search to local layer', async () => {
      await page.evaluate(() => {
        let layer = document.querySelector('[data-testid=local-layer]');
        let link = document.createElement('map-link');
        link.setAttribute('rel', 'search');
        link.dataset.testid = 'local-search-link';
        layer.appendChild(link);
      });
      await page.waitForTimeout(100);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');
    });

    test('search button disabled after removing map-link rel=search from local layer', async () => {
      await page.evaluate(() => {
        let link = document.querySelector('[data-testid=local-search-link]');
        link.remove();
      });
      await page.waitForTimeout(100);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('true');
    });
  });

  test.describe('Layer checked/unchecked', () => {
    test('search button disabled when layer with search link is unchecked', async () => {
      // Add search link first
      await page.evaluate(() => {
        let layer = document.querySelector('[data-testid=local-layer]');
        let link = document.createElement('map-link');
        link.setAttribute('rel', 'search');
        link.dataset.testid = 'local-search-link';
        layer.appendChild(link);
      });
      await page.waitForTimeout(100);
      // Verify enabled
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');

      // Uncheck the layer
      await page.evaluate(() => {
        document
          .querySelector('[data-testid=local-layer]')
          .removeAttribute('checked');
      });
      await page.waitForTimeout(100);
      ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('true');
    });

    test('search button re-enabled when layer with search link is re-checked', async () => {
      await page.evaluate(() => {
        document
          .querySelector('[data-testid=local-layer]')
          .setAttribute('checked', '');
      });
      await page.waitForTimeout(100);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');

      // Clean up: remove the search link
      await page.evaluate(() => {
        let link = document.querySelector('[data-testid=local-search-link]');
        if (link) link.remove();
      });
      await page.waitForTimeout(100);
    });
  });

  test.describe('Remote (src) layer', () => {
    test('search button enabled when remote layer has map-link rel=search', async () => {
      await page.evaluate(async () => {
        let layer = document.querySelector('[data-testid=remote-layer]');
        layer.src = 'search-layer.mapml';
        await layer.whenReady();
      });
      await page.waitForTimeout(200);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');
    });

    test('search button disabled when remote layer without search link', async () => {
      await page.evaluate(async () => {
        let layer = document.querySelector('[data-testid=remote-layer]');
        layer.src = 'no-search-layer.mapml';
        await layer.whenReady();
      });
      await page.waitForTimeout(200);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('true');
    });
  });

  test.describe('Multiple layers', () => {
    test('search button stays enabled if one of two layers has search link', async () => {
      // Add search link to local layer
      await page.evaluate(() => {
        let layer = document.querySelector('[data-testid=local-layer]');
        let link = document.createElement('map-link');
        link.setAttribute('rel', 'search');
        link.dataset.testid = 'local-search-link';
        layer.appendChild(link);
      });
      await page.waitForTimeout(100);
      // Remote layer has no search link (no-search-layer.mapml)
      // But local layer does — button should be enabled
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');
    });

    test('search button disabled only when all search-capable layers are unchecked', async () => {
      // Uncheck local layer (the only one with search link)
      await page.evaluate(() => {
        document
          .querySelector('[data-testid=local-layer]')
          .removeAttribute('checked');
      });
      await page.waitForTimeout(100);
      let ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('true');

      // Re-check it — should be enabled again
      await page.evaluate(() => {
        document
          .querySelector('[data-testid=local-layer]')
          .setAttribute('checked', '');
      });
      await page.waitForTimeout(100);
      ariaDisabled = await page.$eval('.mapml-search-button', (btn) =>
        btn.getAttribute('aria-disabled')
      );
      expect(ariaDisabled).toEqual('false');
    });
  });
});
