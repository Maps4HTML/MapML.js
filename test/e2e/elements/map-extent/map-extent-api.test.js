import { test, expect, chromium } from '@playwright/test';

test.describe('map-extent tests', () => {
  let page;
  let context;
  test.beforeAll(async function () {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('map-extent-api.html');
    await page.waitForTimeout(1000);
  });

  test('map-extent.zoomTo() works', async () => {
    // get the bounds of the map
    const viewer = await page.getByTestId('firstmap');
    let mapExtent = await viewer.evaluate((map) => {
      return {
        xmin: Math.trunc(map.extent.topLeft.pcrs.horizontal),
        ymin: Math.trunc(map.extent.bottomRight.pcrs.vertical),
        xmax: Math.trunc(map.extent.bottomRight.pcrs.horizontal),
        ymax: Math.trunc(map.extent.topLeft.pcrs.vertical),
        zmin: map.extent.zoom.minZoom,
        zmax: map.extent.zoom.maxZoom
      };
    });
    expect(mapExtent.xmin).toEqual(-9373489);
    expect(mapExtent.ymin).toEqual(-11714997);
    expect(mapExtent.xmax).toEqual(9808841);
    expect(mapExtent.ymax).toEqual(11303798);

    // execute map-extent.zoomTo(), which should change the map's extent
    const me = page.getByTestId('ext1');
    mapExtent = await me.evaluate((me) => {
      me.zoomTo();
      let map = document.querySelector('[data-testid=firstmap]');
      return {
        xmin: Math.trunc(map.extent.topLeft.pcrs.horizontal),
        ymin: Math.trunc(map.extent.bottomRight.pcrs.vertical),
        xmax: Math.trunc(map.extent.bottomRight.pcrs.horizontal),
        ymax: Math.trunc(map.extent.topLeft.pcrs.vertical),
        zmin: map.extent.zoom.minZoom,
        zmax: map.extent.zoom.maxZoom
      };
    });
    expect(mapExtent.xmin).toEqual(-10716252);
    expect(mapExtent.ymin).toEqual(-7763437);
    expect(mapExtent.xmax).toEqual(8466077);
    expect(mapExtent.ymax).toEqual(15255358);

    //reset the map extent for later tests
    await viewer.evaluate((map) => map.reload());
  });
  test('map-extent.getMapEl() works', async () => {
    // test that map-extent.getMapEl() returns ancestor mapml-viewer
    // or map[is=web-map] for inline content

    // inline layer
    let map = page.getByTestId('firstmap');
    let me = page.getByTestId('ext1');
    let viewerIsSelectedByGetMapEl = await map.evaluate(
      (map) => map.querySelector('[data-testid=ext1]').getMapEl() === map
    );

    expect(viewerIsSelectedByGetMapEl).toBe(true);

    // test that map-extent.getMapEl() returns ancestor mapml-viewer / map[is=web-map]
    // for remote content - a bit more challenging because the map-extent is in
    // the shadow root of the layer

    await map.evaluate((map) => {
      map.insertAdjacentHTML(
        'beforeend',
        `<map-layer data-testid="remote-layer" src="remote-layer.mapml"></layer>`
      );
    });
    let remoteMapExtent = await page.getByTestId('remote-map-extent');
    viewerIsSelectedByGetMapEl = await remoteMapExtent.evaluate((me) => {
      let map = document.querySelector('[data-testid=firstmap]');
      return me.getMapEl() === map;
    });
    expect(viewerIsSelectedByGetMapEl).toBe(true);

    await page.goto('map-extent-api-web-map.html');
    await page.waitForTimeout(1000);

    // inline layer
    map = page.getByTestId('firstmap');
    me = page.getByTestId('ext1');
    viewerIsSelectedByGetMapEl = await map.evaluate(
      (map) => map.querySelector('[data-testid=ext1]').getMapEl() === map
    );

    expect(viewerIsSelectedByGetMapEl).toBe(true);

    // test that map-extent.getMapEl() returns ancestor mapml-viewer / map[is=web-map]
    // for remote content - a bit more challenging because the map-extent is in
    // the shadow root of the layer

    await map.evaluate((map) => {
      map.insertAdjacentHTML(
        'beforeend',
        `<map-layer data-testid="remote-layer" src="remote-layer.mapml"></layer>`
      );
    });
    remoteMapExtent = await page.getByTestId('remote-map-extent');
    viewerIsSelectedByGetMapEl = await remoteMapExtent.evaluate((me) => {
      let map = document.querySelector('[data-testid=firstmap]');
      return me.getMapEl() === map;
    });
    expect(viewerIsSelectedByGetMapEl).toBe(true);

    await page.goto('map-extent-api.html');
    await page.waitForTimeout(1000);
  });
  test('map-extent.getLayerEl() works', async () => {
    // test that map-extent.getLayerEl() returns ancestor map-layer
    // for inline content
    let layer = await page.getByTestId('cbmt1');
    let layerSelectedByGetLayerEl = await layer.evaluate((layer) => {
      return layer.querySelector('[data-testid=ext1]').getLayerEl() === layer;
    });
    expect(layerSelectedByGetLayerEl).toBe(true);

    // test that map-extent.getLayerEl() returns ancestor map-layer
    // for remote content
    await layer.evaluate((map) => {
      map.insertAdjacentHTML(
        'afterend',
        `<map-layer data-testid="remote-layer" src="remote-layer.mapml"></layer>`
      );
    });
    let remoteMapExtent = await page.getByTestId('remote-map-extent');
    layerSelectedByGetLayerEl = await remoteMapExtent.evaluate((me) => {
      let layer = document.querySelector('[data-testid=remote-layer]');
      return me.getLayerEl() === layer;
    });
    expect(layerSelectedByGetLayerEl).toBe(true);
  });
  test('map-extent.getMeta() works', async () => {
    // map-meta distribution is like so:
    //    <map-layer id="cbmt1" data-testid="cbmt1" label="CBMT - INLINE" checked>
    //      <map-meta data-testid="meta-zoom-1" name="zoom" content="min=1,max=2"></map-meta>
    //      <map-meta data-testid="meta-zoom-1-1" name="zoom" content="min=-1,max=-1"></map-meta>
    //      <map-extent data-testid="ext1" label="User-generated label" units="CBMTILE" checked hidden>
    //        <map-meta data-testid="meta-zoom-2" name="zoom" content="min=2,max=3"></map-meta>
    //        <map-meta data-testid="meta-zoom-2-1" name="zoom" content="min=5,max=7"></map-meta>
    //        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
    //        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
    //        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
    //        <map-link rel='tile' tref='/data/cbmt/{//zoomLevel}/c{col}_r{row}.png'>
    //          <map-meta data-testid="meta-zoom-3" name="zoom" content="min=14,max=27"></map-meta>
    //          <map-meta data-testid="meta-zoom-3-1" name="zoom" content="min=14,max=27"></map-meta>
    //        </map-link>
    //      </map-extent>
    //    </map-layer>

    //  meta-zoom-2 should be found first
    const mapExtent = await page.getByTestId('ext1');
    let foundMetaId = await mapExtent.evaluate((me) => {
      return me.getMeta('zoom').getAttribute('data-testid');
    });
    expect(foundMetaId).toEqual('meta-zoom-2');
    // when meta-zoom-2 is removed, meta-zoom-2-1 should be found
    foundMetaId = await mapExtent.evaluate((me) => {
      document.querySelector('[data-testid=meta-zoom-2]').remove();
      return me.getMeta('zoom').getAttribute('data-testid');
    });
    expect(foundMetaId).toEqual('meta-zoom-2-1');
    // when meta-zoom-2-1 is remove, meta-zoom-1 should be found
    foundMetaId = await mapExtent.evaluate((me) => {
      document.querySelector('[data-testid=meta-zoom-2-1').remove();
      return me.getMeta('zoom').getAttribute('data-testid');
    });
    expect(foundMetaId).toEqual('meta-zoom-1');
    // when meta-zoom-1 is removed, meta-zoom-1-1 should be found
    foundMetaId = await mapExtent.evaluate((me) => {
      document.querySelector('[data-testid=meta-zoom-1').remove();
      return me.getMeta('zoom').getAttribute('data-testid');
    });
    expect(foundMetaId).toEqual('meta-zoom-1-1');
    // when meta-zoom-1-1 is removed, no meta should be found
    foundMetaId = await mapExtent.evaluate((me) => {
      document.querySelector('[data-testid=meta-zoom-1-1').remove();
      return me.getMeta('zoom');
    });
    expect(foundMetaId).toBeNull();
  });
});
