describe("History test", ()=> {
    beforeAll(async () => {
      await page.goto(PATH + "mapml-viewer.html");
    });

    afterAll(async function () {
      await context.close();
    });

    //https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/550
    test("History does not get added to when trying to zoom out at min zoom level", async ()=>{
      await page.keyboard.press("Tab");
      await page.keyboard.press("Minus");
      await page.waitForTimeout(500);

      const history = await page.$eval(
        "body > mapml-viewer",
        (map) => map._history
      );
      await expect(history.length).toEqual(1);
    });

    test("History values are correct during vertical motion out of projection", async ()=>{
      for(let i = 0; i < 3; i++){
        await page.keyboard.press("ArrowUp");
        await page.waitForTimeout(500);
      }
      const history = await page.$eval(
        "body > mapml-viewer",
        (map) => map._history
      );

      await expect(history[2]).toEqual({ zoom: 0, x: 909, y: 870 });
      await expect(history[3]).toEqual({ zoom: 0, x: 909, y: 790 });
    });

    test("History across zoom levels", async ()=>{
      await page.keyboard.press("Equal");
      await page.waitForTimeout(500);
      //await page.keyboard.press("Minus");
      await page.keyboard.press("ArrowUp");
      await page.waitForTimeout(500);
      const history = await page.$eval(
        "body > mapml-viewer",
        (map) => map._history
      );
      await expect(history[4]).toEqual({ zoom: 1, x: 1436, y: 1378 });
      //expect(history[5]).toEqual(history[3]);
      await expect(history[5]).toEqual({ zoom: 1, x: 1436, y: 1298 });

    });

    test("Back function", async ()=>{
      await page.$eval(
        "body > mapml-viewer",
        (map) => map.back()
      );
      await page.waitForTimeout(500);
      const history = await page.$eval(
        "body > mapml-viewer",
        (map) => map._history
      );
      const location = await page.$eval(
        "body > mapml-viewer",
        (map) => map._map.getPixelBounds().getCenter()
      );
      await expect(location.x).toEqual(history[4].x);
      await expect(location.y).toEqual(history[4].y);

    });

    test("Forward function", async ()=>{
      await page.$eval(
        "body > mapml-viewer",
        (map) => map.forward()
      );
      await page.waitForTimeout(500);
      const history = await page.$eval(
        "body > mapml-viewer",
        (map) => map._history
      );
      const location = await page.$eval(
        "body > mapml-viewer",
        (map) => map._map.getPixelBounds().getCenter()
      );
      await expect(location.x).toEqual(history[5].x);
      await expect(location.y).toEqual(history[5].y);
    });
  });