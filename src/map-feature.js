export class MapFeature extends HTMLElement {
    static get observedAttributes() {
      return ['zoom'];
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
            this._redraw();
          }
          break;
        }
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
      } else if (!this._featureLayer) {
        this._redraw();
      }
    }
      
    disconnectedCallback() {
      if(this._layerParent._layerEl.hasAttribute("data-moving")) return;
      this._remove();
      this._observer.disconnect();
    }

    _remove() {
      // if the <layer- > el is disconnected
      // the <g> el has already got removed at this point
      if (this._groupEl?.isConnected) {
        this._groupEl.remove();
      }
      // if the <layer- > el has already been disconnected,
      // then _map.removeLayer(layerEl._layer) has already been invoked (inside layerEl.disconnectedCallback())
      // this._featureLayer has already got removed at this point
      if (this._featureLayer?._map) {
        this._featureLayer._map.removeLayer(this._featureLayer);
        let mapmlvectors = this._layerParent._mapmlvectors;
        if (mapmlvectors) {
          delete mapmlvectors._layers[this._featureLayer._leaflet_id];
          let zoom = mapmlvectors._clampZoom(this._map.getZoom());
          for (let i = 0; i < mapmlvectors._features[zoom].length; ++i) {
            let feature = mapmlvectors._features[zoom][i];
            if (feature._leaflet_id === this._featureLayer._leaflet_id) {
              mapmlvectors._features[zoom].splice(i, 1);
              break;
            }
          }
        }
      }
      delete this._featureLayer;
      delete this._groupEl;
    }

    // re-add / update features
    _redraw() {
      let zoomMeta = this._layerParent._layerEl.querySelectorAll('map-meta[name="zoom"]'),
          length = zoomMeta?.length,
          nativeZoom = length ? +(zoomMeta[length - 1].getAttribute('content')?.split(',').find(str => str.includes("value"))?.split('=')[1]) : 0,
          nativeCS = this.closest(".map-meta[name=cs]")?.getAttribute('content') || 'pcrs',
          mapmlvectors = this._layerParent._mapmlvectors;
      if (mapmlvectors) {
        // if the <layer- > is not removed, then regenerate featureGroup and update the mapmlvectors accordingly
        let zoom = mapmlvectors._clampZoom(this._map.getZoom());
        if (this._layerParent._content.nodeType === Node.DOCUMENT_NODE) {
          // if the map-feature originally migrates from mapml file
          // the nativezoom should be the <map-meta> in mapml file
          let native = mapmlvectors._getNativeVariables(this._layerParent._content);
          nativeCS = native.cs;
          nativeZoom = native.zoom;
        }

        this._featureLayer = mapmlvectors.addData(this, nativeCS, nativeZoom);

        mapmlvectors._resetFeatures(zoom);
        this._map._addZoomLimit(mapmlvectors);

        mapmlvectors._layers[this._featureLayer._leaflet_id] = this._featureLayer;
        this._groupEl = this._featureLayer.options.group;
      }
    }

    // Util functions:
    // internal support for returning a GeoJSON representation of <map-feature> geometry
    // propertyFunction (optional): the function used to format the innerHTML of <map-properties>
    geometryToGeoJSON(propertyFunction) {
      let json = {}, count = 0;
      let shapes = this._featureLayer._layers;
      for (let id in shapes) {
        let j = json[count] = {};
        // transform to gcrs
        let source = null, dest = null, transform = false;
        if (this._map.options.crs.code !== "EPSG:3857" && this._map.options.crs.code  !== "EPSG:4326") {
          source = new proj4.Proj(this._map.options.crs.code);
          dest = new proj4.Proj('EPSG:4326');
          transform = true;
        }
        j.geometry = M._geometry2geojson(shapes[id]._markup, source, dest, transform);
        
        let el = this.querySelector('map-properties');
        if (el) {
          if (propertyFunction) {
            j.properties = propertyFunction(el);
          } else if (el.querySelector('table')) { 
            // setting properties when table presented
            let table = (el.querySelector('table')).cloneNode(true);
            j.properties = M._table2properties(table);
          } else {
            // when no table present, strip any possible html tags to only get text
            j.properties = {prop0: (el.innerHTML).replace( /(<([^>]+)>)/ig, '').replace(/\s/g, '')};
          }
        }
        count++;
      }
      return json;
    }

    // method to calculate and return the extent of the feature as a JavaScript object
    _getFeatureExtent() {
      let map = this._map,
          geometry = this.querySelector('map-geometry'),
          nativeCS = this.closest(".map-meta[name=cs]")?.getAttribute('content') || 'pcrs',
          cs = geometry.getAttribute('cs') || nativeCS,
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
      let pcrsBound = M.boundsToPCRSBounds(L.bounds(topLeft, bottomRight), map.getZoom(), map.options.projection, cs);
      return M._convertAndFormatPCRS(pcrsBound, map);

      function _updateExtent(shape, coord) {
        let data = coord.innerHTML.trim().split(' ');
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
        this.onclick(this, event);
        return;
      } else {
        document.dispatchEvent(new CustomEvent ('focuschange'));
        let properties = this.querySelector('map-properties');
        if (g.getAttribute('role') === 'link') {
          for (let path of g.children) {
            path.mousedown.call(this._featureLayer, event);
            path.mouseup.call(this._featureLayer, event);
          }
        }
        // AFTER the mousedown and mouseup events:
        // case 1: the layer el is not re-attached to the map, the <map-feature> el is still CONNECTED
        // case 2: the layer el is re-attached to the map; the disconnectedCallback() is invoked;
        //         the <map-feature> el (THIS) is now DISCONNECTED, this._featureLayer is removed and a new featureLayer is created
        if (properties && this.isConnected) {
          let featureLayer = this._featureLayer,
              shapes = featureLayer._layers;
          // close popup if the popup is currently shown
          for (let id in shapes) {
            if (shapes[id].isPopupOpen()) {
              shapes[id].closePopup();
            }
          }
          if (featureLayer.isPopupOpen()) {
            featureLayer.closePopup();
          } else {
            featureLayer.openPopup();
          }
        }
      }
    }
    
    focus(event) {
      let g = this._groupEl;
      if (!event) {
        let rect = g.getBoundingClientRect();
        event = new MouseEvent ("mousedown", {
          clientX: rect.x + rect.width / 2,
          clientY: rect.y + rect.height / 2,
          button: 0,
        });
      }
      if (typeof this.onfocus === 'function') {
        this.onfocus(this, event);
        return;
      } else {
        // if any other <map-feature> element is on :focus state, remove
        document.dispatchEvent(new CustomEvent('focuschange'));
        // highlight the <g> element on map
        g.classList.add('focus');
        // handle focus (document.activeElement)
        g.focus();
        // focus state will be removed when users change focus to the other elements
        g.addEventListener('blur', _removeFocusState, true);
        document.addEventListener('focuschange', _removeFocusState, true);
      }

      function _removeFocusState (e) {
        if (g.classList.contains('focus')) {
          g.classList.remove('focus');
        }
        g.removeEventListener('blur', _removeFocusState);
        document.removeEventListener('focuschange', _removeFocusState);
      }
    }
  }