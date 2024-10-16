import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright mapml-viewer map-captions Test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('mapml-viewerCaption.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('Aria-label matches map-caption', async () => {
    let arialabel = await page.evaluate(
      `document.querySelector('mapml-viewer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual('This is a test for mapml-viewer');
  });
  test('Changing first map-caption changes aria-label', async () => {
    await page.evaluateHandle(
      () => (document.querySelector('map-caption').innerHTML = 'Testing 1')
    );
    let arialabel = await page.evaluate(
      `document.querySelector('mapml-viewer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual('Testing 1');
  });
  test("Changing not-first map-caption doesn't change aria-label", async () => {
    await page.evaluateHandle(
      () => (document.getElementById('test2').innerHTML = 'Testing 2')
    );
    let arialabel = await page.evaluate(
      `document.querySelector('mapml-viewer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual('Testing 1'); // since aria-label didn't change, should still = "Testing 1" from previous test
  });
  test("Removing not-first map-caption doesn't remove aria-label", async () => {
    await page.evaluateHandle(() => document.getElementById('test3').remove());
    let arialabel = await page.evaluate(
      `document.querySelector('mapml-viewer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual('Testing 1'); // since aria-label is still there, shoudl still = "Testing 1" from previous test
  });
  test('Removing first map-caption removes aria-label', async () => {
    await page.evaluateHandle(() =>
      document.querySelector('map-caption').remove()
    );
    let arialabel = await page.evaluate(
      `document.querySelector('mapml-viewer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual(null); // since aria-label is removed, should = null
  });
  test("Map Caption doesn't create aria-label on a layer", async () => {
    let arialabel = await page.evaluate(
      `document.querySelector('map-layer').getAttribute('aria-label')`
    );
    expect(arialabel).toEqual(null);
  });
});
