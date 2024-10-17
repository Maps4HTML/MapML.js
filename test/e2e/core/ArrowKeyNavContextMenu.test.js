import { test, expect, chromium } from '@playwright/test';

test.describe('Using arrow keys to navigate context menu', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 250 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('ArrowKeyNavContextMenu.html');
  });
  test.afterAll(async function () {
    await context.close();
  });

  test('Testing layer contextmenu', async () => {
    await page.waitForTimeout(500);
    await page.locator('mapml-viewer').focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    await page.keyboard.press('Tab');

    await page.keyboard.press('Tab');

    await page.keyboard.press('Tab');

    await page.keyboard.press('Tab');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Shift+F10');

    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('ArrowDown');

    let activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Zoom To Layer (<kbd>Z</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy Layer (<kbd>L</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Zoom To Layer (<kbd>Z</kbd>)');

    await page.keyboard.press('ArrowUp');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy Layer (<kbd>L</kbd>)');

    await page.locator('mapml-viewer').click();

    let hidden = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.contextMenu._layerMenu.hidden);
    expect(hidden).toEqual(true);
  });

  test('Testing Extent layer contextmenu', async () => {
    await page.waitForTimeout(500);
    await page.locator('mapml-viewer').click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // opening layer control
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // expanding layer to reveal extents
    await page.keyboard.press('Enter');
    // tabbing to extent layer
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    await page.keyboard.press('Shift+F10');

    let activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Zoom To Sub-layer (<kbd>Z</kbd>)');
    await page.keyboard.press('Tab');
    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy Sub-layer (<kbd>L</kbd>)');
    await page.keyboard.press('ArrowUp');
    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Zoom To Sub-layer (<kbd>Z</kbd>)');

    await page.keyboard.press('Escape');
    let hidden = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.contextMenu._extentLayerMenu.hidden);
    expect(hidden).toEqual(true);

    await page.keyboard.press('Shift+F10');

    await page.locator('mapml-viewer').click();
    hidden = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.contextMenu._extentLayerMenu.hidden);
    expect(hidden).toEqual(true);

    // Ensuring the extent is still being revealed after layercontrol was closed and reopened
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // opening layer control
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+F10');
    await page.waitForTimeout(500);
    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Zoom To Sub-layer (<kbd>Z</kbd>)');
  });

  test('(partial) Up and Down Arrow keys to navigate the contextmenu', async () => {
    await page.locator('mapml-viewer').click({ button: 'right' });
    await page.keyboard.press('ArrowDown');

    let activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View fullscreen (<kbd>F</kbd>)');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Paste (<kbd>P</kbd>)');

    await page.keyboard.press('ArrowUp');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View fullscreen (<kbd>F</kbd>)');
  });

  test('Right and Left Arrow keys to navigate the contextmenu', async () => {
    await page.locator('mapml-viewer').click();
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('ArrowDown');

    let activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press('ArrowRight');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Map');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Extent');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Location');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Map');

    await page.keyboard.press('ArrowLeft');
    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press('ArrowRight');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Map');

    await page.keyboard.press('ArrowDown');
    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Extent');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Location');

    await page.keyboard.press('ArrowLeft');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    let hidden = await page
      .locator('mapml-viewer')
      .evaluate((viewer) => viewer._map.contextMenu._copySubMenu.hidden);
    expect(hidden).toEqual(true);
  });

  test('(full) Up and Down Arrow keys to navigate the contextmenu', async () => {
    await page.waitForTimeout(500);
    await page.locator('mapml-viewer').click();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Enter');

    await page.keyboard.press('Shift+F10');
    let activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Back (<kbd>Alt+Left Arrow</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Forward (<kbd>Alt+Right Arrow</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Reload (<kbd>Ctrl+R</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View fullscreen (<kbd>F</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Paste (<kbd>P</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Toggle Controls (<kbd>T</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Toggle Debug Mode (<kbd>D</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');

    await page.keyboard.press('ArrowDown');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('Back (<kbd>Alt+Left Arrow</kbd>)');

    await page.keyboard.press('ArrowUp');

    activeElement = await page.evaluate(
      () => document.activeElement.shadowRoot.activeElement.innerHTML
    );
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');
  });
});
