import { test, expect, chromium } from '@playwright/test';

test.describe('Playwright Keyboard Navigation + Query Layer Tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('popupTabNavigation.html');
  });

  test.afterAll(async function () {
    await context.close();
  });

  test.describe('Feature Popup Tab Navigation Tests', () => {
    test('Inline features popup focus order', async () => {
      const vectorLayer = page.getByTestId('vector');
      await vectorLayer.evaluate((l) => {
        l.removeAttribute('checked');
      });
      const queryLayer = page.getByTestId('query');
      await queryLayer.evaluate((l) => {
        l.removeAttribute('checked');
      });
      const viewer = page.locator('mapml-viewer');
      await viewer.focus();
      await page.keyboard.press('Tab'); // focus map

      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Enter'); // display popup with link in it
      const popupContainer = page.locator('.leaflet-popup');
      const popup = popupContainer.locator('.mapml-popup-content');
      await expect(popup).toBeFocused();
      await page.keyboard.press('Tab'); // focus link
      // there are actually 2 copies of the testid, so we scope relative to the popup
      const anchor = popupContainer.getByTestId('anchor');
      await expect(anchor).toBeFocused();

      await page.keyboard.press('Tab'); // focus on "zoom to here" link
      const zoomToHereLink = popupContainer.getByText('Zoom to here');
      await expect(zoomToHereLink).toBeFocused();

      await page.keyboard.press('Tab'); // focus on |< affordance
      const focusMapButton = popupContainer.getByRole('button', {
        name: 'Focus Map'
      });
      await expect(focusMapButton).toBeFocused();

      await page.keyboard.press('Tab'); // focus on < affordance
      const previousFeatureButton = popupContainer.getByRole('button', {
        name: 'Previous Feature'
      });
      await expect(previousFeatureButton).toBeFocused();

      await page.keyboard.press('Tab'); // focus on > affordance
      const nextFeatureButton = popupContainer.getByRole('button', {
        name: 'Next Feature'
      });
      await expect(nextFeatureButton).toBeFocused();

      await page.keyboard.press('Tab'); // focus on >| affordance
      const focusControlsButton = popupContainer.getByRole('button', {
        name: 'Focus Controls'
      });
      await expect(focusControlsButton).toBeFocused();

      await page.keyboard.press('Tab'); // focus on X dismiss popup affordance
      const dismissButton = popupContainer.getByRole('button', {
        name: 'Close popup'
      });
      await expect(dismissButton).toBeFocused();
    });

    test('Tab to next feature after tabbing out of popup', async () => {
      const viewer = page.getByTestId('viewer');
      await page.keyboard.press('Escape'); // focus back on feature
      // according to https://github.com/microsoft/playwright/issues/15929
      // tests should locate the element and then check that it is focused
      const bigSquare = viewer.getByTestId('big-square');
      const bigSquarePathData = await bigSquare.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      // no way to get a locator from another locator afaik, but this may work:
      const bigSquareGroupEl = viewer.locator(
        'g:has( > path[d="' + bigSquarePathData + '"])'
      );
      await expect(bigSquareGroupEl).toBeFocused();
      // that we have to do this to get the tooltip back is a bug #681
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Shift + Tab to current feature while popup open', async () => {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const bigSquare = viewer.getByTestId('big-square');
      const bigSquarePathData = await bigSquare.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      const bigSquareGroupEl = viewer.locator(
        'g:has( > path[d="' + bigSquarePathData + '"])'
      );
      await expect(bigSquareGroupEl).toBeFocused();
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Previous feature button focuses previous feature', async () => {
      await page.keyboard.press('ArrowDown'); // focus next feature
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // popup
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus < affordance (previous feature)
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // focus should fall on previous feature
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const bigSquare = viewer.getByTestId('big-square');
      const bigSquarePathData = await bigSquare.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      const bigSquareGroupEl = viewer.locator(
        'g:has( > path[d="' + bigSquarePathData + '"])'
      );
      await expect(bigSquareGroupEl).toBeFocused();
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Tooltip appears after pressing esc key', async () => {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await page.keyboard.down('Escape'); // focus back on feature
      await page.keyboard.up('Escape');
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const bigSquare = viewer.getByTestId('big-square');
      const bigSquarePathData = await bigSquare.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      const bigSquareGroupEl = viewer.locator(
        'g:has( > path[d="' + bigSquarePathData + '"])'
      );
      await expect(bigSquareGroupEl).toBeFocused();
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Tooltip appears after pressing enter on close button', async () => {
      await page.keyboard.press('Enter'); // focus back into popup
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // focus on x button
      await page.keyboard.down('Enter'); // press x button
      await page.keyboard.up('Enter');
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const bigSquare = viewer.getByTestId('big-square');
      const bigSquarePathData = await bigSquare.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      const bigSquareGroupEl = viewer.locator(
        'g:has( > path[d="' + bigSquarePathData + '"])'
      );
      await expect(bigSquareGroupEl).toBeFocused();
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Next feature button focuses next feature', async () => {
      await page.keyboard.press('Enter'); // popup with link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus |< affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus < affordance
      await page.waitForTimeout(500);
      await page.keyboard.press('Tab'); // focus > affordance (next feature)
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); // focus falls on next feature
      const viewer = page.getByTestId('viewer');
      const smallTrapezoid = viewer.getByTestId('small-trapezoid');
      const smallTrapezoidPathData = await smallTrapezoid.evaluate((f) => {
        return f._groupEl.firstElementChild.getAttribute('d');
      });
      // no way to get a locator from another locator afaik, but this may work:
      const smallTrapezoidGroupEl = viewer.locator(
        'g:has( > path[d="' + smallTrapezoidPathData + '"])'
      );
      await expect(smallTrapezoidGroupEl).toBeFocused();
      const toolTipPane = viewer.locator('.leaflet-tooltip-pane');
      let tooltipCount = await toolTipPane.evaluate(
        (div) => div.childElementCount
      );
      expect(tooltipCount).toEqual(1);
    });

    test('Focus Controls focuses the first <button> child in control div', async () => {
      await page.waitForTimeout(1000);
      const viewer = page.locator('mapml-viewer');
      await viewer.click();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.click('body > mapml-viewer');
      await page.keyboard.press('Shift+F10');
      await page.keyboard.press('t');
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      const focusedElement = page.getByText('Maps for HTML Community Group');
      await expect(focusedElement).toBeFocused();
    });

    test('Zoom link zooms to the zoom level = zoom attribute', async () => {
      const body = page.locator('body');
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Enter'); // display popup with link in it
      await page.keyboard.press('Tab'); // focus link
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const zoom = await viewer.evaluate((map) => +map.getAttribute('zoom'));
      expect(zoom).toEqual(2);
    });

    test('Zoom link zooms to the maximum zoom level that can show the feature completely when zoom attribute does not present', async () => {
      const body = page.locator('body');
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab'); // focus feature
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // zoom out
      await page.waitForTimeout(200);
      await body.click();
      await page.keyboard.press('Tab'); // focus map
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowLeft'); // focus targeted feature
      await page.keyboard.press('Enter'); // display popup with link in it
      await page.keyboard.press('Tab'); // focus zoomto link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      const viewer = page.getByTestId('viewer');
      const zoom = await viewer.evaluate((map) => +map.getAttribute('zoom'));
      expect(zoom).toEqual(2);
    });
  });
});
