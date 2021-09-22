export var TemplatedImageLayer =  L.Layer.extend({
    initialize: function(template, options) {
        this._template = template;
        this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
        L.DomUtil.addClass(this._container, 'mapml-image-container');
        let inputData = M.extractInputBounds(template);
        this.zoomBounds = inputData.zoomBounds;
        this.layerBounds=inputData.bounds;
        this.isVisible = true;
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
        this._onMoveEnd();
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

    _onMoveEnd: function() {
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom && 
                        this.layerBounds.overlaps(mapBounds);
      if(!(this.isVisible)){
        this._clearLayer();
        return;
      }
      var map = this._map,
        loc = map.getPixelBounds().min.subtract(map.getPixelOrigin()),
        size = map.getSize(),
        src = this.getImageUrl(),
        overlayToRemove = this._imageOverlay;
        this._imageOverlay = M.imageOverlay(src,loc,size,0,this._container);
          
      this._imageOverlay.addTo(map);
      if (overlayToRemove) {
        this._imageOverlay.on('load error', function () {map.removeLayer(overlayToRemove);});
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
    getImageUrl: function() {
        var obj = {};
        obj[this.options.extent.width] = this._map.getSize().x;
        obj[this.options.extent.height] = this._map.getSize().y;
        obj[this.options.extent.bottom] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).y;
        obj[this.options.extent.left] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).x;
        obj[this.options.extent.top] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).y;
        obj[this.options.extent.right] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).x;
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