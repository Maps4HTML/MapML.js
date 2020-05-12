/* global assert, M */

describe('MapMLLayer Tests', function() {
  /*
   * I believe that the constructor should be called with *either* a URL *or*
   * a content parameter, but not both.  The logic is that a <layer> element
   * can have a @src attribute, pointing to content, or the element can have
   * inline content <layer>content</layer>, but not both.  In either case, you
   * can supply an options object as the third argument.
   * 
   * Testing should probably verify that the second parameter is a Node or null
   * The URL-only, or (url, null, options) form of the function should test that
   * the third parameter is null or not a Node, maybe.
   * 
   * The purpose of the tests should be to ensure that the function initializes
   * and returns a MapMLLayer object "appropriately".
   */
  describe('MapMLLayer Constructor Tests', function() {
    describe('M.mapMLLayer(url) factory function ', function() {
      it('(null content, null options) should return a MapMLLayer object', function () {
        var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
        var ml = M.mapMLLayer(url);
        assert.notExists(ml._content,"without a _content property");
        assert.exists(ml._container, "with a _container property");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert(ml._href === url, "with an _href === the url parameter value");
      // zIndex has to be set, for the case where the layer is added to the
      // map before the layercontrol is used to control it
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(null, <layer-></layer->, options) factory function ', function() {
      var content = document.createElement('layer-');
      beforeEach(function() {
        content.innerHTML = 
                `<extent units="CBMTILE">
                      <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                      <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                      <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                      <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                  </extent>`;
                 // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                 // I reckon it should be HTMLUnknownElement, but it is not.
                 assert(content instanceof HTMLElement, "must pass an element to the MapMLLayer constructor" );
      });
      it('null url should return a MapMLLayer object', function () {
        var ml=M.mapMLLayer(null,content);
        assert.exists(ml._content,"with a _content property");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.notExists(ml._href, "without a _href property");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(url, <layer-></layer->, options) factory function ', function() {
      var content = document.createElement('layer-');
      beforeEach(function() {
        content.innerHTML = 
                `<extent units="CBMTILE">
                      <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                      <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                      <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                      <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                  </extent>`;
                 // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                 // I reckon it should be HTMLUnknownElement, but it is not.
                 assert(content instanceof HTMLElement, "must pass an element to the MapMLLayer constructor" );
      });
      it('url should return a MapMLLayer object', function () {
        var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
        var ml=M.mapMLLayer(url, content);
        assert.notExists(ml._content,"without a _content property");
        assert.exists(ml._layerEl,"with a _layerEl property");
        assert.strictEqual(ml._layerEl,content,"expect the content to be stored as _layerEl");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.exists(ml._href, "with an _href property");
        assert.strictEqual(ml._href, url, "with an _href === the url parameter value");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ', function() {
      var content = document.createElement('foo');
      beforeEach(function() {
        content.innerHTML = 
                `<extent units="CBMTILE">
                      <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                      <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                      <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                      <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                  </extent>`;
                 // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                 // I reckon it should be HTMLUnknownElement, but it is not.
                 assert(content instanceof HTMLElement, "must pass an element to the MapMLLayer constructor" );
      });
      it('url value should return a url-based MapMLLayer object', function () {
        var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
        var ml=M.mapMLLayer(url, content);
        assert.notExists(ml._content,"without a _content property");
        assert.exists(ml._layerEl,"with a _layerEl property");
        assert.strictEqual(ml._layerEl,content,"expect the content to be stored as _layerEl");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.exists(ml._href, "with an _href property");
        assert.strictEqual(ml._href, url, "with an _href === the url parameter value");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
      it('null url should return a inline-content based MapMLLayer object', function () {
        var ml=M.mapMLLayer(null, content);
        assert.exists(ml._content,"with a _content property");
        assert.exists(ml._layerEl,"with a _layerEl property");
        assert.strictEqual(ml._layerEl,content,"expect the content (<foo></foo>) to be stored as _layerEl");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.notExists(ml._href, "without an _href property");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ', function() {
      var content = document.createElement('foo');
      beforeEach(function() {
        content.innerHTML = 
                `<extent units="CBMTILE">
                      <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                      <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                      <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                      <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                  </extent>`;
                 // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                 // I reckon it should be HTMLUnknownElement, but it is not.
                 assert(content instanceof HTMLElement, "must pass an element to the MapMLLayer constructor" );
      });
      it('url value should return a url-based MapMLLayer object', function () {
        var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
        var ml=M.mapMLLayer(url, content);
        assert.notExists(ml._content,"without a _content property");
        assert.exists(ml._layerEl,"with a _layerEl property");
        assert.strictEqual(ml._layerEl,content,"expect the content to be stored as _layerEl");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.exists(ml._href, "with an _href property");
        assert.strictEqual(ml._href, url, "with an _href === the url parameter value");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(url, <foo>(empty)</foo>, options) factory function ', function() {
      it('url value should return a url-based MapMLLayer object', function () {
        var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
        var empty = document.createElement('bar');
        var ml=M.mapMLLayer(url, empty);
        assert.notExists(ml._content,"without a _content property");
        assert.exists(ml._layerEl,"with a _layerEl property");
        assert.strictEqual(ml._layerEl,empty,"expect the content parameter to be stored as _layerEl");
        assert(ml._container.classList.contains('leaflet-layer'), "with a _container having class=leaflet-layer");
        assert.exists(ml._imageContainer, "with an _imageContainer property");
        assert(ml._imageContainer.classList.contains('leaflet-layer'),"with an _imageContainer having class=leaflet-layer");
        assert.exists(ml._href, "with an _href property");
        assert.strictEqual(ml._href, url, "with an _href === the url parameter value");
        assert.strictEqual(ml.options.zIndex, 0,"zIndex must be set to 0 by constructor");
      });
    });
    describe('M.mapMLLayer(null, null, options) factory function ', function() {
      it('null url, null content, any object params should NOT return a MapMLLayer object', function () {
        var ml=M.mapMLLayer(null, null, {});
        assert.notExists(ml,"should not be created by null,null,{} constructor call");
      });
    });
  });
});
