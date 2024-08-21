import { test, expect, chromium } from '@playwright/test';

// these must be declared here to be available for the zoomIn function scope
let page;
let context;

async function zoomIn(requestCount, urlBase, url) {
  let u = '';
  let requests = 0;
  page.on('request', (request) => {
    if (request.url().includes(urlBase)) {
      requests += 1;
      u = request.url();
    }
  });
  await page.keyboard.press('Equal');
  await page.waitForTimeout(1000);
  expect(requests).toEqual(requestCount);
  if (url !== '') expect(u).toContain(url);
}

exports.test = (
  path,
  z2,
  z3,
  z4,
  z5,
  urlBase,
  u1,
  u2,
  u3,
  u4,
  u5,
  pan,
  panU,
  native
) => {
  test.describe('Request Tests', () => {
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page = await context.newPage();
      await page.goto(path);
    });
    test.afterAll(async function () {
      await context.close();
    });

    test('On add requests zoom level 0', async () => {
      let url = '';
      await page.on('request', (request) => {
        if (request.url().includes(urlBase)) {
          url = request.url();
        }
      });
      await page.waitForTimeout(500);
      await page.reload();
      await page.waitForTimeout(500);
      expect(url).toContain(u1);
    });

    test('At zoom level 1, zooming in to 2', async () => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await zoomIn(z2, urlBase, u2);
    });

    test('At zoom level 2, zooming in to 3', async () => {
      await zoomIn(z3, urlBase, u3);
    });

    test('At zoom level 3, zooming in to 4', async () => {
      await zoomIn(z4, urlBase, u4);
    });

    test('At zoom level 4, zooming in to 5', async () => {
      await zoomIn(z5, urlBase, u5);
    });

    //https://github.com/Maps4HTML/MapML.js/issues/666
    if (native) {
      test('No requests out of native zoom bounds', async () => {
        await zoomIn(0, '', '');
        await page.keyboard.press('Minus');
        await page.waitForTimeout(1000);
      });
    }

    test('Panning makes new request as needed', async () => {
      await page.keyboard.press('Minus');
      await page.waitForTimeout(1000);
      let u = '';
      page.on('request', (request) => {
        if (request.url().includes(urlBase)) {
          u = request.url();
        }
      });
      for (let i = 0; i < pan; i++) {
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
      }

      expect(u).toContain(panU);
    });
  });
};
