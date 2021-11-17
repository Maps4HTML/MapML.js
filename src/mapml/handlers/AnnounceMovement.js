export var AnnounceMovement = L.Handler.extend({
    addHooks: function () {
        this._map.on({
            layeradd: this.totalBounds,
            layerremove: this.totalBounds,
        });

        this._map.options.mapEl.addEventListener('moveend', this.announceBounds);
        this._map.dragging._draggable.addEventListener('dragstart', this.dragged);
        this._map.options.mapEl.addEventListener('mapfocused', this.focusAnnouncement);
    },
    removeHooks: function () {
        this._map.off({
            layeradd: this.totalBounds,
            layerremove: this.totalBounds,
        });

        this._map.options.mapEl.removeEventListener('moveend', this.announceBounds);
        this._map.dragging._draggable.removeEventListener('dragstart', this.dragged);
        this._map.options.mapEl.removeEventListener('mapfocused', this.focusAnnouncement);
    },

     focusAnnouncement: function () {
         let mapEl = this;
         setTimeout(function (){
             let el = mapEl.querySelector(".mapml-web-map") ? mapEl.querySelector(".mapml-web-map").shadowRoot.querySelector(".leaflet-container") :
                 mapEl.shadowRoot.querySelector(".leaflet-container");

             let mapZoom = mapEl._map.getZoom();
             let location = M.gcrsToTileMatrix(mapEl);
             let standard = " zoom level " + mapZoom + " column " + location[0] + " row " + location[1];

             if(mapZoom === mapEl._map._layersMaxZoom){
                 standard = "At maximum zoom level, zoom in disabled " + standard;
             }
             else if(mapZoom === mapEl._map._layersMinZoom){
                 standard = "At minimum zoom level, zoom out disabled " + standard;
             }

             el.setAttribute("aria-roledescription", "region " + standard);
             setTimeout(function () {
                 el.removeAttribute("aria-roledescription");
             }, 2000);
         }, 0);
     },

    announceBounds: function () {
        if(this._traversalCall > 0){
            return;
        }
        let mapZoom = this._map.getZoom();
        let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);

        let visible = true;
        if(this._map.totalLayerBounds){
            visible = mapZoom <= this._map._layersMaxZoom && mapZoom >= this._map._layersMinZoom &&
                this._map.totalLayerBounds.overlaps(mapBounds);
        }

        let output = this.querySelector(".mapml-web-map") ? this.querySelector(".mapml-web-map").shadowRoot.querySelector(".mapml-screen-reader-output") :
            this.shadowRoot.querySelector(".mapml-screen-reader-output");

        //GCRS to TileMatrix
        let location = M.gcrsToTileMatrix(this);
        let standard = "zoom level " + mapZoom + " column " + location[0] + " row " + location[1];

        if(!visible){
            let outOfBoundsPos = this._history[this._historyIndex];
            let inBoundsPos = this._history[this._historyIndex - 1];
            this.back();
            this._history.pop();

            if(outOfBoundsPos.zoom !== inBoundsPos.zoom){
                output.innerText = "Zoomed out of bounds, returning to";
            }
            else if(this._map.dragging._draggable.wasDragged){
                output.innerText = "Dragged out of bounds, returning to ";
            }
            else if(outOfBoundsPos.x > inBoundsPos.x){
                output.innerText = "Reached east bound, panning east disabled";
            }
            else if(outOfBoundsPos.x < inBoundsPos.x){
                output.innerText = "Reached west bound, panning west disabled";
            }
            else if(outOfBoundsPos.y < inBoundsPos.y){
                output.innerText = "Reached north bound, panning north disabled";
            }
            else if(outOfBoundsPos.y > inBoundsPos.y){
                output.innerText = "Reached south bound, panning south disabled";
            }

        }
        else{
            let prevZoom = this._history[this._historyIndex - 1].zoom;
            if(mapZoom === this._map._layersMaxZoom && mapZoom !== prevZoom){
                output.innerText = "At maximum zoom level, zoom in disabled " + standard;
            }
            else if(mapZoom === this._map._layersMinZoom && mapZoom !== prevZoom){
                output.innerText = "At minimum zoom level, zoom out disabled " + standard;
            }
            else {
                output.innerText = standard;
            }
        }
        this._map.dragging._draggable.wasDragged = false;
    },

    totalBounds: function () {
        let layers = Object.keys(this._layers);
        let bounds = L.bounds();

        layers.forEach(i => {
            if(this._layers[i].layerBounds){
                if(!bounds){
                    let point = this._layers[i].layerBounds.getCenter();
                    bounds = L.bounds(point, point);
                }
                bounds.extend(this._layers[i].layerBounds.min);
                bounds.extend(this._layers[i].layerBounds.max);
            }
        });

        this.totalLayerBounds = bounds;
    },

    dragged: function () {
        this.wasDragged = true;
    }

});