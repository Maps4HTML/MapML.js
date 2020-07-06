describe("MapMLLayer Constructor Tests", () => {
	describe("M.mapMLLayer(url) factory function ", () => {
		test("(null content, null options) should return a MapMLLayer object", () => {
			var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
			var ml = M.mapMLLayer(url);
			expect(ml._content).toBeFalsy();
			expect(ml._container).toBeTruthy();
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href === url).toBeTruthy();
			expect(ml.options.zIndex).toBe(0);
		});
	});

	describe("M.mapMLLayer(null, <layer-></layer->, options) factory function ", () => {
		var content;
		beforeEach(() => {
			content = document.createElement("layer-");
			content.innerHTML = `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;

			expect(content instanceof HTMLElement).toBeTruthy();
		});
		test("null url should return a MapMLLayer object", () => {
			var ml = M.mapMLLayer(null, content);
			expect(ml._content).toBeTruthy();
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href).toBeFalsy();
			expect(ml.options.zIndex).toBe(0);
		});
		test("url should return a MapMLLayer object", () => {
			var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
			var ml = M.mapMLLayer(url, content);
			expect(ml._content).toBeFalsy();
			expect(ml._layerEl).toBeTruthy();
			expect(ml._layerEl).toBe(content);
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href).toBeTruthy();
			expect(ml._href).toBe(url);
			expect(ml.options.zIndex).toBe(0);
		});
	});

	describe("M.mapMLLayer(url | null, <foo>mapml content</foo>, options) factory function ", () => {
		var content;
		beforeEach(() => {
			content = document.createElement("foo");
			content.innerHTML = `<extent units="CBMTILE">
                        <input name="zoomLevel" type="zoom" value="3" min="0" max="3"/>
                        <input name="row" type="location" axis="row" units="tilematrix" min="14" max="21"/>
                        <input name="col" type="location" axis="column" units="tilematrix" min="14" max="19"/>
                        <link rel="tile" tref="./images/cbmt/{zoomLevel}/c{col}_r{row}.png"/>
                    </extent>`;

			expect(content instanceof HTMLElement).toBeTruthy();
		});
		test("url value should return a url-based MapMLLayer object", () => {
			var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
			var ml = M.mapMLLayer(url, content);
			expect(ml._content).toBeFalsy();
			expect(ml._layerEl).toBeTruthy();
			expect(ml._layerEl).toBe(content);
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href).toBeTruthy();
			expect(ml._href).toBe(url);
			expect(ml.options.zIndex).toBe(0);
		});
		test("null url should return a inline-content based MapMLLayer object", () => {
			var ml = M.mapMLLayer(null, content);
			expect(ml._content).toBeTruthy();
			expect(ml._layerEl).toBeTruthy();
			expect(ml._layerEl).toBe(content);
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href).toBeFalsy();
			expect(ml.options.zIndex).toBe(0);
		});
	});
	describe("M.mapMLLayer(url, <foo>(empty)</foo>, options) factory function ", () => {
		test("url value should return a url-based MapMLLayer object", () => {
			var url = "https://geogratis.gc.ca/mapml/en/cbmtile/cbmt/";
			var empty = document.createElement("bar");
			var ml = M.mapMLLayer(url, empty);
			expect(ml._content).toBeFalsy();
			expect(ml._layerEl).toBeTruthy();
			expect(ml._layerEl).toBe(empty);
			expect(
				ml._container.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._imageContainer).toBeTruthy();
			expect(
				ml._imageContainer.classList.contains("leaflet-layer")
			).toBeTruthy();
			expect(ml._href).toBeTruthy();
			expect(ml._href).toBe(url);
			expect(ml.options.zIndex).toBe(0);
		});
	});
	describe("M.mapMLLayer(null, null, options) factory function ", () => {
		test("null url, null content, any object params should NOT return a MapMLLayer object", () => {
			var ml = M.mapMLLayer(null, null, {});
			expect(ml).toBeFalsy();
		});
	});
});
