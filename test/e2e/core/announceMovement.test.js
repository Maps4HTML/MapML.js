import { test, expect, chromium } from '@playwright/test';

test.describe('Announce movement test', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
  });

  test.afterAll(async function () {
    await context.close();
  });

  let mapFiles = ['web-map.html', 'mapml-viewer.html'];

  for (let file of mapFiles) {
    test(
      file + ': Output values are correct during regular movement',
      async () => {
        await page.goto(file);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1000);
        const map = await page.getByTestId('testviewer');
        const movedUp = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(movedUp).toEqual('zoom level 0');

        for (let i = 0; i < 2; i++) {
          await page.keyboard.press('ArrowLeft');
          await page.waitForTimeout(1000);
        }

        const movedLeft = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(movedLeft).toEqual('zoom level 0');

        await page.keyboard.press('Equal');
        await page.waitForTimeout(1000);

        const zoomedIn = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(zoomedIn).toEqual('zoom level 1');

        await page.keyboard.press('Minus');
        await page.waitForTimeout(1000);

        const zoomedOut = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(zoomedOut).toEqual(
          'At minimum zoom level, zoom out disabled zoom level 0'
        );
        // testing + button
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        const zoomedBackIn = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(zoomedBackIn).toEqual('zoom level 1');
      }
    );

    test(
      file + ': Output values are correct at bounds and bounces back',
      async () => {
        //Zoom out to min layer bound
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Minus');
        await page.waitForTimeout(1000);
        const map = await page.getByTestId('testviewer');

        const minZoom = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(minZoom).toEqual(
          'At minimum zoom level, zoom out disabled zoom level 0'
        );
        await page.pause();

        //Pan out of west bounds, expect the map to bounce back
        for (let i = 0; i < 4; i++) {
          await page.waitForTimeout(1000);
          await page.keyboard.press('ArrowLeft');
        }

        const westBound = await page.waitForFunction(
          () => {
            const map = document.querySelector('mapml-viewer')
              ? document.querySelector('mapml-viewer')
              : document.querySelector('map');
            let output = map.shadowRoot
              ? map.shadowRoot.querySelector('output')
              : map.querySelector('div').shadowRoot.querySelector('output');
            return (
              output.innerHTML === 'Reached west bound, panning west disabled'
            );
          },
          {},
          { timeout: 1000 }
        );
        expect(await westBound.jsonValue()).toEqual(true);

        await page.waitForTimeout(1000);
        const bouncedBack = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(bouncedBack).toEqual('zoom level 0');

        //Zoom in out of bounds, expect the map to zoom back
        await page.keyboard.press('Equal');

        const zoomedOutOfBounds = await page.waitForFunction(
          () => {
            const map = document.querySelector('mapml-viewer')
              ? document.querySelector('mapml-viewer')
              : document.querySelector('map');
            let output = map.shadowRoot
              ? map.shadowRoot.querySelector('output')
              : map.querySelector('div').shadowRoot.querySelector('output');
            return output.innerHTML === 'Zoomed out of bounds, returning to';
          },
          { timeout: 1000 }
        );
        expect(await zoomedOutOfBounds.jsonValue()).toEqual(true);

        await page.waitForTimeout(1000);
        const zoomedBack = await map.evaluate((map) => {
          let output = map.shadowRoot
            ? map.shadowRoot.querySelector('output')
            : map.querySelector('div').shadowRoot.querySelector('output');
          return output.innerHTML;
        });
        expect(zoomedBack).toEqual('zoom level 0');
      }
    );
  }
});
