import { test, expect, chromium } from '@playwright/test';

test.describe('Map Tile Immutable Attributes Tests', () => {
  let page;
  let context;

  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('http://localhost:30001/test-immutable.html');
  });

  test('row, col, zoom attributes become immutable after initialization', async () => {
    // Wait for element to be connected and initialized
    await page.waitForTimeout(2000);

    // Get initial values
    const initialValues = await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      return {
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        zoom: tile.getAttribute('zoom')
      };
    });

    expect(initialValues.row).toBe('1');
    expect(initialValues.col).toBe('1');
    expect(initialValues.zoom).toBe('2');

    // Try to change via setAttribute - should be reverted
    await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      tile.setAttribute('row', '5');
      tile.setAttribute('col', '6');
      tile.setAttribute('zoom', '3');
    });

    // Check that values were reverted
    const afterSetAttribute = await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      return {
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        zoom: tile.getAttribute('zoom')
      };
    });

    expect(afterSetAttribute.row).toBe('1'); // Should remain unchanged
    expect(afterSetAttribute.col).toBe('1'); // Should remain unchanged
    expect(afterSetAttribute.zoom).toBe('2'); // Should remain unchanged

    // Try to change via property setters - should also fail
    await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      tile.row = 10;
      tile.col = 11;
      tile.zoom = 4;
    });

    const afterPropertySetters = await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      return {
        row: tile.getAttribute('row'),
        col: tile.getAttribute('col'),
        zoom: tile.getAttribute('zoom')
      };
    });

    expect(afterPropertySetters.row).toBe('1'); // Should remain unchanged
    expect(afterPropertySetters.col).toBe('1'); // Should remain unchanged
    expect(afterPropertySetters.zoom).toBe('2'); // Should remain unchanged
  });

  test('src attribute can still be changed after initialization', async () => {
    // Wait for element to be connected
    await page.waitForTimeout(1000);

    const initialSrc = await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      return tile.getAttribute('src');
    });

    // Change src attribute
    const newSrc =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mNkYPhfDwAChAGA6ej9MgAAAABJRU5ErkJggg==';
    await page.evaluate((src) => {
      const tile = document.getElementById('test-tile');
      tile.setAttribute('src', src);
    }, newSrc);

    const finalSrc = await page.evaluate(() => {
      const tile = document.getElementById('test-tile');
      return tile.getAttribute('src');
    });

    expect(finalSrc).toBe(newSrc);
    expect(finalSrc).not.toBe(initialSrc);
  });

  test.afterAll(async () => {
    await context.close();
  });
});
