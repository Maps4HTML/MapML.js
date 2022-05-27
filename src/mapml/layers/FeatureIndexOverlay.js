export var FeatureIndexOverlay = L.Layer.extend({
    onAdd: function (map) {
        let svgInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 100 100"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M0 0h100v100H0z" color="#000" overflow="visible"/></svg>`;

        this._container = L.DomUtil.create("div", "mapml-feature-index-box", map._container);
        this._container.innerHTML = svgInnerHTML;

        this._output = L.DomUtil.create("output", "mapml-feature-index", map._container);
        this._output.setAttribute("role", "status");
        this._output.setAttribute("aria-live", "polite");
        this._output.setAttribute("aria-atomic", "true");
        this._body = L.DomUtil.create("span", "mapml-feature-index-content", this._output);
        this._body.index = 0;
        this._output.initialFocus = false;
        map.on("layerchange layeradd layerremove overlayremove", this._toggleEvents, this);
        map.on('moveend focus templatedfeatureslayeradd', this._checkOverlap, this);
        map.on("keydown", this._onKeyDown, this);
        this._addOrRemoveFeatureIndex();
    },

    _calculateReticleBounds: function () {
        let bounds = this._map.getPixelBounds();
        let center = bounds.getCenter();
        let wRatio = Math.abs(bounds.min.x - bounds.max.x) / (this._map.options.mapEl.width);
        let hRatio = Math.abs(bounds.min.y - bounds.max.y) / (this._map.options.mapEl.height);

        let reticleDimension = (getComputedStyle(this._container).width).replace(/[^\d.]/g,'');
        if((getComputedStyle(this._container).width).slice(-1) === "%") {
            reticleDimension = reticleDimension * this._map.options.mapEl.width / 100;
        }
        let w = wRatio * reticleDimension / 2;
        let h = hRatio * reticleDimension / 2;
        let minPoint = L.point(center.x - w, center.y + h);
        let maxPoint = L.point(center.x + w, center.y - h);
        let b = L.bounds(minPoint, maxPoint);
        return M.pixelToPCRSBounds(b,this._map.getZoom(),this._map.options.projection);
    },

    _checkOverlap: function (e) {
        if(e.type === "focus") this._output.initialFocus = true;
        if(!this._output.initialFocus) return;
        if(this._output.popupClosed) {
            this._output.popupClosed = false;
            return;
        }

        this._map.fire("mapkeyboardfocused");

        let featureIndexBounds = this._calculateReticleBounds();
        let features = this._map.featureIndex.inBoundFeatures;
        let index = 1;
        let keys = Object.keys(features);
        let body = this._body;

        body.innerHTML = "";
        body.index = 0;

        body.allFeatures = [];
        keys.forEach(i => {
            let layer = features[i].layer;
            let layers = features[i].layer._layers;
            let bounds = L.bounds();

            if(layers) {
                let keys = Object.keys(layers);
                keys.forEach(j => {
                    if(!bounds) bounds = L.bounds(layer._layers[j]._bounds.min, layer._layers[j]._bounds.max);
                    bounds.extend(layer._layers[j]._bounds.min);
                    bounds.extend(layer._layers[j]._bounds.max);
                });
            } else if(layer._bounds){
                bounds = L.bounds(layer._bounds.min, layer._bounds.max);
            }

            if(featureIndexBounds.overlaps(bounds)){
                let label = features[i].path.getAttribute("aria-label");

                if (index < 8){
                    body.appendChild(this._updateOutput(label, index, index));
                }
                if (index % 7 === 0 || index === 1) {
                    body.allFeatures.push([]);
                }
                body.allFeatures[Math.floor((index - 1) / 7)].push({label, index, layer});
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
        span.setAttribute("data-index", index);
        //", " adds a brief auditory pause when a screen reader is reading through the feature index
        //also prevents names with numbers + key from being combined when read
        span.innerHTML =  `<kbd>${key}</kbd>` + " " + label + "<span>, </span>";
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

    _onKeyDown: function (e){
        let body = this._body;
        let key = e.originalEvent.keyCode;
        if (key >= 49 && key <= 55){
            if(!body.allFeatures[body.index]) return;
            let feature = body.allFeatures[body.index][key - 49];
            if (!feature) return;
            let layer = feature.layer;
            if (layer) {
                this._map.featureIndex.currentIndex = feature.index - 1;
                if (layer._popup){
                    this._map.closePopup();
                    layer.openPopup();
                }
                else layer.options.group.focus();
            }
        } else if(key === 56){
            this._newContent(body, -1);
        } else if(key === 57){
            this._newContent(body, 1);
        }
    },

    _newContent: function (body, direction) {
        let index = body.firstChild.getAttribute("data-index");
        let newContent = body.allFeatures[Math.floor(((index - 1) / 7) + direction)];
        if(newContent && newContent.length > 0){
            body.innerHTML = "";
            body.index += direction;
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
        this._map.on("viewreset move moveend focus blur popupclose", this._addOrRemoveFeatureIndex, this);

    },

    _addOrRemoveFeatureIndex: function (e) {
        let features = this._body.allFeatures ? this._body.allFeatures.length : 0;
        //Toggle aria-hidden attribute so screen reader rereads the feature index on focus
        if (!this._output.initialFocus) {
            this._output.setAttribute("aria-hidden", "true");
        } else if(this._output.hasAttribute("aria-hidden")){
            let obj = this;
            setTimeout(function () {
                obj._output.removeAttribute("aria-hidden");
            }, 100);
        }

        if(e && e.type === "popupclose") {
            this._output.setAttribute("aria-hidden", "true");
            this._output.popupClosed = true;
        } else if (e && e.type === "focus") {
            this._container.removeAttribute("hidden");
            if (features !== 0) this._output.classList.remove("mapml-screen-reader-output");
        } else if (e && e.originalEvent && e.originalEvent.type === 'pointermove') {
            this._container.setAttribute("hidden", "");
            this._output.classList.add("mapml-screen-reader-output");
        } else if (e && e.target._popup) {
            this._container.setAttribute("hidden", "");
        } else if (e && e.type === "blur") {
            this._container.setAttribute("hidden", "");
            this._output.classList.add("mapml-screen-reader-output");
            this._output.initialFocus = false;
            this._addOrRemoveFeatureIndex();
        } else if (this._map.isFocused && e) {
            this._container.removeAttribute("hidden");
            if (features !== 0) {
                this._output.classList.remove("mapml-screen-reader-output");
            } else {
                this._output.classList.add("mapml-screen-reader-output");
            }
        } else {
            this._container.setAttribute("hidden", "");
            this._output.classList.add("mapml-screen-reader-output");
        }

    },

});

export var featureIndexOverlay = function (options) {
    return new FeatureIndexOverlay(options);
};