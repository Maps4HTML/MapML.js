import { test, expect, chromium } from '@playwright/test';

test.describe("Using arrow keys to navigate context menu", () => {
  let page;
  let context;
  test.beforeAll(async function() {
    context = await chromium.launchPersistentContext('');
    page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
    await page.goto("ArrowKeyNavContextMenu.html");
  });
  test.afterAll(async function () {
    await context.close();
  });

  test("Testing layer contextmenu", async () => {
    await page.waitForTimeout(500);
    await page.click('body > mapml-viewer');
    await page.waitForTimeout(500);
    await page.keyboard.press("Tab");

    await page.keyboard.press("Tab");
  
    await page.keyboard.press("Tab");

    await page.keyboard.press("Tab");

    await page.keyboard.press("Tab");

    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await page.keyboard.press("Shift+F10");

    await page.keyboard.press("ArrowDown");

    await page.keyboard.press("ArrowDown");

    let activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Zoom To Layer (<kbd>Z</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy Layer (<kbd>L</kbd>)');
    
    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Zoom To Layer (<kbd>Z</kbd>)');

    await page.keyboard.press("ArrowUp");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy Layer (<kbd>L</kbd>)');

    await page.click('body > mapml-viewer');

    let hide = await page.$eval("body > mapml-viewer", (viewer) => viewer._map.contextMenu._layerMenu.hidden);
    expect(hide).toEqual(true);
  });

  test("(partial) Up and Down Arrow keys to navigate the contextmenu", async () => {
    await page.click('body > mapml-viewer', { button: 'right' });
    await page.keyboard.press("ArrowDown");

    let activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Fullscreen (<kbd>F</kbd>)');

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Paste (<kbd>P</kbd>)');

    await page.keyboard.press("ArrowUp");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Fullscreen (<kbd>F</kbd>)');
  });

  test("Right and Left Arrow keys to navigate the contextmenu", async () => {
    await page.click('body > mapml-viewer');
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("ArrowDown");

    let activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press("ArrowRight");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Map');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Extent');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Location');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Map');

    await page.keyboard.press("ArrowUp");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Location');

    await page.keyboard.press("ArrowLeft");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    let hide = await page.$eval("body > mapml-viewer", (viewer) => viewer._map.contextMenu._coordMenu.hidden);
    expect(hide).toEqual(true);
  });

  test("(full) Up and Down Arrow keys to navigate the contextmenu", async () => {
    await page.waitForTimeout(500);
    await page.click('body > mapml-viewer');
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("Enter");

    await page.keyboard.press("Shift+F10");
    let activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Back (<kbd>Alt+Left Arrow</kbd>)');
  
    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Forward (<kbd>Alt+Right Arrow</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Reload (<kbd>Ctrl+R</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Fullscreen (<kbd>F</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Copy (<kbd>C</kbd>)<span></span>');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Paste (<kbd>P</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Toggle Controls (<kbd>T</kbd>)');
    
    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Toggle Debug Mode (<kbd>D</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');

    await page.keyboard.press("ArrowDown");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('Back (<kbd>Alt+Left Arrow</kbd>)');

    await page.keyboard.press("ArrowUp");

    activeElement = await page.evaluate(() => document.activeElement.shadowRoot.activeElement.innerHTML);
    expect(activeElement).toEqual('View Map Source (<kbd>V</kbd>)');
  });
});

