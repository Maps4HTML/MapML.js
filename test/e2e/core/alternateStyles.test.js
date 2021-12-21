describe("Alternate / Named Styles test", () => {
  beforeAll(async () => {
    await page.goto(PATH + "alternateStyles.html");
  });

  afterAll(async function () {
    await context.close();
  });

  test("Keyboard activate third alternate style", async () => {
      let startingLayerSrc = await page.evaluate(`document.querySelector('layer-').src`);
      await expect(startingLayerSrc).toEqual("alternate-styles-natgeo.mapml");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Tab");
      let layerSrcShouldBe = await page.evaluate(`new URL("alternate-styles-imagery.mapml",document.querySelector('layer-').src).toString()`);
      let layerSrcIs =await page.evaluate(`document.querySelector('layer-').src`);
      await expect(layerSrcIs).toEqual(layerSrcShouldBe);
  });

});