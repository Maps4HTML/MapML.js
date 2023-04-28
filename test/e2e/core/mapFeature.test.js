import { test, expect, chromium } from '@playwright/test';
const data = require('./mapFeature.data.js');

test.describe("Playwright MapFeature Custom Element Tests", () => {
    let page;
    let context;
    test.beforeAll(async () => {
      context = await chromium.launchPersistentContext('');
      page = context.pages().find((page) => page.url() === 'about:blank') || await context.newPage();
      await page.goto("mapFeature.html");
    });

    test.afterAll(async function () {
      await context.close();
    });

    test("Shadowroot tests of <layer- > with src attribute", async () => {
        let shadowAttached = await page.$eval(
            "body > map",
            (map) => map.layers[1].shadowRoot !== null
        );
        expect(shadowAttached).toEqual(true);

        // remove and then re-add <layer- > element
        shadowAttached = await page.$eval(
            "body > map",
            (map) => {
                let layer = map.layers[1];
                map.removeChild(layer);
                map.appendChild(layer);
                return layer.shadowRoot !== null;
            }
        );
        expect(shadowAttached).toEqual(true);
    });

    test("MapFeature interactivity tests", async () => {
        let label = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            g => g.getAttribute('aria-label')
        );
        expect(label).toEqual("feature, role='button'");
        
        // change <map-feature> attributes
        await page.$eval(
            "body > map", 
            async (map) => {
                let layer = map.querySelector('layer-'),
                    mapFeature = layer.querySelector('map-feature');
                mapFeature.setAttribute('zoom', "4");
            }
        );
        await page.waitForTimeout(200);
        label = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            g => g.getAttribute('aria-label')
        );
        // expect the associated <g> el to re-render and re-attach to the map
        expect(label).toEqual("Point, with no zoom attribute");

        // change <map-coordinates>
        await page.reload();
        await page.waitForTimeout(500);
        label = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            g => g.getAttribute('aria-label')
        );
        expect(label).toEqual("feature, role='button'");
        await page.$eval(
            "body > map", 
            (map) => {
                let layer = map.querySelector('layer-'),
                    mapFeature = layer.querySelector('map-feature'),
                    mapCoord = mapFeature.querySelector('map-coordinates');
                mapCoord.innerHTML = "12 11 12 11 12 12 11 12"
            }
        );
        label = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            g => g.getAttribute('aria-label')
        );
        // expect the associated <g> el to re-render and re-attach to the map
        expect(label).toEqual("Point, with no zoom attribute");

        // remove <map-properties>
        await page.$eval(
            "body > map", 
            (map) => {
                let layer = map.querySelector('layer-'),
                    mapFeature = layer.querySelector('map-feature');
                mapFeature.querySelector('map-properties').remove();
            }
        );
        await page.$eval(
            "body > map",
            (map) => {
                let layer = map.querySelector('layer-'),
                    mapFeature = layer.querySelector('map-feature');
                return mapFeature.click();
            }            
        );
        const popupCount = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-popup-pane",
            popupPane => popupPane.childElementCount
        );
        // expect no popup is binded
        expect(popupCount).toEqual(0);
    });

    test("Get extent of <map-point> with zoom attribute = 2", async () => {
        await page.reload();
        await page.waitForTimeout(500);
        const extent = await page.$eval(
            "body > map", 
            (map) => map.querySelector('.point_1').extent         
        );
        expect(extent).toEqual(data.pointExtentwithZoom);
    });

    test("Zoom to <map-point> with zoom attribute = 2", async () => {
        const mapZoom = await page.$eval(
            "body > map",
            (map) => {
                map.querySelector('.point_1').zoomTo();
                return +map.zoom;
            }
        );
        expect(mapZoom).toEqual(2);
    });

    test("Get extent of <map-point> with no zoom attribute", async () => {
        const extent = await page.$eval(
            "body > map",
            (map) => map.querySelector('.point_2').extent
        )
        expect(extent).toEqual(data.pointExtentNoZoom);
    });

    test("Zoom to <map-point> with no zoom attribute", async () => {
        const mapZoom = await page.$eval(
            "body > map",
            (map) => {
                map.querySelector('.point_2').zoomTo();
                return +map.zoom;               
            }
        );
        expect(mapZoom).toEqual(5);
    })

    test("Get geojson representation of <map-geometry> with single geometry", async () => {
        await page.reload();
        await page.waitForTimeout(200);
        // options = {propertyFunction: null, transform: true} (default)
        let geojson = await page.$eval(
            "body > map", 
            (map) => map.querySelector('map-feature').mapml2geojson()
        );
        expect(geojson).toEqual(data.geojsonData.withDefOptions);

        // options = {propertyFunction: null, transform: false}
        geojson = await page.$eval(
            "body > map", 
            (map) => map.querySelector('map-feature').mapml2geojson({transform: false})
        );
        expect(geojson).toEqual(data.geojsonData.withNoTransform);

        // options = {propertyFunction: function (properties) {...}, transform: true}
        geojson = await page.$eval(
            "body > map", 
            (map) => {
                return map.querySelector('.table').mapml2geojson({propertyFunction: function (properties) {
                    let obj = {}, count = 0;
                    properties.querySelectorAll('th').forEach((th) => {
                        obj[th.innerHTML] = [];
                        properties.querySelectorAll('tr').forEach(
                            (tr) => {
                                let data = tr.querySelectorAll('td')[count]?.innerHTML;
                                if (data) {
                                    obj[th.innerHTML].push(data);
                                }
                            }
                        )
                        count++;
                    })
                    return obj;
                }});
            }  
        );
        expect(geojson).toEqual(data.geojsonData.withPropertyFunc);
    });

    test("Get geojson representation of <map-geometry> with multiple geometries", async () => {
        // multiple geometries (<map-geometrycollection>)
        let geojson = await page.$eval(
            "body > map", 
            (map) => map.querySelector('.link').mapml2geojson()
        );
        expect(geojson).toEqual(data.geojsonData.withMultiGeo);
    })

    test("Default click method test", async () => {
        // click method test
        // <map-feature> with role="button" should have popup opened after click
        const popup = await page.$eval(
            "body > map", 
            (map) => {
                let featureButton = map.querySelector('.button');
                featureButton.click();
                return featureButton._featureGroup.isPopupOpen();
            }   
        );
        expect(popup).toEqual(true);

        // <map-feature> with role="link" should add a new layer / jump to another page after click
        const layerCount = await page.$eval(
            "body > map",
            (map) => {
                map.querySelector('.link').click();
                return map.layers.length;
            }
        );
        expect(layerCount).toEqual(4);

        // the <path> element should be marked as "visited" after click
        let status = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(4)",
            (g) => {
                for (let path of g.querySelectorAll('path')) {
                    if (!path.classList.contains("map-a-visited")) {
                        return false;
                    }
                }
                return true;
            }
        );
        expect(status).toEqual(true);
    });

    test("Custom click method test", async () => {
        const isClicked = await page.$eval(
            "body > map", 
            (map) => {
                let mapFeature = map.querySelector('map-feature');
                // define custom click method
                mapFeature.onclick = function (e) {
                    document.querySelector('map-feature').classList.add("customClick");
                }
                mapFeature.click();
                return mapFeature.classList.contains("customClick");
            }   
        );
        expect(isClicked).toEqual(true);
    });

    test("Default focus method test", async () => {
        await page.reload();
        await page.waitForTimeout(500);
        // focus method test
        let focus = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            (g) => {
                let layer = document.querySelector('map').querySelector('layer-'),
                    mapFeature = layer.querySelector('map-feature');
                mapFeature.focus();
                return document.activeElement.shadowRoot?.activeElement === g;
            }
        );
        expect(focus).toEqual(true);

        // focus state will be removed when users change focus to the other elements
        await page.$eval(
            "body > map",
            (map) => map.querySelectorAll('map-feature')[1].focus()
        );
        focus = await page.$eval(
            "body > map > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > div > div.mapml-vector-container > svg > g > g:nth-child(1)",
            (g) => document.activeElement.shadowRoot?.activeElement === g
        );
        expect(focus).toEqual(false);
    });

    test("Default blur method test", async () => {
        const loseFocus = await page.$eval(
            "body > map", 
            (map) => {
                let feature = map.querySelector('map-feature');
                feature.focus();
                feature.blur();
                return document.activeElement.shadowRoot?.activeElement === map._map._container;
            }   
        );
        expect(loseFocus).toEqual(true);
    });

    test("Custom focus method test", async () => {
        const isFocused = await page.$eval(
            "body > map", 
            (map) => {
                let mapFeature = map.querySelector('map-feature');
                // define custom focus method
                mapFeature.onfocus = function (e) {
                    map.querySelector('map-feature').classList.add("customFocus");
                }
                mapFeature.focus();
                return mapFeature.classList.contains("customFocus");
            }   
        );
        expect(isFocused).toEqual(true);
    });

    test("Add event handler via HTML", async () => {
        const test = await page.$eval(
            "body > map", 
            (map) => {
                let mapFeature = map.querySelector('.event');
                mapFeature.setAttribute('onfocus', 'test_1()');
                mapFeature._groupEl.focus();
                return mapFeature.classList.contains("test_1");
            }   
        );
        expect(test).toEqual(true);
    });

    test("Add event handler via Script", async () => {
        const test = await page.$eval(
            "body > map",
            (map) => {
                let mapFeature = map.querySelector('.event');
                mapFeature._groupEl.blur();
                return mapFeature.classList.contains('blur_property_test') && mapFeature.classList.contains('blur_addEvtLsn_test');
            }
        );
        expect(test).toEqual(true);
    })
})