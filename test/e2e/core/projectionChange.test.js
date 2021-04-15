const playwright = require("playwright");
jest.setTimeout(50000);
(async () => {
  for (const browserType of BROWSER) {
    describe(
      "Playwright Projection Change Tests " + browserType,
      () => {
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
          await page.goto(PATH + "projectionChange.html");
        });

        afterAll(async function () {
          await browser.close();
        });
        describe("Linked Feature Projection Change Tests in " + browserType, () => {
          test("[" + browserType + "]" + " _self Linked Feature Change To OSMTILE", async () => {
            for(let i = 0; i < 2; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(2000);
            const isChecked = await page.$eval(
              "body > map:nth-child(1) > layer-",
              (layer) => layer.checked
            );
            const isDisabled = await page.$eval(
              "body > map:nth-child(1) > layer-",
              (layer) => layer.disabled
            );
            expect(isChecked).toBeTruthy();
            expect(isDisabled).toEqual(false);
          });

          test("[" + browserType + "]" + " _parent Linked Feature Change To OSMTILE", async () => {
            for(let i = 0; i < 10; i++)
              await page.keyboard.press("Tab");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(2000);
            const isChecked = await page.$eval(
              "body > map:nth-child(1) > layer-",
              (layer) => layer.checked
            );
            const isDisabled = await page.$eval(
              "body > map:nth-child(1) > layer-",
              (layer) => layer.disabled
            );
            expect(isChecked).toBeTruthy();
            expect(isDisabled).toEqual(false);
          });
        });
      }
    );
  }
})();