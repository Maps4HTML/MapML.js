import { bounds, point, extend } from 'leaflet';

import { MapFeatureLayer } from './mapml/layers/MapFeatureLayer.js';
import { featureRenderer } from './mapml/features/featureRenderer.js';
import { Util } from './mapml/utils/Util.js';
import proj4 from 'proj4';
import { calculatePosition } from './mapml/elementSupport/layers/calculatePosition.js';

export class HTMLFeatureElement extends HTMLElement {
  static get observedAttributes() {
    return ['zoom', 'min', 'max'];
  }

  /* jshint ignore:start */
  #hasConnected; // prevents attributeChangedCallback before connectedCallback
  /* jshint ignore:end */
  get zoom() {
    // for templated or queried features ** native zoom is only used for zoomTo() **
    let meta = {},
      metaEl = this.getMeta('zoom');
    if (metaEl)
      meta = Util._metaContentToObject(metaEl.getAttribute('content'));
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // nativeZoom = zoom attribute || (sd.map-meta zoom 'value'  || 'max') || this._initialZoom
      return +(this.hasAttribute('zoom')
        ? this.getAttribute('zoom')
        : meta.value
        ? meta.value
        : meta.max
        ? meta.max
        : this._initialZoom);
    } else {
      // for "static" features
      // nativeZoom zoom attribute || this._initialZoom
      // NOTE we don't use map-meta here, because the map-meta is the minimum
      // zoom bounds for the layer, and is extended by additional features
      // if added / removed during layer lifetime
      return +(this.hasAttribute('zoom')
        ? this.getAttribute('zoom')
        : this._initialZoom);
    }
  }

  set zoom(val) {
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal) && parsedVal >= this.min && parsedVal <= this.max) {
      this.setAttribute('zoom', parsedVal);
    }
  }

  get min() {
    // for templated or queried features ** native zoom is only used for zoomTo() **
    let meta = {},
      metaEl = this.getMeta('zoom');
    if (metaEl)
      meta = Util._metaContentToObject(metaEl.getAttribute('content'));
    let projectionMinZoom = 0;
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // minZoom = min attribute || sd.map-meta min zoom || map-link minZoom
      return +(this.hasAttribute('min')
        ? this.getAttribute('min')
        : meta.min
        ? meta.min
        : this._parentEl.getZoomBounds().minZoom);
    } else {
      // for "static" features
      // minZoom = min attribute || map-meta zoom || projection minZoom
      return +(this.hasAttribute('min')
        ? this.getAttribute('min')
        : meta.min
        ? meta.min
        : projectionMinZoom);
    }
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
    // for templated or queried features ** native zoom is only used for zoomTo() **
    let meta = {},
      metaEl = this.getMeta('zoom');
    if (metaEl)
      meta = Util._metaContentToObject(metaEl.getAttribute('content'));
    let projectionMaxZoom =
      this.getMapEl()._map.options.crs.options.resolutions.length - 1;
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // maxZoom = max attribute || sd.map-meta max zoom || map-link maxZoom
      return +(this.hasAttribute('max')
        ? this.getAttribute('max')
        : meta.max
        ? meta.max
        : this._parentEl.getZoomBounds().maxZoom);
    } else {
      // for "static" features
      // maxZoom = max attribute || map-meta zoom max || projection maxZoom
      return +(this.hasAttribute('max')
        ? this.getAttribute('max')
        : meta.max
        ? meta.max
        : projectionMaxZoom);
    }
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
  get position() {
    return calculatePosition(this);
  }
  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  getLayerEl() {
    return Util.getClosest(this, 'map-layer,layer-');
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
    // set the initial zoom of the map when features connected
    // used for fallback zoom getter for static features
    this._initialZoom = this.getMapEl().zoom;
    this._parentEl =
      this.parentNode.nodeName === 'MAP-LAYER' ||
      this.parentNode.nodeName === 'LAYER-' ||
      this.parentNode.nodeName === 'MAP-LINK'
        ? this.parentNode
        : this.parentNode.host;
    if (
      this.getLayerEl().hasAttribute('data-moving') ||
      this._parentEl.parentElement?.hasAttribute('data-moving')
    )
      return;
    if (
      this._parentEl.nodeName === 'MAP-LAYER' ||
      this._parentEl.nodeName === 'LAYER-' ||
      this._parentEl.nodeName === 'MAP-LINK'
    ) {
      this._createOrGetFeatureLayer();
    }
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
    if (
      this.getLayerEl()?.hasAttribute('data-moving') ||
      this._parentEl.parentElement?.hasAttribute('data-moving')
    )
      return;
    this._observer.disconnect();
    if (this._featureLayer) {
      this.removeFeature(this._featureLayer);
      // If this was the last feature in the layer, clean up the layer
      if (this._featureLayer.getLayers().length === 0) {
        if (this._featureLayer.options.renderer) {
          // since this is the last reference to the MapFeatureLayer, we need to also
          // manually remove the shared renderer
          this._featureLayer.options.renderer.remove();
        }
        this._featureLayer.remove();
        this._featureLayer = null;
        delete this._featureLayer;
      }
    }
  }

  reRender(layerToRenderOn) {
    // this is for re-generating the rendering in case of <geometry> changes
    // based on mutation observers. Kinda brute force.
    if (this._groupEl.isConnected) {
      let fallbackCS = this._getFallbackCS();
      let placeholder = document.createElement('span');
      this._groupEl.insertAdjacentElement('beforebegin', placeholder);
      if (layerToRenderOn._staticFeature) {
        layerToRenderOn._removeFromFeaturesList(this._geometry);
      }
      layerToRenderOn.removeLayer(this._geometry);
      // Garbage collection needed
      this._geometry = layerToRenderOn
        .createGeometry(this, fallbackCS) // side effect: this._groupEl set
        .addTo(layerToRenderOn);
      placeholder.replaceWith(this._geometry.options.group);
      layerToRenderOn._validateRendering();
      // TODO: getBounds() should dynamically update the layerBounds and zoomBounds
      delete this._getFeatureExtent;
      this._setUpEvents();
    }
  }

  removeFeature(layerToRemoveFrom) {
    // layerToRemoveFrom is the LayerGroup or FeatureGroup to remove this
    // feature from...
    layerToRemoveFrom.removeLayer(this._geometry);
    // TODO: MOVE THIS LOGIC TO layerToRemoveFrom.removeLayer(Geometry)
    //    if (layerToRemoveFrom._staticFeature) {
    //      if (layerToRemoveFrom._features[this.zoom]) {
    //        this._removeInFeatureList(this.zoom);
    //      }
    if (layerToRemoveFrom._staticFeature) {
      layerToRemoveFrom._removeFromFeaturesList(this._geometry);
    }
    layerToRemoveFrom.options.properties = null;
    delete this._geometry;
    // ensure that feature extent can be re-calculated everytime that map-feature element is updated / re-added
    if (this._getFeatureExtent) delete this._getFeatureExtent;
  }

  addFeature(layerToAddTo) {
    this._featureLayer = layerToAddTo;
    // "synchronize" the event handlers between map-feature and <g>
    if (!this.querySelector('map-geometry')) return;
    let fallbackCS = this._getFallbackCS();
    this._geometry = layerToAddTo.createGeometry(this, fallbackCS); // side effect: extends `this` with this._groupEl if successful, points to svg g element that renders to map SD
    if (!this._geometry) return;
    this._geometry._layerEl = this.getLayerEl();
    layerToAddTo.addLayer(this._geometry);
    this._setUpEvents();
  }
  isFirst() {
    // Get the previous element sibling
    const prevSibling = this.previousElementSibling;

    // If there's no previous sibling, return true
    if (!prevSibling) {
      return true;
    }

    // Compare the node names (tag names) - return true if they're different
    return this.nodeName !== prevSibling.nodeName;
  }
  getPrevious() {
    // Check if this is the first element of a sequence
    if (this.isFirst()) {
      return null; // No previous element available
    }

    // Since we know it's not the first, we can safely return the previous element sibling
    return this.previousElementSibling;
  }
  _createOrGetFeatureLayer() {
    // Wait for parent layer to be ready before proceeding
    this._parentEl
      .whenReady()
      .then(() => {
        // Detect parent context and get the appropriate layer container
        const isMapLink = this._parentEl.nodeName === 'MAP-LINK';
        const parentLayer = isMapLink
          ? this._parentEl._templatedLayer
          : this._parentEl._layer;

        if (this.isFirst() && parentLayer) {
          const parentElement = this._parentEl;

          let map = parentElement.getMapEl()._map;

          this._featureLayer = new MapFeatureLayer(null, {
            // pass the vector layer a renderer of its own, otherwise leaflet
            // puts everything into the overlayPane
            // with this feature creating its own MapFeatureLayer for each
            // sub-sequence of features, it means that there may be > 1 <svg>
            // container (one per renderer) in the pane...
            renderer: featureRenderer(),
            // pass the vector layer the container for the parent into which
            // it will append its own container for rendering into
            pane: parentLayer.getContainer(),
            // the bounds will be static, fixed, constant for the lifetime of a (templated) layer
            ...(isMapLink && parentElement.getBounds()
              ? { layerBounds: parentElement.getBounds() }
              : {}),
            ...(isMapLink ? { zoomBounds: this._getZoomBounds() } : {}),
            ...(isMapLink ? {} : { _leafletLayer: parentElement._layer }),
            zIndex: this.position,
            projection: map.options.projection,
            mapEl: parentElement.getMapEl(),
            onEachFeature: function (properties, geometry) {
              if (properties) {
                const popupOptions = {
                  autoClose: false,
                  autoPan: true,
                  maxHeight: map.getSize().y * 0.5 - 50,
                  maxWidth: map.getSize().x * 0.7,
                  minWidth: 165
                };
                var c = document.createElement('div');
                c.classList.add('mapml-popup-content');
                c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                geometry.bindPopup(c, popupOptions);
              }
            }
          });
          // this is used by DebugOverlay testing "multipleExtents.test.js
          // but do we really need or want each feature to have the bounds of the
          // map link?  tbd
          extend(this._featureLayer.options, {
            _leafletLayer: Object.assign(this._featureLayer, {
              _layerEl: this.getLayerEl()
            })
          });

          this.addFeature(this._featureLayer);

          // add MapFeatureLayer to appropriate parent layer
          parentLayer.addLayer(this._featureLayer);
        } else {
          // get the previous feature's layer
          this._featureLayer = this.getPrevious()?._featureLayer;
          if (this._featureLayer) {
            this.addFeature(this._featureLayer);
          }
        }
      })
      .catch((error) => {
        console.log('Error waiting for parent layer to be ready:', error);
      });
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

  // native cs: used by FeatureLayer._geometryToLayer(...),
  //            the fallback cs for map-geometry if its cs attribute is not specified
  _getFallbackCS() {
    let csMeta;
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // feature attaches to link's shadow root
      csMeta =
        this._parentEl.shadowRoot.querySelector('map-meta[name=cs][content]') ||
        this._parentEl.parentElement.getMeta('cs');
    } else {
      let layerEl = this.getLayerEl();
      csMeta = layerEl.src
        ? layerEl.shadowRoot.querySelector('map-meta[name=cs][content]')
        : layerEl.querySelector('map-meta[name=cs][content]');
    }
    // even here we could make an effort to use the tref variables to determine
    // the coordinate system of the response - would only work with WMS, I think
    // the fallback 'gcrs' SHOULD be specified by the MapML spec
    // per https://github.com/Maps4HTML/MapML/issues/257
    return csMeta
      ? Util._metaContentToObject(csMeta.getAttribute('content')).content
      : 'gcrs';
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
          zoom = this.zoom,
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
        let topLeft = point(bboxExtent[0], bboxExtent[1]);
        let bottomRight = point(bboxExtent[2], bboxExtent[3]);
        let pcrsBound = Util.boundsToPCRSBounds(
          bounds(topLeft, bottomRight),
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
          pcrsBound = Util.pixelToPCRSBounds(
            bounds(pixel.subtract(tileCenter), pixel.add(tileCenter)),
            this.zoom || maxZoom,
            projection
          );
        }
        let result = Object.assign(
          Util._convertAndFormatPCRS(
            pcrsBound,
            map.options.crs,
            map.options.projection
          ),
          { zoom: this._getZoomBounds() }
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
      switch (shape.tagName.toUpperCase()) {
        case 'MAP-POINT':
          bboxExtent = Util._updateExtent(bboxExtent, +data[0], +data[1]);
          break;
        case 'MAP-LINESTRING':
        case 'MAP-POLYGON':
        case 'MAP-MULTIPOINT':
        case 'MAP-MULTILINESTRING':
          for (let i = 0; i < data.length; i += 2) {
            bboxExtent = Util._updateExtent(bboxExtent, +data[i], +data[i + 1]);
          }
          break;
        default:
          break;
      }
      return bboxExtent;
    }
  }
  _getZoomBounds() {
    // ** native zoom is only used for zoomTo() **
    return {
      minZoom: this.min,
      maxZoom: this.max,
      minNativeZoom: this.zoom,
      maxNativeZoom: this.zoom
    };
  }
  getZoomToZoom() {
    let tL = this.extent.topLeft.pcrs,
      bR = this.extent.bottomRight.pcrs,
      bound = bounds(
        point(tL.horizontal, tL.vertical),
        point(bR.horizontal, bR.vertical)
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
      newZoom = Util.getMaxZoom(bound, this.getMapEl()._map, minZoom, maxZoom);
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
  getMeta(metaName) {
    let name = metaName.toLowerCase();
    if (name !== 'cs' && name !== 'zoom' && name !== 'projection') return;
    let sdMeta = this._parentEl.shadowRoot.querySelector(
      `map-meta[name=${name}][content]`
    );
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // sd.map-meta || map-extent meta || layer meta
      return sdMeta || this._parentEl.parentElement.getMeta(metaName);
    } else {
      return this._parentEl.src
        ? this._parentEl.shadowRoot.querySelector(
            `map-meta[name=${name}][content]`
          )
        : this._parentEl.querySelector(`map-meta[name=${name}][content]`);
    }
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
      json.properties = Util._table2properties(table);
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
          Util._geometry2geojson(shape, source, dest, options.transform)
        );
      }
    } else {
      json.geometry = Util._geometry2geojson(
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
    // for custom projection, map-layer element may disconnect and re-attach to the map after the click
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
      bound = bounds(
        point(tL.horizontal, tL.vertical),
        point(bR.horizontal, bR.vertical)
      ),
      center = map.options.crs.unproject(bound.getCenter(true));
    map.setView(center, this.getZoomToZoom(), { animate: false });
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
