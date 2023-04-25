export class MapFeature extends HTMLElement {
    static get observedAttributes() {
      return ['zoom', 'onfocus', 'onclick', 'onblur'];
    }

    get zoom() {
      return +(this.hasAttribute("zoom") ? this.getAttribute("zoom") : 0);
    }

    set zoom(val) {
      var parsedVal = parseInt(val,10);
      if (!isNaN(parsedVal) && (parsedVal >= this.min && parsedVal <= this.max)) {
        this.setAttribute('zoom', parsedVal);
      }
    }

    get min() {
      // fallback: the minimum zoom bound of layer- element
      return +(this.hasAttribute("min") ? this.getAttribute("min") : this._layer._layerEl.extent.zoom.minZoom);
    }

    set min(val) {
      var parsedVal = parseInt(val,10);
      if (!isNaN(parsedVal)) {
        if (parsedVal >= this._layer._layerEl.extent.zoom.minZoom && parsedVal <= this._layer._layerEl.extent.zoom.maxZoom) {          
          this.setAttribute('min', parsedVal);
        } else {
          this.setAttribute('min', this._layer._layerEl.extent.zoom.minZoom);
        }
      }
    }

    get max() {
      // fallback: the maximum zoom bound of layer- element
      return +(this.hasAttribute("max") ? this.getAttribute("max") : this._layer._layerEl.extent.zoom.maxZoom);
    }

    set max(val) {
      var parsedVal = parseInt(val,10);
      if (!isNaN(parsedVal)) {
        if (parsedVal >= this._layer._layerEl.extent.zoom.minZoom && parsedVal <= this._layer._layerEl.extent.zoom.maxZoom) {          
          this.setAttribute('max', parsedVal);
        } else {
          this.setAttribute('max', this._layer._layerEl.extent.zoom.maxZoom);
        }
      }
    }

    get extent() {
      if (this.isConnected) {
        // if the feature extent is the first time to be calculated or the feature extent is changed (by changing
        // the innertext of map-coordinates), then calculate feature extent by invoking the getFeatureExtent function
        if (!this._getFeatureExtent) {this._getFeatureExtent = this._memoizeExtent();}
        return this._getFeatureExtent();
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'zoom': {
          if (oldValue !== newValue && this._layer) {
            let layer = this._layer,
            layerEl = layer._layerEl,
            mapmlvectors = layer._mapmlvectors;
            // if the vector layer only has static features, should update zoom bounds when zoom attribute is changed
            if (mapmlvectors?._staticFeature) {
              this._removeInFeatureList(oldValue);
              let native = this._getNativeZoomAndCS(layer._content);
              mapmlvectors.zoomBounds = mapmlvectors._getZoomBounds(layerEl.shadowRoot || layerEl, native.zoom);
            }
            this._removeFeature();
            this._updateFeature();
          }
          break;
        }
        case 'onfocus': 
        case 'onclick':
        case 'onblur':
          if (this._groupEl) {
            // "synchronize" the onevent properties (i.e. onfocus, onclick, onblur)
            // between the mapFeature and its associated <g> element
            this._groupEl[name] = this[name];
            break;
          }
      }
    }

    constructor() {
      // Always call super first in constructor
      super();
    }

    connectedCallback() {
      // if mapFeature element is not connected to layer- or layer-'s shadowroot,
      // or the parent layer- element has a "data-moving" attribute
      if ((this.parentNode.nodeType !== document.DOCUMENT_FRAGMENT_NODE && this.parentNode.nodeName.toLowerCase() !== 'layer-') || 
          (this.parentNode.nodeType === document.DOCUMENT_FRAGMENT_NODE && this.parentNode.host.hasAttribute('data-moving')) ||
          (this.parentNode.nodeName.toLowerCase() === 'layer-' && this.parentNode.hasAttribute('data-moving'))) {
          return;
      }
      // set up the map-feature object properties
      this._addFeature();
      // use observer to monitor the changes in mapFeature's subtree 
      // (i.e. map-properties, map-featurecaption, map-coordinates)
      this._observer = new MutationObserver((mutationList) => {
        for (let mutation of mutationList) {
          // the attributes changes of <map-feature> element should be handled by attributeChangedCallback()
          if (mutation.type === 'attributes' && mutation.target === this) {
            return;
          }
          // re-render feature if there is any observed change
          this._removeFeature();
          this._updateFeature();
        }
      });
      this._observer.observe(this, { 
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true
      });
    }
      
    disconnectedCallback() {
      if(this._layer._layerEl.hasAttribute("data-moving")) return;
      this._removeFeature();
      this._observer.disconnect();
    }

    _removeFeature() {
      // if the <layer- > el is disconnected
      // the <g> el has already got removed at this point
      if (this._groupEl?.isConnected) {
        this._groupEl.remove();
      }
      // if the <layer- > el has already been disconnected,
      // then _map.removeLayer(layerEl._layer) has already been invoked (inside layerEl.disconnectedCallback())
      // this._featureGroup has already got removed at this point
      if (this._featureGroup?._map){
        this._featureGroup._map.removeLayer(this._featureGroup);
        let mapmlvectors = this._layer._mapmlvectors;
        if (mapmlvectors) {
          if (mapmlvectors._staticFeature) {
            if (mapmlvectors._features[this.zoom]) {
              this._removeInFeatureList(this.zoom);
            }
            let container = this._layer.shadowRoot || this._layer._layerEl;
            // update zoom bounds of vector layer
            mapmlvectors.zoomBounds = mapmlvectors._getZoomBounds(container, this._getNativeZoomAndCS(this._layer._content).zoom);
          }
          mapmlvectors.options.properties = null;
          delete mapmlvectors._layers[this._featureGroup._leaflet_id];
        }
      }
      delete this._featureGroup;
      delete this._groupEl;
      // ensure that feature extent can be re-calculated everytime that map-feature element is updated / re-added
      if (this._getFeatureExtent) delete this._getFeatureExtent;
    }

    _addFeature() {
      // this._layer: the leaflet layer object associated with the <layer- > element
      //              that the <map-feature> attaches
      // case 1: the <map-feature> el directly attaches to the <layer- > el
      // case 2: the <map-feature> el is originally in a <mapml- > document (<layer- src="...mapml">)
      //         and attaches to the shadowRoot of the <layer- > element
      this._layer = this.parentNode._layer ? this.parentNode._layer : this.parentNode.host._layer;
      // if the parent layer- el has not yet added to the map, wait until it is added
      if (!this._layer._map) {
        this._layer.once('add', function () {
          this._map = this._layer._map;
        }, this);
      } else {
        this._map = this._layer._map;
      }

      // "synchronize" the event handlers between map-feature and <g>
      if (!this.querySelector('map-geometry')) return;
      if (!this._layer._mapmlvectors) {
        this._layer.on('add', this._setUpEvents, this);
        return;
      } else if (!this._featureGroup) {
        // if the map-feature el or its subtree is updated
        // this._featureGroup has been free in this._removeFeature()
        this._updateFeature();
      } else {
        this._setUpEvents();
      }
    }

    _updateFeature() {
      let mapmlvectors = this._layer._mapmlvectors;
      // if the parent layer has not yet rendered on the map
      if (!mapmlvectors) return;
      // if the <layer- > is not removed, then regenerate featureGroup and update the mapmlvectors accordingly
      let native = this._getNativeZoomAndCS(this._layer._content);
      this._featureGroup = mapmlvectors.addData(this, native.cs, native.zoom);
      mapmlvectors._layers[this._featureGroup._leaflet_id] = this._featureGroup;
      this._groupEl = this._featureGroup.options.group;
      if (mapmlvectors._staticFeature) {
        let container = this._layer.shadowRoot || this._layer._layerEl;
        // update zoom bounds of vector layer
        mapmlvectors.zoomBounds = mapmlvectors._getZoomBounds(container, this._getNativeZoomAndCS(this._layer._content).zoom);
        // add feature layers to map
        mapmlvectors._resetFeatures();
        // update map's zoom limit
        this._map._addZoomLimit(mapmlvectors);
        L.extend(mapmlvectors.options, mapmlvectors.zoomBounds);
      }
      this._setUpEvents();
    }

    _setUpEvents() {
      ['click','focus','blur'].forEach(name => {
        // onevent properties & onevent attributes
        if (this[`on${name}`] && typeof this[`on${name}`] === "function")  {
          this._groupEl[`on${name}`] = this[`on${name}`];
        }
        // handle event handlers set via addEventlistener
        // for HTMLElement
        // when <g> is clicked / focused / blurred
        // should dispatch the click / focus / blur event listener on **linked HTMLFeatureElements**
        this._groupEl.addEventListener(name, (e) => {
          // this === mapFeature as arrow function does not have their own "this" pointer
          // store onEvent handler of mapFeature if there is any to ensure that it will not be re-triggered when the cloned mouseevent is dispatched
          // so that only the event handlers set on HTMLFeatureElement via addEventListener method will be triggered
          const handler = this[`on${name}`]; // a deep copy, var handler will not change when this.onevent is set to null (i.e. store the onevent property)
          this[`on${name}`] = null;
          if (name === 'click') {
            // dispatch a cloned mouseevent to trigger the click event handlers set on HTMLFeatureElement
            this.dispatchEvent(new MouseEvent (name, {...e.options}));
          } else {
            this.dispatchEvent(new FocusEvent (name, {...e.options}));
          }
          if (handler) this[`on${name}`] = handler;
        });
      });
    }

    _getNativeZoomAndCS(content) {
      // content: layer- || mapml file in src
      let nativeZoom, nativeCS;
      if (content.nodeName.toUpperCase() === "LAYER-") {
        // templated features || inline features
        let parentEl = this._extentEl && this.parentNode.nodeType === document.DOCUMENT_FRAGMENT_NODE ? this.parentNode : this._layer._layerEl;
        let zoomMeta = parentEl.querySelectorAll('map-meta[name=zoom]'),
            zoomLength = zoomMeta?.length;
        nativeZoom = zoomLength ? +(zoomMeta[zoomLength - 1].getAttribute('content')?.split(',').find(str => str.includes("value"))?.split('=')[1]) : 0;

        let csMeta = parentEl.querySelectorAll("map-meta[name=cs]"),
            csLength = csMeta?.length;
        if (csLength) {
          nativeCS = csMeta[csLength - 1].getAttribute('content');
        } else if (parentEl.nodeType === document.DOCUMENT_FRAGMENT_NODE) {
          // templated
          nativeCS = 'gcrs';
        } else {
          nativeCS = 'pcrs';
        }
        return {zoom: nativeZoom, cs: nativeCS};
      } else if (content.nodeType === Node.DOCUMENT_NODE) {
        // features migrated from mapml
        // set the native according to the map-meta[name=zoom / cs] in mapml file
        return this._layer._mapmlvectors._getNativeVariables(content);
      }
    }

    // Util functions:
    // internal method to calculate the extent of the feature and store it in cache for the first time
    // and return cache when feature's extent is repeatedly requested
    // for .extent
    _memoizeExtent () {
      // memoize calculated extent
      let extentCache;
      return function () {
        if (extentCache && this._getFeatureExtent) {
          // if the extent has already been calculated and is not updated, return stored extent
          return extentCache;
        } else {
          // calculate feature extent
          let map = this._map,
              geometry = this.querySelector('map-geometry'),
              native = this._getNativeZoomAndCS(this._layer._content),
              cs = geometry.getAttribute('cs') || native.cs,
              // zoom level that the feature rendered at
              zoom = this.zoom || native.zoom,
              shapes = geometry.querySelectorAll("map-point, map-linestring, map-polygon, map-multipoint, map-multilinestring"),
              bboxExtent = [Infinity, Infinity, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
          for (let shape of shapes) {
            let coord = shape.querySelectorAll('map-coordinates');
            for (let i = 0; i < coord.length; ++i) {
              bboxExtent = _updateExtent(shape, coord[i], bboxExtent);
            }
          }
          let topLeft = L.point(bboxExtent[0], bboxExtent[1]);
          let bottomRight = L.point(bboxExtent[2], bboxExtent[3]);
          let pcrsBound = M.boundsToPCRSBounds(L.bounds(topLeft, bottomRight), zoom, map.options.projection, cs);
          if (shapes.length === 1 && shapes[0].tagName.toUpperCase() === "MAP-POINT") {
            let projection = map.options.projection,
                maxZoom = this.hasAttribute('max') ? +this.getAttribute('max') : M[projection].options.resolutions.length - 1,
                tileCenter = M[projection].options.crs.tile.bounds.getCenter(),
                pixel = M[projection].transformation.transform(pcrsBound.min, M[projection].scale(+this.zoom || maxZoom));
            pcrsBound = M.pixelToPCRSBounds(L.bounds(pixel.subtract(tileCenter), pixel.add(tileCenter)), this.zoom || maxZoom, projection);
          }
          let result = M._convertAndFormatPCRS(pcrsBound, map);
          // memoize calculated result
          extentCache = result;
          return result;
        }
      };

      // update the bboxExtent
      function _updateExtent(shape, coord, bboxExtent) {
        let data = coord.innerHTML.trim().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').split(/[<>\ ]/g);
        switch (shape.tagName) {
          case "MAP-POINT":
            bboxExtent = M._updateExtent(bboxExtent, +data[0], +data[1]);
            break;
          case "MAP-LINESTRING":
          case "MAP-POLYGON":
          case "MAP-MULTIPOINT":
          case "MAP-MULTILINESTRING":
            for (let i = 0; i < data.length; i += 2) {
              bboxExtent = M._updateExtent(bboxExtent, +data[i], +data[i + 1]);
            }
            break;
          default:
            break;
        }
        return bboxExtent;
      }
    }

    // find and remove the feature from mapmlvectors._features if vector layer only contains static features, helper function
    //      prevent it from being rendered again when zooming in / out (mapmlvectors.resetFeature() is invoked) 
    _removeInFeatureList(zoom) {
      let mapmlvectors = this._layer._mapmlvectors;
      for (let i = 0; i < mapmlvectors._features[zoom].length; ++i) {
        let feature = mapmlvectors._features[zoom][i];
        if (feature._leaflet_id === this._featureGroup._leaflet_id) {
          mapmlvectors._features[zoom].splice(i, 1);
          break;
        }
      }
    }

    getMaxZoom() {
      let tL = this.extent.topLeft.pcrs,
          bR = this.extent.bottomRight.pcrs,
          bound = L.bounds(L.point(tL.horizontal, tL.vertical), L.point(bR.horizontal, bR.vertical));
      let projection = this._map.options.projection,
          layerZoomBounds = this._layer._layerEl.extent.zoom,
          minZoom = layerZoomBounds.minZoom ? layerZoomBounds.minZoom : 0,
          maxZoom = layerZoomBounds.maxZoom ? layerZoomBounds.maxZoom : M[projection].options.resolutions.length - 1;
      let newZoom;
      if (this.hasAttribute('zoom')) {
        // if there is a zoom attribute set to the map-feature, zoom to the zoom attribute value
        newZoom = this.zoom;
      } else {
        // if not, calculate the maximum zoom level that can show the feature completely
        newZoom = M.getMaxZoom(bound, this._map, minZoom, maxZoom);
        if (this.max < newZoom) {
          // if the calculated zoom is greater than the value of max zoom attribute, go with max zoom attribute
          newZoom = this.max;
        } else if (this.min > newZoom) {
          // if the calculated zoom is less than the value of min zoom attribute, go with min zoom attribute
          newZoom = this.min;
        }
      }
      // prevent overzooming / underzooming
      if (newZoom < minZoom) {
        newZoom = minZoom;
      } else if (newZoom > maxZoom) {
        newZoom = maxZoom;
      }

      // should check whether the extent after zooming falls into the templated extent bound
      return newZoom;
    }

    // internal support for returning a GeoJSON representation of <map-feature> geometry
    // The options object can contain the following:
    //      propertyFunction   - function(<map-properties>), A function that maps the features' <map-properties> element to a GeoJSON "properties" member.
    //      transform          - Bool, Transform coordinates to gcrs values, defaults to True
    // mapml2geojson: <map-feature> Object -> GeoJSON
    mapml2geojson(options) {
      let defaults = {
        propertyFunction: null,
        transform: true
      };
      // assign default values for undefined options
      options = Object.assign({}, defaults, options);

      let json = {
        type: "Feature",
        properties: {},
        geometry: {}
      };
      let el = this.querySelector('map-properties');
      if (!el) {
        json.properties = null;
      } else if (typeof options.propertyFunction === "function") {
        json.properties = options.propertyFunction(el);
      } else if (el.querySelector('table')) { 
        // setting properties when table presented
        let table = (el.querySelector('table')).cloneNode(true);
        json.properties = M._table2properties(table);
      } else {
        // when no table present, strip any possible html tags to only get text
        json.properties = {prop0: (el.innerHTML).replace(/(<([^>]+)>)/ig, '').replace(/\s/g, '')};
      }

      // transform to gcrs if options.transform = true (default)
      let source = null, dest = null;
      if (options.transform) {
        source = new proj4.Proj(this._map.options.crs.code);
        dest = new proj4.Proj('EPSG:4326');
        if (this._map.options.crs.code === "EPSG:3857" || this._map.options.crs.code  === "EPSG:4326") {
          options.transform = false;
        }
      }

      let collection = this.querySelector("map-geometry").querySelector("map-geometrycollection"),
          shapes = this.querySelector("map-geometry").querySelectorAll("map-point, map-polygon, map-linestring, map-multipoint, map-multipolygon, map-multilinestring");

      if (collection) {
        json.geometry.type = "GeometryCollection";
        json.geometry.geometries = [];
        for (let shape of shapes) {
          json.geometry.geometries.push(M._geometry2geojson(shape, source, dest, options.transform));
        }
      } else {
        json.geometry = M._geometry2geojson(shapes[0], source, dest, options.transform);
      }
      return json;
    }

    // a method that simulates a click, or invoking the user-defined click event
    //      event (optional): a MouseEvent object, can be passed as an argument of the user-defined click event handlers
    click(event) {
      let g = this._groupEl,
          rect = g.getBoundingClientRect();
      if (!event) {
        event = new MouseEvent ("click", {
          clientX: rect.x + rect.width / 2,
          clientY: rect.y + rect.height / 2,
          button: 0
        });
      }
      if (typeof this.onclick === 'function') {
        this.onclick.call(this._groupEl, event);
        return;
      } else {
        let properties = this.querySelector('map-properties');
        if (g.getAttribute('role') === 'link') {
          for (let path of g.children) {
            path.mousedown.call(this._featureGroup, event);
            path.mouseup.call(this._featureGroup, event);
          }
        }
        // for custom projection, layer- element may disconnect and re-attach to the map after the click
        // so check whether map-feature element is still connected before any further operations
        if (properties && this.isConnected) {
          let featureGroup = this._featureGroup,
              shapes = featureGroup._layers;
          // close popup if the popup is currently open
          for (let id in shapes) {
            if (shapes[id].isPopupOpen()) {
              shapes[id].closePopup();
            }
          }
          if (featureGroup.isPopupOpen()) {
            featureGroup.closePopup();
          } else {
            featureGroup.openPopup();
          }
        }
      }
    }
    
    // a method that sets the current focus to the <g> element, or invoking the user-defined focus event
    //      event (optional): a FocusEvent object, can be passed as an argument of the user-defined focus event handlers
    //      options (optional): as options parameter for native HTMLelemnt 
    //                          https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
    focus(event, options) {
      let g = this._groupEl;
      if (typeof this.onfocus === 'function') {
        this.onfocus.call(this._groupEl, event);
        return;
      } else {
        g.focus(options);
      }
    }

    // a method that makes the <g> element lose focus, or invoking the user-defined blur event
    //      event (optional): a FocusEvent object, can be passed as an argument of the user-defined blur event handlers
    blur(event) {
      if (typeof this.onblur === 'function') {
        this.onblur.call(this._groupEl, event);
      } else if (document.activeElement.shadowRoot?.activeElement === this._groupEl || 
                 document.activeElement.shadowRoot?.activeElement.parentNode === this._groupEl) {
        this._groupEl.blur();
        // set focus to the map container
        this._map._container.focus();
      }
    }

    // a method that can the viewport to be centred on the feature's extent
    zoomTo() {
      let extent = this.extent,
          map = this._map;
      let tL = extent.topLeft.pcrs,
          bR = extent.bottomRight.pcrs,
          bound = L.bounds(L.point(tL.horizontal, tL.vertical), L.point(bR.horizontal, bR.vertical)),
          center = map.options.crs.unproject(bound.getCenter(true));
      map.setView(center, this.getMaxZoom(), {animate: false});
    }
  }