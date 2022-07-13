describe("mapml-viewer DOM API Tests", () => {
  beforeAll(async () => {
    await page.goto(PATH + "domApi.html");
  });

  afterAll(async function () {
    await context.close();
  });
  
  test("Create a map viewer with document.createElement(mapml-viewer)", async () => {
    const viewerHandle = await page.evaluateHandle(()=> document.createElement("mapml-viewer"));
    const nn = await (await page.evaluateHandle(viewer => viewer.nodeName, viewerHandle)).jsonValue();
    await expect(nn).toEqual('MAPML-VIEWER');
    await page.evaluateHandle((viewer) => viewer.setAttribute("lat", 45), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("lon", -90), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("zoom", 2), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("controls", "controls"), viewerHandle);
    await page.evaluateHandle((viewer) => viewer.setAttribute("projection", "CBMTILE"), viewerHandle);
    await page.evaluateHandle( (viewer) => document.body.appendChild(viewer), viewerHandle);
    const velName = await page.evaluate(() => document.body.querySelector("mapml-viewer").nodeName);
    await expect(velName).toBe('MAPML-VIEWER');
      });
  

});