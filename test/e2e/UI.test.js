const playwright = require('playwright')
const { JSDOM } = require('jsdom');
const domToPlaywright = require('dom-to-playwright').default;

let page, browser, context

describe('Playwright UI Drag&Drop Test', () => {

    beforeEach(async () => {
        browser = await playwright['chromium'].launch({ headless: false })
        context = await browser.newContext()
        page = await context.newPage()
        await page.goto(PATH)
    })

    afterEach(async function () {
        //await page.screenshot({ path: `${this.currentTest.title.replace(/\s+/g, '_')}.png` })
        await browser.close()
    })

    it('drag and drop of zoom-in button', async () => {
        const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
        await page.dispatchEvent('.leaflet-control-zoom-in', 'dragstart', { dataTransfer });
        await page.dispatchEvent('.leaflet-top.leaflet-right', 'drop', { dataTransfer });
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(1);
    })

    it('drag and drop of layers', async () => {
        const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
        await page.hover(".leaflet-top.leaflet-right");
        await page.dispatchEvent("[draggable='true']", 'dragstart', { dataTransfer });
        await page.dispatchEvent('.leaflet-top.leaflet-right', 'drop', { dataTransfer });
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(2);
    })

    //adding layer in html can add any type of layer the user wants,
    //but how should that layer get treated by the map element,
    //should it be ignored or shown as undefined
    it('HTML - add additional MapML Layer', async () => {
        const { document } = new JSDOM(`
        <!doctype html>
            <html>
            <head>
                <title>index-map.html</title>
                <meta charset="UTF-8">
                <script type="module" src="dist/web-map.js"></script>
                <style>
                html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                </style>
            </head>
            <body>
                <map is="web-map" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                    <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                </map>     
            </body>
            </html>
        `).window;
        const { select, update } = await domToPlaywright(page, document);

        await update(document);
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(2);

    })
    it('HTML - add additional non-MapML Layer', async () => {
        const { document } = new JSDOM(`
        <!doctype html>
            <html>
            <head>
                <title>index-map.html</title>
                <meta charset="UTF-8">
                <script type="module" src="dist/web-map.js"></script>
                <style>
                html {height: 100%} body,map {height: inherit} * {margin: 0;padding: 0;}
                </style>
            </head>
            <body>
                <map is="web-map" projection="CBMTILE" zoom="2" lat="45" lon="-90" controls >
                    <layer- label='CBMT' src='https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/' checked></layer->
                    <layer- label='CBMT' src='https://example.com/' checked></layer->
                </map>     
            </body>
            </html>
        `).window;
        const { select, update } = await domToPlaywright(page, document);

        await update(document);
        await page.hover(".leaflet-top.leaflet-right");
        let vars = await page.$$("[draggable='true']");
        expect(vars.length).toBe(1);

    })


})

//nodeTestingServer.stop();