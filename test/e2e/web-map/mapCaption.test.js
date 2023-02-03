import { test, expect, chromium } from '@playwright/test';

test.describe("Playwright web-map map-captions Test", () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      page = await context.newPage();
      await page.goto("mapCaption.html");
    });

    test.afterAll(async function () {
      await context.close();
    });

    test("Aria-label matches map-caption", async () => {
        let arialabel = await page.evaluate(`document.querySelector('map').getAttribute('aria-label')`);
        expect(arialabel).toEqual("This is a test for web-map");
    });
    test("Changing map-caption changes aria-label", async () => {
        await page.evaluateHandle(() => document.querySelector('map-caption').innerHTML="Testing 2");
        let arialabel = await page.evaluate(`document.querySelector('map').getAttribute('aria-label')`);
        expect(arialabel).toEqual("Testing 2");
    });

});