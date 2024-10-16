import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('', { slowMo: 500 });
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-extent.html');
  });
  test('Basic hidden functionality and API', async () => {
    const extent = await page.getByTestId('ext1');
    let hiddenInLayerControl = await extent.evaluate((extent) => {
      return !extent._layerControlHTML.isConnected;
    });
    expect(hiddenInLayerControl).toBe(true);

    await extent.evaluate((extent) => {
      extent.hidden = false;
    });
    hiddenInLayerControl = await extent.evaluate((extent) => {
      return !extent._layerControlHTML.isConnected;
    });
    expect(hiddenInLayerControl).toBe(false);

    let labelProperty = await extent.evaluate((extent) => {
      return extent.label;
    });
    expect(labelProperty === 'User-generated label').toBe(true);

    let labelInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlLabel.innerText;
    });
    expect(labelInLayerControl === labelProperty).toBe(true);

    await extent.evaluate((extent) => {
      extent.removeAttribute('label');
    });

    await page.waitForTimeout(500);
    const labelChangesToDefaultAndLayerNotHidden = await extent.evaluate(
      (extent) => {
        return (
          extent.label === 'Sub-layer' &&
          !extent.hidden &&
          extent._layerControlLabel.innerText === extent.label
        );
      }
    );
    expect(labelChangesToDefaultAndLayerNotHidden).toBe(true);
    await extent.evaluate((extent) => {
      // restore original state
      extent.hidden = true;
    });
  });

  test('hidden DOM order maintained when unhiding', async () => {
    const t = await page.getByTestId('template');
    await t.evaluate((t) => {
      let extents = t.content.cloneNode(true);
      let l = document.querySelector('#cbmt1');
      l.appendChild(extents);
    });
    await page.waitForTimeout(500);
    const layer = await page.getByTestId('cbmt1');
    let unhiddenMapExtentCount = await layer.evaluate((layer) => {
      return layer._propertiesGroupAnatomy.childElementCount;
    });
    // all hidden extents
    expect(unhiddenMapExtentCount).toEqual(0);
    await layer.evaluate((layer) => {
      return layer.whenElemsReady();
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext3"]').hidden = false;
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext1"]').hidden = false;
    });
    await layer.evaluate((layer) => {
      layer.querySelector('[data-testid="ext2"]').hidden = false;
    });
    unhiddenMapExtentCount = await layer.evaluate((layer) => {
      return layer._propertiesGroupAnatomy.childElementCount;
    });
    // no hidden extents
    expect(unhiddenMapExtentCount).toBe(3);

    const orderOfDOMExtentsEqualsLayerControlOrder = await layer.evaluate(
      (layer) => {
        let extents = layer.querySelectorAll('map-extent');
        let match = true;
        for (let i = 0; i < extents.length; i++) {
          if (
            extents[i]._layerControlHTML !==
            layer._propertiesGroupAnatomy.children[i]
          ) {
            match = false;
            break;
          }
        }
        return match;
      }
    );
    expect(orderOfDOMExtentsEqualsLayerControlOrder).toBe(true);
  });
  test('Basic checked functionality and API', async () => {
    // extent ext2-1 starts life checked and hidden
    const extent = await page.getByTestId('ext2-1');
    let checkedInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    let visibleOnMap = await extent.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    let checkedProperty = await extent.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(true);
    expect(visibleOnMap).toBe(true);
    expect(checkedProperty).toBe(true);
    await extent.evaluate((extent) => {
      extent.checked = false;
    });

    await extent.evaluate((extent) => {
      extent.hidden = false;
    });
    checkedInLayerControl = await extent.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    visibleOnMap = await extent.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    checkedProperty = await extent.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(false);
    expect(visibleOnMap).toBe(false);
    expect(checkedProperty).toBe(false);

    // extent2 is not checked when loaded
    const extent2 = await page.getByTestId('ext2-2');
    checkedInLayerControl = await extent2.evaluate((extent) => {
      return extent._layerControlCheckbox.checked;
    });
    visibleOnMap = await extent2.evaluate((extent) => {
      return extent._extentLayer._container.isConnected;
    });
    checkedProperty = await extent2.evaluate((extent) => {
      return extent.checked;
    });
    expect(checkedInLayerControl).toBe(false);
    expect(visibleOnMap).toBe(false);
    expect(checkedProperty).toBe(false);
  });
  test('Ensure that undefined projection throws exception', async () => {
    let errorLogs = [];
    page.on('pageerror', (err) => {
      errorLogs.push(err.message);
    });
    const viewer = page.getByTestId('firstmap');
    await viewer.evaluate((viewer) => {
      const l = document.createElement('map-layer');
      l.label = 'Layer';
      const e = document
        .querySelector('template')
        .content.querySelector('[data-testid=ext4]')
        .cloneNode(true);
      l.checked = true;
      l.appendChild(e);
      viewer.appendChild(l);
    });
    // map-extent.connectedCallback does an await map.whenProjectionDefined('foo')
    // which has a timeout of 5 seconds
    await page.waitForTimeout(5500);
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0]).toBe('Undefined projection:foo');
  });
  test("An empty layer's extent equals projection extent + it updates once content is added to the layer", async () => {
    const viewer = await page.getByTestId('firstmap');
    await viewer.evaluate((viewer) => {
      const l = document.createElement('map-layer');
      l.label = 'An empty layer';
      l.setAttribute('data-testid', 'empty');
      const metaProjection = document.createElement('map-meta');
      metaProjection.setAttribute('name', 'projection');
      metaProjection.setAttribute('content', 'CBMTILE');
      l.appendChild(metaProjection);
      viewer.appendChild(l);
    });
    const emptyLayerBounds = await page
      .getByTestId('empty')
      .evaluate((layer) => {
        return {
          xmin: layer.extent.topLeft.pcrs.horizontal,
          ymin: layer.extent.bottomRight.pcrs.vertical,
          xmax: layer.extent.bottomRight.pcrs.horizontal,
          ymax: layer.extent.topLeft.pcrs.vertical,
          zmin: layer.extent.zoom.minZoom,
          zmax: layer.extent.zoom.maxZoom
        };
      });
    const cbmtileProjectionBounds = await viewer.evaluate((viewer) => {
      let proj = viewer.projection;
      return {
        xmin: M[proj].options.crs.pcrs.horizontal.min,
        ymin: M[proj].options.crs.pcrs.vertical.min,
        xmax: M[proj].options.crs.pcrs.horizontal.max,
        ymax: M[proj].options.crs.pcrs.vertical.max,
        zmin: 0,
        zmax: M[proj].options.resolutions.length - 1
      };
    });
    expect(emptyLayerBounds.xmin).toEqual(cbmtileProjectionBounds.xmin);
    expect(emptyLayerBounds.ymin).toEqual(cbmtileProjectionBounds.ymin);
    expect(emptyLayerBounds.xmax).toEqual(cbmtileProjectionBounds.xmax);
    expect(emptyLayerBounds.ymax).toEqual(cbmtileProjectionBounds.ymax);
    expect(emptyLayerBounds.zmin).toEqual(cbmtileProjectionBounds.zmin);
    expect(emptyLayerBounds.zmax).toEqual(cbmtileProjectionBounds.zmax);

    await viewer.evaluate((viewer) => {
      const initiallyEmptyLayer = viewer.querySelector('[data-testid=empty'),
        ext = document
          .querySelector('[data-testid=template2]')
          .content.querySelector('[data-testid=ext5]')
          .cloneNode(true);
      initiallyEmptyLayer.appendChild(ext);
    });
    const layerWithContentBounds = await viewer.evaluate((v) => {
      let initiallyEmptyLayer = v.querySelector('[data-testid=empty]');
      return {
        xmin: initiallyEmptyLayer.extent.topLeft.pcrs.horizontal,
        ymin: initiallyEmptyLayer.extent.bottomRight.pcrs.vertical,
        xmax: initiallyEmptyLayer.extent.bottomRight.pcrs.horizontal,
        ymax: initiallyEmptyLayer.extent.topLeft.pcrs.vertical,
        zmin: initiallyEmptyLayer.extent.zoom.minZoom,
        zmax: initiallyEmptyLayer.extent.zoom.maxZoom
      };
    });
    const content = page.getByTestId('ext5');
    const contentBounds = await content.evaluate((content) => {
      return {
        xmin: content.extent.topLeft.pcrs.horizontal,
        ymin: content.extent.bottomRight.pcrs.vertical,
        xmax: content.extent.bottomRight.pcrs.horizontal,
        ymax: content.extent.topLeft.pcrs.vertical,
        zmin: content.extent.zoom.minZoom,
        zmax: content.extent.zoom.maxZoom
      };
    });
    expect(layerWithContentBounds.xmin).not.toEqual(
      cbmtileProjectionBounds.xmin
    );
    expect(layerWithContentBounds.ymin).not.toEqual(
      cbmtileProjectionBounds.ymin
    );
    expect(layerWithContentBounds.xmax).not.toEqual(
      cbmtileProjectionBounds.xmax
    );
    expect(layerWithContentBounds.ymax).not.toEqual(
      cbmtileProjectionBounds.ymax
    );
    expect(layerWithContentBounds.zmin).not.toEqual(
      cbmtileProjectionBounds.zmin
    );
    expect(layerWithContentBounds.zmax).not.toEqual(
      cbmtileProjectionBounds.zmax
    );

    expect(layerWithContentBounds.xmin).toEqual(contentBounds.xmin);
    expect(layerWithContentBounds.ymin).toEqual(contentBounds.ymin);
    expect(layerWithContentBounds.xmax).toEqual(contentBounds.xmax);
    expect(layerWithContentBounds.ymax).toEqual(contentBounds.ymax);
    expect(layerWithContentBounds.zmin).toEqual(contentBounds.zmin);
    expect(layerWithContentBounds.zmax).toEqual(contentBounds.zmax);

    // clean up
    await page.getByTestId('empty').evaluate((layer) => layer.remove());
  });

  test('map-extent.extent set by map-meta and/or map-inputs', async () => {
    // get extent of projection
    // set up an empty layer
    // get its extent
    // assert that extent of empty layer equals extent of projection
    // add a map-extent wherein bounds and zoom bounds are set via map-input
    // get initial extent of map-extent
    // assert that updated **layer** extent equals initial extent of map-extent
    // remove the map-extent
    // assert that layer extent returns to equal the extent of projection
    // create a map-extent identical to the first but which sets the extent (bounds and zoom bounds) via map-meta child elements
    // get the extent of map-extent
    // assert that the map-extent extent equals extent of added  map-meta elements
    // get extent of projection
    const viewer = page.getByTestId('firstmap');
    const cbmtileProjectionBounds = await viewer.evaluate((viewer) => {
      let proj = viewer.projection;
      return {
        xmin: M[proj].options.crs.pcrs.horizontal.min,
        ymin: M[proj].options.crs.pcrs.vertical.min,
        xmax: M[proj].options.crs.pcrs.horizontal.max,
        ymax: M[proj].options.crs.pcrs.vertical.max,
        zmin: 0,
        zmax: M[proj].options.resolutions.length - 1
      };
    });
    // set up an empty layer
    await viewer.evaluate((viewer) => {
      const l = document.createElement('map-layer');
      l.label = 'An empty layer';
      l.setAttribute('data-testid', 'empty');
      const metaProjection = document.createElement('map-meta');
      metaProjection.setAttribute('name', 'projection');
      metaProjection.setAttribute('content', 'CBMTILE');
      l.appendChild(metaProjection);
      viewer.appendChild(l);
    });
    // get its extent
    const emptyLayerBounds = await page
      .getByTestId('empty')
      .evaluate((layer) => {
        return {
          xmin: layer.extent.topLeft.pcrs.horizontal,
          ymin: layer.extent.bottomRight.pcrs.vertical,
          xmax: layer.extent.bottomRight.pcrs.horizontal,
          ymax: layer.extent.topLeft.pcrs.vertical,
          zmin: layer.extent.zoom.minZoom,
          zmax: layer.extent.zoom.maxZoom
        };
      });
    // assert that extent of empty layer equals extent of projection
    expect(emptyLayerBounds.xmin).toEqual(cbmtileProjectionBounds.xmin);
    expect(emptyLayerBounds.ymin).toEqual(cbmtileProjectionBounds.ymin);
    expect(emptyLayerBounds.xmax).toEqual(cbmtileProjectionBounds.xmax);
    expect(emptyLayerBounds.ymax).toEqual(cbmtileProjectionBounds.ymax);
    expect(emptyLayerBounds.zmin).toEqual(cbmtileProjectionBounds.zmin);
    expect(emptyLayerBounds.zmax).toEqual(cbmtileProjectionBounds.zmax);

    // add a map-extent wherein bounds and zoom bounds are set via map-input
    await viewer.evaluate((viewer) => {
      const initiallyEmptyLayer = viewer.querySelector('[data-testid=empty'),
        ext = document
          .querySelector('[data-testid=template2]')
          .content.querySelector('[data-testid=ext5]')
          .cloneNode(true);
      initiallyEmptyLayer.appendChild(ext);
    });
    // get initial extent of map-extent
    let mapExtent = page.getByTestId('ext5');
    const initialExtentBounds = await mapExtent.evaluate((me) => {
      return {
        xmin: me.extent.topLeft.pcrs.horizontal,
        ymin: me.extent.bottomRight.pcrs.vertical,
        xmax: me.extent.bottomRight.pcrs.horizontal,
        ymax: me.extent.topLeft.pcrs.vertical,
        zmin: me.extent.zoom.minZoom,
        zmax: me.extent.zoom.maxZoom
        // native zoom?
      };
    });
    // get the updated layer extent
    const layer = page.getByTestId('empty');
    const updatedLayerExtent = await layer.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom
      };
    });
    // assert that updated layer extent equals initial extent of map-extent
    expect(updatedLayerExtent.xmin).toEqual(initialExtentBounds.xmin);
    expect(updatedLayerExtent.ymin).toEqual(initialExtentBounds.ymin);
    expect(updatedLayerExtent.xmax).toEqual(initialExtentBounds.xmax);
    expect(updatedLayerExtent.ymax).toEqual(initialExtentBounds.ymax);
    expect(updatedLayerExtent.zmin).toEqual(initialExtentBounds.zmin);
    expect(updatedLayerExtent.zmax).toEqual(initialExtentBounds.zmax);

    // remove the map-extent
    await mapExtent.evaluate((me) => me.remove());

    // assert that layer extent returns to equal the extent of projection
    const originalLayerExtent = await layer.evaluate((l) => {
      return {
        xmin: l.extent.topLeft.pcrs.horizontal,
        ymin: l.extent.bottomRight.pcrs.vertical,
        xmax: l.extent.bottomRight.pcrs.horizontal,
        ymax: l.extent.topLeft.pcrs.vertical,
        zmin: l.extent.zoom.minZoom,
        zmax: l.extent.zoom.maxZoom
      };
    });
    expect(originalLayerExtent.xmin).toEqual(cbmtileProjectionBounds.xmin);
    expect(originalLayerExtent.ymin).toEqual(cbmtileProjectionBounds.ymin);
    expect(originalLayerExtent.xmax).toEqual(cbmtileProjectionBounds.xmax);
    expect(originalLayerExtent.ymax).toEqual(cbmtileProjectionBounds.ymax);
    expect(originalLayerExtent.zmin).toEqual(cbmtileProjectionBounds.zmin);
    expect(originalLayerExtent.zmax).toEqual(cbmtileProjectionBounds.zmax);

    // create a map-extent identical to the first but which sets the extent (bounds and zoom bounds) via map-meta child elements
    await page.getByTestId('template2').evaluate(() => {
      let me = document
        .querySelector('[data-testid=template2]')
        .content.querySelector('[data-testid=ext5]')
        .cloneNode(true);
      // note that setting an extent using tilematrix coordinates is not working
      // at this moment i.e. <map-meta name="extent" content="zoom=3,top-left-column=16, top-left-row=18, bottom-right-column=18, bottom-right-row=20"></map-meta>
      // is not working, forced to use pcrs coordinates for the time being
      me.insertAdjacentHTML(
        'afterbegin',
        `<map-meta name="extent" content="top-left-easting=-2143735, 
          top-left-northing=2741864, bottom-right-easting=1928211, 
          bottom-right-northing=-1314206"></map-meta>`
      );
      me.insertAdjacentHTML(
        'afterbegin',
        `<map-meta name="zoom" content="min=0,max=4"></map-meta>`
      );
      let layer = document.querySelector('[data-testid=empty]');
      layer.appendChild(me);
    });

    // see https://github.com/Maps4HTML/MapML.js/issues/921
    mapExtent = page.getByTestId('ext5');

    // get the extent of map-extent
    const finalExtentBounds = await mapExtent.evaluate((me) => {
      return {
        xmin: me.extent.topLeft.tilematrix[3].horizontal,
        ymin: me.extent.topLeft.tilematrix[3].vertical,
        xmax: me.extent.bottomRight.tilematrix[3].horizontal,
        ymax: me.extent.bottomRight.tilematrix[3].vertical,
        zmin: me.extent.zoom.minZoom,
        zmax: me.extent.zoom.maxZoom
      };
    });
    // the map-meta appended above extend the bounds by one tile to the northwest
    // and extend the zoom range to 0..4 (original is 1..3)
    // assert that the map-extent extent equals extent of added  map-meta elements
    const mapMetaExtent = {
      xmin: 16,
      ymin: 18,
      xmax: 18,
      ymax: 20,
      zmin: 0,
      zmax: 4
    };
    // note that setting an extent using tilematrix coordinates is not working
    // at this moment i.e. <map-meta name="extent" content="zoom=3,top-left-column=16, top-left-row=18,
    //      bottom-right-column=18, bottom-right-row=20"></map-meta>
    // is not working
    expect(finalExtentBounds.xmin).toBeCloseTo(mapMetaExtent.xmin, 2);
    expect(finalExtentBounds.ymin).toBeCloseTo(mapMetaExtent.ymin, 2);
    expect(finalExtentBounds.xmax).toBeCloseTo(mapMetaExtent.xmax, 2);
    expect(finalExtentBounds.ymax).toBeCloseTo(mapMetaExtent.ymax, 2);
    expect(finalExtentBounds.zmin).toEqual(mapMetaExtent.zmin);
    expect(finalExtentBounds.zmax).toEqual(mapMetaExtent.zmax);
  });
});
