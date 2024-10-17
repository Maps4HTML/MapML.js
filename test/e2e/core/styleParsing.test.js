import { test, expect, chromium } from '@playwright/test';

test.describe('map-style and map-link[rel=stylesheet] tests', () => {
  let page;
  let context;
  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('');
    page =
      context.pages().find((page) => page.url() === 'about:blank') ||
      (await context.newPage());
    await page.goto('styleParsing.html');
    await page.waitForTimeout(250);
  });

  test.afterAll(async function () {
    await context.close();
  });

  //tests using the 1st map in the page
  test(`Local-content (no src) styles rendered as style/link in same order as \
found, in expected shadow root location`, async () => {
    const localContentLayer = page.getByTestId('arizona');
    const ids = await localContentLayer.evaluate((layer) => {
      const elementSequence = layer.querySelectorAll(
        'map-link[rel=stylesheet],map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await localContentLayer.evaluate((layer) => {
      const elementSequence = layer._layer._container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });

  test(`Local layer content (no src) map-link[rel=features] remote styles \
rendered as style/link in same order as found, in expected shadow root location`, async () => {
    const featuresLink = page.getByTestId('alabama-features');
    const ids = await featuresLink.evaluate((link) => {
      const elementSequence = link.shadowRoot.querySelectorAll(
        'map-link[rel=stylesheet],map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await featuresLink.evaluate((link) => {
      const elementSequence = link._templatedLayer._container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });

  test(`Local style children of map-extent rendered as style/link in same order \
as found, in expected shadow root location`, async () => {
    const mapExtent = page.getByTestId('map-ext1');
    const ids = await mapExtent.evaluate((e) => {
      const elementSequence = e.querySelectorAll(
        'map-link[rel=stylesheet],map-style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await mapExtent.evaluate((e) => {
      const elementSequence = e._extentLayer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(ids).toEqual(renderedIds);
  });
  test(`Local content map-link[rel=tile][type=text/mapml] with remote styles \
embedded in text/mapml tiles are rendered in same order as found in tile`, async () => {
    // it's a bit tricky to work with tiled mapml vectors because the map-feature
    // is discarded and only the rendered path is kept.  In this case, we're using
    // the same layer twice in the styleParsing.html (vector-tile-test.mapml),
    // which refers to the WGS84 countries' test tile data
    // as a result, we get the same feature rendered whenever we add the layer
    // in this case it is used inline and remotely. The inline countries are
    // first in DOM order, so we'll take the first location of the rendered thing
    // we're looking for (in this test, at least)
    const renderedPath = await page.getByTestId('r0_c0').first();
    const renderedStyleIds = await renderedPath.evaluate((p) => {
      const elementSequence = p
        .closest('.mapml-tile-group.leaflet-tile')
        .querySelectorAll(':scope > link[rel=stylesheet],:scope > style');
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedStyleIds).toEqual('one,two,three');
  });
  test(`Remote styles (map-layer src) in the map-head rendered in the same source order\
as children of map-layer._layer._container`, async () => {
    const remoteLayer = page.getByTestId('remote');
    const ids = await remoteLayer.evaluate((l) => {
      const elementSequence = l.shadowRoot.querySelectorAll(
        ':host > map-style,:host > [rel=stylesheet]'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await remoteLayer.evaluate((l) => {
      const elementSequence = l._layer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedIds).toEqual(ids);
  });
  test(`Remote (map-layer src) styles in the remote map-extent should be rendered \
in the same order as in remote source, in the map-extent._extentLayer._container`, async () => {
    const remoteLayer = page.getByTestId('remote');
    const ids = await remoteLayer.evaluate((l) => {
      const elementSequence = l.shadowRoot.querySelectorAll(
        ':host > map-extent > map-style,:host > map-extent > [rel=stylesheet]'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    const renderedIds = await remoteLayer.evaluate((l) => {
      const e = l.shadowRoot.querySelector('map-extent');
      const elementSequence = e._extentLayer._container.querySelectorAll(
        ':scope > link[rel=stylesheet],:scope > style'
      );
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    expect(renderedIds).toEqual(ids);
  });
  test(`Remote (map-layer src) styles embedded within loaded tiles should be \
rendered in the same order as in the tile, in the tile container`, async () => {
    // there's more than one use of vector-tile-test.mapml here, so the test id
    // is not unique. this is the second and last occurence of it though:
    const renderedPath = await page.getByTestId('r0_c0').last();
    const renderedStyleIds = await renderedPath.evaluate((p) => {
      const elementSequence = p
        .closest('.mapml-tile-group.leaflet-tile')
        .querySelectorAll(':scope > link[rel=stylesheet],:scope > style');
      let ids = '';
      for (let i = 0; i < elementSequence.length; i++)
        ids +=
          elementSequence[i].getAttribute('id') +
          (i < elementSequence.length - 1 ? ',' : '');
      return ids;
    });
    // see e2e/data/tiles/wgs84/0/r0_c0.mapml for original order, it's one,two,three...
    expect(renderedStyleIds).toEqual('one,two,three');
  });
});
