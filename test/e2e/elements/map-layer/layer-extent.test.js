import { test, expect, chromium } from '@playwright/test';

test.describe('map-layer local/inline extent source tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', {
      ignoreHTTPSErrors: true
    });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('layer-extent.html');
    await page.waitForTimeout(1000);
  });
  test('map-layer.extent min/maxZoom from map-inputs', async () => {
    // changed to add :host / :scope - create a test that passes now but failed before that change
    //      <map-layer data-testid="inline-layer" label="Local content" checked>
    //        <map-extent units="CBMTILE"  checked="checked">
    //          <!-- the bounds and zoom bounds of the inline content are different than the remote layer's content -->
    //          <map-input name="z" type="zoom"  value="17" min="3" max="17"></map-input>
    //          <map-input name="y" type="location" units="tilematrix" axis="row" min="31000" max="34000"></map-input>
    //          <map-input name="x" type="location" units="tilematrix" axis="column" min="27000" max="30000"></map-input>
    //          <map-link rel="tile" tref="dummy/arcgis/rest/services/BaseMaps/CBMT3978/MapServer/tile/{//z}/{y}/{x}?m4h=t" >
    //            <!-- previously this would have been used. Now it is ignored -->
    //            <map-meta name="zoom" content="min=5,max=10"></map-meta>
    //          </map-link>//
    //        </map-extent>
    //      </map-layer>
    const inline = await page.getByTestId('inline-layer');
    let zoomBounds = await inline.evaluate((l) => l.extent.zoom);
    expect(zoomBounds.minZoom).toEqual(3);
    expect(zoomBounds.maxZoom).toEqual(17);

    const remote = await page.getByTestId('remote-layer');
    zoomBounds = await remote.evaluate((l) => l.extent.zoom);
    expect(zoomBounds.minZoom).toEqual(0);
    expect(zoomBounds.maxZoom).toEqual(17);
  });
  test('map-layer.extent bounds from map-inputs', async () => {
    const inline = await page.getByTestId('inline-layer');
    let bounds = await inline.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.tilematrix[17].horizontal,
        ymin: l.extent.topLeft.tilematrix[17].vertical,
        xmax: l.extent.bottomRight.tilematrix[17].horizontal,
        ymax: l.extent.bottomRight.tilematrix[17].vertical
      };
    });
    expect(bounds.xmin).toEqual(27000);
    expect(bounds.ymin).toEqual(31000);
    expect(bounds.xmax).toEqual(30000);
    expect(bounds.ymax).toEqual(34000);
    const remote = await page.getByTestId('remote-layer');
    bounds = await remote.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.tilematrix[17].horizontal,
        ymin: l.extent.topLeft.tilematrix[17].vertical,
        xmax: l.extent.bottomRight.tilematrix[17].horizontal,
        ymax: l.extent.bottomRight.tilematrix[17].vertical
      };
    });
    expect(bounds.xmin).toEqual(26484);
    expect(bounds.ymin).toEqual(29750);
    expect(bounds.xmax).toEqual(32463);
    expect(bounds.ymax).toEqual(34475);
  });
  test('map-layer.extent bounds update when map-extent changes extent due to map-meta', async () => {
    // add a map-meta for extent inside the map-layer element
    //      <map-layer data-testid="inline-layer" label="Local content" checked>
    //        <map-extent units="CBMTILE"  checked="checked">
    //          <!-- add map-meta extent here, layer extent bounds should change -->
    //          <!-- add map-meta zoom here, layer extent zoom bounds should change -->
    //          <!-- the bounds and zoom bounds of the inline content are different than the remote layer's content -->
    //          <map-input name="z" type="zoom"  value="17" min="3" max="17"></map-input>
    //          <map-input name="y" type="location" units="tilematrix" axis="row" min="31000" max="34000"></map-input>
    //          <map-input name="x" type="location" units="tilematrix" axis="column" min="27000" max="30000"></map-input>
    //          <map-link rel="tile" tref="dummy/arcgis/rest/services/BaseMaps/CBMT3978/MapServer/tile/{//z}/{y}/{x}?m4h=t" >
    //            <!-- previously this would have been used. Now it is ignored, because the selectors are scoped -->
    //            <map-meta data-testid="large-zoom-bounds" name="zoom" content="min=5,max=21"></map-meta>
    //            <map-meta data-testid="large-extent" name="extent" content="top-left-easting=-5329325, top-left-northing=5643026, bottom-right-easting=5915489, bottom-right-northing=-5601788"></map-meta>
    //          </map-link>//
    //        </map-extent>
    //      </map-layer>

    const inline = await page.getByTestId('inline-layer');
    let bounds = await inline.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zmaxNative: l.extent.zoom.maxNativeZoom,
        zminNative: l.extent.zoom.minNativeZoom
      };
    });
    // these are the extent of the map-link above.
    expect(bounds.xmin).toBeCloseTo(-2651735.99, 1);
    expect(bounds.ymin).toBeCloseTo(-991413.9, 1);
    expect(bounds.xmax).toBeCloseTo(904271.1, 1);
    expect(bounds.ymax).toBeCloseTo(2564593.2, 1);
    expect(bounds.zmin).toEqual(3);
    expect(bounds.zmax).toEqual(17);
    expect(bounds.zmaxNative).toEqual(17);
    expect(bounds.zminNative).toEqual(3);

    await inline.evaluate((l) => {
      // this metaExtent fully includes the bounds of the map-link which are
      // derived from the map-input min/max attributes
      let metaExtent = document.querySelector('[data-testid=large-extent]');
      let mapExtent = document.querySelector('[data-testid=inline-extent]');
      let zoomMeta = document.querySelector('[data-testid=large-zoom-bounds]');
      mapExtent.insertAdjacentElement('afterbegin', metaExtent);
      metaExtent.insertAdjacentElement('afterend', zoomMeta);
    });
    bounds = await inline.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zmaxNative: l.extent.zoom.maxNativeZoom,
        zminNative: l.extent.zoom.minNativeZoom
      };
    });
    expect(bounds.xmin).toEqual(-5329325);
    expect(bounds.ymin).toEqual(-5601788);
    expect(bounds.xmax).toEqual(5915489);
    expect(bounds.ymax).toEqual(5643026);
    // until the map-meta is created in scope, there is no diff between display
    // and native zooms.  the new map-meta name=zoom sets up the display zoom
    expect(bounds.zmin).toEqual(5);
    expect(bounds.zmax).toEqual(21);
    expect(bounds.zmaxNative).toEqual(17);
    expect(bounds.zminNative).toEqual(3);
  });
  test('map-layer.extent bounds update with addition of map-meta children', async () => {
    await page.reload();
    await page.waitForTimeout(1000);
    await page.evaluate(async () => {
      const leaflet = await import('http://localhost:30001/leaflet-src.esm.js');
      window.L = leaflet;
    });
    // this tests the MutationObserver on the map-layer element to ensure it's
    // listening for map-meta name=zoom and name=extent
    // add a map-meta for extent inside the map-layer element
    //      <map-layer data-testid="inline-layer" label="Local content" checked>
    //          <!-- add map-meta extent here, layer extent bounds should change -->
    //          <!-- add map-meta zoom here, layer extent zoom bounds should change -->
    //        <map-extent units="CBMTILE"  checked="checked">
    //          <!-- the bounds and zoom bounds of the inline content are different than the remote layer's content -->
    //          <map-input name="z" type="zoom"  value="17" min="3" max="17"></map-input>
    //          <map-input name="y" type="location" units="tilematrix" axis="row" min="31000" max="34000"></map-input>
    //          <map-input name="x" type="location" units="tilematrix" axis="column" min="27000" max="30000"></map-input>
    //          <map-link rel="tile" tref="dummy/arcgis/rest/services/BaseMaps/CBMT3978/MapServer/tile/{//z}/{y}/{x}?m4h=t" >
    //            <!-- previously this would have been used. Now it is ignored, because the selectors are scoped -->
    //            <map-meta data-testid="large-zoom-bounds" name="zoom" content="min=5,max=21"></map-meta>
    //            <map-meta data-testid="large-extent" name="extent" content="top-left-easting=-5329325, top-left-northing=5643026, bottom-right-easting=5915489, bottom-right-northing=-5601788"></map-meta>
    //          </map-link>//
    //        </map-extent>
    //      </map-layer>

    const inline = await page.getByTestId('inline-layer');
    let bounds = await inline.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zmaxNative: l.extent.zoom.maxNativeZoom,
        zminNative: l.extent.zoom.minNativeZoom
      };
    });
    // these are the extent of the map-link above.
    expect(bounds.xmin).toBeCloseTo(-2651735.99, 1);
    expect(bounds.ymin).toBeCloseTo(-991413.9, 1);
    expect(bounds.xmax).toBeCloseTo(904271.1, 1);
    expect(bounds.ymax).toBeCloseTo(2564593.2, 1);
    expect(bounds.zmin).toEqual(3);
    expect(bounds.zmax).toEqual(17);
    expect(bounds.zmaxNative).toEqual(17);
    expect(bounds.zminNative).toEqual(3);

    await inline.evaluate((l) => {
      // this metaExtent fully includes the bounds of the map-link which are
      // derived from the map-input min/max attributes
      let metaExtent = document.querySelector('[data-testid=large-extent]');
      let zoomMeta = document.querySelector('[data-testid=large-zoom-bounds]');
      l.insertAdjacentElement('afterbegin', metaExtent);
      metaExtent.insertAdjacentElement('afterend', zoomMeta);
    });
    bounds = await inline.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom,
        zmaxNative: l.extent.zoom.maxNativeZoom,
        zminNative: l.extent.zoom.minNativeZoom
      };
    });
    expect(bounds.xmin).toEqual(-5329325);
    expect(bounds.ymin).toEqual(-5601788);
    expect(bounds.xmax).toEqual(5915489);
    expect(bounds.ymax).toEqual(5643026);
    // the "display" zoom min is not changed by map-meta name=zoom content="min=5,max=21"
    expect(bounds.zmin).toEqual(3);
    // the display zoom max is changed...
    expect(bounds.zmax).toEqual(21);
    // native zoom are the values specified on the inputs' min/max
    expect(bounds.zmaxNative).toEqual(17);
    expect(bounds.zminNative).toEqual(3);
  });
  test(`map-layer .extent bounds change with added / removed child map-features`, async () => {
    const newFeature = `<map-feature data-testid="f1" zoom="0" min="0" max="11"><map-geometry cs="pcrs"><map-linestring>
                        <map-coordinates>-7195964 5732985 4048850 5732985 4048850 -5511829 -7195964 -5511829 -7195964 5732985 
                        </map-coordinates></map-linestring></map-geometry>
                      </map-feature>`;

    const layer = await page.evaluateHandle(() =>
      document.querySelector('[data-testid=inline-layer]')
    );
    const initialLayerBoundsContainsFeatureBounds = await page.evaluate(
      (obj) => {
        // weird, but could not use document.querySelector here
        let beforeFeatureLayerBounds = L.bounds(
          [
            obj.l.extent.topLeft.pcrs.horizontal,
            obj.l.extent.topLeft.pcrs.vertical
          ],
          [
            obj.l.extent.bottomRight.pcrs.horizontal,
            obj.l.extent.bottomRight.pcrs.vertical
          ]
        );
        obj.l.insertAdjacentHTML('beforeend', obj.f);
        let f = obj.l.querySelector('[data-testid=f1]');
        let featureBounds = L.bounds(
          [f.extent.topLeft.pcrs.horizontal, f.extent.topLeft.pcrs.vertical],
          [
            f.extent.bottomRight.pcrs.horizontal,
            f.extent.bottomRight.pcrs.vertical
          ]
        );
        return beforeFeatureLayerBounds.contains(featureBounds);
      },
      { l: layer, f: newFeature }
    );
    expect(initialLayerBoundsContainsFeatureBounds).toBe(false);

    const inline = page.getByTestId('inline-layer');
    const layerBoundsIncludesNewFeatureBounds = await inline.evaluate((l) => {
      let layerBounds = L.bounds(
        [l.extent.topLeft.pcrs.horizontal, l.extent.topLeft.pcrs.vertical],
        [
          l.extent.bottomRight.pcrs.horizontal,
          l.extent.bottomRight.pcrs.vertical
        ]
      );
      let f = l.querySelector('[data-testid=f1]');
      let featureBounds = L.bounds(
        [f.extent.topLeft.pcrs.horizontal, f.extent.topLeft.pcrs.vertical],
        [
          f.extent.bottomRight.pcrs.horizontal,
          f.extent.bottomRight.pcrs.vertical
        ]
      );
      return layerBounds.contains(featureBounds);
    });
    expect(layerBoundsIncludesNewFeatureBounds).toBe(true);
    // remove the feature,
    const finalLayerBoundsContainsFeatureBounds = await inline.evaluate((l) => {
      let f = l.querySelector('[data-testid=f1]');
      let featureBounds = L.bounds(
        [f.extent.topLeft.pcrs.horizontal, f.extent.topLeft.pcrs.vertical],
        [
          f.extent.bottomRight.pcrs.horizontal,
          f.extent.bottomRight.pcrs.vertical
        ]
      );
      f.remove();
      let layerBounds = L.bounds(
        [l.extent.topLeft.pcrs.horizontal, l.extent.topLeft.pcrs.vertical],
        [
          l.extent.bottomRight.pcrs.horizontal,
          l.extent.bottomRight.pcrs.vertical
        ]
      );
      return layerBounds.contains(featureBounds);
    });
    // layer bounds should no longer contain the feature
    expect(finalLayerBoundsContainsFeatureBounds).toBe(false);
  });
});
