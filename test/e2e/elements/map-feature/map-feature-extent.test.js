import { test, expect, chromium } from '@playwright/test';

test.describe('map-feature extent functionality and API', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', {
      slowMo: 500,
      ignoreHTTPSErrors: true
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-feature-extent.html');
    await page.evaluate(async () => {
      const leaflet = await import('http://localhost:30001/leaflet-src.esm.js');
      window.L = leaflet;
    });
  });
  /* Test that feature extent is correct, interaction with map-layer extent is
   * appropriate.  Tests SHOULD cover different projections, not only OSMTILE and WGS84,
   * but also CBMTILE and perhaps a custom projection.  The tricky thing about
   * features is that coordinates are supposed to be expressed in any of gcrs,
   * pcrs, tcrs, tilematrix, tile (?) etc, so the extent bounds determination must
   * decide on the semantics of extent wrt the projection. Is the extent of a feature
   * its bounds' coordinates in projected or geographic coordinates?
   */

  test(`layer extent bounds include map-feature's`, async () => {
    // get extent of layer
    const layer = await page.getByTestId('layer1');
    const layerExtent = await layer.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zNativeMin: l.extent.zoom.minNativeZoom,
        zNativeMax: l.extent.zoom.maxNativeZoom
      };
    });
    // get extent of map-feature(s)
    const feature = await page.getByTestId('f1');
    const featureExtent = await feature.evaluate((f) => {
      return {
        xmin: f.extent.topLeft.pcrs.horizontal,
        ymin: f.extent.bottomRight.pcrs.vertical,
        xmax: f.extent.bottomRight.pcrs.horizontal,
        ymax: f.extent.topLeft.pcrs.vertical,
        zmin: f.extent.zoom.minZoom,
        zmax: f.extent.zoom.maxZoom,
        zNativeMin: f.extent.zoom.minNativeZoom,
        zNativeMax: f.extent.zoom.maxNativeZoom
      };
    });
    // assert that bounds of layer entirely include bounds of feature
    const layerBoundsIncludeFeatureBounds = await page.evaluate(
      (obj) => {
        let layerBounds = L.bounds(
          [obj.le.xmin, obj.le.ymin],
          [obj.le.xmax, obj.le.ymax]
        );
        let featureBounds = L.bounds(
          [obj.fe.xmin, obj.fe.ymin],
          [obj.fe.xmax, obj.fe.ymax]
        );
        return layerBounds.contains(featureBounds);
      },
      { le: layerExtent, fe: featureExtent }
    );
    expect(layerBoundsIncludeFeatureBounds).toBe(true);
    // get bounds of map-meta
    const meta = await page.getByTestId('meta-ext1');
    const metaExtent = await meta.evaluate((m) => {
      let content = M.Util._metaContentToObject(m.getAttribute('content'));
      return {
        xmin: +content['top-left-easting'],
        ymin: +content['bottom-right-northing'],
        xmax: +content['bottom-right-easting'],
        ymax: +content['top-left-northing']
      };
    });
    // assert that bounds of layer include the bounds of map-meta
    const layerBoundsIncludeMetaBounds = await page.evaluate(
      (obj) => {
        let layerBounds = L.bounds(
          [obj.le.xmin, obj.le.ymin],
          [obj.le.xmax, obj.le.ymax]
        );
        let metaBounds = L.bounds(
          [obj.me.xmin, obj.me.ymax],
          [obj.me.xmax, obj.me.ymin]
        );
        return layerBounds.contains(metaBounds);
      },
      { le: layerExtent, me: metaExtent }
    );
    expect(layerBoundsIncludeMetaBounds).toBe(true);

    // assert that map-meta bounds exclude the bounds of map-feature
    // i.e. they don't intersect
    const metaBoundsExcludeFeatureBounds = await page.evaluate(
      (obj) => {
        let metaBounds = L.bounds(
          [obj.me.xmin, obj.me.ymin],
          [obj.me.xmax, obj.me.ymax]
        );
        let featureBounds = L.bounds(
          [obj.fe.xmin, obj.fe.ymin],
          [obj.fe.xmax, obj.fe.ymax]
        );
        return !metaBounds.intersects(featureBounds);
      },
      { me: metaExtent, fe: featureExtent }
    );
    expect(metaBoundsExcludeFeatureBounds).toBe(true);
  });
  test(`bounds of map-meta + map-feature extent bounds equal map-layer extent bounds`, async () => {
    // get bounds of map-meta
    const meta = await page.getByTestId('meta-ext1');
    const metaExtent = await meta.evaluate((m) => {
      let content = M.Util._metaContentToObject(m.getAttribute('content'));
      return {
        xmin: +content['top-left-easting'],
        ymin: +content['bottom-right-northing'],
        xmax: +content['bottom-right-easting'],
        ymax: +content['top-left-northing']
      };
    });
    // get extent of map-feature(s)
    const feature = await page.getByTestId('f1');
    const featureExtent = await feature.evaluate((f) => {
      return {
        xmin: f.extent.topLeft.pcrs.horizontal,
        ymin: f.extent.bottomRight.pcrs.vertical,
        xmax: f.extent.bottomRight.pcrs.horizontal,
        ymax: f.extent.topLeft.pcrs.vertical,
        zmin: f.extent.zoom.minZoom,
        zmax: f.extent.zoom.maxZoom,
        zNativeMin: f.extent.zoom.minNativeZoom,
        zNativeMax: f.extent.zoom.maxNativeZoom
      };
    });
    // get extent of layer
    const layer = await page.getByTestId('layer1');
    const layerExtent = await layer.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zNativeMin: l.extent.zoom.minNativeZoom,
        zNativeMax: l.extent.zoom.maxNativeZoom
      };
    });
    const metaBoundsPlusFeatureBoundsEqualLayerBounds = await page.evaluate(
      (obj) => {
        let layerBounds = L.bounds(
          [obj.le.xmin, obj.le.ymin],
          [obj.le.xmax, obj.le.ymax]
        );
        let metaBounds = L.bounds(
          [obj.me.xmin, obj.me.ymax],
          [obj.me.xmax, obj.me.ymin]
        );
        let featureBounds = L.bounds(
          [obj.fe.xmin, obj.fe.ymin],
          [obj.fe.xmax, obj.fe.ymax]
        );
        return metaBounds.extend(featureBounds).equals(layerBounds);
      },
      { me: metaExtent, le: layerExtent, fe: featureExtent }
    );
    expect(metaBoundsPlusFeatureBoundsEqualLayerBounds).toBe(true);
  });
  test(`zoom bounds of layer include the zoom bounds of child features and map-meta'`, async () => {
    // get zoom bounds of layer
    const layer = await page.getByTestId('layer1');
    const layerZoomBounds = await layer.evaluate((l) => {
      return {
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zNativeMin: l.extent.zoom.minNativeZoom,
        zNativeMax: l.extent.zoom.maxNativeZoom
      };
    });
    // get zoom bounds of map-feature(s)
    const feature = await page.getByTestId('f1');
    const featureZoomBounds = await feature.evaluate((f) => {
      return {
        zmin: f.extent.zoom.minZoom,
        zmax: f.extent.zoom.maxZoom,
        zNativeMin: f.extent.zoom.minNativeZoom,
        zNativeMax: f.extent.zoom.maxNativeZoom
      };
    });
    // get zoom bounds of map-meta
    const meta = await page.getByTestId('meta-zoom1');
    const metaZoomBounds = await meta.evaluate((m) => {
      let content = M.Util._metaContentToObject(m.getAttribute('content'));
      return {
        zmin: +content['min'],
        zmax: +content['max']
      };
    });
    const layerZoomBoundsIncludeFeaturesAndMapMetaZoomBounds =
      await page.evaluate(
        (obj) => {
          let lzbIncludesFzb =
            obj.lzb.zmin <= obj.fzb.zmin && obj.lzb.zmax >= obj.fzb.zmax;
          let lzbIncludesMzb =
            obj.lzb.zmin <= obj.mzb.zmin && obj.lzb.zmax >= obj.mzb.zmax;
          let lzbIncludesFzbAndMzb = lzbIncludesFzb && lzbIncludesMzb;
          let lzbNativeZBEqualsFzbNZB =
            obj.lzb.zNativeMin === obj.fzb.zNativeMin &&
            obj.lzb.zNativeMax === obj.fzb.zNativeMax;
          return lzbIncludesFzbAndMzb && lzbNativeZBEqualsFzbNZB;
        },
        { lzb: layerZoomBounds, fzb: featureZoomBounds, mzb: metaZoomBounds }
      );
    expect(layerZoomBoundsIncludeFeaturesAndMapMetaZoomBounds).toBe(true);
  });
});
