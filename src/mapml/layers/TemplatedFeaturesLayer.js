export var TemplatedFeaturesLayer =  L.Layer.extend({
  // this and M.ImageLayer could be merged or inherit from a common parent
    initialize: function(template, options) {
      let inputData = M.extractInputBounds(template);
      this.zoomBounds = inputData.zoomBounds;
      this.extentBounds=inputData.bounds;
      this.isVisible = true;
      this._template = template;
      this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
      L.extend(options, this.zoomBounds);
      L.DomUtil.addClass(this._container, 'mapml-features-container');
      delete options.opacity;
      L.setOptions(this, L.extend(options,this._setUpFeaturesTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._onMoveEnd
        };
        return events;
    },
    onAdd: function () {
      this._map._addZoomLimit(this);
      var mapml, headers = new Headers({'Accept': 'text/mapml'});
          var parser = new DOMParser(),
          opacity = this.options.opacity || 1,
          container = this._container,
          map = this._map;
      if (!this._features) {
        this._features = M.mapMlFeatures( null, {
          // pass the vector layer a renderer of its own, otherwise leaflet
          // puts everything into the overlayPane
          renderer: M.featureRenderer(),
          // pass the vector layer the container for the parent into which
          // it will append its own container for rendering into
          pane: container,
          opacity: opacity,
          projection:map.options.projection,
          static: true,
          onEachFeature: function(properties, geometry) {
            // need to parse as HTML to preserve semantics and styles
            var c = document.createElement('div');
            c.classList.add("mapml-popup-content");
            c.insertAdjacentHTML('afterbegin', properties.innerHTML);
            geometry.bindPopup(c, {autoClose: false, minWidth: 108});
          }
        });
      }
      // this was tricky...recursion alwasy breaks my brain
      var features = this._features,
          _pullFeatureFeed = function (url, limit) {
            return (fetch (url,{redirect: 'follow',headers: headers})
                    .then( function (response) {return response.text();})
                    .then( function (text) {
              mapml = parser.parseFromString(text,"application/xml");
              var base = (new URL(mapml.querySelector('map-base') ? mapml.querySelector('map-base').getAttribute('href') : url)).href;
              url = mapml.querySelector('map-link[rel=next]')? mapml.querySelector('map-link[rel=next]').getAttribute('href') : null;
              url =  url ? (new URL(url, base)).href: null;
              let nativeZoom = mapml.querySelector("map-meta[name=zoom]") &&
                +M.metaContentToObject(mapml.querySelector("map-meta[name=zoom]").getAttribute("content")).value || 0;
              let nativeCS = mapml.querySelector("map-meta[name=cs]") &&
                      M.metaContentToObject(mapml.querySelector("map-meta[name=cs]").getAttribute("content")).content || "GCRS";
              features.addData(mapml, nativeCS, nativeZoom);
              if (url && --limit) {
                return _pullFeatureFeed(url, limit);
              }
            }));
          };
      _pullFeatureFeed(this._getfeaturesUrl(), 10)
        .then(function() { 
              map.addLayer(features);
              map.fire('moveend');  // TODO: replace with moveend handler for layer and not entire map
        })
        .catch(function (error) { console.log(error);});
    },
    redraw: function() {
        this._onMoveEnd();
    },

    _onMoveEnd: function() {
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom && 
                        this.extentBounds.overlaps(mapBounds);
      
      this._features.clearLayers();
      if(!(this.isVisible)){
        return;
      }

      // TODO add preference with a bit less weight than that for text/mapml; 0.8 for application/geo+json; 0.6
      var mapml, headers = new Headers({'Accept': 'text/mapml;q=0.9,application/geo+json;q=0.8'}),
          parser = new DOMParser(),
          features = this._features,
          map = this._map,
          context = this,
          MAX_PAGES = 10,
        _pullFeatureFeed = function (url, limit) {
          return (fetch (url,{redirect: 'follow',headers: headers})
                  .then( function (response) {return response.text();})
                  .then( function (text) {
                    //TODO wrap this puppy in a try/catch/finally to parse application/geo+json if necessary
              mapml = parser.parseFromString(text,"application/xml");
              var base = (new URL(mapml.querySelector('map-base') ? mapml.querySelector('map-base').getAttribute('href') : url)).href;
              url = mapml.querySelector('map-link[rel=next]')? mapml.querySelector('map-link[rel=next]').getAttribute('href') : null;
              url =  url ? (new URL(url, base)).href: null;
              // TODO if the xml parser barfed but the response is application/geo+json, use the parent addData method
            let nativeZoom = mapml.querySelector("map-meta[name=zoom]") &&
                              +M.metaContentToObject(mapml.querySelector("map-meta[name=zoom]").getAttribute("content")).value || 0;
            let nativeCS = mapml.querySelector("map-meta[name=cs]") &&
                              M.metaContentToObject(mapml.querySelector("map-meta[name=cs]").getAttribute("content")).content || "GCRS";
            features.addData(mapml, nativeCS, nativeZoom);
            if (url && --limit) {
              return _pullFeatureFeed(url, limit);
            }
          }));
        };
      _pullFeatureFeed(this._getfeaturesUrl(), MAX_PAGES)
        .then(function() { 
          map.addLayer(features);
          map.fire("templatedfeatureslayeradd");
          M.TemplatedFeaturesLayer.prototype._updateTabIndex(context);
        })
        .catch(function (error) { console.log(error);});
    },
    setZIndex: function (zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();
        return this;
    },
    _updateTabIndex: function(context){
      let c = context || this;
      for(let layerNum in c._features._layers){
        let layer = c._features._layers[layerNum];
        if(layer._path){
          if(layer._path.getAttribute("d") !== "M0 0"){
            layer._path.setAttribute("tabindex", 0);
          } else {
            layer._path.removeAttribute("tabindex");
          }
          if(layer._path.childElementCount === 0) {
            let title = document.createElement("title");
            title.innerText = "Feature";
            layer._path.appendChild(title);
          }
        }
      }
    },
    _updateZIndex: function () {
        if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    onRemove: function () {
      this._map.removeLayer(this._features);
    },
    _getfeaturesUrl: function() {
        var obj = {};
        if (this.options.feature.zoom) {
          obj[this.options.feature.zoom] = this._map.getZoom();
        }
        if (this.options.feature.width) {
          obj[this.options.feature.width] = this._map.getSize().x;
        }
        if (this.options.feature.height) {
          obj[this.options.feature.height] = this._map.getSize().y;
        }
        if (this.options.feature.bottom) {
          obj[this.options.feature.bottom] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).y;
        }
        if (this.options.feature.left) {
          obj[this.options.feature.left] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).x;
        }
        if (this.options.feature.top) {
          obj[this.options.feature.top] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).y;
        }
        if (this.options.feature.right) {
          obj[this.options.feature.right] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).x;
        }
        // hidden and other variables that may be associated
        for (var v in this.options.feature) {
            if (["width","height","left","right","top","bottom","zoom"].indexOf(v) < 0) {
                obj[v] = this.options.feature[v];
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
    _setUpFeaturesTemplateVars: function(template) {
      // process the inputs and create an object named "extent"
      // with member properties as follows:
      // {width: {name: 'widthvarname'}, // value supplied by map if necessary
      //  height: {name: 'heightvarname'}, // value supplied by map if necessary
      //  left: {name: 'leftvarname', axis: 'leftaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  right: {name: 'rightvarname', axis: 'rightaxisname'}, // axis name (coordinate system of) drives the value supplied by the map
      //  top: {name: 'topvarname', axis: 'topaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  bottom: {name: 'bottomvarname', axis: 'bottomaxisname'} // axis name drives (coordinate system of) the value supplied by the map
      //  zoom: {name: 'zoomvarname'}
      //  hidden: [{name: name, value: value}]}

      var featuresVarNames = {feature:{}},
          inputs = template.values;
      featuresVarNames.feature.hidden = [];
      for (var i=0;i<inputs.length;i++) {
        // this can be removed when the spec removes the deprecated inputs...
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            value = inputs[i].getAttribute("value"),
            select = (inputs[i].tagName.toLowerCase() === "map-select");
        if (type === "width") {
              featuresVarNames.feature.width = name;
        } else if ( type === "height") {
              featuresVarNames.feature.height = name;
        } else if (type === "zoom") {
              featuresVarNames.feature.zoom = name;
        } else if (type === "location" && (units === "pcrs" || units ==="gcrs") ) {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting">
          switch (axis) {
            case ('x'):
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    featuresVarNames.feature.left = name;
                  } else if (position.match(/.*?-right/i)) {
                    featuresVarNames.feature.right = name;
                  }
              }
              break;
            case ('y'):
            case ('latitude'):
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  featuresVarNames.feature.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  featuresVarNames.feature.bottom = name;
                }
              }
              break;
          }
         } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          featuresVarNames.feature[name] = function() {
              return parsedselect.value;
          };
         // projection is deprecated, make it hidden
        } else {
            /*jshint -W104 */
            const input = inputs[i];
            featuresVarNames.feature[name] = function() {
                return input.getAttribute("value");
            };
        }
      }
      return featuresVarNames;
    }
});
export var templatedFeaturesLayer = function(template, options) {
    return new TemplatedFeaturesLayer(template, options);
};