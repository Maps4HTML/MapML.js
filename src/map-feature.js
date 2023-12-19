export class MapFeature extends HTMLElement {
  static get observedAttributes() {
    return ['zoom', 'min', 'max'];
  }

  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get zoom() {
    return +(this.hasAttribute('zoom') ? this.getAttribute('zoom') : 0);
  }

  set zoom(val) {
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal) && parsedVal >= this.min && parsedVal <= this.max) {
      this.setAttribute('zoom', parsedVal);
    }
  }

  get min() {
    // fallback: the minimum zoom bound of layer- element
    return +(this.hasAttribute('min')
      ? this.getAttribute('min')
      : this.getLayerEl().extent.zoom.minZoom);
  }

  set min(val) {
    var parsedVal = parseInt(val, 10);
    var layerZoomBounds = this.getLayerEl().extent.zoom;
    if (!isNaN(parsedVal)) {
      if (
        parsedVal >= layerZoomBounds.minZoom &&
        parsedVal <= layerZoomBounds.maxZoom
      ) {
        this.setAttribute('min', parsedVal);
      } else {
        this.setAttribute('min', layerZoomBounds.minZoom);
      }
    }
  }

  get max() {
    // fallback: the maximum zoom bound of layer- element
    return +(this.hasAttribute('max')
      ? this.getAttribute('max')
      : this.getLayerEl().extent.zoom.maxZoom);
  }

  set max(val) {
    var parsedVal = parseInt(val, 10);
    var layerZoomBounds = this.getLayerEl().extent.zoom;
    if (!isNaN(parsedVal)) {
      if (
        parsedVal >= layerZoomBounds.minZoom &&
        parsedVal <= layerZoomBounds.maxZoom
      ) {
        this.setAttribute('max', parsedVal);
      } else {
        this.setAttribute('max', layerZoomBounds.maxZoom);
      }
    }
  }

  get extent() {
    if (this.isConnected) {
      // if the feature extent is the first time to be calculated or the feature extent is changed (by changing
      // the innertext of map-coordinates), then calculate feature extent by invoking the getFeatureExtent function
      if (!this._getFeatureExtent) {
        this._getFeatureExtent = this._memoizeExtent();
      }
      return this._getFeatureExtent();
    }
  }
  getLayerEl() {
    let layerEl;
    if (this.getRootNode() instanceof ShadowRoot) {
      if (this.getRootNode().host.getRootNode() instanceof ShadowRoot) {
        //   layer- src
        //     > sd
        //      map-extent
        //       map-link
        //        > sd
        //          map-feature (1)
        layerEl = this.getRootNode().host.getRootNode().host;
      } else if (this.getRootNode().host.nodeName === 'MAP-LINK') {
        //   layer-
        //     map-extent
        //       map-link
        //         > sd
        //           map-feature (4)
        layerEl = this.getRootNode().host.closest('layer-');
      } else {
        //   layer- src
        //     > sd
        //        map-feature (2)
        layerEl = this.getRootNode().host;
      }
    } else {
      //     layer-
      //       map-feature (3)
      layerEl = this.closest('layer-');
    }
    return layerEl;
  }
  getMapEl() {
    return this.getLayerEl().closest('mapml-viewer,map[is=web-map]');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'min':
        case 'max':
        case 'zoom':
          if (oldValue !== newValue) {
            this.reRender(this._featureLayer);
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
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    this._parentEl =
      this.parentNode.nodeName.toUpperCase() === 'LAYER-' ||
      this.parentNode.nodeName.toUpperCase() === 'MAP-LINK'
        ? this.parentNode
        : this.parentNode.host;
    if (
      this.getLayerEl().hasAttribute('data-moving') ||
      this._parentEl.parentElement.hasAttribute('data-moving')
    )
      return;
    // use observer to monitor the changes in mapFeature's subtree
    // (i.e. map-properties, map-featurecaption, map-coordinates)
    this._observer = new MutationObserver((mutationList) => {
      for (let mutation of mutationList) {
        // the attributes changes of <map-feature> element should be handled by attributeChangedCallback()
        if (mutation.type === 'attributes' && mutation.target === this) {
          return;
        }
        // re-render feature if there is any observed change
        this.reRender(this._featureLayer);
        // TODO: move this code to layer- mutation observer
        // delete this._parentEl.bounds;
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
    if (!this.getLayerEl()?.hasAttribute('data-moving')) return;
    this.removeFeature(this._featureLayer);
    this._observer.disconnect();
  }

  reRender(layerToRenderOn) {
    // this is for re-generating the rendering in case of <geometry> changes
    // based on mutation observers. Kinda brute force.
    if (this._groupEl.isConnected) {
      let fallbackZoom = this._getFallbackZoom();
      let fallbackCS = this._getFallbackCS();
      let placeholder = document.createElement('span');
      this._groupEl.insertAdjacentElement('beforebegin', placeholder);
      if (layerToRenderOn._staticFeature) {
        layerToRenderOn._removeFromFeaturesList(this._geometry);
      }
      layerToRenderOn.removeLayer(this._geometry);
      // Garbage collection needed
      this._geometry = layerToRenderOn
        .addData(this, fallbackCS, fallbackZoom) // side effect: this._groupEl set
        .addTo(layerToRenderOn);
      placeholder.replaceWith(this._geometry.options.group);
      layerToRenderOn._resetFeatures();
      // TODO: getBounds() should dynamically update the layerBounds and zoomBounds
      delete this._getFeatureExtent;
      this._setUpEvents();
    }
  }

  removeFeature(layerToRemoveFrom) {
    // layerToRemoveFrom is the L.LayerGroup or L.FeatureGroup to remove this
    // feature from...
    layerToRemoveFrom.removeLayer(this._geometry);
    // TODO: MOVE THIS LOGIC TO layerToRemoveFrom.removeLayer(M.Geometry)
    //    if (layerToRemoveFrom._staticFeature) {
    //      if (layerToRemoveFrom._features[this.zoom]) {
    //        this._removeInFeatureList(this.zoom);
    //      }
    //
    //      TODO: update layerToRemoveFrom.removeLayer(...) to update its own
    //      zoomBounds
    //      // update zoom bounds of vector layer
    //      layerToRemoveFrom.zoomBounds = M.getZoomBounds(
    //        this._layer._content,
    //        this._getNativeZoomAndCS(this._layer._content).zoom
    //      );
    //    }
    if (layerToRemoveFrom._staticFeature) {
      layerToRemoveFrom._removeFromFeaturesList(this._geometry);
    }
    layerToRemoveFrom.options.properties = null;
    layerToRemoveFrom.removeLayer(this._geometry);
    delete this._geometry;
    // ensure that feature extent can be re-calculated everytime that map-feature element is updated / re-added
    if (this._getFeatureExtent) delete this._getFeatureExtent;
  }

  addFeature(layerToAddTo) {
    this._featureLayer = layerToAddTo;
    let parentLayer = this.getLayerEl();
    // "synchronize" the event handlers between map-feature and <g>
    if (!this.querySelector('map-geometry')) return;
    let fallbackZoom = this._getFallbackZoom();
    let fallbackCS = this._getFallbackCS();
    let content = parentLayer.src ? parentLayer.shadowRoot : parentLayer;
    this._geometry = layerToAddTo
      .addData(this, fallbackCS, fallbackZoom) // side effect: extends `this` with this._groupEl, points to svg g element that renders to map SD
      .addTo(layerToAddTo);
    layerToAddTo._layers[this._geometry._leaflet_id] = this._geometry;
    if (layerToAddTo._staticFeature && this._parentEl.nodeName !== 'MAP-LINK') {
      // update zoom bounds of vector layer
      layerToAddTo.zoomBounds = M.getZoomBounds(
        content,
        // this._getNativeZoomAndCS().zoom
        fallbackZoom
      );
      // todo: dynamically update layer bounds of vector layer
      layerToAddTo.layerBounds = M.getBounds(content);
      // update map's zoom limit
      // the mapmlvectors.options should be updated with the new zoomBounds,
      // to ensure the _addZoomLimit function call can read updated zoom info
      // and update map zoom limit properly
      L.extend(layerToAddTo.options, layerToAddTo.zoomBounds);
      // this._map._addZoomLimit(mapmlvectors);
      // TODO: can be set as a handler of featureLayer
      layerToAddTo._resetFeatures();
    }

    this._setUpEvents();
  }

  _setUpEvents() {
    ['click', 'focus', 'blur', 'keyup', 'keydown'].forEach((name) => {
      // when <g> is clicked / focused / blurred
      // should dispatch the click / focus / blur event listener on **linked HTMLFeatureElements**
      this._groupEl.addEventListener(name, (e) => {
        if (name === 'click') {
          // dispatch a cloned mouseevent to trigger the click event handlers set on HTMLFeatureElement
          let clickEv = new PointerEvent(name, { cancelable: true });
          clickEv.originalEvent = e;
          this.dispatchEvent(clickEv);
        } else if (name === 'keyup' || name === 'keydown') {
          let keyEv = new KeyboardEvent(name, { cancelable: true });
          keyEv.originalEvent = e;
          this.dispatchEvent(keyEv);
        } else {
          // dispatch a cloned focusevent to trigger the focus/blue event handlers set on HTMLFeatureElement
          let focusEv = new FocusEvent(name, { cancelable: true });
          focusEv.originalEvent = e;
          this.dispatchEvent(focusEv);
        }
      });
    });
  }

  // native zoom: used by FeatureLayer.addData(...),
  //              the fallback zoom for map-feature if its zoom attribute is not specified
  //              for query and templated features, fallback zoom is the current map zoom level
  //              for static features, fallback zoom is map-meta[name="zoom"] value in layer- || the current map zoom level
  _getFallbackZoom() {
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // feature attaches to link's shadow
      return this.getMapEl().zoom;
    } else {
      // feature attaches to the layer- / layer-'s shadow
      let layerEl = this.getLayerEl();
      let zoomMeta = layerEl.src
        ? layerEl.shadowRoot.querySelector('map-meta[name=zoom]')
        : layerEl.querySelector('map-meta[name=zoom]');
      return (
        M._metaContentToObject(zoomMeta?.getAttribute('content'))?.value ||
        this.getMapEl().zoom
      );
    }
  }

  // native cs: used by FeatureLayer.geometryToLayer(...),
  //            the fallback cs for map-geometry if its cs attribute is not specified
  _getFallbackCS() {
    let csMeta;
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // feature attaches to link's shadow
      csMeta =
        this._parentEl.shadowRoot.querySelector('map-meta[name=cs]') ||
        this._parentEl.parentElement.getMeta('cs');
    } else {
      let layerEl = this.getLayerEl();
      csMeta = layerEl.src
        ? layerEl.shadowRoot.querySelector('map-meta[name=cs]')
        : layerEl.querySelector('map-meta[name=cs]');
    }
    if (csMeta) {
      // M._metaContentObject("gcrs") -> {content: "gcrs"}
      return (
        M._metaContentToObject(csMeta.getAttribute('content')).content || 'gcrs'
      );
    } else {
      return 'gcrs';
    }
  }

  // Util functions:
  // internal method to calculate the extent of the feature and store it in cache for the first time
  // and return cache when feature's extent is repeatedly requested
  // for .extent
  _memoizeExtent() {
    // memoize calculated extent
    let extentCache;
    return function () {
      if (extentCache && this._getFeatureExtent) {
        // if the extent has already been calculated and is not updated, return stored extent
        return extentCache;
      } else {
        // calculate feature extent
        let map = this.getMapEl()._map,
          geometry = this.querySelector('map-geometry'),
          cs = geometry.getAttribute('cs') || this._getFallbackCS(),
          // zoom level that the feature rendered at
          zoom = this.zoom || this._getFallbackZoom(),
          shapes = geometry.querySelectorAll(
            'map-point, map-linestring, map-polygon, map-multipoint, map-multilinestring'
          ),
          bboxExtent = [
            Infinity,
            Infinity,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
          ];
        for (let shape of shapes) {
          let coord = shape.querySelectorAll('map-coordinates');
          for (let i = 0; i < coord.length; ++i) {
            bboxExtent = _updateExtent(shape, coord[i], bboxExtent);
          }
        }
        let topLeft = L.point(bboxExtent[0], bboxExtent[1]);
        let bottomRight = L.point(bboxExtent[2], bboxExtent[3]);
        let pcrsBound = M.boundsToPCRSBounds(
          L.bounds(topLeft, bottomRight),
          zoom,
          map.options.projection,
          cs
        );
        if (
          shapes.length === 1 &&
          shapes[0].tagName.toUpperCase() === 'MAP-POINT'
        ) {
          let projection = map.options.projection,
            maxZoom = this.hasAttribute('max')
              ? +this.getAttribute('max')
              : M[projection].options.resolutions.length - 1,
            tileCenter = M[projection].options.crs.tile.bounds.getCenter(),
            pixel = M[projection].transformation.transform(
              pcrsBound.min,
              M[projection].scale(+this.zoom || maxZoom)
            );
          pcrsBound = M.pixelToPCRSBounds(
            L.bounds(pixel.subtract(tileCenter), pixel.add(tileCenter)),
            this.zoom || maxZoom,
            projection
          );
        }
        let result = Object.assign(
          M._convertAndFormatPCRS(
            pcrsBound,
            map.options.crs,
            map.options.projection
          )
        );
        // memoize calculated result
        extentCache = result;
        return result;
      }
    };

    // update the bboxExtent
    function _updateExtent(shape, coord, bboxExtent) {
      let data = coord.innerHTML
        .trim()
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .split(/[<>\ ]/g);
      switch (shape.tagName) {
        case 'MAP-POINT':
          bboxExtent = M._updateExtent(bboxExtent, +data[0], +data[1]);
          break;
        case 'MAP-LINESTRING':
        case 'MAP-POLYGON':
        case 'MAP-MULTIPOINT':
        case 'MAP-MULTILINESTRING':
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

  getMaxZoom() {
    let tL = this.extent.topLeft.pcrs,
      bR = this.extent.bottomRight.pcrs,
      bound = L.bounds(
        L.point(tL.horizontal, tL.vertical),
        L.point(bR.horizontal, bR.vertical)
      );
    let projection = this.getMapEl()._map.options.projection,
      layerZoomBounds = this.getLayerEl().extent.zoom,
      minZoom = layerZoomBounds.minZoom ? layerZoomBounds.minZoom : 0,
      maxZoom = layerZoomBounds.maxZoom
        ? layerZoomBounds.maxZoom
        : M[projection].options.resolutions.length - 1;
    let newZoom;
    if (this.hasAttribute('zoom')) {
      // if there is a zoom attribute set to the map-feature, zoom to the zoom attribute value
      newZoom = this.zoom;
    } else {
      // if not, calculate the maximum zoom level that can show the feature completely
      newZoom = M.getMaxZoom(bound, this.getMapEl()._map, minZoom, maxZoom);
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
      type: 'Feature',
      properties: {},
      geometry: {}
    };
    let el = this.querySelector('map-properties');
    if (!el) {
      json.properties = null;
    } else if (typeof options.propertyFunction === 'function') {
      json.properties = options.propertyFunction(el);
    } else if (el.querySelector('table')) {
      // setting properties when table presented
      let table = el.querySelector('table').cloneNode(true);
      json.properties = M._table2properties(table);
    } else {
      // when no table present, strip any possible html tags to only get text
      json.properties = {
        prop0: el.innerHTML.replace(/(<([^>]+)>)/gi, '').replace(/\s/g, '')
      };
    }

    // transform to gcrs if options.transform = true (default)
    let source = null,
      dest = null,
      map = this.getMapEl()._map;
    if (options.transform) {
      source = new proj4.Proj(map.options.crs.code);
      dest = new proj4.Proj('EPSG:4326');
      if (
        map.options.crs.code === 'EPSG:3857' ||
        map.options.crs.code === 'EPSG:4326'
      ) {
        options.transform = false;
      }
    }

    let collection = this.querySelector('map-geometry').querySelector(
        'map-geometrycollection'
      ),
      shapes = this.querySelector('map-geometry').querySelectorAll(
        'map-point, map-polygon, map-linestring, map-multipoint, map-multipolygon, map-multilinestring'
      );

    if (collection) {
      json.geometry.type = 'GeometryCollection';
      json.geometry.geometries = [];
      for (let shape of shapes) {
        json.geometry.geometries.push(
          M._geometry2geojson(shape, source, dest, options.transform)
        );
      }
    } else {
      json.geometry = M._geometry2geojson(
        shapes[0],
        source,
        dest,
        options.transform
      );
    }
    return json;
  }

  // a method that simulates a click, or invoking the user-defined click event
  click() {
    let g = this._groupEl,
      rect = g.getBoundingClientRect();
    let event = new MouseEvent('click', {
      clientX: rect.x + rect.width / 2,
      clientY: rect.y + rect.height / 2,
      button: 0
    });
    let properties = this.querySelector('map-properties');
    if (g.getAttribute('role') === 'link') {
      for (let path of g.children) {
        path.mousedown.call(this._geometry, event);
        path.mouseup.call(this._geometry, event);
      }
    }
    // dispatch click event for map-feature to allow events entered by 'addEventListener'
    let clickEv = new PointerEvent('click', { cancelable: true });
    clickEv.originalEvent = event;
    this.dispatchEvent(clickEv);
    // for custom projection, layer- element may disconnect and re-attach to the map after the click
    // so check whether map-feature element is still connected before any further operations
    if (properties && this.isConnected) {
      let geometry = this._geometry,
        shapes = geometry._layers;
      // close popup if the popup is currently open
      for (let id in shapes) {
        if (shapes[id].isPopupOpen()) {
          shapes[id].closePopup();
        }
      }
      if (geometry.isPopupOpen()) {
        geometry.closePopup();
      } else if (!clickEv.originalEvent.cancelBubble) {
        // If stopPropagation is not set on originalEvent by user
        geometry.openPopup();
      }
    }
  }

  // a method that sets the current focus to the <g> element, or invoking the user-defined focus event
  //      options (optional): as options parameter for native HTMLElement
  //                          https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
  focus(options) {
    this._groupEl.focus(options);
  }

  // a method that makes the <g> element lose focus, or invoking the user-defined blur event
  blur() {
    if (
      document.activeElement.shadowRoot?.activeElement === this._groupEl ||
      document.activeElement.shadowRoot?.activeElement.parentNode ===
        this._groupEl
    ) {
      this._groupEl.blur();
      // set focus to the map container
      this.getMapEl()._map.getContainer().focus();
    }
  }

  // a method that can the viewport to be centred on the feature's extent
  zoomTo() {
    let extent = this.extent,
      map = this.getMapEl()._map;
    let tL = extent.topLeft.pcrs,
      bR = extent.bottomRight.pcrs,
      bound = L.bounds(
        L.point(tL.horizontal, tL.vertical),
        L.point(bR.horizontal, bR.vertical)
      ),
      center = map.options.crs.unproject(bound.getCenter(true));
    map.setView(center, this.getMaxZoom(), { animate: false });
  }
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this.isConnected /* jshint ignore:line */) {
        resolve();
      } else {
        let featureElement = this;
        interval = setInterval(testForFeature, 200, featureElement);
        failureTimer = setTimeout(featureNotDefined, 5000);
      }
      function testForFeature(featureElement) {
        if (featureElement.isConnected /* jshint ignore:line */) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        }
      }
      function featureNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for feature to be ready');
      }
    });
  }
}
