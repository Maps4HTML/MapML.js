const request = require('./request')
describe("Templated image layer with step", () => {
    beforeAll(async () => {
        await page.goto(PATH + 'step/templatedImageLayer.html');
    });

    afterAll(async function () {
        await context.close();
    });

    request.test(0, 1, 0, 0,
        "http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en?SERVICE=WMS&REQUEST=GetMap&FORMAT=image/jpeg&TRANSPARENT=FALSE&STYLES=&VERSION=1.3.0&LAYERS=WMS-Toporama&WIDTH=300&HEIGHT=150&CRS=EPSG:3978&BBOX=",
        "-5537023.0124460235,-2392385.4881043136,5972375.006350018,3362313.521293707&m4h=t",
        "",
        "-968982.6263652518,-107703.83540767431,1412272.136144273,1082923.545847088&m4h=t",
        "",
        "",
        1, "-968982.6263652518,257421.89484378695,1412272.136144273,1448049.2760985494&m4h=t"
    );

    let selector = "div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > img";
    test("Scale layer on add", async () => {
        await page.reload();
        await page.waitForTimeout(500);
        const transform = await page.$eval(selector, (img) => img.style.transform);
        await expect(transform).toEqual("translate3d(-106px, -53px, 0px) scale(1.70588)");
    });

    test("Shift zooming from level 1 -> 4 requests and scales level 3", async () => {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);
        await page.keyboard.press("Shift+Equal");
        await page.waitForTimeout(1000);
        const transform = await page.$eval(selector, (img) => img.style.transform);
        const url = await page.$eval(selector, (img) => img.src);
        await expect(transform).toEqual("translate3d(-107px, -54px, 0px) scale(1.71429)");
        await expect(url).toContain("-968982.6263652518,-107703.83540767431,1412272.136144273,1082923.545847088&m4h=t");
    });

    /*
    The resetting mentioned below would make it look like the map zoomed out before panning since the
    scaled layer's css scale transform would be removed and there would be enough time to see it before the new
    layer is added.
    https://github.com/Maps4HTML/Web-Map-Custom-Element/commit/8df7c993276e719bb30c4f55a8966289d4c918b7
    */
    test("Overlay to remove does not reset its transform on shift pan when on a scaled layer", async () => {
        await page.keyboard.press("Shift+ArrowUp");
        let unscaleOnShiftPan
        try {
            unscaleOnShiftPan = await page.waitForFunction(() =>
                document.querySelector("body > mapml-viewer").shadowRoot.querySelector("div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.leaflet-layer.mapml-templatedlayer-container > div > img")
                    .style.transform === "translate3d(0px, 0px, 0px)", {}, {timeout: 1000}
            );
        } catch (e) {

        }
        await expect(unscaleOnShiftPan).toEqual(undefined);
    });

});