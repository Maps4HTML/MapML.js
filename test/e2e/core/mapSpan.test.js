const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
    for (const browserType of BROWSER) {
        describe(
            "<map-span> test " + browserType,
            ()=> {
                beforeAll(async () => {
                    browser = await playwright[browserType].launch({
                        headless: ISHEADLESS,
                        slowMo: 100,
                    });
                    context = await browser.newContext();
                    page = await context.newPage();
                    if (browserType === "firefox") {
                        await page.waitForNavigation();
                    }
                    await page.goto(PATH + "mapSpan.html");
                });
                afterAll(async function () {
                    await browser.close();
                });

                test("[" + browserType + "]" + " <map-span> hides tile boundaries", async ()=>{
                    const total = await page.$eval(
                        'body > mapml-viewer div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path:nth-child(2)',
                        (path) => path.getAttribute("style")
                    );

                    const featureOutline = await page.$(
                        'body > mapml-viewer div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path.fclass._2.mapml-feature-outline'
                    );

                    const hidden = await page.$eval(
                        'body > mapml-viewer div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > div > div:nth-child(1) > svg > g > g:nth-child(1) > path.noline.fclass._2',
                        (path) => path.getAttribute("d")
                    );
                    expect(featureOutline).not.toBe(null);

                    const d = await featureOutline.getAttribute("d");
                    const spliced = await hidden.slice(3, hidden.length);
                    //Makes sure that the part that should be hidden is not part of the feature outline
                    let index = d.indexOf(spliced);

                    expect(total).toEqual("stroke: none;");
                    expect(index).toEqual(-1);
                });
            }
        );
    }
})();