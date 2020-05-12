"use strict";

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:63342/Web-Map-Custom-Element/index.html");
    await page.click(".leaflet-control-zoom-in");
    await page.click(".leaflet-control-zoom-in");
    await page.click(".leaflet-control-zoom-in");
    await page.click(".leaflet-control-zoom-in");
    for (const browserType of ['chromium', 'firefox', 'webkit']) {
        const browser = await playwright[browserType].launch();
        const context = await browser.newContext();
        const page = await context.newPage('http://whatsmyuseragent.org/');

        await page.screenshot({ path: `example-${browserType}.png` });
        await browser.close();
    }
})();