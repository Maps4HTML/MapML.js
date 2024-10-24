import { test, expect, chromium } from '@playwright/test';
let browserLocale, enLocale, frLocale, locales;

test.describe('<mapml-viewer> localization tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    page = await context.newPage();
    await page.goto('localization.html');

    // fetch locales and check that they are not undefined
    browserLocale = await page.getByTestId('map-options').evaluate(t => {
      return JSON.parse(t.content.firstChild.textContent).locale;
    });
    expect(browserLocale.cmBack).toBeTruthy();
    enLocale = await page.evaluate(() => M.options.localeEn);
    expect(enLocale.cmBack).toBeTruthy();
    frLocale = await page.evaluate(() => M.options.localeFr);
    expect(frLocale.cmBack).toBeTruthy();

    // define locale pairs for iterations
    locales = [
      ['english', enLocale],
      ['french', frLocale],
      ['ukrainian', browserLocale]
    ];
  });

  test.afterAll(async function () {
    await context.close();
  });

  test('All locales have matching keys', async () => {
    // for every property in enLocale, check that the corresponding
    // exist in frLocale and browserLocale
    for (const l in enLocale) {
      expect(frLocale[l]).toBeTruthy();
      expect(browserLocale[l]).toBeTruthy();
    }

    // for every property in frLocale, check that the corresponding is in enLocale
    for (const l in frLocale) {
      expect(enLocale[l]).toBeTruthy();
    }
  });

  test('Messages in context menus matches the locale key', async () => {
    const cmLocaleList = ['cmBack', 'cmForward', 'cmReload', 'btnFullScreen',
      'cmCopyCoords', 'cmCopyMapML', 'cmCopyExtent', 'cmCopyLocation',
      'cmPasteLayer', 'cmToggleControls', 'cmToggleDebug', 'cmViewSource'];

    for (const [language, locale] of locales) {
      // right click the current map
      await page.getByTestId(language).click({ button: 'right' });

      // locate the current context menu
      const contextMenu = await page.locator('.mapml-contextmenu:not([hidden])');

      // locate all buttons within this context menu
      const buttons = await contextMenu.locator('.mapml-contextmenu-item.mapml-button');

      const buttonCount = await buttons.count();
      expect(buttonCount).toBe(cmLocaleList.length);

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        expect(text).toBeTruthy();
        expect(text.startsWith(locale[cmLocaleList[i]])).toBe(true);
      }
    }
  });

  test('Messages in layer menus matches the locale key', async () => {
    const buttonNames = ['lmRemoveLayer', 'lmLayerSettings', 'lmRemoveExtent', 'lmExtentSettings'];

    for (const [language, locale] of locales) {
      // select the current map
      const map = await page.getByTestId(language);

      // check all setting buttons
      const layerMenu = await map.locator('.leaflet-control-layers.leaflet-control');
      const buttons = await layerMenu.locator('.mapml-button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBe(buttonNames.length);
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.getAttribute('title');
        expect(text).toBeTruthy();
        expect(text.startsWith(locale[buttonNames[i]])).toBe(true);
      }

      // check opacity and default layer/extent names
    }
  });
});
