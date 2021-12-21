describe("Announce movement test", ()=> {
    beforeAll(async () => {
        await page.goto(PATH + "featureIndexOverlay.html");
    });

    afterAll(async function () {
        await context.close();
    });

    test("Feature index overlay and reticle shows on focus", async () => {
        const hiddenOverlay = await page.$eval(
            "div > output.mapml-feature-index",
            (output) => output.hasAttribute("hidden")
        );
        const hiddenReticle = await page.$eval(
            "div > div.mapml-feature-index-box",
            (div) => div.hasAttribute("hidden")
        );

        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        const afterTabOverlay = await page.$eval(
            "div > output.mapml-feature-index",
            (output) => output.hasAttribute("hidden")
        );
        const afterTabReticle = await page.$eval(
            "div > div.mapml-feature-index-box",
            (div) => div.hasAttribute("hidden")
        );

        await expect(hiddenOverlay).toEqual(true);
        await expect(hiddenReticle).toEqual(true);
        await expect(afterTabOverlay).toEqual(false);
        await expect(afterTabReticle).toEqual(false);
    });

    test("Feature index content is correct", async () => {
        const spanCount = await page.$eval(
            "div > output.mapml-feature-index > span",
            (span) => span.childElementCount
        );
        const firstFeature = await page.$eval(
            "div > output.mapml-feature-index > span > span:nth-child(1)",
            (span) => span.innerText
        );
        const lastSpan = await page.$eval(
            "div > output.mapml-feature-index > span > span:nth-child(8)",
            (span) => span.innerText
        );

        await expect(spanCount).toEqual(8);
        await expect(firstFeature).toEqual("1 Vermont");
        await expect(lastSpan).toEqual("9 More results");
    });

    test("Feature index more results are correct", async () => {
        await page.keyboard.press("9");
        await page.waitForTimeout(500);

        const spanCount = await page.$eval(
            "div > output.mapml-feature-index > span",
            (span) => span.childElementCount
        );
        const firstFeature = await page.$eval(
            "div > output.mapml-feature-index > span > span:nth-child(1)",
            (span) => span.innerText
        );
        const lastSpan = await page.$eval(
            "div > output.mapml-feature-index > span > span:nth-child(3)",
            (span) => span.innerText
        );

        await expect(spanCount).toEqual(3);
        await expect(firstFeature).toEqual("1 Pennsylvania");
        await expect(lastSpan).toEqual("8 Previous results");
    });

    test("Feature index previous results are correct", async () => {
        await page.keyboard.press("8");
        const spanCount = await page.$eval(
            "div > output.mapml-feature-index > span",
            (span) => span.childElementCount
        );

        await expect(spanCount).toEqual(8);
    });

});