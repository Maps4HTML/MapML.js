import { test, expect, chromium } from '@playwright/test';

test.describe('map-link extent tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-link.html');
  });

  const contentLocations = ['inline', 'remote'];
  for (const inlineOrRemote of contentLocations) {
    test(`${inlineOrRemote} map-link extent bounds set by associated map-inputs min/max`, async () => {
      const link1Bounds = await page
        .getByTestId(`${inlineOrRemote}-link1`)
        .evaluate((link) => {
          return {
            xmin: link.extent.topLeft.pcrs.horizontal,
            ymin: link.extent.bottomRight.pcrs.vertical,
            xmax: link.extent.bottomRight.pcrs.horizontal,
            ymax: link.extent.topLeft.pcrs.vertical
          };
        });
      //          <!-- bounds of map-link #link1 should have same values as the identified inputs below -->
      //          <map-input data-testid="inline-image-horizontal1" name="xmin" type="location" units="pcrs" axis="easting" position="top-left"     min="-13898086" max="-12675094"></map-input>
      //          <map-input name="xmax" type="location" units="pcrs" axis="easting" position="top-right"    min="-13898086" max="-12675094"></map-input>
      //          <map-input name="ymin" type="location" units="pcrs" axis="northing" position="bottom-left" min="6134530"   max="7357523"></map-input>
      //          <map-input data-testid="inline-image-vertical1" name="ymax" type="location" units="pcrs" axis="northing" position="top-left"    min="6134530"   max="7357523"></map-input>
      const mapInputLink1Horizontal = await page
        .getByTestId(`${inlineOrRemote}-image-horizontal1`)
        .evaluate((input) => {
          return {
            min: +input.getAttribute('min'),
            max: +input.getAttribute('max')
          };
        });
      const mapInputLink1Vertical = await page
        .getByTestId(`${inlineOrRemote}-image-vertical1`)
        .evaluate((input) => {
          return {
            min: +input.getAttribute('min'),
            max: +input.getAttribute('max')
          };
        });
      expect(link1Bounds.xmin).toEqual(mapInputLink1Horizontal.min);
      expect(link1Bounds.ymin).toEqual(mapInputLink1Vertical.min);
      expect(link1Bounds.xmax).toEqual(mapInputLink1Horizontal.max);
      expect(link1Bounds.ymax).toEqual(mapInputLink1Vertical.max);
    });
    test(`${inlineOrRemote} map-link zoom bounds set by associated map-inputs min/max`, async () => {
      const link1ZoomBounds = await page
        .getByTestId(`${inlineOrRemote}-link1`)
        .evaluate((link) => link.extent.zoom);
      //        <!-- this map-meta should establish the map-link.extent.zoom.minZoom and .maxZoom for both map-links -->
      //          <map-meta data-testid="inline-image-mmz1" name="zoom" content="min=3,max=11"></map-meta>

      //          <!-- this map-input (should) establish the min/maxNativeZoom for #link1 -->
      //          <map-input data-testid="inline-image-z1" name="z" type="zoom" min="3" max="10"></map-input>  });

      const nativeZoomFromInputLink1 = await page
        .getByTestId(`${inlineOrRemote}-image-z1`)
        .evaluate((input) => {
          return {
            minNativeZoom: +input.getAttribute('min'),
            maxNativeZoom: +input.getAttribute('max')
          };
        });
      const zoomFromMetaLink1 = await page
        .getByTestId(`${inlineOrRemote}-image-mmz1`)
        .evaluate((meta) => {
          let content = meta.getAttribute('content');
          return {
            minZoom: +M.Util._metaContentToObject(content)['min'],
            maxZoom: +M.Util._metaContentToObject(content)['max']
          };
        });
      expect(link1ZoomBounds.minZoom).toEqual(zoomFromMetaLink1.minZoom);
      expect(link1ZoomBounds.maxZoom).toEqual(zoomFromMetaLink1.maxZoom);
      expect(link1ZoomBounds.minNativeZoom).toEqual(
        nativeZoomFromInputLink1.minNativeZoom
      );
      expect(link1ZoomBounds.maxNativeZoom).toEqual(
        nativeZoomFromInputLink1.maxNativeZoom
      );
    });
    test(`${inlineOrRemote} map-link bounds should default to projection bounds`, async () => {
      //          <!-- #inline/remote-link2 should have the bounds of the projection (because its
      //          variables don't have min/max values, and it should
      //          have zoom bounds of the map-meta #inline/remote-image-mmz1, and the native
      //          zoom bounds of #inline/remote-image-z2 -->
      const link2Bounds = await page
        .getByTestId(`${inlineOrRemote}-link2`)
        .evaluate((link) => {
          return {
            xmin: link.extent.topLeft.pcrs.horizontal,
            ymin: link.extent.bottomRight.pcrs.vertical,
            xmax: link.extent.bottomRight.pcrs.horizontal,
            ymax: link.extent.topLeft.pcrs.vertical
          };
        });
      const projectionBounds = await page
        .getByTestId('viewer')
        .evaluate((v) => v._map.options.crs.options.bounds);
      expect(link2Bounds.xmin).toEqual(projectionBounds.min.x);
      expect(link2Bounds.ymin).toEqual(projectionBounds.min.y);
      expect(link2Bounds.xmax).toEqual(projectionBounds.max.x);
      expect(link2Bounds.ymax).toEqual(projectionBounds.max.y);
    });
    test(`${inlineOrRemote} map-link zoom bounds set by map-meta, native zoom bounds by map-input`, async () => {
      //  and it should
      //  have zoom bounds of the map-meta #inline-image-mmz1, and the native
      //  zoom bounds of #inline-image-z2 -->  });
      const link2ZoomBounds = await page
        .getByTestId(`${inlineOrRemote}-link2`)
        .evaluate((link) => link.extent.zoom);
      const mapMetaZoomBounds = await page
        .getByTestId(`${inlineOrRemote}-image-mmz1`)
        .evaluate((meta) => {
          let content = meta.getAttribute('content');
          return {
            minZoom: +M.Util._metaContentToObject(content)['min'],
            maxZoom: +M.Util._metaContentToObject(content)['max']
          };
        });
      const mapInputNativeZoomBounds = await page
        .getByTestId(`${inlineOrRemote}-image-z2`)
        .evaluate((input) => {
          return {
            min: +input.getAttribute('min'),
            max: +input.getAttribute('max')
          };
        });
      expect(link2ZoomBounds.minZoom).toEqual(mapMetaZoomBounds.minZoom);
      expect(link2ZoomBounds.maxZoom).toEqual(mapMetaZoomBounds.maxZoom);
      expect(link2ZoomBounds.minNativeZoom).toEqual(
        mapInputNativeZoomBounds.min
      );
      expect(link2ZoomBounds.maxNativeZoom).toEqual(
        mapInputNativeZoomBounds.max
      );
    });
    test(`${inlineOrRemote} link extent bounds set by map-meta, zoom bounds default to projection`, async () => {
      //  link3 should have the bounds of the map-meta #inline-image-mm-bounds,
      //  and the zoom bounds of the projection

      const link3Bounds = await page
        .getByTestId(`${inlineOrRemote}-link3`)
        .evaluate((link) => {
          return {
            xmin: link.extent.topLeft.pcrs.horizontal,
            ymin: link.extent.bottomRight.pcrs.vertical,
            xmax: link.extent.bottomRight.pcrs.horizontal,
            ymax: link.extent.topLeft.pcrs.vertical
          };
        });
      const mapMetaBounds = await page
        .getByTestId(`${inlineOrRemote}-image-mm-bounds`)
        .evaluate((meta) => {
          let content = meta.getAttribute('content');
          return {
            xmin: +M.Util._metaContentToObject(content)['top-left-easting'],
            ymin: +M.Util._metaContentToObject(content)[
              'bottom-right-northing'
            ],
            xmax: +M.Util._metaContentToObject(content)['bottom-right-easting'],
            ymax: +M.Util._metaContentToObject(content)['top-left-northing']
          };
        });
      expect(link3Bounds.xmin).toEqual(mapMetaBounds.xmin);
      expect(link3Bounds.ymin).toEqual(mapMetaBounds.ymin);
      expect(link3Bounds.xmax).toEqual(mapMetaBounds.xmax);
      expect(link3Bounds.ymax).toEqual(mapMetaBounds.ymax);

      const link3ZoomBounds = await page
        .getByTestId(`${inlineOrRemote}-link3`)
        .evaluate((link) => link.extent.zoom);
      const projectionZoomBounds = await page
        .getByTestId('viewer')
        .evaluate((v) => {
          return {
            min: 0,
            max: v._map.options.crs.options.resolutions.length - 1
          };
        });

      expect(link3ZoomBounds.minZoom).toEqual(projectionZoomBounds.min);
      expect(link3ZoomBounds.maxZoom).toEqual(projectionZoomBounds.max);
      expect(link3ZoomBounds.minNativeZoom).toEqual(projectionZoomBounds.min);
      expect(link3ZoomBounds.maxNativeZoom).toEqual(projectionZoomBounds.max);
    });
    test(`${inlineOrRemote} queryable layer should be disabled when extent is out of bounds in any way`, async () => {
      await page.reload();
      const viewer = page.getByTestId('viewer');
      const layer = page.getByTestId(`${inlineOrRemote}-image-queryable`);
      await expect(layer).toHaveAttribute('disabled');

      await page
        .getByTestId(`${inlineOrRemote}-image-queryable`)
        .evaluate((layer) => layer.zoomTo());
      await expect(layer).not.toHaveAttribute('disabled');
      const outOfZoomBoundsZoom = await page
        .getByTestId(`${inlineOrRemote}-image-queryable`)
        .evaluate((layer) => layer.extent.zoom.minZoom - 1);
      await page
        .getByTestId('viewer')
        .evaluate((v, z) => v.zoomTo(v.lat, v.lon, z), outOfZoomBoundsZoom);
      await expect(layer).toHaveAttribute('disabled');
      await page
        .getByTestId(`${inlineOrRemote}-image-queryable`)
        .evaluate((layer) => layer.zoomTo());
      await expect(layer).not.toHaveAttribute('disabled');

      // get the width of the extent, move the viewer twice that amount
      // in one direction, test that the layer is now disabled

      await viewer.evaluate((v) => {
        const e = v.extent,
          w = e.bottomRight.gcrs.horizontal - e.topLeft.gcrs.horizontal;
        v.zoomTo(v.lat, v.lon + 2 * w, v.zoom);
      });
      await expect(layer).toHaveAttribute('disabled');
    });
  }
});
