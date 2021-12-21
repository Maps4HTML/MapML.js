describe("Alternate / Named Styles test", () => {
  beforeEach(async () => {
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
      let layerSrcShouldBe = await page.evaluate(`new URL("alternate-styles-imagery.mapml",window.location).toString()`);
      let layerSrcIs =await page.evaluate(`document.querySelector('layer-').src`);
      await expect(layerSrcIs).toEqual(layerSrcShouldBe);
  });

  test("Mouse activate third alternate style", async () => {
      await page.hover(".leaflet-top.leaflet-right");
      await page.click(".mapml-layer-item-settings-control.mapml-button");
      await page.click(".mapml-layer-item-style");
      await page.click('text="Satellite Imagery"')
      let startingLayerSrc = await page.evaluate(`document.querySelector('layer-').src`);
      await expect(startingLayerSrc).toEqual("alternate-styles-natgeo.mapml");
      // the focusout event is when the update occurs
      await page.click('body');
      let layerSrcShouldBe = await page.evaluate(`new URL("alternate-styles-imagery.mapml",window.location).toString()`);
      let layerSrcIs =await page.evaluate(`document.querySelector('layer-').src`);
      await expect(layerSrcIs).toEqual(layerSrcShouldBe);
  });

});