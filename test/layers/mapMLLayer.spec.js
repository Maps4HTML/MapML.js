describe('MapMLLayer Constructor Tests', () => {
  describe('M.mapMLLayer(url) factory function ', () => {
    test('(null content, null options) should return a MapMLLayer object', async () => {
      var url = 'https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/';
      var ml = M.mapMLLayer(url);
      await expect(ml._content).toBeFalsy();
      await expect(ml._container).toBeTruthy();
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href === url).toBeTruthy();
      await expect(ml.options.zIndex).toBe(0);
    });
  });

  describe('M.mapMLLayer(null, <layer-></layer->, options) factory function ', () => {
    var content;
    beforeEach(async () => {
      content = document.createElement('layer-');
      content.innerHTML = `<map-extent units="CBMTILE">
                        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
                        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
                        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
                        <map-link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
                    </map-extent>`;

      await expect(content instanceof HTMLElement).toBeTruthy();
    });
    test('null url should return a MapMLLayer object', async () => {
      var ml = M.mapMLLayer(null, content);
      await expect(ml._content).toBeTruthy();
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href).toBeFalsy();
      await expect(ml.options.zIndex).toBe(0);
    });
    test('url should return a MapMLLayer object', async () => {
      var url = 'https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/';
      var ml = M.mapMLLayer(url, content);
      await expect(ml._content).toBeFalsy();
      await expect(ml._layerEl).toBeTruthy();
      await expect(ml._layerEl).toBe(content);
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href).toBeTruthy();
      await expect(ml._href).toBe(url);
      await expect(ml.options.zIndex).toBe(0);
    });
  });

  describe('M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ', () => {
    var content;
    beforeEach(async () => {
      content = document.createElement('foo');
      content.innerHTML = `<map-extent units="CBMTILE">
                        <map-input name="zoomLevel" type="zoom" value="3" min="0" max="3"></map-input>
                        <map-input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"></map-input>
                        <map-input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"></map-input>
                        <map-link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"></map-link>
                    </map-extent>`;

      await expect(content instanceof HTMLElement).toBeTruthy();
    });
    test('url value should return a url-based MapMLLayer object', async () => {
      var url = 'https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/';
      var ml = M.mapMLLayer(url, content);
      await expect(ml._content).toBeFalsy();
      await expect(ml._layerEl).toBeTruthy();
      await expect(ml._layerEl).toBe(content);
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href).toBeTruthy();
      await expect(ml._href).toBe(url);
      await expect(ml.options.zIndex).toBe(0);
    });
    test('null url should return a inline-content based MapMLLayer object', async () => {
      var ml = M.mapMLLayer(null, content);
      await expect(ml._content).toBeTruthy();
      await expect(ml._layerEl).toBeTruthy();
      await expect(ml._layerEl).toBe(content);
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href).toBeFalsy();
      await expect(ml.options.zIndex).toBe(0);
    });
  });
  describe('M.mapMLLayer(url, <foo>(empty)</foo>, options) factory function ', () => {
    test('url value should return a url-based MapMLLayer object', async () => {
      var url = 'https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/';
      var empty = document.createElement('bar');
      var ml = M.mapMLLayer(url, empty);
      await expect(ml._content).toBeFalsy();
      await expect(ml._layerEl).toBeTruthy();
      await expect(ml._layerEl).toBe(empty);
      await expect(
        ml._container.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._imageContainer).toBeTruthy();
      await expect(
        ml._imageContainer.classList.contains('leaflet-layer')
      ).toBeTruthy();
      await expect(ml._href).toBeTruthy();
      await expect(ml._href).toBe(url);
      await expect(ml.options.zIndex).toBe(0);
    });
  });
  describe('M.mapMLLayer(null, null, options) factory function ', () => {
    test('null url, null content, any object params should NOT return a MapMLLayer object', async () => {
      var ml = M.mapMLLayer(null, null, {});
      await expect(ml).toBeFalsy();
    });
  });
});
