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

        this._output = L.DomUtil.create("output", "mapml-feature-index", map._container);
        this._body = L.DomUtil.create("span", "mapml-feature-index-content", this._output);

        map.on("layerchange layeradd layerremove overlayremove", this._toggleEvents, this);
        map.on('moveend focus', this._checkOverlap, this);
        map.on("keydown", this._toggleContent, this);
        this._addOrRemoveFeatureIndex();
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

        body.allFeatures = [];
        keys.forEach(i => {
            if(layers[i].featureAttributes && featureIndexBounds.overlaps(layers[i]._bounds)){
                let label = layers[i].group.getAttribute("aria-label");

                if (index < 8){
                    body.appendChild(this._updateOutput(label, index, index));
                }
                if (index % 7 === 0 || index === 1) {
                    body.allFeatures.push([]);
                }
                body.allFeatures[Math.floor((index - 1) / 7)].push({label, index});
                if (body.allFeatures[1] && body.allFeatures[1].length === 1){
                    body.appendChild(this._updateOutput("More results", 0, 9));
                }
                index += 1;
            }
        });
        this._addToggleKeys();
    },

    _updateOutput: function (label, index, key) {
        let span = document.createElement("span");
        span.setAttribute("index", index);
        span.innerHTML = `<kbd>${key}</kbd>` + " " + label;
        return span;
    },

    _addToggleKeys: function () {
        let allFeatures = this._body.allFeatures;
        for(let i = 0; i < allFeatures.length; i++){
            if(allFeatures[i].length === 0) return;
            if(allFeatures[i - 1]){
                let label = "Previous results";
                allFeatures[i].push({label});
            }

            if(allFeatures[i + 1] && allFeatures[i + 1].length > 0){
                let label = "More results";
                allFeatures[i].push({label});
            }
        }
    },

    _toggleContent: function (e){
        let body = this._body;
        if(e.originalEvent.keyCode === 57){
            this._newContent(body, 1);
        } else if(e.originalEvent.keyCode === 56){
            this._newContent(body, -1);
        }
    },

    _newContent: function (body, direction) {
        let index = body.firstChild.getAttribute("index");
        let newContent = body.allFeatures[Math.floor(((index - 1) / 7) + direction)];
        if(newContent && newContent.length > 0){
            body.innerHTML = "";
            for(let i = 0; i < newContent.length; i++){
                let feature = newContent[i];
                let index = feature.index ? feature.index : 0;
                let key = i + 1;
                if (feature.label === "More results") key = 9;
                if (feature.label === "Previous results") key = 8;
                body.appendChild(this._updateOutput(feature.label, index, key));
            }
        }
    },

    _toggleEvents: function (){
        this._map.on("viewreset move moveend focus blur", this._addOrRemoveFeatureIndex, this);

    },

    _addOrRemoveFeatureIndex: function (e) {
        let obj = this;
        setTimeout(function() {
            if (e && e.type === "focus") {
                obj._container.querySelector('rect').style.display = "inline";
                obj._output.style.display = "block";
            } else if (e && e.type === "blur") {
                obj._container.querySelector('rect').style.display = "none";
                obj._output.style.display = "none";
            } else if (obj._map.isFocused) {
                obj._container.querySelector('rect').style.display = "inline";
                obj._output.style.display = "block";
            } else {
                obj._container.querySelector('rect').style.display = "none";
                obj._output.style.display = "none";
            }
        }, 0);

    },

});

export var featureIndex = function (options) {
    return new FeatureIndex(options);
};