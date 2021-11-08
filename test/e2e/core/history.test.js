const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
    for (const browserType of BROWSER) {
       describe(
           "History test" + browserType,
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

               //https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/550
               test("[" + browserType + "]" + " History does not get added to when trying to zoom out at min zoom level", async ()=>{
                   await page.keyboard.press("Tab");
                   await page.keyboard.press("Minus");
                   await page.waitForTimeout(100);

                   const history = await page.$eval(
                       "body > mapml-viewer",
                       (map) => map._history
                   );
                   expect(history.length).toEqual(1);
               });

               test("[" + browserType + "]" + " History values are correct during vertical motion out of projection", async ()=>{
                    for(let i = 0; i < 3; i++){
                        await page.keyboard.press("ArrowUp");
                        await page.waitForTimeout(100);
                    }
                    const history = await page.$eval(
                        "body > mapml-viewer",
                        (map) => map._history
                    );
                    expect(history[2]).toEqual({ zoom: 0, x: 909, y: 870 });
                    expect(history[3]).toEqual({ zoom: 0, x: 909, y: 790 });
               });

               test("[" + browserType + "]" + " History across zoom levels", async ()=>{
                    await page.keyboard.press("Equal");
                    await page.waitForTimeout(100);
                    //await page.keyboard.press("Minus");
                    await page.keyboard.press("ArrowUp");
                    const history = await page.$eval(
                        "body > mapml-viewer",
                        (map) => map._history
                    );
                    expect(history[4]).toEqual({ zoom: 1, x: 1436, y: 1378 });
                    //expect(history[5]).toEqual(history[3]);
                    expect(history[5]).toEqual({ zoom: 1, x: 1436, y: 1298 });

               });

               test("[" + browserType + "]" + " Back function", async ()=>{
                   await page.$eval(
                       "body > mapml-viewer",
                       (map) => map.back()
                   );
                   const history = await page.$eval(
                       "body > mapml-viewer",
                       (map) => map._history
                   );
                   const location = await page.$eval(
                       "body > mapml-viewer",
                       (map) => map._map.getPixelBounds().getCenter()
                   );
                   expect(location.x).toEqual(history[4].x);
                   expect(location.y).toEqual(history[4].y);

               });

               test("[" + browserType + "]" + " Forward function", async ()=>{
                   await page.$eval(
                       "body > mapml-viewer",
                       (map) => map.forward()
                   );
                   const history = await page.$eval(
                       "body > mapml-viewer",
                       (map) => map._history
                   );
                   const location = await page.$eval(
                       "body > mapml-viewer",
                       (map) => map._map.getPixelBounds().getCenter()
                   );
                   expect(location.x).toEqual(history[5].x);
                   expect(location.y).toEqual(history[5].y);
               });
           }
       );
    }
})();