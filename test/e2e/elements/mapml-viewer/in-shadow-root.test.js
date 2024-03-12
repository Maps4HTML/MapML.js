import { test, expect, chromium } from '@playwright/test';

test.describe('mapml-viewer can be inside a shadow root or other custom element', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('in-shadow-root.html');
  });
  test('Console is clean when loading in shadow root', async () => {});
  test('Fullscreen control works via keyboard or mouse in shadow root', async () => {});
  test('layer- getMapEl() works in shadow root', async () => {});
  test('map-link getMapEl() works in shadow root', async () => {});
  test('map-feature getMapEl() works in shadow root', async () => {});
  test('map-extent getMapEl() works in shadow root', async () => {});
  test('map-extent getLayerEl() works in shadow root', async () => {});
  test('map-link getLayerEl() works in shadow root', async () => {});
  test('map-input getLayerEl() works in shadow root', async () => {});
  test('map-feature getLayerEl() works in shadow root', async () => {});
  

});