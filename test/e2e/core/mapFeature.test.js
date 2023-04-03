import { test, expect, chromium } from '@playwright/test';

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
        const expectedExtent = {
            "topLeft": {
                "tcrs": [
                    {
                        "horizontal": 902.4137931034481,
                        "vertical": 1065.5172413793102
                    },
                    {
                        "horizontal": 1539.411764705882,
                        "vertical": 1817.647058823529
                    },
                    {
                        "horizontal": 2617,
                        "vertical": 3090
                    },
                    {
                        "horizontal": 4361.666666666666,
                        "vertical": 5150
                    },
                    {
                        "horizontal": 7477.142857142856,
                        "vertical": 8828.571428571428
                    },
                    {
                        "horizontal": 13084.999999999998,
                        "vertical": 15449.999999999998
                    },
                    {
                        "horizontal": 21808.333333333332,
                        "vertical": 25749.999999999996
                    },
                    {
                        "horizontal": 37385.71428571428,
                        "vertical": 44142.857142857145
                    },
                    {
                        "horizontal": 65424.999999999985,
                        "vertical": 77249.99999999999
                    },
                    {
                        "horizontal": 109041.66666666666,
                        "vertical": 128749.99999999999
                    },
                    {
                        "horizontal": 186928.57142857142,
                        "vertical": 220714.28571428568
                    },
                    {
                        "horizontal": 311547.619047619,
                        "vertical": 367857.1428571428
                    },
                    {
                        "horizontal": 523399.9999999999,
                        "vertical": 617999.9999999999
                    },
                    {
                        "horizontal": 902413.7931034481,
                        "vertical": 1065517.2413793101
                    },
                    {
                        "horizontal": 1539411.7647058822,
                        "vertical": 1817647.0588235292
                    },
                    {
                        "horizontal": 2616999.9999999995,
                        "vertical": 3089999.9999999995
                    },
                    {
                        "horizontal": 4361666.666666666,
                        "vertical": 5149999.999999999
                    },
                    {
                        "horizontal": 7477142.857142856,
                        "vertical": 8828571.428571427
                    },
                    {
                        "horizontal": 13084999.999999998,
                        "vertical": 15449999.999999998
                    },
                    {
                        "horizontal": 21808333.33333333,
                        "vertical": 25749999.999999996
                    },
                    {
                        "horizontal": 37385714.28571428,
                        "vertical": 44142857.142857134
                    },
                    {
                        "horizontal": 65424999.99999999,
                        "vertical": 77250000
                    },
                    {
                        "horizontal": 109041666.66666666,
                        "vertical": 128750000
                    },
                    {
                        "horizontal": 186928571.4285714,
                        "vertical": 220714285.7142857
                    },
                    {
                        "horizontal": 311547619.04761904,
                        "vertical": 367857142.8571428
                    },
                    {
                        "horizontal": 523399999.99999994,
                        "vertical": 618000000
                    }
                ],
                "tilematrix": [
                    {
                        "horizontal": 3.5250538793103443,
                        "vertical": 4.162176724137931
                    },
                    {
                        "horizontal": 6.0133272058823515,
                        "vertical": 7.10018382352941
                    },
                    {
                        "horizontal": 10.22265625,
                        "vertical": 12.0703125
                    },
                    {
                        "horizontal": 17.037760416666664,
                        "vertical": 20.1171875
                    },
                    {
                        "horizontal": 29.20758928571428,
                        "vertical": 34.48660714285714
                    },
                    {
                        "horizontal": 51.11328124999999,
                        "vertical": 60.35156249999999
                    },
                    {
                        "horizontal": 85.18880208333333,
                        "vertical": 100.58593749999999
                    },
                    {
                        "horizontal": 146.03794642857142,
                        "vertical": 172.43303571428572
                    },
                    {
                        "horizontal": 255.56640624999994,
                        "vertical": 301.75781249999994
                    },
                    {
                        "horizontal": 425.94401041666663,
                        "vertical": 502.92968749999994
                    },
                    {
                        "horizontal": 730.1897321428571,
                        "vertical": 862.1651785714284
                    },
                    {
                        "horizontal": 1216.9828869047617,
                        "vertical": 1436.941964285714
                    },
                    {
                        "horizontal": 2044.5312499999995,
                        "vertical": 2414.0624999999995
                    },
                    {
                        "horizontal": 3525.053879310344,
                        "vertical": 4162.17672413793
                    },
                    {
                        "horizontal": 6013.327205882352,
                        "vertical": 7100.183823529411
                    },
                    {
                        "horizontal": 10222.656249999998,
                        "vertical": 12070.312499999998
                    },
                    {
                        "horizontal": 17037.760416666664,
                        "vertical": 20117.187499999996
                    },
                    {
                        "horizontal": 29207.589285714283,
                        "vertical": 34486.60714285714
                    },
                    {
                        "horizontal": 51113.28124999999,
                        "vertical": 60351.56249999999
                    },
                    {
                        "horizontal": 85188.80208333331,
                        "vertical": 100585.93749999999
                    },
                    {
                        "horizontal": 146037.94642857142,
                        "vertical": 172433.03571428568
                    },
                    {
                        "horizontal": 255566.40624999997,
                        "vertical": 301757.8125
                    },
                    {
                        "horizontal": 425944.0104166666,
                        "vertical": 502929.6875
                    },
                    {
                        "horizontal": 730189.732142857,
                        "vertical": 862165.1785714285
                    },
                    {
                        "horizontal": 1216982.886904762,
                        "vertical": 1436941.964285714
                    },
                    {
                        "horizontal": 2044531.2499999998,
                        "vertical": 2414062.5
                    }
                ],
                "gcrs": {
                    "horizontal": -95.23168835631657,
                    "vertical": 28.442841852103484
                },
                "pcrs": {
                    "horizontal": -35001.59173651785,
                    "vertical": -1568206.756413512
                }
            },
            "bottomRight": {
                "tcrs": [
                    {
                        "horizontal": 990.6896551724137,
                        "vertical": 1153.7931034482758
                    },
                    {
                        "horizontal": 1689.9999999999998,
                        "vertical": 1968.2352941176468
                    },
                    {
                        "horizontal": 2873,
                        "vertical": 3346
                    },
                    {
                        "horizontal": 4788.333333333333,
                        "vertical": 5576.666666666667
                    },
                    {
                        "horizontal": 8208.571428571428,
                        "vertical": 9560
                    },
                    {
                        "horizontal": 14365,
                        "vertical": 16730
                    },
                    {
                        "horizontal": 23941.666666666668,
                        "vertical": 27883.333333333332
                    },
                    {
                        "horizontal": 41042.857142857145,
                        "vertical": 47800
                    },
                    {
                        "horizontal": 71824.99999999999,
                        "vertical": 83649.99999999999
                    },
                    {
                        "horizontal": 119708.33333333333,
                        "vertical": 139416.66666666666
                    },
                    {
                        "horizontal": 205214.2857142857,
                        "vertical": 239000
                    },
                    {
                        "horizontal": 342023.8095238095,
                        "vertical": 398333.3333333333
                    },
                    {
                        "horizontal": 574599.9999999999,
                        "vertical": 669199.9999999999
                    },
                    {
                        "horizontal": 990689.6551724137,
                        "vertical": 1153793.1034482757
                    },
                    {
                        "horizontal": 1689999.9999999998,
                        "vertical": 1968235.294117647
                    },
                    {
                        "horizontal": 2872999.9999999995,
                        "vertical": 3345999.9999999995
                    },
                    {
                        "horizontal": 4788333.333333333,
                        "vertical": 5576666.666666666
                    },
                    {
                        "horizontal": 8208571.428571428,
                        "vertical": 9560000
                    },
                    {
                        "horizontal": 14365000,
                        "vertical": 16729999.999999998
                    },
                    {
                        "horizontal": 23941666.666666664,
                        "vertical": 27883333.333333332
                    },
                    {
                        "horizontal": 41042857.14285714,
                        "vertical": 47800000
                    },
                    {
                        "horizontal": 71825000,
                        "vertical": 83650000
                    },
                    {
                        "horizontal": 119708333.33333334,
                        "vertical": 139416666.6666667
                    },
                    {
                        "horizontal": 205214285.71428573,
                        "vertical": 239000000
                    },
                    {
                        "horizontal": 342023809.5238095,
                        "vertical": 398333333.3333333
                    },
                    {
                        "horizontal": 574600000,
                        "vertical": 669200000
                    }
                ],
                "tilematrix": [
                    {
                        "horizontal": 3.869881465517241,
                        "vertical": 4.507004310344827
                    },
                    {
                        "horizontal": 6.601562499999999,
                        "vertical": 7.688419117647058
                    },
                    {
                        "horizontal": 11.22265625,
                        "vertical": 13.0703125
                    },
                    {
                        "horizontal": 18.704427083333332,
                        "vertical": 21.783854166666668
                    },
                    {
                        "horizontal": 32.06473214285714,
                        "vertical": 37.34375
                    },
                    {
                        "horizontal": 56.11328125,
                        "vertical": 65.3515625
                    },
                    {
                        "horizontal": 93.52213541666667,
                        "vertical": 108.91927083333333
                    },
                    {
                        "horizontal": 160.32366071428572,
                        "vertical": 186.71875
                    },
                    {
                        "horizontal": 280.56640624999994,
                        "vertical": 326.75781249999994
                    },
                    {
                        "horizontal": 467.6106770833333,
                        "vertical": 544.5963541666666
                    },
                    {
                        "horizontal": 801.6183035714286,
                        "vertical": 933.59375
                    },
                    {
                        "horizontal": 1336.030505952381,
                        "vertical": 1555.9895833333333
                    },
                    {
                        "horizontal": 2244.5312499999995,
                        "vertical": 2614.0624999999995
                    },
                    {
                        "horizontal": 3869.881465517241,
                        "vertical": 4507.004310344827
                    },
                    {
                        "horizontal": 6601.562499999999,
                        "vertical": 7688.419117647059
                    },
                    {
                        "horizontal": 11222.656249999998,
                        "vertical": 13070.312499999998
                    },
                    {
                        "horizontal": 18704.427083333332,
                        "vertical": 21783.854166666664
                    },
                    {
                        "horizontal": 32064.73214285714,
                        "vertical": 37343.75
                    },
                    {
                        "horizontal": 56113.28125,
                        "vertical": 65351.56249999999
                    },
                    {
                        "horizontal": 93522.13541666666,
                        "vertical": 108919.27083333333
                    },
                    {
                        "horizontal": 160323.6607142857,
                        "vertical": 186718.75
                    },
                    {
                        "horizontal": 280566.40625,
                        "vertical": 326757.8125
                    },
                    {
                        "horizontal": 467610.6770833334,
                        "vertical": 544596.3541666667
                    },
                    {
                        "horizontal": 801618.3035714286,
                        "vertical": 933593.75
                    },
                    {
                        "horizontal": 1336030.5059523808,
                        "vertical": 1555989.5833333333
                    },
                    {
                        "horizontal": 2244531.25,
                        "vertical": 2614062.5
                    }
                ],
                "gcrs": {
                    "horizontal": -63.57311713551018,
                    "vertical": 9.982662659857995
                },
                "pcrs": {
                    "horizontal": 3351671.8482770324,
                    "vertical": -4954880.196427062
                }
            },
            "projection": "CBMTILE"
        };
        expect(extent).toEqual(expectedExtent);
    });

    test("Zoom to <map-point> with zoom attribute = 2", async () => {
        const mapZoom = await page.$eval(
            "body > map",
            (map) => {
                map.querySelector('.point_1').zoomTo();
                return +map.zoom;
            }
        );
        expect(mapZoom).toEqual(3);
    });

    test("Get extent of <map-point> with no zoom attribute", async () => {
        const extent = await page.$eval(
            "body > map",
            (map) => map.querySelector('.point_2').extent
        )
        const expectedExtent = {
            "topLeft": {
                "tcrs": [
                    {
                        "horizontal": 946.5515034482756,
                        "vertical": 1109.6549517241376
                    },
                    {
                        "horizontal": 1614.7055058823523,
                        "vertical": 1892.9407999999994
                    },
                    {
                        "horizontal": 2744.9993599999993,
                        "vertical": 3217.9993599999993
                    },
                    {
                        "horizontal": 4574.998933333332,
                        "vertical": 5363.332266666665
                    },
                    {
                        "horizontal": 7842.855314285712,
                        "vertical": 9194.283885714283
                    },
                    {
                        "horizontal": 13724.996799999997,
                        "vertical": 16089.996799999997
                    },
                    {
                        "horizontal": 22874.994666666662,
                        "vertical": 26816.661333333326
                    },
                    {
                        "horizontal": 39214.27657142856,
                        "vertical": 45971.41942857142
                    },
                    {
                        "horizontal": 68624.98399999997,
                        "vertical": 80449.98399999997
                    },
                    {
                        "horizontal": 114374.9733333333,
                        "vertical": 134083.30666666664
                    },
                    {
                        "horizontal": 196071.3828571428,
                        "vertical": 229857.0971428571
                    },
                    {
                        "horizontal": 326785.638095238,
                        "vertical": 383095.1619047618
                    },
                    {
                        "horizontal": 548999.8719999997,
                        "vertical": 643599.8719999997
                    },
                    {
                        "horizontal": 946551.5034482755,
                        "vertical": 1109654.9517241376
                    },
                    {
                        "horizontal": 1614705.5058823524,
                        "vertical": 1892940.7999999993
                    },
                    {
                        "horizontal": 2744999.359999999,
                        "vertical": 3217999.359999999
                    },
                    {
                        "horizontal": 4574998.933333332,
                        "vertical": 5363332.266666665
                    },
                    {
                        "horizontal": 7842855.314285712,
                        "vertical": 9194283.885714283
                    },
                    {
                        "horizontal": 13724996.799999995,
                        "vertical": 16089996.799999995
                    },
                    {
                        "horizontal": 22874994.66666666,
                        "vertical": 26816661.333333325
                    },
                    {
                        "horizontal": 39214276.57142856,
                        "vertical": 45971419.42857142
                    },
                    {
                        "horizontal": 68624983.99999999,
                        "vertical": 80449983.99999999
                    },
                    {
                        "horizontal": 114374973.33333331,
                        "vertical": 134083306.66666664
                    },
                    {
                        "horizontal": 196071382.8571428,
                        "vertical": 229857097.1428571
                    },
                    {
                        "horizontal": 326785638.09523803,
                        "vertical": 383095161.9047618
                    },
                    {
                        "horizontal": 548999871.9999999,
                        "vertical": 643599871.9999999
                    }
                ],
                "tilematrix": [
                    {
                        "horizontal": 3.6974668103448267,
                        "vertical": 4.334589655172413
                    },
                    {
                        "horizontal": 6.307443382352939,
                        "vertical": 7.394299999999998
                    },
                    {
                        "horizontal": 10.722653749999997,
                        "vertical": 12.570309999999997
                    },
                    {
                        "horizontal": 17.87108958333333,
                        "vertical": 20.950516666666662
                    },
                    {
                        "horizontal": 30.63615357142856,
                        "vertical": 35.91517142857142
                    },
                    {
                        "horizontal": 53.61326874999999,
                        "vertical": 62.85154999999999
                    },
                    {
                        "horizontal": 89.35544791666665,
                        "vertical": 104.7525833333333
                    },
                    {
                        "horizontal": 153.18076785714283,
                        "vertical": 179.5758571428571
                    },
                    {
                        "horizontal": 268.0663437499999,
                        "vertical": 314.2577499999999
                    },
                    {
                        "horizontal": 446.7772395833332,
                        "vertical": 523.7629166666666
                    },
                    {
                        "horizontal": 765.9038392857141,
                        "vertical": 897.8792857142855
                    },
                    {
                        "horizontal": 1276.5063988095235,
                        "vertical": 1496.4654761904758
                    },
                    {
                        "horizontal": 2144.530749999999,
                        "vertical": 2514.061999999999
                    },
                    {
                        "horizontal": 3697.466810344826,
                        "vertical": 4334.589655172413
                    },
                    {
                        "horizontal": 6307.443382352939,
                        "vertical": 7394.299999999997
                    },
                    {
                        "horizontal": 10722.653749999996,
                        "vertical": 12570.309999999996
                    },
                    {
                        "horizontal": 17871.089583333327,
                        "vertical": 20950.51666666666
                    },
                    {
                        "horizontal": 30636.153571428564,
                        "vertical": 35915.17142857142
                    },
                    {
                        "horizontal": 53613.26874999998,
                        "vertical": 62851.54999999998
                    },
                    {
                        "horizontal": 89355.44791666664,
                        "vertical": 104752.5833333333
                    },
                    {
                        "horizontal": 153180.7678571428,
                        "vertical": 179575.8571428571
                    },
                    {
                        "horizontal": 268066.34374999994,
                        "vertical": 314257.74999999994
                    },
                    {
                        "horizontal": 446777.23958333326,
                        "vertical": 523762.91666666657
                    },
                    {
                        "horizontal": 765903.8392857141,
                        "vertical": 897879.2857142856
                    },
                    {
                        "horizontal": 1276506.3988095236,
                        "vertical": 1496465.4761904757
                    },
                    {
                        "horizontal": 2144530.7499999995,
                        "vertical": 2514061.9999999995
                    }
                ],
                "gcrs": {
                    "horizontal": -81.86462856715072,
                    "vertical": 20.607654254188965
                },
                "pcrs": {
                    "horizontal": 1658326.6615866497,
                    "vertical": -3261535.0097366795
                }
            },
            "bottomRight": {
                "tcrs": [
                    {
                        "horizontal": 946.551944827586,
                        "vertical": 1109.655393103448
                    },
                    {
                        "horizontal": 1614.7062588235287,
                        "vertical": 1892.9415529411758
                    },
                    {
                        "horizontal": 2745.0006399999993,
                        "vertical": 3218.0006399999997
                    },
                    {
                        "horizontal": 4575.001066666666,
                        "vertical": 5363.334399999999
                    },
                    {
                        "horizontal": 7842.858971428569,
                        "vertical": 9194.28754285714
                    },
                    {
                        "horizontal": 13725.003199999997,
                        "vertical": 16090.003199999997
                    },
                    {
                        "horizontal": 22875.005333333327,
                        "vertical": 26816.671999999995
                    },
                    {
                        "horizontal": 39214.29485714285,
                        "vertical": 45971.437714285705
                    },
                    {
                        "horizontal": 68625.01599999997,
                        "vertical": 80450.01599999997
                    },
                    {
                        "horizontal": 114375.02666666664,
                        "vertical": 134083.35999999996
                    },
                    {
                        "horizontal": 196071.47428571424,
                        "vertical": 229857.1885714285
                    },
                    {
                        "horizontal": 326785.7904761904,
                        "vertical": 383095.3142857142
                    },
                    {
                        "horizontal": 549000.1279999998,
                        "vertical": 643600.1279999998
                    },
                    {
                        "horizontal": 946551.9448275858,
                        "vertical": 1109655.393103448
                    },
                    {
                        "horizontal": 1614706.258823529,
                        "vertical": 1892941.5529411759
                    },
                    {
                        "horizontal": 2745000.639999999,
                        "vertical": 3218000.639999999
                    },
                    {
                        "horizontal": 4575001.0666666655,
                        "vertical": 5363334.3999999985
                    },
                    {
                        "horizontal": 7842858.971428569,
                        "vertical": 9194287.54285714
                    },
                    {
                        "horizontal": 13725003.199999996,
                        "vertical": 16090003.199999996
                    },
                    {
                        "horizontal": 22875005.333333325,
                        "vertical": 26816671.999999993
                    },
                    {
                        "horizontal": 39214294.85714284,
                        "vertical": 45971437.7142857
                    },
                    {
                        "horizontal": 68625015.99999999,
                        "vertical": 80450015.99999999
                    },
                    {
                        "horizontal": 114375026.66666664,
                        "vertical": 134083359.99999997
                    },
                    {
                        "horizontal": 196071474.28571424,
                        "vertical": 229857188.57142854
                    },
                    {
                        "horizontal": 326785790.4761904,
                        "vertical": 383095314.2857142
                    },
                    {
                        "horizontal": 549000127.9999999,
                        "vertical": 643600127.9999999
                    }
                ],
                "tilematrix": [
                    {
                        "horizontal": 3.697468534482758,
                        "vertical": 4.334591379310344
                    },
                    {
                        "horizontal": 6.307446323529409,
                        "vertical": 7.394302941176468
                    },
                    {
                        "horizontal": 10.722658749999997,
                        "vertical": 12.570314999999999
                    },
                    {
                        "horizontal": 17.871097916666663,
                        "vertical": 20.950524999999995
                    },
                    {
                        "horizontal": 30.636167857142848,
                        "vertical": 35.915185714285705
                    },
                    {
                        "horizontal": 53.61329374999999,
                        "vertical": 62.85157499999999
                    },
                    {
                        "horizontal": 89.35548958333331,
                        "vertical": 104.75262499999998
                    },
                    {
                        "horizontal": 153.18083928571426,
                        "vertical": 179.57592857142853
                    },
                    {
                        "horizontal": 268.0664687499999,
                        "vertical": 314.2578749999999
                    },
                    {
                        "horizontal": 446.7774479166666,
                        "vertical": 523.7631249999998
                    },
                    {
                        "horizontal": 765.9041964285713,
                        "vertical": 897.8796428571426
                    },
                    {
                        "horizontal": 1276.5069940476187,
                        "vertical": 1496.466071428571
                    },
                    {
                        "horizontal": 2144.531749999999,
                        "vertical": 2514.062999999999
                    },
                    {
                        "horizontal": 3697.468534482757,
                        "vertical": 4334.591379310344
                    },
                    {
                        "horizontal": 6307.44632352941,
                        "vertical": 7394.302941176468
                    },
                    {
                        "horizontal": 10722.658749999997,
                        "vertical": 12570.314999999997
                    },
                    {
                        "horizontal": 17871.097916666662,
                        "vertical": 20950.524999999994
                    },
                    {
                        "horizontal": 30636.16785714285,
                        "vertical": 35915.185714285704
                    },
                    {
                        "horizontal": 53613.29374999998,
                        "vertical": 62851.57499999998
                    },
                    {
                        "horizontal": 89355.4895833333,
                        "vertical": 104752.62499999997
                    },
                    {
                        "horizontal": 153180.83928571423,
                        "vertical": 179575.92857142852
                    },
                    {
                        "horizontal": 268066.46874999994,
                        "vertical": 314257.87499999994
                    },
                    {
                        "horizontal": 446777.44791666657,
                        "vertical": 523763.1249999999
                    },
                    {
                        "horizontal": 765904.1964285712,
                        "vertical": 897879.6428571427
                    },
                    {
                        "horizontal": 1276506.9940476187,
                        "vertical": 1496466.0714285711
                    },
                    {
                        "horizontal": 2144531.7499999995,
                        "vertical": 2514062.9999999995
                    }
                ],
                "gcrs": {
                    "horizontal": -81.86447091392834,
                    "vertical": 20.60755723930661
                },
                "pcrs": {
                    "horizontal": 1658343.59495385,
                    "vertical": -3261551.9431038797
                }
            },
            "projection": "CBMTILE"
        }
        expect(extent).toEqual(expectedExtent);
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
        let expectedGeoJSON = {
            "type": "Feature",
            "properties": {
                "prop0": "Testtest"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -94.99984966849256,
                            49.00009891208923
                        ],
                        [
                            -94.99983600199188,
                            49.000098912067
                        ],
                        [
                            -94.99983600195664,
                            49.00010790408876
                        ],
                        [
                            -94.99984966846026,
                            49.00010790411096
                        ]
                    ]
                ]
            }
        };
        expect(geojson).toEqual(expectedGeoJSON);

        // options = {propertyFunction: null, transform: false}
        geojson = await page.$eval(
            "body > map", 
            (map) => map.querySelector('map-feature').mapml2geojson({transform: false})
        );
        expectedGeoJSON = {
            "type": "Feature",
            "properties": {
                "prop0": "Testtest"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            11,
                            11
                        ],
                        [
                            12,
                            11
                        ],
                        [
                            12,
                            12
                        ],
                        [
                            11,
                            12
                        ]
                    ]
                ]
            }
        };
        expect(geojson).toEqual(expectedGeoJSON);

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
        expectedGeoJSON = {
            "type": "Feature",
            "properties": {
                "Head_1": [
                    "row 1, column 1",
                    "row 2, column 1"
                ],
                "Head_2": [
                    "row 1, column 2",
                    "row 2, column 2"
                ],
                "Head_3": [
                    "row 1, column 3",
                    "row 2, column 3"
                ]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -94.9998565017429,
                            49.00009891209961
                        ],
                        [
                            -94.99985308511772,
                            49.00009891209448
                        ],
                        [
                            -94.99985308510982,
                            49.00010116009988
                        ],
                        [
                            -94.99985650173518,
                            49.00010116010502
                        ],
                        [
                            -94.9998565017429,
                            49.00009891209961
                        ]
                    ]
                ]
            }
        };
        expect(geojson).toEqual(expectedGeoJSON);
    });

    test("Get geojson representation of <map-geometry> with multiple geometries", async () => {
        // multiple geometries (<map-geometrycollection>)
        let geojson = await page.$eval(
            "body > map", 
            (map) => map.querySelector('.link').mapml2geojson()
        );
        let expectedGeoJSON = {
            "type": "Feature",
            "properties": null,
            "geometry": {
                "type": "GeometryCollection",
                "geometries": [
                    {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    -94.96210493103726,
                                    49.02792322828346
                                ],
                                [
                                    -94.95971164220019,
                                    49.027985211685106
                                ],
                                [
                                    -94.95960139478952,
                                    49.028857483320465
                                ],
                                [
                                    -94.96150249324594,
                                    49.028696385054374
                                ]
                            ]
                        ]
                    },
                    {
                        "type": "Point",
                        "coordinates": [
                            -94.96245959238846,
                            49.02893057867041
                        ]
                    }
                ]
            }
        };
        expect(geojson).toEqual(expectedGeoJSON);
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
                    this.classList.add("customClick");
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
                    this.classList.add("customFocus");
                }
                mapFeature.focus();
                return mapFeature.classList.contains("customFocus");
            }   
        );
        expect(isFocused).toEqual(true);
    });
})