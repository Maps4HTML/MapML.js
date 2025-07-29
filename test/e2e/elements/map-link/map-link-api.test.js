import { test, expect, chromium } from '@playwright/test';

test.describe('map-link api tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', {
      ignoreHTTPSErrors: true
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link-api.html');
    await page.evaluate(async () => {
      const leaflet = await import('http://localhost:30001/leaflet-src.esm.js');
      window.L = leaflet;
    });
  });
  test(`extent of map-link established via map-meta vs map-inputs`, async () => {
    // create map-extent with map-link whose min,maxZoom and min/maxNativeZoom
    // established via map-input min/max attributes
    // get extent of map-link established via map-input
    const layer = page.getByTestId('initially-empty');
    let linkExtentViaMapInputs = await layer.evaluate((l) => {
      let extent = document
        .querySelector('template')
        .content.querySelector('#extent-via-map-input')
        .cloneNode(true);
      l.appendChild(extent);
      let linkExt = extent.querySelector('map-link').extent;
      return {
        xmin: linkExt.topLeft.tilematrix[3].horizontal,
        ymin: linkExt.topLeft.tilematrix[3].vertical,
        xmax: linkExt.bottomRight.tilematrix[3].horizontal,
        ymax: linkExt.bottomRight.tilematrix[3].vertical,
        zmin: linkExt.zoom.minZoom,
        zmax: linkExt.zoom.maxZoom,
        zNativeMax: linkExt.zoom.maxNativeZoom,
        zNativeMin: linkExt.zoom.minNativeZoom
      };
    });

    // create map-extent with map-link whose min,maxZoom are established via
    // map-meta name=zoom, but whose min/maxNativeZoom are established via
    // a map-input bound into the map-link's tref
    // get extent of map-link established via map-meta zoom/extent
    let linkExtentViaMapMeta = await layer.evaluate((l) => {
      let extent = document
        .querySelector('template')
        .content.querySelector('#extent-via-map-meta')
        .cloneNode(true);
      l.appendChild(extent);
      let linkExt = extent.querySelector('map-link').extent;
      return {
        xmin: linkExt.topLeft.tilematrix[3].horizontal,
        ymin: linkExt.topLeft.tilematrix[3].vertical,
        xmax: linkExt.bottomRight.tilematrix[3].horizontal,
        ymax: linkExt.bottomRight.tilematrix[3].vertical,
        zmin: linkExt.zoom.minZoom,
        zmax: linkExt.zoom.maxZoom,
        zNativeMax: linkExt.zoom.maxNativeZoom,
        zNativeMin: linkExt.zoom.minNativeZoom
      };
    });
    // bounds should be the same, but note that the tilematrix coordinate system has
    // some difficulty coercing very very small real numbers to 0
    // so I used a non-zero upper left corner to avoid that issue
    expect(linkExtentViaMapInputs.xmin).toEqual(linkExtentViaMapMeta.xmin);
    expect(linkExtentViaMapInputs.ymin).toEqual(linkExtentViaMapMeta.ymin);
    expect(linkExtentViaMapInputs.xmax).toEqual(linkExtentViaMapMeta.xmax);
    expect(linkExtentViaMapInputs.ymax).toEqual(linkExtentViaMapMeta.ymax);
    // expect that min/maxZoom will be the same, but min/maxNativeZoom will correspond
    // to the min/max attribute values of the map-input type=zoom
    expect(linkExtentViaMapInputs.zmin).toEqual(linkExtentViaMapMeta.zmin);
    expect(linkExtentViaMapInputs.zmax).toEqual(linkExtentViaMapMeta.zmax);

    // was 0 via map-input, still 0, (and still established via map-input)
    expect(linkExtentViaMapInputs.zNativeMin).toEqual(
      linkExtentViaMapMeta.zNativeMin
    );
    expect(linkExtentViaMapInputs.zNativeMax).not.toEqual(
      linkExtentViaMapMeta.zNativeMax
    );
  });
  test("map-links that shouldn't have an extent behave accordingly", async () => {
    await page.waitForTimeout(500);
    // create a layer containing a <map-link rel=license
    const viewer = page.getByTestId('viewer');
    await viewer.evaluate((map) => {
      let layerWithLicenseLink = document
        .querySelector('template')
        .content.querySelector('[data-testid=inline-tiles]')
        .cloneNode(true);
      map.appendChild(layerWithLicenseLink);
      let licenseLink = layerWithLicenseLink.querySelector(
        'map-link[rel=license]'
      );
      licenseLink.setAttribute('data-testid', 'license-link');
    });
    const licenseLink = page.getByTestId('license-link');
    const licenseExtent = await licenseLink.evaluate((l) => {
      return l.extent;
    });
    expect(licenseExtent).toBeNull();
    // to do: other non-extentful links??
  });
  test('map-link.zoomTo() function works', async () => {
    const viewer = page.getByTestId('viewer');
    // get initial extent
    let initialExtent = await viewer.evaluate((map) => {
      return {
        xmin: map.extent.topLeft.pcrs.horizontal,
        ymin: map.extent.topLeft.pcrs.vertical,
        xmax: map.extent.bottomRight.pcrs.horizontal,
        ymax: map.extent.bottomRight.pcrs.vertical
      };
    });

    // get an extentful map-link
    await viewer.evaluate((map) => {
      let layer = document
        .querySelector('template')
        .content.querySelector('[data-testid=inline-image]')
        .cloneNode(true);
      map.appendChild(layer);
    });
    const imageLink = viewer.getByTestId('inline-link1');
    await imageLink.evaluate((link) => link.zoomTo());
    let finalExtent = await viewer.evaluate((map) => {
      return {
        xmin: map.extent.topLeft.pcrs.horizontal,
        ymin: map.extent.topLeft.pcrs.vertical,
        xmax: map.extent.bottomRight.pcrs.horizontal,
        ymax: map.extent.bottomRight.pcrs.vertical
      };
    });
    // the map should have moved...
    expect(finalExtent.xmin).not.toEqual(initialExtent.xmin);
    expect(finalExtent.ymin).not.toEqual(initialExtent.ymin);
    expect(finalExtent.xmax).not.toEqual(initialExtent.xmax);
    expect(finalExtent.ymax).not.toEqual(initialExtent.ymax);

    // get the centre of the map-link's extent, in pcrs, unproject to lat/lng
    let linkExtentCentre = await imageLink.evaluate((link) => {
      let map = document.querySelector('[data-testid=viewer]'),
        x =
          link.extent.topLeft.pcrs.horizontal +
          (link.extent.bottomRight.pcrs.horizontal -
            link.extent.topLeft.pcrs.horizontal) /
            2,
        y =
          link.extent.bottomRight.pcrs.vertical +
          (link.extent.topLeft.pcrs.vertical -
            link.extent.bottomRight.pcrs.vertical) /
            2,
        linkExtentCentre = M['OSMTILE'].unproject(L.point([x, y])),
        centreLat = linkExtentCentre.lat,
        centreLon = linkExtentCentre.lng;

      return {
        centreLat: centreLat,
        centreLon: centreLon,
        mapLon: map.lon,
        mapLat: map.lat
      };
    });
    // map should have zoomed to be centred on the map-link when map-link.zoomTo()
    // was run.  The zoom is calculated as the largest allowable zoom that will fit the
    // bounds into the map viewport, but the value is not tested here.
    expect(linkExtentCentre.centreLat).toBeCloseTo(linkExtentCentre.mapLat, 5);
    expect(linkExtentCentre.centreLon).toBeCloseTo(linkExtentCentre.mapLon, 6);
  });
  test.skip('map-link.extent changes dynamically with map-input, map-meta changes', async () => {
    // future work. Requires behaviour to be programmed into map-input, map-meta
    // custom elements
    test.fail();
  });

  test.skip('map-link constructed programmatically works', async () => {
    // future work.
    test.fail();
  });
});
