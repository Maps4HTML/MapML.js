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
});