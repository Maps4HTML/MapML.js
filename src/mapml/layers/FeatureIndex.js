export var FeatureIndex = L.Layer.extend({
    onAdd: function (map) {
        let svgInnerHTML = `<svg
                            xmlns:dc="http://purl.org/dc/elements/1.1/"
                            xmlns:cc="http://creativecommons.org/ns#"
                            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                            xmlns:svg="http://www.w3.org/2000/svg" 
                            xmlns="http://www.w3.org/2000/svg" version="1.1"
                            x="0px" y="0px" viewBox="0 0 99.999998 99.999998" xml:space="preserve">
                                <g>
                                    <rect  width="100" height="100"
                                    style="color:#000000;clip-rule:nonzero;display:inline;overflow:visible;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;fill:#000000;fill-opacity:0;fill-rule:nonzero;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"
                                    />
                                </g>
                            </svg>`;

        this._container = L.DomUtil.create("div", "mapml-feature-index-box", map._container);
        this._container.innerHTML = svgInnerHTML;

        this._table = L.DomUtil.create("table", "mapml-feature-index", map._container);
        this._title = L.DomUtil.create("caption", "mapml-feature-index-header", this._table);
        this._title.innerHTML = "Feature Index";
        this._body = L.DomUtil.create("tbody", "mapml-feature-index-content", this._table);

        map.on('moveend', this._checkOverlap, this);
    },

    _checkOverlap: function () {
        let bounds = this._map.getPixelBounds();
        let center = bounds.getCenter();
        let wRatio = Math.abs(bounds.min.x - bounds.max.x) / (this._map.options.mapEl.width);
        let hRatio = Math.abs(bounds.min.y - bounds.max.y) / (this._map.options.mapEl.height);

        let w = wRatio * 36;
        let h = hRatio * 36;
        let minPoint = L.point(center.x - w, center.y + h);
        let maxPoint = L.point(center.x + w, center.y - h);
        let b = L.bounds(minPoint, maxPoint);
        let featureIndexBounds = M.pixelToPCRSBounds(b,this._map.getZoom(),this._map.options.projection);

        let layers = this._map._layers;
        let index = 1;
        let keys = Object.keys(layers);
        let body = this._body;

        body.innerHTML = "";

        keys.forEach(i => {
            if(layers[i].featureAttributes && featureIndexBounds.overlaps(layers[i]._bounds)){
                let label = layers[i].group.getAttribute("aria-label");

                if(index === 9){
                    body.appendChild(this._updateCell("More results", 9));
                    body.querySelector("tr:nth-child(9) > td").addEventListener('focus', this._showMoreResults(body));
                    index += 1;
                }
                if(index > 9){
                    this._moreResults(label, index, body);
                } else {
                    body.appendChild(this._updateCell(label, index));
                }
                index += 1;

            }
        });
    },

    _updateCell: function (label, index) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");

        row.setAttribute("row", index);
        cell.setAttribute("tabindex", index);
        cell.setAttribute("aria-label", label);
        cell.innerHTML = index + " " + label;
        row.appendChild(cell);
        return row;
    },

    _moreResults :function (label, index, body) {
        let multiplier = Math.floor((index - 1) / 9);
        let row = body.querySelector(`[row='${index - (9 * multiplier)}']`);
        let cell = document.createElement("td");

        cell.className = "more-results";
        cell.style.display = "none";
        cell.setAttribute("tabindex", index);
        cell.setAttribute("aria-label", label);
        cell.innerHTML = index + " " + label;
        row.appendChild(cell);
    },

    _showMoreResults: function (body) {
        return function () {
            let hiddenCells = body.getElementsByClassName("more-results");
            for (let i = 0; i < hiddenCells.length; i++){
                hiddenCells[i].style.display = "";
            }
        };
    },

});

export var featureIndex = function (options) {
    return new FeatureIndex(options);
};