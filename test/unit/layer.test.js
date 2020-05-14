

describe('MapMLLayer Tests', () => {
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
    describe('MapMLLayer Constructor Tests', () => {
        describe('M.mapMLLayer(url) factory function ', () => {
            test(
                '(null content, null options) should return a MapMLLayer object',
                () => {
                    var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
                    var ml = M.mapMLLayer(url);
                    //assert.notExists(ml._content, "without a _content property");
                    //assert.exists(ml._container, "with a _container property");
                    expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                    //assert.exists(ml._imageContainer, "with an _imageContainer property");
                    expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                    expect(ml._href === url).toBeTruthy();
                    // zIndex has to be set, for the case where the layer is added to the
                    // map before the layercontrol is used to control it
                    expect(ml.options.zIndex).toBe(0);
                }
            );
        });
        describe('M.mapMLLayer(null, <layer-></layer->, options) factory function ', () => {
            var content = document.createElement('layer-');
            beforeEach(() => {
                content.innerHTML =
                    `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;
                // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                // I reckon it should be HTMLUnknownElement, but it is not.
                expect(content instanceof HTMLElement).toBeTruthy();
            });
            test('null url should return a MapMLLayer object', () => {
                var ml = M.mapMLLayer(null, content);
                //assert.exists(ml._content, "with a _content property");
                expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._imageContainer, "with an _imageContainer property");
                expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.notExists(ml._href, "without a _href property");
                expect(ml.options.zIndex).toBe(0);
            });
        });
        describe('M.mapMLLayer(url, <layer-></layer->, options) factory function ', () => {
            var content = document.createElement('layer-');
            beforeEach(() => {
                content.innerHTML =
                    `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;
                // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                // I reckon it should be HTMLUnknownElement, but it is not.
                expect(content instanceof HTMLElement).toBeTruthy();
            });
            test('url should return a MapMLLayer object', () => {
                var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
                var ml = M.mapMLLayer(url, content);
                //assert.notExists(ml._content, "without a _content property");
                //assert.exists(ml._layerEl, "with a _layerEl property");
                expect(ml._layerEl).toBe(content);
                expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._imageContainer, "with an _imageContainer property");
                expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._href, "with an _href property");
                expect(ml._href).toBe(url);
                expect(ml.options.zIndex).toBe(0);
            });
        });
        describe('M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ', () => {
            var content = document.createElement('foo');
            beforeEach(() => {
                content.innerHTML =
                    `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;
                // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                // I reckon it should be HTMLUnknownElement, but it is not.
                expect(content instanceof HTMLElement).toBeTruthy();
            });
            test('url value should return a url-based MapMLLayer object', () => {
                var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
                var ml = M.mapMLLayer(url, content);
                //assert.notExists(ml._content, "without a _content property");
                //assert.exists(ml._layerEl, "with a _layerEl property");
                expect(ml._layerEl).toBe(content);
                expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._imageContainer, "with an _imageContainer property");
                expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._href, "with an _href property");
                expect(ml._href).toBe(url);
                expect(ml.options.zIndex).toBe(0);
            });
            test(
                'null url should return a inline-content based MapMLLayer object',
                () => {
                    var ml = M.mapMLLayer(null, content);
                    //assert.exists(ml._content, "with a _content property");
                    //assert.exists(ml._layerEl, "with a _layerEl property");
                    expect(ml._layerEl).toBe(content);
                    expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                    //assert.exists(ml._imageContainer, "with an _imageContainer property");
                    expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                    //assert.notExists(ml._href, "without an _href property");
                    expect(ml.options.zIndex).toBe(0);
                }
            );
        });
        describe('M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ', () => {
            var content = document.createElement('foo');
            beforeEach(() => {
                content.innerHTML =
                    `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;
                // weirdly, this is true, perhaps because it was constructed with document.createElement('layer-');
                // I reckon it should be HTMLUnknownElement, but it is not.
                expect(content instanceof HTMLElement).toBeTruthy();
            });
            test('url value should return a url-based MapMLLayer object', () => {
                var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
                var ml = M.mapMLLayer(url, content);
                //assert.notExists(ml._content, "without a _content property");
                //assert.exists(ml._layerEl, "with a _layerEl property");
                expect(ml._layerEl).toBe(content);
                expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._imageContainer, "with an _imageContainer property");
                expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._href, "with an _href property");
                expect(ml._href).toBe(url);
                expect(ml.options.zIndex).toBe(0);
            });
        });
        describe('M.mapMLLayer(url, <foo>(empty)</foo>, options) factory function ', () => {
            test('url value should return a url-based MapMLLayer object', () => {
                var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
                var empty = document.createElement('bar');
                var ml = M.mapMLLayer(url, empty);
                //assert.notExists(ml._content, "without a _content property");
                //assert.exists(ml._layerEl, "with a _layerEl property");
                expect(ml._layerEl).toBe(empty);
                expect(ml._container.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._imageContainer, "with an _imageContainer property");
                expect(ml._imageContainer.classList.contains('leaflet-layer')).toBeTruthy();
                //assert.exists(ml._href, "with an _href property");
                expect(ml._href).toBe(url);
                expect(ml.options.zIndex).toBe(0);
            });
        });
        describe('M.mapMLLayer(null, null, options) factory function ', () => {
            test(
                'null url, null content, any object params should NOT return a MapMLLayer object',
                () => {
                    var ml = M.mapMLLayer(null, null, {});
                    //assert.notExists(ml, "should not be created by null,null,{} constructor call");
                }
            );
        });
    });
});
