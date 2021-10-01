const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
    for (const browserType of BROWSER) {
        describe(
            "Announce movement test " + browserType,
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
                    await page.goto(PATH + "mapml-viewer.html");
                });
                afterAll(async function () {
                    await browser.close();
                });

                test("[" + browserType + "]" + " Output values are correct during regular movement", async ()=>{
                    const announceMovement = await page.$eval(
                        "body > mapml-viewer",
                        (map) => map._map.announceMovement._enabled
                    );
                    if(!announceMovement){
                        return;
                    }
                    await page.keyboard.press("Tab");
                    await page.keyboard.press("ArrowUp");
                    await page.waitForTimeout(100);

                    const movedUp = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(movedUp).toEqual("zoom level 0 column 3 row 3");

                    for(let i = 0; i < 2; i++){
                        await page.keyboard.press("ArrowLeft");
                        await page.waitForTimeout(100);
                    }

                    const movedLeft = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(movedLeft).toEqual("zoom level 0 column 2 row 3");

                    await page.keyboard.press("Equal");
                    await page.waitForTimeout(100);

                    const zoomedIn = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(zoomedIn).toEqual("zoom level 1 column 4 row 6");
                });

                test("[" + browserType + "]" + " Output values are correct at bounds and bounces back", async ()=>{
                    const announceMovement = await page.$eval(
                        "body > mapml-viewer",
                        (map) => map._map.announceMovement._enabled
                    );
                    if(!announceMovement){
                        return;
                    }
                    //Zoom out to min layer bound
                    await page.keyboard.press("Minus");
                    await page.waitForTimeout(100);

                    const minZoom = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(minZoom).toEqual("At minimum zoom level, zoom out disabled zoom level 0 column 2 row 3");

                    //Pan out of west bounds, expect the map to bounce back
                    for(let i = 0; i < 4; i++){
                        await page.waitForTimeout(100);
                        await page.keyboard.press("ArrowLeft");
                    }

                    const westBound = await page.waitForFunction(() =>
                        document.querySelector("body > mapml-viewer").shadowRoot.querySelector("div > output").innerHTML === "Reached west bound, panning west disabled",
                        {}, {timeout: 1000}
                    );
                    expect(await westBound.jsonValue()).toEqual(true);

                    const bouncedBack = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(bouncedBack).toEqual("zoom level 0 column 1 row 3");

                    //Zoom in out of bounds, expect the map to zoom back
                    await page.keyboard.press("Equal");

                    const zoomedOutOfBounds = await page.waitForFunction(() =>
                        document.querySelector("body > mapml-viewer").shadowRoot.querySelector("div > output").innerHTML === "Zoomed out of bounds, returning to",
                        {}, {timeout: 1000}
                    );
                    expect(await zoomedOutOfBounds.jsonValue()).toEqual(true);

                    const zoomedBack = await page.$eval(
                        "body > mapml-viewer div > output",
                        (output) => output.innerHTML
                    );
                    expect(zoomedBack).toEqual("zoom level 0 column 1 row 3");

                });

            }
        );
    }
})();