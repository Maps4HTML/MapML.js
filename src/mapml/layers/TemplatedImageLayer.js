export var TemplatedImageLayer =  L.Layer.extend({
    initialize: function(template, options) {
        this._template = template;
        this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
        L.DomUtil.addClass(this._container, 'mapml-image-container');
        let inputData = M._extractInputBounds(template);
        this.zoomBounds = inputData.zoomBounds;
        this.extentBounds=inputData.bounds;
        this.isVisible = true;
        delete options.opacity;
        L.extend(options, this.zoomBounds);
        L.setOptions(this, L.extend(options,this._setUpExtentTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._onMoveEnd
        };
        return events;
    },
    onAdd: function () {
        this._map._addZoomLimit(this);  //used to set the zoom limit of the map
        this.setZIndex(this.options.zIndex);
        this._onAdd();
    },
    redraw: function() {
        this._onMoveEnd();
    },

    _clearLayer: function(){
      let containerImages = this._container.querySelectorAll('img');
      for(let i = 0; i< containerImages.length;i++){
        this._container.removeChild(containerImages[i]);
      }
    },

    _addImage: function (bounds, zoom, loc) {
        let map = this._map;
        let overlayToRemove = this._imageOverlay;
        let src = this.getImageUrl(bounds, zoom);
        let size = map.getSize();
        this._imageOverlay = M.imageOverlay(src, loc, size, 0, this._container);
        this._imageOverlay._step = this._template.step;
        this._imageOverlay.addTo(map);
        if (overlayToRemove) {
            this._imageOverlay._overlayToRemove = overlayToRemove._url;
            this._imageOverlay.on('load error', function () {map.removeLayer(overlayToRemove);});
        }
    },

    _scaleImage: function (bounds, zoom) {
        let obj = this;
        setTimeout(function () {
            let step = obj._template.step;
            let steppedZoom = Math.floor(zoom / step) * step;
            let scale = obj._map.getZoomScale(zoom, steppedZoom);
            let translate = bounds.min.multiplyBy(scale)
                .subtract(obj._map._getNewPixelOrigin(obj._map.getCenter(), zoom)).round();
            L.DomUtil.setTransform(obj._imageOverlay._image, translate, scale);
        });
    },

    _onAdd: function () {
        let zoom = this._map.getZoom();
        let steppedZoom = zoom;
        let step = this._template.step;

        if (zoom % step !== 0) steppedZoom = Math.floor(zoom / step) * step;
        let bounds = this._map.getPixelBounds(this._map.getCenter(), steppedZoom);
        this._addImage(bounds, steppedZoom, L.point(0,0));
        this._pixelOrigins = {};
        this._pixelOrigins[steppedZoom] = bounds.min;
        if(zoom !== steppedZoom) {
            this._scaleImage(bounds, zoom);
        }
    },

    _onMoveEnd: function(e) {
        let mapZoom = this._map.getZoom();
        let history = this._map.options.mapEl._history;
        let current = history[history.length - 1];
        let previous = history[history.length - 2];
        if(!previous) previous = current;
        let step = this._template.step;
        let steppedZoom =   Math.floor(mapZoom / step) * step;
        let bounds = this._map.getPixelBounds(this._map.getCenter(), steppedZoom);
        //Zooming from one step increment into a lower one
        if((step !== "1") && ((mapZoom + 1) % step === 0) &&
            current.zoom === previous.zoom - 1){
            this._addImage(bounds, steppedZoom, L.point(0,0));
            this._scaleImage(bounds, mapZoom);
        //Zooming or panning within a step increment
        } else if (e && mapZoom % step !== 0) {
            this._imageOverlay._overlayToRemove = this._imageOverlay._url;
            if (current.zoom !== previous.zoom) {
                //Zoomed from within one step increment into another
                if(steppedZoom !== Math.floor(previous.zoom / step) * step){
                    this._addImage(bounds, steppedZoom, L.point(0,0));
                    this._pixelOrigins[steppedZoom] = bounds.min;
                }
                this._scaleImage(bounds, mapZoom);
            } else {
                let pixelOrigin = this._pixelOrigins[steppedZoom];
                let loc = bounds.min.subtract(pixelOrigin);
                if(this.getImageUrl(bounds, steppedZoom) === this._imageOverlay._url) return;
                this._addImage(bounds, steppedZoom, loc);
                this._scaleImage(bounds, mapZoom);
            }
        } else {
            let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
            this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom &&
            this.extentBounds.overlaps(mapBounds);
            if(!(this.isVisible)){
                this._clearLayer();
                return;
            }
            var map = this._map, loc = map.getPixelBounds().min.subtract(map.getPixelOrigin());
            this._addImage(map.getPixelBounds(), mapZoom, loc);
            this._pixelOrigins[mapZoom] = map.getPixelOrigin();
        }
    },
    setZIndex: function (zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();

        return this;
    },
    _updateZIndex: function () {
        if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    onRemove: function (map) {
      this._clearLayer();
      map._removeZoomLimit(this);
      this._container = null;
    },
    getImageUrl: function(pixelBounds, zoom) {
        var obj = {};
        obj[this.options.extent.width] = this._map.getSize().x;
        obj[this.options.extent.height] = this._map.getSize().y;
        obj[this.options.extent.bottom] = this._TCRSToPCRS(pixelBounds.max, zoom).y;
        obj[this.options.extent.left] = this._TCRSToPCRS(pixelBounds.min, zoom).x;
        obj[this.options.extent.top] = this._TCRSToPCRS(pixelBounds.min, zoom).y;
        obj[this.options.extent.right] = this._TCRSToPCRS(pixelBounds.max, zoom).x;
        // hidden and other variables that may be associated
        for (var v in this.options.extent) {
            if (["width","height","left","right","top","bottom"].indexOf(v) < 0) {
                obj[v] = this.options.extent[v];
              }
        }
        return L.Util.template(this._template.template, obj);
    },
    _TCRSToPCRS: function(coords, zoom) {
      // TCRS pixel point to Projected CRS point (in meters, presumably)
      var map = this._map,
          crs = map.options.crs,
          loc = crs.transformation.untransform(coords,crs.scale(zoom));
          return loc;
    },
    _setUpExtentTemplateVars: function(template) {
      // process the inputs associated to template and create an object named
      // extent with member properties as follows:
      // {width: 'widthvarname', 
      //  height: 'heightvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'}

      var extentVarNames = {extent:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            select = (inputs[i].tagName.toLowerCase() === "map-select");
        if (type === "width") {
              extentVarNames.extent.width = name;
        } else if ( type === "height") {
              extentVarNames.extent.height = name;
        } else if (type === "location" && (units === "pcrs" || units ==="gcrs") ) {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
          switch (axis) {
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = name;
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = name;
                  }
              }
              break;
            case ('latitude'):
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  extentVarNames.extent.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  extentVarNames.extent.bottom = name;
                }
              }
              break;
          }
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          extentVarNames.extent[name] = function() {
              return parsedselect.value;
          };
        } else {
            /*jshint -W104 */
            const input = inputs[i];
            extentVarNames.extent[name] = function() {
                return input.getAttribute("value");
            };
        }
      }
      return extentVarNames;
    },
});
export var templatedImageLayer = function(template, options) {
    return new TemplatedImageLayer(template, options);
};