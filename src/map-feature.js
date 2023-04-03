export class MapFeature extends HTMLElement {
    static get observedAttributes() {
      return ['zoom', 'onfocus', 'onclick', 'onblur'];
    }

    get zoom() {
      return +(this.hasAttribute("zoom") ? this.getAttribute("zoom") : 0);
    }

    set zoom(val) {
      var parsedVal = String.toString(parseInt(val,10));
      if (!isNaN(parsedVal) && (parsedVal >= 0 && parsedVal <= 25)) {
        this.setAttribute('zoom', parsedVal);
      }
    }

    get extent() {
      if (this.isConnected) {
        return this._getFeatureExtent();
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'zoom': {
          if (oldValue !== newValue && this._layerParent) {
            this._remove();
            let layer = this._layerParent,
                layerEl = layer._layerEl,
                mapmlvectors = layer._mapmlvectors;
            if (mapmlvectors?._staticFeature) {
              let native = this._getNative(layer._content);
              mapmlvectors.zoomBounds = mapmlvectors._getZoomBounds(layerEl.shadowRoot || layerEl, native.zoom);
            }
            this._redraw();
          }
          break;
        }
        case 'onfocus': 
        case 'onclick':
        case 'onblur':
          this._groupEl[name] = this[name];
          break;
      }
    }

    constructor() {
      // Always call super first in constructor
      super();
    }

    connectedCallback() {
      if (this.parentNode.nodeType !== document.DOCUMENT_FRAGMENT_NODE && 
          this.parentNode.tagName.toLowerCase() !== 'layer-') {
        return;
      }

      // this._layerParent: the leaflet layer object associated with the <layer- > element
      //                    that the <map-feature> attaches
      // case 1: the <map-feature> el directly attaches to the <layer- > el
      // case 2: the <map-feature> el is originally in a <mapml- > document (<layer- src="...mapml">)
      //         and attaches to the shadowRoot of the <layer- > element
      this._layerParent = this.parentNode._layer ? this.parentNode._layer : this.parentNode.host._layer;
      this._map = this._layerParent._map;
      if (!this._map) {
        this._layerParent.once('add', function () {
          this._map = this._layerParent._map;
        }, this);
      }
      if(this._layerParent._layerEl.hasAttribute("data-moving")) return;
      
      this._observer = new MutationObserver((mutationList) => {
        // muatationList: a list records changes made on <map-feature> and its children elements
        for (let mutation of mutationList) {
          // the attributes changes of <map-feature> element should be handled by attributeChangedCallback()
          if (mutation.type === 'attributes' && mutation.target === this) {
            return;
          }
          // re-render <map-feature>
          this._remove();
          this._redraw();
        }
      });
      // Start observing the target node for configured mutations
      this._observer.observe(this, { 
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true
      });
      
      if (!this._layerParent._mapmlvectors) {
        return;
      } else if (!this._featureGroup) {
        this._redraw();
      }

      this._groupEl.addEventListener('keydown', (e) => {
        // backspace / delete
        if (e.keyCode === 8 || e.keyCode === 46) {
          this._remove();
        }
      });
    }
      
    disconnectedCallback() {
      if(this._layerParent._layerEl.hasAttribute("data-moving")) return;
      this._remove();
    }

    _remove() {
      // if the <layer- > el is disconnected
      // the <g> el has already got removed at this point
      if (this._groupEl?.isConnected) {
        this._groupEl.remove();
      }
      // if the <layer- > el has already been disconnected,
      // then _map.removeLayer(layerEl._layer) has already been invoked (inside layerEl.disconnectedCallback())
      // this._featureGroup has already got removed at this point
      if (this._featureGroup?._map) {
        this._featureGroup._map.removeLayer(this._featureGroup);
        let mapmlvectors = this._layerParent._mapmlvectors;
        if (mapmlvectors) {
          if (mapmlvectors._staticFeature) {
            let zoom = mapmlvectors._clampZoom(this._map.getZoom());
            for (let i = 0; i < mapmlvectors._features[zoom].length; ++i) {
              let feature = mapmlvectors._features[zoom][i];
              if (feature._leaflet_id === this._featureGroup._leaflet_id) {
                mapmlvectors._features[zoom].splice(i, 1);
                break;
              }
            }
          }
          mapmlvectors.options.properties = null;
          delete mapmlvectors._layers[this._featureGroup._leaflet_id];
        }
      }
      delete this._featureGroup;
      delete this._groupEl;
      this._observer.disconnect();
    }

    // re-add / update features
    _redraw() {
      let mapmlvectors = this._layerParent._mapmlvectors;
      if (!mapmlvectors) return;
      // if the <layer- > is not removed, then regenerate featureGroup and update the mapmlvectors accordingly
      let native = this._getNative(this._layerParent._content);
      this._featureGroup = mapmlvectors.addData(this, native.cs, native.zoom);
      mapmlvectors._layers[this._featureGroup._leaflet_id] = this._featureGroup;
      this._groupEl = this._featureGroup.options.group;
      if (mapmlvectors._staticFeature) {
        let zoom = mapmlvectors._clampZoom(this._map.getZoom());
        mapmlvectors._resetFeatures(zoom);
        this._map._addZoomLimit(mapmlvectors);
        L.extend(mapmlvectors.options, mapmlvectors.zoomBounds);
      }
    }

    _getNative(content) {
      let nativeZoom, nativeCS;
      if (!content || content.nodeName.toUpperCase() === "LAYER-") {
        let layerEl = this._layerParent._layerEl;
        let zoomMeta = layerEl.querySelectorAll('map-meta[name=zoom]'),
            zoomLength = zoomMeta?.length;
        nativeZoom = zoomLength ? +(zoomMeta[zoomLength - 1].getAttribute('content')?.split(',').find(str => str.includes("value"))?.split('=')[1]) : 0;

        let csMeta = layerEl.querySelectorAll("map-meta[name=cs]"),
            csLength = csMeta?.length;
        nativeCS = csLength ? csMeta[csLength - 1].getAttribute('content') : 'pcrs';
        return {zoom: nativeZoom, cs: nativeCS};
      } else if (content.nodeType === Node.DOCUMENT_NODE) {
        // if the map-feature originally migrates from mapml file
        // the nativezoom should be the <map-meta> in mapml file
        return this._layerParent._mapmlvectors._getNativeVariables(content);
      }
    }

    // Util functions:
    // internal support for returning a GeoJSON representation of <map-feature> geometry
    // propertyFunction (optional): the function used to format the innerHTML of <map-properties>
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
        json.properties = {prop0: (el.innerHTML).replace( /(<([^>]+)>)/ig, '').replace(/\s/g, '')};
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

    // method to calculate and return the extent of the feature as a JavaScript object
    _getFeatureExtent() {
      let map = this._map,
          geometry = this.querySelector('map-geometry'),
          cs = geometry.getAttribute('cs') || this._getNative(this._layerParent._content).cs,
          // zoom level that the feature rendered at
          zoom = this.zoom || this._getNative(this._layerParent._content).zoom,
          shapes = geometry.querySelectorAll("map-point, map-linestring, map-polygon, map-multipoint, map-multilinestring"),
          bboxExtent = [Infinity, Infinity, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
      for (let shape of shapes) {
        let coord = shape.querySelectorAll('map-coordinates');
        for (let i = 0; i < coord.length; ++i) {
          _updateExtent(shape, coord[i]);
        }
      }
      let topLeft = L.point(bboxExtent[0], bboxExtent[1]);
      let bottomRight = L.point(bboxExtent[2], bboxExtent[3]);
      let pcrsBound = M.boundsToPCRSBounds(L.bounds(topLeft, bottomRight), zoom, map.options.projection, cs);
      if (shapes.length === 1 && shapes[0].tagName.toUpperCase() === "MAP-POINT") {
        let projection = map.options.projection,
            maxZoom = M[projection].options.resolutions.length - 1,
            tileCenter = M[projection].options.crs.tile.bounds.getCenter(),
            pixel = M[projection].transformation.transform(pcrsBound.min, M[projection].scale(+this.zoom || maxZoom));
        pcrsBound = M.pixelToPCRSBounds(L.bounds(pixel.subtract(tileCenter), pixel.add(tileCenter)), this.zoom || maxZoom, projection);
      }
      return M._convertAndFormatPCRS(pcrsBound, map);

      function _updateExtent(shape, coord) {
        let data = coord.innerHTML.trim().replace(/<[^>]+>/g, '').split(/[<>\ ]/g);
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
      }
    }

    _pasteFeature(text, layerToAdd) {
      text.trim();
      if (layerToAdd && text.slice(0,12) === "<map-feature" && text.slice(-14) === "</map-feature>") {
        layerToAdd.insertAdjacentHTML("beforeend", text);
      }
    }

    // a .click() method that highlights the feature and show popup on map as if doing a click
    click(event) {
      let g = this._groupEl,
          rect = g.getBoundingClientRect();
      if (!event) {
        event = new MouseEvent ("mousedown", {
          clientX: rect.x + rect.width / 2,
          clientY: rect.y + rect.height / 2,
          button: 0
        });
      }
      if (typeof this.onclick === 'function') {
        this.onclick.call(this, event);
        return;
      } else {
        let properties = this.querySelector('map-properties');
        if (g.getAttribute('role') === 'link') {
          for (let path of g.children) {
            path.mousedown.call(this._featureGroup, event);
            path.mouseup.call(this._featureGroup, event);
          }
        }
        // AFTER the mousedown and mouseup events:
        // case 1: the layer el is not re-attached to the map, the <map-feature> el is still CONNECTED
        // case 2: the layer el is re-attached to the map; the disconnectedCallback() is invoked;
        //         the <map-feature> el (THIS) is now DISCONNECTED, this._featureGroup is removed and a new one is created
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
    
    focus(event) {
      let g = this._groupEl;
      if (typeof this.onfocus === 'function') {
        this.onfocus.call(this, event);
        return;
      } else {
        g.focus();
      }
    }

    blur(event) {
      if (typeof this.onblur === 'function') {
        this.onblur.call(this, event);
      } else if (document.activeElement.shadowRoot?.activeElement === this._groupEl || 
                 document.activeElement.shadowRoot?.activeElement.parentNode === this._groupEl) {
        this._groupEl.blur();
        // set focus to the map container
        this._map._container.focus();
      }
    }

    zoomTo() {
      let extent = this.extent,
          map = this._map;
      let tL = extent.topLeft.pcrs,
          bR = extent.bottomRight.pcrs,
          bound = L.bounds(L.point(tL.horizontal, tL.vertical), L.point(bR.horizontal, bR.vertical)),
          center = map.options.crs.unproject(bound.getCenter(true));
      let layerEl = this._layerParent._layerEl,
          minZoom = layerEl.extent.zoom.minZoom,
          maxZoom = layerEl.extent.zoom.maxZoom;
      map.setView(center, M.getMaxZoom(bound, map, minZoom, maxZoom), {animate: false});
    }
  }