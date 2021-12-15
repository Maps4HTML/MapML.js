import { FALLBACK_PROJECTION, BLANK_TT_TREF } from '../utils/Constants';

export var MapMLLayer = L.Layer.extend({
    // zIndex has to be set, for the case where the layer is added to the
    // map before the layercontrol is used to control it (where autoZindex is used)
    // e.g. in the raw MapML-Leaflet-Client index.html page.
    options: {
        maxNext: 10,
        zIndex: 0,
        maxZoom: 25
    },
    // initialize is executed before the layer is added to a map
    initialize: function (href, content, options) {
        // in the custom element, the attribute is actually 'src'
        // the _href version is the URL received from layer-@src
        var mapml;
        if (href) {
            this._href = href;
        }
        if (content) {
          this._layerEl = content;
          mapml = content.querySelector('map-feature,map-tile,map-extent') ? true : false;
          if (!href && mapml) {
              this._content = content;
          }
        }
        L.setOptions(this, options);
        this._container = L.DomUtil.create('div', 'leaflet-layer');
        L.DomUtil.addClass(this._container,'mapml-layer');
        this._imageContainer = L.DomUtil.create('div', 'leaflet-layer', this._container);
        L.DomUtil.addClass(this._imageContainer,'mapml-image-container');
        
        // this layer 'owns' a mapmlTileLayer, which is a subclass of L.GridLayer
        // it 'passes' what tiles to load via the content of this._mapmlTileContainer
        this._mapmlTileContainer = L.DomUtil.create('div', 'mapml-tile-container', this._container);
        // hit the service to determine what its extent might be
        // OR use the extent of the content provided

        if (!mapml && content && content.hasAttribute('label')) this._title = content.getAttribute('label');
        this._initCount = 0;
        this._initExtent(mapml ? content : null);
        
        // a default extent can't be correctly set without the map to provide
        // its bounds , projection, zoom range etc, so if that stuff's not
        // established by metadata in the content, we should use map properties
        // to set the extent, but the map won't be available until the <layer>
        // element is attached to the <map> element, wait for that to happen.
        this.on('attached', this._validateExtent, this );
        // weirdness.  options is actually undefined here, despite the hardcoded
        // options above. If you use this.options, you see the options defined
        // above.  Not going to change this, but failing to understand ATM.
        // may revisit some time.
        this.validProjection = true; 
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
    // remove all the extents before removing the layer from the map
    _removeExtents: function(map){
      if(this._extent._mapExtents){
        for(let i = 0; i < this._extent._mapExtents.length; i++){
          if(this._extent._mapExtents[i].templatedLayer){
            map.removeLayer(this._extent._mapExtents[i].templatedLayer);
          }
        }
      }
    },
    _changeOpacity: function(e) {
      if (e && e.target && e.target.value >=0 && e.target.value <= 1.0) {
        this.changeOpacity(e.target.value);
      }
    },
    changeOpacity: function(opacity) {
        this._container.style.opacity = opacity;
        if(this.opacityEl) this.opacityEl.value = opacity;
    },
    _changeExtentOpacity: function(e){
      if(e && e.target && e.target.value >=0 && e.target.value <= 1.0){
        this.templatedLayer.changeOpacity(e.target.value);
        this._templateVars.opacity = e.target.value;
      }
    },
    _changeExtent: function(e, extent) {
        if(e.target.checked){
          extent.checked = true;
              extent.templatedLayer = M.templatedLayer(extent._templateVars, 
                { pane: this._container,
                  _leafletLayer: this,
                  crs: extent.crs
                }).addTo(this._map);
                this._getCombinedExtentsLayerBounds();         
        } else {
            L.DomEvent.stopPropagation(e);
            extent.checked = false;
            this._map.removeLayer(extent.templatedLayer);
            this._getCombinedExtentsLayerBounds();
        }
    },

    // if there are multiple extents, find the combined layerbounds
    _getCombinedExtentsLayerBounds: function(){
      let bounds, zoomMax, zoomMin, maxNativeZoom, minNativeZoom;

      // get the bounds for each templateVars (need to get this again as value is being changed below - passed by ref)
      for(let i = 0; i < this._extent._mapExtents.length; i++){
        for(let j = 0; j < this._extent._mapExtents[i]._templateVars.length; j++){
          let inputData = M.extractInputBounds(this._extent._mapExtents[i]._templateVars[j]);
          this._extent._mapExtents[i]._templateVars[j].extentBounds = inputData.bounds;
          this._extent._mapExtents[i]._templateVars[j].extentZoomBounds = inputData.zoomBounds;
        }
      }

      for(let i = 0; i < this._extent._mapExtents.length; i++){
        if(this._extent._mapExtents[i].checked){
              for(let j = 0; j < this._extent._mapExtents[i]._templateVars.length; j++){
                if(!bounds){
                  bounds = this._extent._mapExtents[i]._templateVars[j].extentBounds;
                  zoomMax = this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.maxZoom;
                  zoomMin = this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.minZoom;
                  maxNativeZoom = this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.maxNativeZoom;
                  minNativeZoom = this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.minNativeZoom;
                } else {
                  bounds.extend(this._extent._mapExtents[i]._templateVars[j].extentBounds.min);
                  bounds.extend(this._extent._mapExtents[i]._templateVars[j].extentBounds.max);
                  zoomMax = Math.max(zoomMax, this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.maxZoom);
                  zoomMin = Math.min(zoomMin, this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.minZoom);
                  maxNativeZoom = Math.max(maxNativeZoom, this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.maxNativeZoom);
                  minNativeZoom = Math.min(minNativeZoom, this._extent._mapExtents[i]._templateVars[j].extentZoomBounds.minNativeZoom);
                }
              }
            }
          }
          this._extent.layerBounds = bounds;
          this._extent.zoomBounds = {minZoom: 0, maxZoom: 0, maxNativeZoom: 0, minNativeZoom: 0};
          this._extent.zoomBounds.maxZoom = zoomMax;
          this._extent.zoomBounds.minZoom = zoomMin;
          this._extent.zoomBounds.minNativeZoom = minNativeZoom;
          this._extent.zoomBounds.maxNativeZoom = maxNativeZoom;
          if(bounds){
            //assigns the formatted extent object to .extent and spreads the zoom ranges to .extent also
            this._layerEl.extent = (Object.assign(
                                      M.convertAndFormatPCRS(bounds,this._map),
                                      {zoom:this._extent.zoomBounds}));
          }

          // assign each template the layer and zoom bounds
          for(let i = 0; i < this._extent._mapExtents.length; i++){
            this._extent._mapExtents[i].templatedLayer.layerBounds = bounds;
            this._extent._mapExtents[i].templatedLayer.zoomBounds = this._extent.zoomBounds;
          }
      },

    onAdd: function (map) {
        if((this._extent || this._extent_mapExtents) && !this._validProjection(map)){
          this.validProjection = false;
          return;
        }
        this._map = map;
        if(this._content){
          if (!this._mapmlvectors) {
            this._mapmlvectors = M.mapMlFeatures(this._content, {
              // pass the vector layer a renderer of its own, otherwise leaflet
              // puts everything into the overlayPane
              renderer: M.featureRenderer(),
              // pass the vector layer the container for the parent into which
              // it will append its own container for rendering into
              pane: this._container,
              opacity: this.options.opacity,
              projection:map.options.projection,
              // each owned child layer gets a reference to the root layer
              _leafletLayer: this,
              static: true,
              onEachFeature: function(properties, geometry) {
                // need to parse as HTML to preserve semantics and styles
                if (properties) {
                  var c = document.createElement('div');
                  c.classList.add("mapml-popup-content");
                  c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                  geometry.bindPopup(c, {autoClose: false, minWidth: 165});
                }
              }
            });
          }
          map.addLayer(this._mapmlvectors);
        } else {
          this.once('extentload', function() {
            if(!this._validProjection(map)){
              this.validProjection = false;
              return;
            }
            if (!this._mapmlvectors) {
              this._mapmlvectors = M.mapMlFeatures(this._content, {
                  // pass the vector layer a renderer of its own, otherwise leaflet
                  // puts everything into the overlayPane
                  renderer: M.featureRenderer(),
                  // pass the vector layer the container for the parent into which
                  // it will append its own container for rendering into
                  pane: this._container,
                  opacity: this.options.opacity,
                  projection:map.options.projection,
                  // each owned child layer gets a reference to the root layer
                  _leafletLayer: this,
                  static: true,
                  onEachFeature: function(properties, geometry) {
                    // need to parse as HTML to preserve semantics and styles
                    if (properties) {
                      var c = document.createElement('div');
                      c.classList.add("mapml-popup-content");
                      c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                      geometry.bindPopup(c, {autoClose: false, minWidth: 165});
                    }
                  }
                }).addTo(map);
            }
            this._setLayerElExtent();
          },this);
        }
        
        
        
        if (!this._imageLayer) {
            this._imageLayer = L.layerGroup();
        }
        map.addLayer(this._imageLayer);
        // the layer._imageContainer property contains an element in which
        // content will be maintained
        
        //only add the layer if there are tiles to be rendered
        if((!this._staticTileLayer || this._staticTileLayer._container === null) && 
          this._mapmlTileContainer.getElementsByTagName("map-tiles").length > 0)
        {
          this._staticTileLayer = M.mapMLStaticTileLayer({
            pane:this._container,
            _leafletLayer: this,
            className:"mapml-static-tile-layer",
            tileContainer:this._mapmlTileContainer,
            maxZoomBound:map.options.crs.options.resolutions.length - 1,
            tileSize: map.options.crs.options.crs.tile.bounds.max.x,
          });
          map.addLayer(this._staticTileLayer);
        }

        // if the extent has been initialized and received, update the map,
        if (this._extent && this._extent._mapExtents && this._extent._mapExtents[0]._templateVars) {
          for(let i = 0; i < this._extent._mapExtents.length; i++){
            if (this._extent._mapExtents[i]._templateVars && this._extent._mapExtents[i].checked) {
              this._templatedLayer = M.templatedLayer(this._extent._mapExtents[i]._templateVars, 
                { pane: this._container,
                  _leafletLayer: this,
                  crs: this._extent.crs,
                  }).addTo(map);   
                  this._extent._mapExtents[i].templatedLayer = this._templatedLayer;
                  if(this._templatedLayer._queries){
                    if(!this._extent._queries) this._extent._queries = [];
                    this._extent._queries = this._extent._queries.concat(this._templatedLayer._queries);
                  }
            }
           }
          this._getCombinedExtentsLayerBounds();
        } else {
            this.once('extentload', function() {
                if(!this._validProjection(map)){
                  this.validProjection = false;
                  return;
                }
                if(this._extent && this._extent._mapExtents){
                  for(let i = 0; i < this._extent._mapExtents.length; i++){
                    if (this._extent._mapExtents[i]._templateVars) { 
                      this._templatedLayer = M.templatedLayer(this._extent._mapExtents[i]._templateVars, 
                      { pane: this._container,
                        _leafletLayer: this,
                        crs: this._extent.crs
                      }).addTo(map);
                      this._extent._mapExtents[i].templatedLayer = this._templatedLayer;
                      this._getCombinedExtentsLayerBounds();
                    }
                  }
                } 
              }, this);
        }
        this._setLayerElExtent();
        this.setZIndex(this.options.zIndex);
        this.getPane().appendChild(this._container);
        setTimeout(() => {
          map.fire('checkdisabled');
        }, 0);
        map.on("popupopen", this._attachSkipButtons, this);
    },


    _validProjection : function(map){
      let noLayer = false;
      if(this._extent._mapExtents){
        for(let i = 0; i < this._extent._mapExtents.length; i++){
          if(this._extent._mapExtents[i]._templateVars){
            for(let template of this._extent._mapExtents[i]._templateVars)
              if(!template.projectionMatch && template.projection !== map.options.projection) {
                noLayer = true; // if there's a single template where projections don't match, set noLayer to true
                break;
              } 
            }
      }
    }
      return !(noLayer || this.getProjection() !== map.options.projection.toUpperCase());
    },

    //sets the <layer-> elements .bounds property 
    _setLayerElExtent: function(){
      let localBounds, localZoomRanges;
      let layerTypes = ["_staticTileLayer","_imageLayer","_mapmlvectors"];
      layerTypes.forEach((type) =>{
        if(this[type]){
            if(this[type].layerBounds){
              if(!localBounds){
                localBounds = this[type].layerBounds;
                localZoomRanges = this[type].zoomBounds;
              } else{
                localBounds.extend(this[type].layerBounds.min);
                localBounds.extend(this[type].layerBounds.max);
              }
            } 
          
          }       
      });

      if(localBounds){
        //assigns the formatted extent object to .extent and spreads the zoom ranges to .extent also
        this._layerEl.extent = (Object.assign(
                                  M.convertAndFormatPCRS(localBounds,this._map),
                                  {zoom:localZoomRanges}));
      }
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    getEvents: function () {
        return {zoomanim: this._onZoomAnim};
    },
    redraw: function() {
      // for now, only redraw templated layers.
        if (this._extent._mapExtents) {
          for(let i = 0; i < this._extent._mapExtents.length; i++){
            if(this._extent._mapExtents[i].templatedLayer){
              this._extent._mapExtents[i].templatedLayer.redraw();
            }
          }
        }
    },
    _onZoomAnim: function(e) {
      // get the min and max zooms from all extents
      var toZoom = e.zoom,
          zoom = (this._extent && this._extent._mapExtents) ? this._extent._mapExtents[0].querySelector("map-input[type=zoom]") : null,
          min = zoom && zoom.hasAttribute("min") ? parseInt(zoom.getAttribute("min")) : this._map.getMinZoom(),
          max =  zoom && zoom.hasAttribute("max") ? parseInt(zoom.getAttribute("max")) : this._map.getMaxZoom();
      if(zoom){
        for(let i = 1; i < this._extent._mapExtents.length; i++){
          zoom = this._extent._mapExtents[i].querySelector("map-input[type=zoom]");
          if(zoom && zoom.hasAttribute("min")) { min = Math.min(parseInt(zoom.getAttribute("min")), min); }
          if(zoom && zoom.hasAttribute("max")){ max = Math.max(parseInt(zoom.getAttribute("max")), max); }
        }
      }
      var canZoom = (toZoom < min && this._extent.zoomout) || (toZoom > max && this._extent.zoomin);
      if (!(min <= toZoom && toZoom <= max)){
        if (this._extent.zoomin && toZoom > max) {
          // this._href is the 'original' url from which this layer came
          // since we are following a zoom link we will be getting a new
          // layer almost, resetting child content as appropriate
          this._href = this._extent.zoomin;
          this._layerEl.src = this._extent.zoomin;
          // this.href is the "public" property. When a dynamic layer is
          // accessed, this value changes with every new extent received
          this.href = this._extent.zoomin;
          this._layerEl.src = this._extent.zoomin;
        } else if (this._extent.zoomout && toZoom < min) {
          this._href = this._extent.zoomout;
          this.href = this._extent.zoomout;
          this._layerEl.src = this._extent.zoomout;
        }
      }
      if (this._templatedLayer && canZoom ) {
        // get the new extent
        //this._initExtent();
      }
    },
    onRemove: function (map) {
        L.DomUtil.remove(this._container);
        if(this._staticTileLayer) map.removeLayer(this._staticTileLayer);
        if(this._mapmlvectors) map.removeLayer(this._mapmlvectors);
        if(this._imageLayer) map.removeLayer(this._imageLayer);
        if (this._extent && this._extent._mapExtents) this._removeExtents(map);

        map.fire("checkdisabled");
        map.off("popupopen", this._attachSkipButtons);
    },
    getZoomBounds: function () {
        var ext = this._extent;
        var zoom = ext ? ext.querySelector('[type=zoom]') : undefined,
            min = zoom && zoom.hasAttribute('min') ? zoom.getAttribute('min') : this._map.getMinZoom(),
            max = zoom && zoom.hasAttribute('max') ? zoom.getAttribute('max') : this._map.getMaxZoom();
        var bounds = {};
        bounds.min = Math.min(min,max);
        bounds.max = Math.max(min,max);
        return bounds;
    },
    _transformDeprectatedInput: function (i) {
      var type = i.getAttribute("type").toLowerCase();
      if (type === "xmin" || type === "ymin" || type === "xmax" || type === "ymax") {
        i.setAttribute("type", "location");
        i.setAttribute("units","tcrs");
        switch (type) {
          case "xmin":
            i.setAttribute("axis","x");
            i.setAttribute("position","top-left");
            break;
          case "ymin":
            i.setAttribute("axis","y");
            i.setAttribute("position","top-left");
            break;
          case "xmax":
            i.setAttribute("axis","x");
            i.setAttribute("position","bottom-right");
            break;
          case "ymax":
            i.setAttribute("axis","y");
            i.setAttribute("position","bottom-right");
            break;
        }
      } 
    },
    // retrieve the (projected, scaled) layer extent for the current map zoom level
    getLayerExtentBounds: function(map) {
        
        if (!this._extent) return;
        var zoom = map.getZoom(), projection = map.options.projection,
            ep = this._extent.getAttribute("units"),
            projecting = (projection !== ep),
            p;
        
        var xmin,ymin,xmax,ymax,v1,v2,extentZoomValue;
        
        // todo: create an array of min values, converted to tcrs units
        // take the Math.min of all of them.
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('min');
        xmin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('max');
        xmax = Math.max(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('min');
        ymin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('max');
        ymax = Math.max(v1,v2);
        // WGS84 can be converted to Tiled CRS units
        if (projecting) {
            //project and scale to M[projection] from WGS84
            p = M[projection];
            var corners = [
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom),
              p.latLngToPoint(L.latLng([ymax,xmax]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmax]),zoom)
            ];
            return L.bounds(corners);
        } else {
            // if the zoom level of the extent does not match that of the map
            extentZoomValue = parseInt(this._extent.querySelector('[type=zoom]').getAttribute('value'));
            if (extentZoomValue !== zoom) {
                // convert the extent bounds to corresponding bounds at the current map zoom
                p = M[projection];
                return L.bounds(
                    p.latLngToPoint(p.pointToLatLng(L.point(xmin,ymin),extentZoomValue),zoom),
                    p.latLngToPoint(p.pointToLatLng(L.point(xmax,ymax),extentZoomValue),zoom));
            } else {
                // the extent's zoom value === map.getZoom(), return the bounds
                return L.bounds(L.point(xmin,ymin), L.point(xmax,ymax));
            }
        }
    },
    getAttribution: function () {
        return this.options.attribution;
    },

    getLayerExtentHTML: function (labelName, i) {
      var extent = L.DomUtil.create('fieldset', 'mapml-layer-extent'),
        extentProperties = L.DomUtil.create('div', 'mapml-layer-item-properties', extent),
        extentSettings = L.DomUtil.create('div', 'mapml-layer-item-settings', extent),
        extentLabel = L.DomUtil.create('label', 'mapml-layer-item-toggle', extentProperties),
        input = L.DomUtil.create('input'),
        svgExtentControlIcon = L.SVG.create('svg'),
        extentControlPath1 = L.SVG.create('path'),
        extentControlPath2 = L.SVG.create('path'),
        extentNameIcon = L.DomUtil.create('span'),
        extentItemControls = L.DomUtil.create('div', 'mapml-layer-item-controls', extentProperties),
        opacityControl = L.DomUtil.create('details', 'mapml-layer-item-opacity', extentSettings),
        extentOpacitySummary = L.DomUtil.create('summary', '', opacityControl),
        opacity = L.DomUtil.create('input', '', opacityControl);
        extentSettings.hidden = true;

        // append the svg paths
        svgExtentControlIcon.setAttribute('viewBox', '0 0 24 24');
        svgExtentControlIcon.setAttribute('height', '22');
        svgExtentControlIcon.setAttribute('width', '22');
        extentControlPath1.setAttribute('d', 'M0 0h24v24H0z');
        extentControlPath1.setAttribute('fill', 'none');
        extentControlPath2.setAttribute('d', 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z');
        svgExtentControlIcon.appendChild(extentControlPath1);
        svgExtentControlIcon.appendChild(extentControlPath2);

        let removeExtentButton = L.DomUtil.create('button', 'mapml-layer-item-remove-control', extentItemControls);
        removeExtentButton.type = 'button';
        removeExtentButton.title = 'Remove Sub Layer';
        removeExtentButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
        removeExtentButton.classList.add('mapml-button');
        L.DomEvent.on(removeExtentButton, 'click', L.DomEvent.stop);
        L.DomEvent.on(removeExtentButton, 'click', (e)=>{
          e.target.checked = false;
          this._changeExtent(e, this._extent._mapExtents[i]);
          this._extent._mapExtents[i].extentAnatomy.parentNode.removeChild(this._extent._mapExtents[i].extentAnatomy);
          //this._extent._mapExtents.splice(i, 1);
          // remove events
        }, this);

        let extentsettingsButton = L.DomUtil.create('button', 'mapml-layer-item-settings-control', extentItemControls);
        extentsettingsButton.type = 'button';
        extentsettingsButton.title = 'Extent Settings';
        extentsettingsButton.setAttribute('aria-expanded', false);
        extentsettingsButton.classList.add('mapml-button');
        L.DomEvent.on(extentsettingsButton, 'click', (e)=>{
          if(extentSettings.hidden == true){
            extentsettingsButton.setAttribute('aria-expanded', true);
            extentSettings.hidden = false;
          } else {
            extentsettingsButton.setAttribute('aria-expanded', false);
            extentSettings.hidden = true;
          }
        }, this);

        extentNameIcon.setAttribute('aria-hidden', true);
        extentLabel.appendChild(input);
        extentsettingsButton.appendChild(extentNameIcon);
        extentNameIcon.appendChild(svgExtentControlIcon);
        extentOpacitySummary.innerText = 'Opacity';
        extentOpacitySummary.id = 'mapml-layer-item-opacity-' + L.stamp(extentOpacitySummary);
        opacity.setAttribute('type','range');
        opacity.setAttribute('min', '0');
        opacity.setAttribute('max','1.0');
        opacity.setAttribute('value', this._extent._mapExtents[i]._templateVars.opacity || '1.0');
        opacity.setAttribute('step','0.1');
        opacity.setAttribute('aria-labelledby', 'mapml-layer-item-opacity-' + L.stamp(extentOpacitySummary));
        this._extent._mapExtents[i]._templateVars.opacity = this._extent._mapExtents[i]._templateVars.opacity || '1.0';
        L.DomEvent.on(opacity, 'change', this._changeExtentOpacity, this._extent._mapExtents[i]);

        var extentItemNameSpan = L.DomUtil.create('span', 'mapml-layer-item-name', extentLabel);
        input.defaultChecked = this._extent._mapExtents[i] ? true: false;
        this._extent._mapExtents[i].checked = input.defaultChecked;
        input.type = 'checkbox';
        extentItemNameSpan.innerHTML = labelName;
        L.DomEvent.on(input, 'change', (e)=>{
          this._changeExtent(e, this._extent._mapExtents[i]);
        });
        extentItemNameSpan.id = 'mapml-extent-item-name-{' + L.stamp(extentItemNameSpan) + '}';
        extent.setAttribute('aria-labelledby', extentItemNameSpan.id);
        return extent;
    },

    getLayerUserControlsHTML: function () {
      var fieldset = L.DomUtil.create('fieldset', 'mapml-layer-item'),
        input = L.DomUtil.create('input'),
        layerItemName = L.DomUtil.create('span', 'mapml-layer-item-name'),
        settingsButtonNameIcon = L.DomUtil.create('span'),
        layerItemProperty = L.DomUtil.create('div', 'mapml-layer-item-properties', fieldset),
        layerItemSettings = L.DomUtil.create('div', 'mapml-layer-item-settings', fieldset),
        itemToggleLabel = L.DomUtil.create('label', 'mapml-layer-item-toggle', layerItemProperty),
        layerItemControls = L.DomUtil.create('div', 'mapml-layer-item-controls', layerItemProperty),
        opacityControl = L.DomUtil.create('details', 'mapml-layer-item-opacity mapml-control-layers', layerItemSettings),
        opacity = L.DomUtil.create('input'),
        opacityControlSummary = L.DomUtil.create('summary'),
        svgSettingsControlIcon = L.SVG.create('svg'),
        settingsControlPath1 = L.SVG.create('path'),
        settingsControlPath2 = L.SVG.create('path'),
        mapEl = this._layerEl.parentNode;
        this.opacityEl = opacity;

        // append the paths in svg for the remove layer and toggle icons
        svgSettingsControlIcon.setAttribute('viewBox', '0 0 24 24');
        svgSettingsControlIcon.setAttribute('height', '22');
        svgSettingsControlIcon.setAttribute('width', '22');
        settingsControlPath1.setAttribute('d', 'M0 0h24v24H0z');
        settingsControlPath1.setAttribute('fill', 'none');
        settingsControlPath2.setAttribute('d', 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z');
        svgSettingsControlIcon.appendChild(settingsControlPath1);
        svgSettingsControlIcon.appendChild(settingsControlPath2);
        
        layerItemSettings.hidden = true;
        settingsButtonNameIcon.setAttribute('aria-hidden', true);
        
        let removeControlButton = L.DomUtil.create('button', 'mapml-layer-item-remove-control', layerItemControls);
        removeControlButton.type = 'button';
        removeControlButton.title = 'Remove Layer';
        removeControlButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
        removeControlButton.classList.add('mapml-button');
        //L.DomEvent.disableClickPropagation(removeControlButton);
        L.DomEvent.on(removeControlButton, 'click', L.DomEvent.stop);
        L.DomEvent.on(removeControlButton, 'click', (e)=>{
          let fieldset = 0, elem, root;
          root = mapEl.tagName === "MAPML-VIEWER" ? mapEl.shadowRoot : mapEl.querySelector(".mapml-web-map").shadowRoot;
          if(e.target.closest("fieldset").nextElementSibling && !e.target.closest("fieldset").nextElementSibling.disbaled){
            elem = e.target.closest("fieldset").previousElementSibling;
            while(elem){
              fieldset += 2; // find the next layer menu item
              elem = elem.previousElementSibling;
            }
          } else {
            // focus on the link
            elem = "link";
          }
          mapEl.removeChild(e.target.closest("fieldset").querySelector("span").layer._layerEl);
          elem = elem ? root.querySelector(".leaflet-control-attribution").firstElementChild: elem = root.querySelectorAll('input')[fieldset];
          elem.focus();
        }, this);

        let itemSettingControlButton = L.DomUtil.create('button', 'mapml-layer-item-settings-control', layerItemControls);
        itemSettingControlButton.type = 'button';
        itemSettingControlButton.title = 'Layer Settings';
        itemSettingControlButton.setAttribute('aria-expanded', false);
        itemSettingControlButton.classList.add('mapml-button');
        L.DomEvent.on(itemSettingControlButton, 'click', (e)=>{
          if(layerItemSettings.hidden == true){
            itemSettingControlButton.setAttribute('aria-expanded', true);
            layerItemSettings.hidden = false;
          } else {
            itemSettingControlButton.setAttribute('aria-expanded', false);
            layerItemSettings.hidden = true;
          }
        }, this);

        input.defaultChecked = this._map ? true: false;
        input.type = 'checkbox';
        layerItemName.layer = this;

        if (this._legendUrl) {
          var legendLink = document.createElement('a');
          legendLink.text = ' ' + this._title;
          legendLink.href = this._legendUrl;
          legendLink.target = '_blank';
          legendLink.draggable = false;
          layerItemName.appendChild(legendLink);
        } else {
          layerItemName.innerHTML = this._title;
        }
        layerItemName.id = 'mapml-layer-item-name-{' + L.stamp(layerItemName) + '}';
        opacityControlSummary.innerText = 'Opacity';
        opacityControlSummary.id = 'mapml-layer-item-opacity-' + L.stamp(opacityControlSummary);
        opacityControl.appendChild(opacityControlSummary);
        opacityControl.appendChild(opacity);
        opacity.setAttribute('type','range');
        opacity.setAttribute('min', '0');
        opacity.setAttribute('max','1.0');
        opacity.setAttribute('value', this._container.style.opacity || '1.0');
        opacity.setAttribute('step','0.1');
        opacity.setAttribute('aria-labelledby', opacityControlSummary.id);
        opacity.value = this._container.style.opacity || '1.0';

        fieldset.setAttribute("aria-grabbed", "false");
        fieldset.setAttribute('aria-labelledby', layerItemName.id);

        fieldset.onmousedown = (downEvent) => {
          if(downEvent.target.tagName.toLowerCase() === "input" || downEvent.target.tagName.toLowerCase() === "select") return;
          downEvent.preventDefault();
          let control = fieldset,
              controls = fieldset.parentNode,
              moving = false, yPos = downEvent.clientY;

          document.body.onmousemove = (moveEvent) => {
            moveEvent.preventDefault();

            // Fixes flickering by only moving element when there is enough space
            let offset = moveEvent.clientY - yPos;
            moving = Math.abs(offset) > 5 || moving;
            if( (controls && !moving) || (controls && controls.childElementCount <= 1) || 
                controls.getBoundingClientRect().top > control.getBoundingClientRect().bottom || 
                controls.getBoundingClientRect().bottom < control.getBoundingClientRect().top){
                  return;
                }
            
            controls.classList.add("mapml-draggable");
            control.style.transform = "translateY("+ offset +"px)";
            control.style.pointerEvents = "none";

            let x = moveEvent.clientX, y = moveEvent.clientY,
                root = mapEl.tagName === "MAPML-VIEWER" ? mapEl.shadowRoot : mapEl.querySelector(".mapml-web-map").shadowRoot,
                elementAt = root.elementFromPoint(x, y),
                swapControl = !elementAt || !elementAt.closest("fieldset") ? control : elementAt.closest("fieldset");
      
            swapControl =  Math.abs(offset) <= swapControl.offsetHeight ? control : swapControl;
            
            control.setAttribute("aria-grabbed", 'true');
            control.setAttribute("aria-dropeffect", "move");
            if(swapControl && controls === swapControl.parentNode){
              swapControl = swapControl !== control.nextSibling? swapControl : swapControl.nextSibling;
              if(control !== swapControl){ 
                yPos = moveEvent.clientY;
                control.style.transform = null;
              }
              controls.insertBefore(control, swapControl);
            }
          };

          document.body.onmouseup = () => {
            control.setAttribute("aria-grabbed", "false");
            control.removeAttribute("aria-dropeffect");
            control.style.pointerEvents = null;
            control.style.transform = null;
            let controlsElems = controls.children,
                zIndex = 1;
            for(let c of controlsElems){
              let layerEl = c.querySelector("span").layer._layerEl;
              
              layerEl.setAttribute("data-moving","");
              mapEl.insertAdjacentElement("beforeend", layerEl);
              layerEl.removeAttribute("data-moving");

              
              layerEl._layer.setZIndex(zIndex);
              zIndex++;
            }
            controls.classList.remove("mapml-draggable");
            document.body.onmousemove = document.body.onmouseup = null;
          };
        };

        L.DomEvent.on(opacity,'change', this._changeOpacity, this);

        itemToggleLabel.appendChild(input);
        itemToggleLabel.appendChild(layerItemName);
        itemSettingControlButton.appendChild(settingsButtonNameIcon);
        settingsButtonNameIcon.appendChild(svgSettingsControlIcon);

        if (this._styles) {
          layerItemSettings.appendChild(this._styles);
        }

        if (this._userInputs) {
          var frag = document.createDocumentFragment();
          var templates = this._extent._templateVars;
          if (templates) {
            for (var i=0;i<templates.length;i++) {
              var template = templates[i];
              for (var j=0;j<template.values.length;j++) {
                var mapmlInput = template.values[j],
                    id = '#'+mapmlInput.getAttribute('id');
                // don't add it again if it is referenced > once
                if (mapmlInput.tagName.toLowerCase() === 'map-select' && !frag.querySelector(id)) {
                  // generate a <details><summary></summary><select...></details>
                  var selectdetails = L.DomUtil.create('details', 'mapml-layer-item-time mapml-control-layers', frag),
                      selectsummary = L.DomUtil.create('summary'),
                      selectSummaryLabel = L.DomUtil.create('label');
                      selectSummaryLabel.innerText = mapmlInput.getAttribute('name');
                      selectSummaryLabel.setAttribute('for', mapmlInput.getAttribute('id'));
                      selectsummary.appendChild(selectSummaryLabel);
                      selectdetails.appendChild(selectsummary);
                      selectdetails.appendChild(mapmlInput.htmlselect);
                }
              }
            }
          }
          layerItemSettings.appendChild(frag);
        }

        // if there are extents, add them to the layer control
        if(this._extent && this._extent._mapExtents) {
          var extentsFieldset = L.DomUtil.create('fieldset', 'mapml-layer-grouped-extents');
          extentsFieldset.setAttribute('aria-label', 'Sublayers');
          for(let j=0; j < this._extent._mapExtents.length; j++) {
            extentsFieldset.appendChild(this._extent._mapExtents[j].extentAnatomy);
          }
          layerItemSettings.appendChild(extentsFieldset);
        }

        return fieldset;
    },
    _initExtent: function(content) {
        if (!this._href && !content) {return;}
        var layer = this;
        // the this._href (comes from layer@src) should take precedence over 
        // content of the <layer> element, but if no this._href / src is provided
        // but there *is* child content of the <layer> element (which is copied/
        // referred to by this._content), we should use that content.
        if (this._href) {
            var xhr = new XMLHttpRequest();
//            xhr.withCredentials = true;
            _get(this._href, _processInitialExtent);
        } else if (content) {
            // may not set this._extent if it can't be done from the content
            // (eg a single point) and there's no map to provide a default yet
            _processInitialExtent.call(this, content);
        }
        function _get(url, fCallback  ) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              layer.error = true;
              layer.fire('extentload', layer, true);
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        }
        function transcribe(element) {
            var select = document.createElement("select");
            var elementAttrNames = element.getAttributeNames();

            for(let i = 0; i < elementAttrNames.length; i++){
                select.setAttribute(elementAttrNames[i], element.getAttribute(elementAttrNames[i]));
            }

            var options = element.children;

            for(let i = 0; i < options.length; i++){
                var option = document.createElement("option");
                var optionAttrNames = options[i].getAttributeNames();

                for (let j = 0; j < optionAttrNames.length; j++){
                    option.setAttribute(optionAttrNames[j], options[i].getAttribute(optionAttrNames[j]));
                }

                option.innerHTML = options[i].innerHTML;
                select.appendChild(option);
            }
            return select;
        }

        function _initTemplateVars(serverExtent, metaExtent, projection, mapml, base, projectionMatch){
          var templateVars = [];
          // set up the URL template and associated inputs (which yield variable values when processed)
          var tlist = serverExtent.querySelectorAll('map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]'),
              varNamesRe = (new RegExp('(?:\{)(.*?)(?:\})','g')),
              zoomInput = serverExtent.querySelector('map-input[type="zoom" i]'),
              includesZoom = false, extentFallback = {};

          extentFallback.zoom = 0;
          if (metaExtent){
            let content = M.metaContentToObject(metaExtent.getAttribute("content")), cs;
            
            extentFallback.zoom = content.zoom || extentFallback.zoom;

            let metaKeys = Object.keys(content);
            for(let i =0;i<metaKeys.length;i++){
              if(!metaKeys[i].includes("zoom")){
                cs = M.axisToCS(metaKeys[i].split("-")[2]);
                break;
              }
            }
            let axes = M.csToAxes(cs);
            extentFallback.bounds = M.boundsToPCRSBounds(
              L.bounds(L.point(+content[`top-left-${axes[0]}`],+content[`top-left-${axes[1]}`]),
              L.point(+content[`bottom-right-${axes[0]}`],+content[`bottom-right-${axes[1]}`])),
              extentFallback.zoom, projection, cs);
            
          } else {
            extentFallback.bounds = M[projection].options.crs.pcrs.bounds;
          }
            
          for (var i=0;i< tlist.length;i++) {
            var t = tlist[i], template = t.getAttribute('tref'); 
            if(!template){
              template = BLANK_TT_TREF;
              let blankInputs = mapml.querySelectorAll('map-input');
              for (let i of blankInputs){
                template += `{${i.getAttribute("name")}}`;
              }
            }
            
            var v,
                title = t.hasAttribute('title') ? t.getAttribute('title') : 'Query this layer',
                vcount=template.match(varNamesRe),
                trel = (!t.hasAttribute('rel') || t.getAttribute('rel').toLowerCase() === 'tile') ? 'tile' : t.getAttribute('rel').toLowerCase(),
                ttype = (!t.hasAttribute('type')? 'image/*':t.getAttribute('type').toLowerCase()),
                inputs = [],
                tms = t && t.hasAttribute("tms");
                var zoomBounds = mapml.querySelector('map-meta[name=zoom]')?
                                  M.metaContentToObject(mapml.querySelector('map-meta[name=zoom]').getAttribute('content')):
                                  undefined;
            while ((v = varNamesRe.exec(template)) !== null) {
              var varName = v[1],
                  inp = serverExtent.querySelector('map-input[name='+varName+'],map-select[name='+varName+']');
              if (inp) {

                if ((inp.hasAttribute("type") && inp.getAttribute("type")==="location") && 
                    (!inp.hasAttribute("min" || !inp.hasAttribute("max"))) && 
                    (inp.hasAttribute("axis") && !["i","j"].includes(inp.getAttribute("axis").toLowerCase()))){
                  zoomInput.setAttribute("value", extentFallback.zoom);
                  
                  let axis = inp.getAttribute("axis"), 
                      axisBounds = M.convertPCRSBounds(extentFallback.bounds, extentFallback.zoom, projection, M.axisToCS(axis));
                  inp.setAttribute("min", axisBounds.min[M.axisToXY(axis)]);
                  inp.setAttribute("max", axisBounds.max[M.axisToXY(axis)]);
                }

                inputs.push(inp);
                includesZoom = includesZoom || inp.hasAttribute("type") && inp.getAttribute("type").toLowerCase() === "zoom";
                if (inp.hasAttribute('shard')) {
                  var id = inp.getAttribute('list');
                  inp.servers = [];
                  var servers = serverExtent.querySelectorAll('map-datalist#'+id + ' > map-option');
                  if (servers.length === 0 && inp.hasAttribute('value')) {
                    servers = inp.getAttribute('value').split('');
                  }
                  for (var s=0;s < servers.length;s++) {
                    if (servers[s].getAttribute) {
                      inp.servers.push(servers[s].getAttribute('value'));
                    } else {
                      inp.servers.push(servers[s]);
                    }
                  }
                } else if (inp.tagName.toLowerCase() === 'map-select') {
                  // use a throwaway div to parse the input from MapML into HTML
                  var div =document.createElement("div");
                  div.insertAdjacentHTML("afterbegin",inp.outerHTML);
                  // parse
                  inp.htmlselect = div.querySelector("map-select");
                  inp.htmlselect = transcribe(inp.htmlselect);

                  // this goes into the layer control, so add a listener
                  L.DomEvent.on(inp.htmlselect, 'change', layer.redraw, layer);
                  if (!layer._userInputs) {
                    layer._userInputs = [];
                  }
                  layer._userInputs.push(inp.htmlselect);
                }
                // TODO: if this is an input@type=location 
                // get the TCRS min,max attribute values at the identified zoom level 
                // save this information as properties of the serverExtent,
                // perhaps as a bounds object so that it can be easily used
                // later by the layer control to determine when to enable
                // disable the layer for drawing.
              } else {
                console.log('input with name='+varName+' not found for template variable of same name');
                // no match found, template won't be used
                break;
              }
            }
            if (template && vcount.length === inputs.length || template === BLANK_TT_TREF) {
              if (trel === 'query') {
                layer.queryable = true;
              }
              if(!includesZoom && zoomInput) {
                inputs.push(zoomInput);
              }
              // template has a matching input for every variable reference {varref}
              templateVars.push({
                template:decodeURI(new URL(template, base)), 
                linkEl: t,
                title:title, 
                rel: trel, 
                type: ttype, 
                values: inputs, 
                zoomBounds:zoomBounds, 
                projectionMatch: projectionMatch,
                projection:serverExtent.getAttribute("units") || FALLBACK_PROJECTION,
                tms:tms,
              });
            }
          }
          return templateVars;
        }

        function _processInitialExtent(content) {
          //TODO: include inline extents
            var mapml = this.responseXML || content;
            if(mapml.querySelector && mapml.querySelector('map-feature'))layer._content = mapml;
            if(!this.responseXML && this.responseText) mapml = new DOMParser().parseFromString(this.responseText,'text/xml');
            if (this.readyState === this.DONE && mapml.querySelector && !mapml.querySelector("parsererror")) {
                var serverExtent = mapml.querySelectorAll('map-extent'), projection, projectionMatch, serverMeta;
                    
                
                if(!serverExtent.length){
                  serverMeta = mapml.querySelector('map-meta[name=projection]');
                }

                // check whether all map-extent elements have the same units
                if(serverExtent.length >= 1){
                  for(let i = 0; i < serverExtent.length; i++){
                    if (serverExtent[i].tagName.toLowerCase() === "map-extent" && serverExtent[i].hasAttribute('units')){
                      projection = serverExtent[i].getAttribute("units");
                    }
                    projectionMatch = projection && projection === layer.options.mapprojection;
                    if(!projectionMatch){
                      break;
                    }
                  }
                } else if(serverMeta){
                  if (serverMeta.tagName.toLowerCase() === "map-meta" && serverMeta.hasAttribute('content')) {
                    projection = M.metaContentToObject(serverMeta.getAttribute('content')).content;
                    projectionMatch = projection && projection === layer.options.mapprojection;
                  }
                }  
                
                var metaExtent = mapml.querySelector('map-meta[name=extent]'),
                    selectedAlternate = !projectionMatch && mapml.querySelector('map-head map-link[rel=alternate][projection='+layer.options.mapprojection+']'),
                    
                    base = 
      (new URL(mapml.querySelector('map-base') ? mapml.querySelector('map-base').getAttribute('href') : mapml.baseURI || this.responseURL, this.responseURL)).href;
                
                if (!serverExtent.length && !serverMeta) {
                    serverExtent = layer._synthesizeExtent(mapml);
                    // the mapml resource does not have a (complete) extent form, save
                    // its content if any so we don't have to revisit the server, ever.
                    if (mapml.querySelector('map-feature,map-tile')) {
                        layer._content = mapml;
                    }
                } else if (!projectionMatch && selectedAlternate && selectedAlternate.hasAttribute('href')) {
                     
                    layer.fire('changeprojection', {href:  (new URL(selectedAlternate.getAttribute('href'), base)).href}, false);
                    return;
                } else if (!projectionMatch && layer._map && layer._map.options.mapEl.querySelectorAll("layer-").length === 1){
                  layer._map.options.mapEl.projection = projection;
                  return;
                } else if (!serverMeta){
                  layer._extent = {};
                  if(projectionMatch){
                    layer._extent.crs = M[projection];
                  }
                  layer._extent._mapExtents = []; // stores all the map-extent elements in the layer
                  layer._extent._templateVars = []; // stores all template variables coming from all extents
                  for(let j = 0; j < serverExtent.length; j++){
                    if (serverExtent[j].querySelector('map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]') &&
                        serverExtent[j].hasAttribute("units")) {
                          layer._extent._mapExtents.push(serverExtent[j]);
                          projectionMatch = projectionMatch || selectedAlternate;
                          let templateVars = _initTemplateVars.call(layer, serverExtent[j], metaExtent, projection, mapml, base, projectionMatch);
                          layer._extent._mapExtents[j]._templateVars = templateVars;
                          layer._extent._templateVars = layer._extent._templateVars.concat(templateVars);
                        } 
                      }     
                } else {
                  layer._extent = serverMeta;
                }  
                layer._parseLicenseAndLegend(mapml, layer, projection);

                var zoomin = mapml.querySelector('map-link[rel=zoomin]'),
                    zoomout = mapml.querySelector('map-link[rel=zoomout]');
                delete layer._extent.zoomin;
                delete layer._extent.zoomout;
                if (zoomin) {
                  layer._extent.zoomin = (new URL(zoomin.getAttribute('href'), base)).href;
                }
                if (zoomout) {
                  layer._extent.zoomout = (new URL(zoomout.getAttribute('href'), base)).href;
                }
                if (layer._extent._mapExtents) {
                  for(let i = 0; i < layer._extent._mapExtents.length; i++){
                    if(layer._extent._mapExtents[i].templatedLayer){
                      layer._extent._mapExtents[i].templatedLayer.reset(layer._extent._mapExtents[i]._templateVars);
                    }
                  }
                  
                }
                if (mapml.querySelector('map-tile')) {
                  var tiles = document.createElement("map-tiles"),
                    zoom = mapml.querySelector('map-meta[name=zoom][content]') || mapml.querySelector('map-input[type=zoom][value]');
                  tiles.setAttribute("zoom", zoom && zoom.getAttribute('content') || zoom && zoom.getAttribute('value') || "0");
                  var newTiles = mapml.getElementsByTagName('map-tile');
                  for (var nt=0;nt<newTiles.length;nt++) {
                      tiles.appendChild(document.importNode(newTiles[nt], true));
                  }
                  layer._mapmlTileContainer.appendChild(tiles);
                }
                M.parseStylesheetAsHTML(mapml, base, layer._container);

                // add multiple extents
                if(layer._extent._mapExtents){
                  for(let j = 0; j < layer._extent._mapExtents.length; j++){
                    var labelName = layer._extent._mapExtents[j].getAttribute('label');
                    if(!labelName) labelName = layer._layerEl.getAttribute('label') + " Extent"; // temporariyl have the extent lableled by label name
                    var extentElement = layer.getLayerExtentHTML(labelName, j);
                    layer._extent._mapExtents[j].extentAnatomy = extentElement;
                  }
                }

                var styleLinks = mapml.querySelectorAll('map-link[rel=style],map-link[rel="self style"],map-link[rel="style self"]');
                if (styleLinks.length > 1) {
                  var stylesControl = document.createElement('details'),
                  stylesControlSummary = document.createElement('summary');
                  stylesControlSummary.innerText = 'Style';
                  stylesControl.appendChild(stylesControlSummary);
                  var changeStyle = function (e) {
                      layer.fire('changestyle', {src: e.target.getAttribute("data-href")}, false);
                  };

                  for (var j=0;j<styleLinks.length;j++) {
                    var styleOption = document.createElement('div'),
                    styleOptionInput = styleOption.appendChild(document.createElement('input'));
                    styleOptionInput.setAttribute("type", "radio");
                    styleOptionInput.setAttribute("id", "rad-"+L.stamp(styleOptionInput));
                    styleOptionInput.setAttribute("name", "styles-"+this._title);
                    styleOptionInput.setAttribute("value", styleLinks[j].getAttribute('title'));
                    styleOptionInput.setAttribute("data-href", new URL(styleLinks[j].getAttribute('href'),base).href);
                    var styleOptionLabel = styleOption.appendChild(document.createElement('label'));
                    styleOptionLabel.setAttribute("for", "rad-"+L.stamp(styleOptionInput));
                    styleOptionLabel.innerText = styleLinks[j].getAttribute('title');
                    if (styleLinks[j].getAttribute("rel") === "style self" || styleLinks[j].getAttribute("rel") === "self style") {
                      styleOptionInput.checked = true;
                    }
                    stylesControl.appendChild(styleOption);
                    L.DomUtil.addClass(stylesControl,'mapml-layer-item-style mapml-control-layers');
                    L.DomEvent.on(styleOptionInput,'click', changeStyle, layer);
                  }
                  layer._styles = stylesControl;
                }
                
                if (mapml.querySelector('map-title')) {
                  layer._title = mapml.querySelector('map-title').textContent.trim();
                } else if (mapml instanceof Element && mapml.hasAttribute('label')) {
                  layer._title = mapml.getAttribute('label').trim();
                }
                if (layer._map) {
                    layer._validateExtent();
                    // if the layer is checked in the layer control, force the addition
                    // of the attribution just received
                    if (layer._map.hasLayer(layer)) {
                        layer._map.attributionControl.addAttribution(layer.getAttribution());
                    }
                    //layer._map.fire('moveend', layer);
                }
            } else {
                layer.error = true;
            }
            layer.fire('extentload', layer, false);
            layer._layerEl.dispatchEvent(new CustomEvent('extentload', {detail: layer,}));
        }
    },
    _createExtent: function () {
    
        var extent = document.createElement('map-extent'),
            xminInput = document.createElement('map-input'),
            yminInput = document.createElement('map-input'),
            xmaxInput = document.createElement('map-input'),
            ymaxInput = document.createElement('map-input'),
            zoom = document.createElement('map-input'),
            projection = document.createElement('map-input');
    
        zoom.setAttribute('type','zoom');
        zoom.setAttribute('min','0');
        zoom.setAttribute('max','0');
        
        xminInput.setAttribute('type','xmin');
        xminInput.setAttribute('min','');
        xminInput.setAttribute('max','');
        
        yminInput.setAttribute('type','ymin');
        yminInput.setAttribute('min','');
        yminInput.setAttribute('max','');
        
        xmaxInput.setAttribute('type','xmax');
        xmaxInput.setAttribute('min','');
        xmaxInput.setAttribute('max','');

        ymaxInput.setAttribute('type','ymax');
        ymaxInput.setAttribute('min','');
        ymaxInput.setAttribute('max','');
        
        projection.setAttribute('type','projection');
        projection.setAttribute('value','WGS84');
        
        extent.appendChild(xminInput);
        extent.appendChild(yminInput);
        extent.appendChild(xmaxInput);
        extent.appendChild(ymaxInput);
        extent.appendChild(zoom);
        extent.appendChild(projection);

        return extent;
    },
    _validateExtent: function () {
      // TODO: change so that the _extent bounds are set based on inputs
      if(!this._extent || !this._map){
        return;
      }
      var serverExtent = this._extent._mapExtents ? this._extent._mapExtents : [this._extent], lp;
        
        // loop through the map-extent elements and assign each one its crs
        for(let i = 0; i < serverExtent.length; i++){
          if (!serverExtent[i].querySelector) {
            return;
          }
        if (serverExtent[i].querySelector('[type=zoom][min=""], [type=zoom][max=""]')) {
            var zoom = serverExtent[i].querySelector('[type=zoom]');
            zoom.setAttribute('min',this._map.getMinZoom());
            zoom.setAttribute('max',this._map.getMaxZoom());
        }
          lp = serverExtent[i].hasAttribute("units") ? serverExtent[i].getAttribute("units") : null;
          if (lp && M[lp]) {
            if(this._extent._mapExtents) this._extent._mapExtents[i].crs = M[lp];
            else this._extent.crs = M[lp];
          } else {
            if(this._extent._mapExtents) this._extent._mapExtents[i].crs = M.OSMTILE;
            else this._extent.crs = M.OSMTILE;
          }
        }
    },
    _getMapMLExtent: function (bounds, zooms, proj) {
        
        var extent = this._createExtent(),
            zoom = extent.querySelector('map-input[type=zoom]'),
            xminInput = extent.querySelector('map-input[type=xmin]'),
            yminInput = extent.querySelector('map-input[type=ymin]'),
            xmaxInput = extent.querySelector('map-input[type=xmax]'),
            ymaxInput = extent.querySelector('map-input[type=ymax]'),
            projection = extent.querySelector('map-input[type=projection]'),
            zmin = zooms[0] !== undefined && zooms[1] !== undefined ? Math.min(zooms[0],zooms[1]) : '',
            zmax = zooms[0] !== undefined && zooms[1] !== undefined ? Math.max(zooms[0],zooms[1]) : '',
            xmin = bounds ? bounds._southWest ? bounds.getWest() : bounds.getBottomLeft().x : '',
            ymin = bounds ? bounds._southWest ? bounds.getSouth() : bounds.getTopRight().y : '',
            xmax = bounds ? bounds._southWest ? bounds.getEast() : bounds.getTopRight().x : '',
            ymax = bounds ? bounds._southWest ? bounds.getNorth() : bounds.getBottomLeft().y : '';
    
        zoom.setAttribute('min', typeof(zmin) === 'number' && isNaN(zmin)? '' : zmin);
        zoom.setAttribute('max', typeof(zmax) === 'number' && isNaN(zmax)? '' : zmax);
        
        xminInput.setAttribute('min',xmin);
        xminInput.setAttribute('max',xmax);
        
        yminInput.setAttribute('min',ymin);
        yminInput.setAttribute('max',ymax);
        
        xmaxInput.setAttribute('min',xmin);
        xmaxInput.setAttribute('max',xmax);

        ymaxInput.setAttribute('min',ymin);
        ymaxInput.setAttribute('max',ymax);
        
        projection.setAttribute('value',bounds && bounds._southWest && !proj ? 'WGS84' : proj);

        return extent;
    },
    _synthesizeExtent: function (mapml) {
        var metaZoom = mapml.querySelectorAll('map-meta[name=zoom]')[0],
            metaExtent = mapml.querySelector('map-meta[name=extent]'),
            metaProjection = mapml.querySelector('map-meta[name=projection]'),
            proj = metaProjection ? metaProjection.getAttribute('content'): FALLBACK_PROJECTION,
            i,expressions,bounds,zmin,zmax,xmin,ymin,xmax,ymax,expr,lhs,rhs;
        if (metaZoom) {
            expressions = metaZoom.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'min') {
                zmin = parseInt(rhs);
              }
              if (lhs === 'max') {
                zmax = parseInt(rhs);
              }
            }
        }  
        if (metaExtent) {
            expressions = metaExtent.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'xmin') {
                xmin = parseFloat(rhs);
              }
              if (lhs === 'xmax') {
                xmax = parseFloat(rhs);
              }
              if (lhs === 'ymin') {
                ymin = parseFloat(rhs);
              }
              if (lhs === 'ymax') {
                ymax = parseFloat(rhs);
              }
            }
        }
        if (xmin && ymin && xmax && ymax && proj === 'WGS84') {
            var sw = L.latLng(ymin,xmin), ne = L.latLng(ymax,xmax);
            bounds = L.latLngBounds(sw,ne);
        } else if (xmin && ymin && xmax && ymax) {
            // needs testing
            bounds = L.bounds([[xmin,ymin],[xmax,ymax]]);
        }
        return this._getMapMLExtent(bounds, [zmin,zmax], proj);
    },
    // a layer must share a projection with the map so that all the layers can
    // be overlayed in one coordinate space.  WGS84 is a 'wildcard', sort of.
    getProjection: function () {
      let extent = this._extent._mapExtents ? this._extent._mapExtents[0] : this._extent; // the projections for each extent eould be the same (as) validated in _validProjection, so can use mapExtents[0]
      if(!extent) return FALLBACK_PROJECTION;
      switch (extent.tagName.toUpperCase()) {
        case "MAP-EXTENT":
          if(extent.hasAttribute('units'))
            return extent.getAttribute('units').toUpperCase();
          break;
        case "MAP-INPUT":
          if(extent.hasAttribute('value'))
            return extent.getAttribute('value').toUpperCase();
          break;
        case "MAP-META":
          if(extent.hasAttribute('content'))
            return M.metaContentToObject(extent.getAttribute('content')).content.toUpperCase(); 
          break;
        default:
          return FALLBACK_PROJECTION; 
      }
      return FALLBACK_PROJECTION;
    },
    _parseLicenseAndLegend: function (xml, layer) {
        var licenseLink =  xml.querySelector('map-link[rel=license]'), licenseTitle, licenseUrl, attText;
        if (licenseLink) {
            licenseTitle = licenseLink.getAttribute('title');
            licenseUrl = licenseLink.getAttribute('href');
            attText = '<a href="' + licenseUrl + '" title="'+licenseTitle+'">'+licenseTitle+'</a>';
        }
        L.setOptions(layer,{attribution:attText});
        var legendLink = xml.querySelector('map-link[rel=legend]');
        if (legendLink) {
          layer._legendUrl = legendLink.getAttribute('href');
        }
    },
    // return the LatLngBounds of the map unprojected such that the whole
    // map is covered, not just a band defined by the projected map bounds.
    _getUnprojectedMapLatLngBounds: function(map) {
      
        map = map||this._map; 
        var origin = map.getPixelOrigin(),
          bounds = map.getPixelBounds(),
          nw = map.unproject(origin),
          sw = map.unproject(bounds.getBottomLeft()),
          ne = map.unproject(bounds.getTopRight()),
          se = map.unproject(origin.add(map.getSize()));
        return L.latLngBounds(sw,ne).extend(se).extend(nw);
    },
    // this takes into account that WGS84 is considered a wildcard match.
    _projectionMatches: function(map) {
        map = map||this._map;
        var projection = this.getProjection();
        if (!map.options.projection || projection !== 'WGS84' && map.options.projection !== projection) return false;
        return true;
    },
    getQueryTemplates: function(pcrsClick) {
        if (this._extent && this._extent._queries) {
          var templates = [];
          // only return queries that are in bound
          for(let i = 0; i < this._extent._queries.length; i++){
            if(this._extent._queries[i].layerBounds.contains(pcrsClick)){
              templates.push(this._extent._queries[i]);
            }
          }
          return templates;
        }
    },
    _attachSkipButtons: function(e){
      let popup = e.popup, map = e.target, layer, group,
          content = popup._container.getElementsByClassName("mapml-popup-content")[0];

      popup._container.setAttribute("role", "dialog");
      content.setAttribute("tabindex", "-1");
      // https://github.com/Maps4HTML/Web-Map-Custom-Element/pull/467#issuecomment-844307818
      content.setAttribute("role", "document");
      popup._count = 0; // used for feature pagination

      if(popup._source._eventParents){ // check if the popup is for a feature or query
        layer = popup._source._eventParents[Object.keys(popup._source._eventParents)[0]]; // get first parent of feature, there should only be one
        group = popup._source.group;
      } else {
        layer = popup._source._templatedLayer;
      }

      if(popup._container.querySelector('nav[class="mapml-focus-buttons"]')){
        L.DomUtil.remove(popup._container.querySelector('nav[class="mapml-focus-buttons"]'));
        L.DomUtil.remove(popup._container.querySelector('hr'));
      }
      //add when popopen event happens instead
      let div = L.DomUtil.create("nav", "mapml-focus-buttons");

      // creates |< button, focuses map
      let mapFocusButton = L.DomUtil.create("button", "mapml-popup-button", div);
      mapFocusButton.type = "button";
      mapFocusButton.title = "Focus Map";
      mapFocusButton.innerHTML = "<span aria-hidden='true'>|&#10094;</span>";
      L.DomEvent.on(mapFocusButton, 'click', (e)=>{
        L.DomEvent.stop(e);
        map.featureIndex._sortIndex();
        map.closePopup();
        map._container.focus();
      }, popup);

      // creates < button, focuses previous feature, if none exists focuses the current feature
      let previousButton = L.DomUtil.create("button", "mapml-popup-button", div);
      previousButton.type = "button";
      previousButton.title = "Previous Feature";
      previousButton.innerHTML = "<span aria-hidden='true'>&#10094;</span>";
      L.DomEvent.on(previousButton, 'click', layer._previousFeature, popup);

      // static feature counter that 1/1
      let featureCount = L.DomUtil.create("p", "mapml-feature-count", div),
          totalFeatures = this._totalFeatureCount ? this._totalFeatureCount : 1;
      featureCount.innerText = (popup._count + 1)+"/"+totalFeatures;

      // creates > button, focuses next feature, if none exists focuses the current feature
      let nextButton = L.DomUtil.create("button", "mapml-popup-button", div);
      nextButton.type = "button";
      nextButton.title = "Next Feature";
      nextButton.innerHTML = "<span aria-hidden='true'>&#10095;</span>";
      L.DomEvent.on(nextButton, 'click', layer._nextFeature, popup);
      
      // creates >| button, focuses map controls
      let controlFocusButton = L.DomUtil.create("button", "mapml-popup-button", div);
      controlFocusButton.type = "button";
      controlFocusButton.title = "Focus Controls";
      controlFocusButton.innerHTML = "<span aria-hidden='true'>&#10095;|</span>";
      L.DomEvent.on(controlFocusButton, 'click', (e) => {
        map.featureIndex._sortIndex();
        map.featureIndex.currentIndex = map.featureIndex.inBoundFeatures.length - 1;
        map.featureIndex.inBoundFeatures[0].path.setAttribute("tabindex", -1);
        map.featureIndex.inBoundFeatures[map.featureIndex.currentIndex].path.setAttribute("tabindex", 0);
        L.DomEvent.stop(e);
        map.closePopup();
        map._controlContainer.querySelector("A").focus();
      }, popup);
  
      let divider = L.DomUtil.create("hr");

      popup._navigationBar = div;
      popup._content.appendChild(divider);
      popup._content.appendChild(div);
      
      content.focus();

      if(group) {
        // e.target = this._map
        // Looks for keydown, more specifically tab and shift tab
        group.setAttribute("aria-expanded", "true");
        map.on("keydown", focusFeature);
      } else {
        map.on("keydown", focusMap);
      }
      // When popup is open, what gets focused with tab needs to be done using JS as the DOM order is not in an accessibility friendly manner
      function focusFeature(focusEvent){
        let path = focusEvent.originalEvent.path || focusEvent.originalEvent.composedPath();
        let isTab = focusEvent.originalEvent.keyCode === 9,
            shiftPressed = focusEvent.originalEvent.shiftKey;
        if((path[0].classList.contains("leaflet-popup-close-button") && isTab && !shiftPressed) || focusEvent.originalEvent.keyCode === 27){
          setTimeout(() => {
            L.DomEvent.stop(focusEvent);
            map.closePopup(popup);
            group.focus();
          }, 0);
        } else if ((path[0].title==="Focus Map" || path[0].classList.contains("mapml-popup-content")) && isTab && shiftPressed){
          setTimeout(() => { //timeout needed so focus of the feature is done even after the keypressup event occurs
            L.DomEvent.stop(focusEvent);
            map.closePopup(popup);
            group.focus();
          }, 0);
        }
      }

      function focusMap(focusEvent){
        let path = focusEvent.originalEvent.path || focusEvent.originalEvent.composedPath();
        let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;

        if((focusEvent.originalEvent.keyCode === 13 && path[0].classList.contains("leaflet-popup-close-button")) || focusEvent.originalEvent.keyCode === 27 ){
          L.DomEvent.stopPropagation(focusEvent);
          map._container.focus();
          map.closePopup(popup);
          if(focusEvent.originalEvent.keyCode !== 27)map._popupClosed = true;
        } else if (isTab && path[0].classList.contains("leaflet-popup-close-button")){
          map.closePopup(popup);
        } else if ((path[0].title==="Focus Map" || path[0].classList.contains("mapml-popup-content")) && isTab && shiftPressed){
          setTimeout(() => { //timeout needed so focus of the feature is done even after the keypressup event occurs
            L.DomEvent.stop(focusEvent);
            map.closePopup(popup);
            map._container.focus();
          }, 0);
        }
      }

      // if popup closes then the focusFeature handler can be removed
      map.on("popupclose", removeHandlers);
      function removeHandlers(removeEvent){
        if (removeEvent.popup === popup){
          map.off("keydown", focusFeature);
          map.off("keydown", focusMap);
          map.off('popupclose', removeHandlers);
          if(group) group.setAttribute("aria-expanded", "false");
        }
      }
    },
});
export var mapMLLayer = function (url, node, options) {
  if (!url && !node) return null;
	return new MapMLLayer(url, node, options);
};
