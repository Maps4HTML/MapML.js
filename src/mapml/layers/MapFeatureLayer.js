import {
  FeatureGroup,
  DomUtil,
  bounds,
  SVG,
  Util as LeafletUtil,
  Browser
} from 'leaflet';
import { Util } from '../utils/Util.js';
import { path } from '../features/path.js';
import { geometry } from '../features/geometry.js';

/**
 * The equivalent of MapTileLayer and MapExtentLayer, for features.
 * Represents an adjacent sequence of <map-feature> elements on the Leaflet map
 *
 * This layer will be inserted into the LayerGroup hosted by the <map-link> or
 * <map-layer> immediately after creation, so that its index within the _layers array of
 * that LayerGroup will be equal to its z-index within the LayerGroup's container
 *
 * <map-tile row="10" col="12" src="url1"></map-tile>  LayerGroup._layers[0] <- each *set* of adjacent tiles
 * <map-tile row="11" col="12" src="url2"></map-tile>  LayerGroup._layers[0] <- is a *single* MapTileLayer
 * <map-extent units="OSMTILE" checked hidden> LayerGroup._layers[1] *each* <map-extent> is a LayerGroup of Templated*Layer.js
 * <map-feature id="a"> LayerGroup._layers[2] <- each *set* of adjacent features
 * <map-feature id="b"> LayerGroup._layers[2] <- is a single MapFeatureLayer FeatureGroup
 * <map-tile row="10" col="12" src="url3"></map-tile>  LayerGroup._layers[3]
 * <map-tile row="11" col="12" src="url4"></map-tile>  LayerGroup._layers[3]
 * <map-feature id="c"> LayerGroup._layers[4]
 * <map-feature id="d"> LayerGroup._layers[4]
 * and so on
 *
 */
export var MapFeatureLayer = FeatureGroup.extend({
  initialize: function (mapml, options) {
    /*
        mapml:
        1. for query: an array of map-feature elements that it fetches
        2. for static: null (features manage themselves via connectedCallback)
        3. for templated: null (created by TemplatedFeaturesOrTilesLayer)
        4. for tiled: null (vector tiles)
      */
    FeatureGroup.prototype.initialize.call(this, null, options);

    // Determine context once
    this._context = this._determineContext(options);

    // Set up based on context
    this._setupContainer();
    this._setupFeatures(mapml);
  },

  /**
   * Determines the context for this MapFeatureLayer based on options
   * @param {Object} options - Layer options
   * @returns {string} - 'query', 'tiled', 'static', or 'templated'
   */
  _determineContext: function (options) {
    if (options.query) return 'query';
    if (options.tiles) return 'tiled';
    if (options._leafletLayer) return 'static';
    return 'templated';
  },

  /**
   * Sets up the container based on the determined context
   */
  _setupContainer: function () {
    if (this._context === 'tiled') {
      // Tiled vector features don't need container setup
      return;
    }

    if (this._context === 'query' || this._context === 'static') {
      // Query and static contexts create their own container
      this._container = DomUtil.create(
        'div',
        'leaflet-layer',
        this.options.pane
      );
      DomUtil.addClass(this._container, 'leaflet-pane mapml-vector-container');
    } else {
      // Templated context uses provided container directly
      this._container = this.options.pane;
      DomUtil.addClass(this._container, 'leaflet-pane mapml-vector-container');
    }
    if (this.options.zIndex) {
      this._container.style.zIndex = this.options.zIndex;
    }

    this.options.renderer.options.pane = this._container;
  },

  /**
   * Sets up feature management based on the determined context
   * @param {*} mapml - The mapml data
   */
  _setupFeatures: function (mapml) {
    switch (this._context) {
      case 'query':
        this._queryFeatures = mapml.features ? mapml.features : mapml;
        break;
      case 'static':
        this._features = {};
        break;
      case 'templated':
        // Features are added dynamically by TemplatedFeaturesOrTilesLayer
        break;
      case 'tiled':
        // Tiled features are managed differently
        break;
    }
  },

  /**
   * Public getter for external code that needs to check if this is a static feature layer
   * @returns {boolean}
   */
  get _staticFeature() {
    return this._context === 'static';
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
  },
  _updateZIndex: function () {
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },
  isVisible: function () {
    let map = this.options.mapEl._map;
    // if query, isVisible is unconditionally true
    if (this.options.query) return true;
    // if the featureLayer is for static features, i.e. it is the mapmlvector layer,
    // if it is empty, isVisible = false
    // For static context: check if the featureLayer is empty
    // this._features: check if the current static featureLayer is empty
    // (Object.keys(this._features).length === 0 => this._features is an empty object)
    else if (
      this._context === 'static' &&
      Object.keys(this._features).length === 0
    ) {
      return false;
    } else {
      let mapZoom = map.getZoom(),
        zoomBounds = this.zoomBounds || this.options.zoomBounds,
        layerBounds = this.layerBounds || this.options.layerBounds,
        withinZoom = zoomBounds
          ? mapZoom <= zoomBounds.maxZoom && mapZoom >= zoomBounds.minZoom
          : false;
      return (
        withinZoom &&
        this._layers &&
        layerBounds &&
        layerBounds.overlaps(
          Util.pixelToPCRSBounds(
            map.getPixelBounds(),
            mapZoom,
            map.options.projection
          )
        )
      );
    }
  },

  onAdd: function (map) {
    this._map = map;
    // Re-append container to pane if it was removed
    if (this._container && !this._container.isConnected && this.options.pane) {
      this.options.pane.appendChild(this._container);
    }
    FeatureGroup.prototype.onAdd.call(this, map);
    if (this._context === 'static') {
      this._validateRendering();
    }
    if (this._queryFeatures) {
      map.on('featurepagination', this.showPaginationFeature, this);
    }
  },
  addLayer: function (layerToAdd) {
    FeatureGroup.prototype.addLayer.call(this, layerToAdd);
    if (!this.options.layerBounds) {
      this.layerBounds = this.layerBounds
        ? this.layerBounds.extend(layerToAdd.layerBounds)
        : bounds(layerToAdd.layerBounds.min, layerToAdd.layerBounds.max);

      if (this.zoomBounds) {
        if (layerToAdd.zoomBounds.minZoom < this.zoomBounds.minZoom)
          this.zoomBounds.minZoom = layerToAdd.zoomBounds.minZoom;
        if (layerToAdd.zoomBounds.maxZoom > this.zoomBounds.maxZoom)
          this.zoomBounds.maxZoom = layerToAdd.zoomBounds.maxZoom;
        if (layerToAdd.zoomBounds.minNativeZoom < this.zoomBounds.minNativeZoom)
          this.zoomBounds.minNativeZoom = layerToAdd.zoomBounds.minNativeZoom;
        if (layerToAdd.zoomBounds.maxNativeZoom > this.zoomBounds.maxNativeZoom)
          this.zoomBounds.maxNativeZoom = layerToAdd.zoomBounds.maxNativeZoom;
      } else {
        this.zoomBounds = layerToAdd.zoomBounds;
      }
    }
    if (this._context === 'static') {
      // TODO: validate the use the feature.zoom which is new (was in createGeometry)
      let featureZoom = layerToAdd.options.mapmlFeature.zoom;
      if (featureZoom in this._features) {
        this._features[featureZoom].push(layerToAdd);
      } else {
        this._features[featureZoom] = [layerToAdd];
      }
      // hide/display features based on the their zoom limits
      this._validateRendering();
    }
    return this;
  },
  addRendering: function (featureToAdd) {
    FeatureGroup.prototype.addLayer.call(this, featureToAdd);
  },
  onRemove: function (map) {
    if (this._queryFeatures) {
      map.off('featurepagination', this.showPaginationFeature, this);
      delete this._queryFeatures;
      DomUtil.remove(this._container);
    }
    if (this._context === 'static') {
      DomUtil.remove(this._container);
    }
    FeatureGroup.prototype.onRemove.call(this, map);
    this._map.featureIndex.cleanIndex();
  },

  removeLayer: function (featureToRemove) {
    FeatureGroup.prototype.removeLayer.call(this, featureToRemove);
    if (!this.options.layerBounds) {
      delete this.layerBounds;
      // this ensures that the <map-layer>.extent gets recalculated if needed
      delete this.options._leafletLayer.bounds;
      delete this.zoomBounds;
      // this ensures that the <map-layer>.extent gets recalculated if needed
      delete this.options._leafletLayer.zoomBounds;
      delete this._layers[featureToRemove._leaflet_id];
      this._removeFromFeaturesList(featureToRemove);
      // iterate through all remaining layers
      let layerBounds, zoomBounds;
      let layerIds = Object.keys(this._layers);
      // re-calculate the layerBounds and zoomBounds for the whole layer when
      // a feature is permanently removed from the overall layer
      // bug alert: it's necessary to create a new bounds object to initialize
      // this.layerBounds, to avoid changing the layerBounds of the first geometry
      // added to this layer
      for (let id of layerIds) {
        let layer = this._layers[id];
        if (layerBounds) {
          layerBounds.extend(layer.layerBounds);
        } else {
          layerBounds = bounds(layer.layerBounds.min, layer.layerBounds.max);
        }
        if (zoomBounds) {
          if (layer.zoomBounds.minZoom < zoomBounds.minZoom)
            zoomBounds.minZoom = layer.zoomBounds.minZoom;
          if (layer.zoomBounds.maxZoom > zoomBounds.maxZoom)
            zoomBounds.maxZoom = layer.zoomBounds.maxZoom;
          if (layer.zoomBounds.minNativeZoom < zoomBounds.minNativeZoom)
            zoomBounds.minNativeZoom = layer.zoomBounds.minNativeZoom;
          if (layer.zoomBounds.maxNativeZoom > zoomBounds.maxNativeZoom)
            zoomBounds.maxNativeZoom = layer.zoomBounds.maxNativeZoom;
        } else {
          zoomBounds = {};
          zoomBounds.minZoom = layer.zoomBounds.minZoom;
          zoomBounds.maxZoom = layer.zoomBounds.maxZoom;
          zoomBounds.minNativeZoom = layer.zoomBounds.minNativeZoom;
          zoomBounds.maxNativeZoom = layer.zoomBounds.maxNativeZoom;
        }
      }
      // If the last feature is removed, we should remove the .layerBounds and
      // .zoomBounds properties, so that the FeatureLayer may be ignored
      if (layerBounds) {
        this.layerBounds = layerBounds;
      } else {
        delete this.layerBounds;
      }
      if (zoomBounds) {
        this.zoomBounds = zoomBounds;
      } else {
        delete this.zoomBounds;
        delete this.options.zoomBounds;
      }
    }
    return this;
  },
  /**
   * Remove the geomtry rendering (an svg g/ M.Geomtry) from the L.FeatureGroup
   * _layers array, so that it's not visible on the map, but still contributes
   * to the bounds and zoom limits of the FeatureLayer.
   *
   * @param {type} featureToRemove
   * @returns {undefined}
   */
  removeRendering: function (featureToRemove) {
    FeatureGroup.prototype.removeLayer.call(this, featureToRemove);
  },
  _removeFromFeaturesList: function (feature) {
    for (let zoom in this._features)
      for (let i = 0; i < this._features[zoom].length; ++i) {
        let feature = this._features[zoom][i];
        if (feature._leaflet_id === feature._leaflet_id) {
          this._features[zoom].splice(i, 1);
          break;
        }
      }
  },
  getEvents: function () {
    if (this._context === 'static') {
      return {
        moveend: this._handleMoveEnd,
        zoomend: this._handleZoomEnd
      };
    }
    return {};
  },

  // for query
  showPaginationFeature: function (e) {
    if (this.options.query && this._queryFeatures[e.i]) {
      let feature = this._queryFeatures[e.i];
      feature._linkEl.shadowRoot.replaceChildren();
      this.clearLayers();
      // append all map-meta from mapml document
      if (feature.meta) {
        for (let i = 0; i < feature.meta.length; i++) {
          feature._linkEl.shadowRoot.appendChild(feature.meta[i]);
        }
      }
      feature._linkEl.shadowRoot.appendChild(feature);
      feature.addFeature(this);
      e.popup._navigationBar.querySelector('p').innerText =
        e.i + 1 + '/' + this.options._leafletLayer._totalFeatureCount;
      e.popup._content
        .querySelector('iframe')
        .setAttribute('sandbox', 'allow-same-origin allow-forms');
      e.popup._content.querySelector('iframe').srcdoc =
        feature.querySelector('map-properties').innerHTML;
      // "zoom to here" link need to be re-set for every pagination
      this._map.fire('attachZoomLink', { i: e.i, currFeature: feature });
      this._map.once(
        'popupclose',
        function (e) {
          this.shadowRoot.innerHTML = '';
        },
        feature._linkEl
      );
    }
  },

  _handleMoveEnd: function () {
    this._removeCSS();
  },

  _handleZoomEnd: function (e) {
    // handle zoom end gets called twice for every zoom, this condition makes it go through once only.
    if (this.zoomBounds) {
      this._validateRendering();
    }
  },
  /*
   * _validateRendering prunes the features currently in the _features hashmap (created
   * by us).  _features categorizes features by zoom, and is used to remove or add
   * features from the map based on the map-feature min/max getters.  It also
   * maintains the _map.featureIndex property, which is used to control the tab
   * order for interactive (static) features currently rendered on the map.
   * @private
   *  */
  _validateRendering: function () {
    // since features are removed and re-added by zoom level, need to clean the feature index before re-adding
    if (this._map) this._map.featureIndex.cleanIndex();
    let map = this._map || this.options._leafletLayer?._map;
    // Guard against case where neither this._map nor _leafletLayer._map is available yet
    if (!map) return;
    // it's important that we not try to validate rendering if the FeatureLayer
    // isn't actually  being rendered (i.e. on the map.  the _map property can't
    // be used because once it's assigned  (by onAdd, above) it's never unassigned.
    if (!map.hasLayer(this)) return;
    if (this._features) {
      for (let zoom in this._features) {
        for (let k = 0; k < this._features[zoom].length; k++) {
          let geometry = this._features[zoom][k],
            renderable = geometry._checkRender(
              map.getZoom(),
              this.zoomBounds.minZoom,
              this.zoomBounds.maxZoom
            );
          if (!renderable) {
            // insert a placeholder in the dom rendering for the geometry
            // so that it retains its layering order when it is next rendered
            let placeholder = document.createElement('span');
            placeholder.id = geometry._leaflet_id;
            // geometry.defaultOptions.group is the rendered svg g element in sd
            geometry.defaultOptions.group.insertAdjacentElement(
              'beforebegin',
              placeholder
            );
            // removing the rendering without removing the feature from the feature list
            this.removeRendering(geometry);
          } else if (
            // checking for _map so we do not enter this code block during the connectedCallBack of the map-feature
            !map.hasLayer(geometry) &&
            !geometry._map
          ) {
            this.addRendering(geometry);
            // update the layerbounds
            let placeholder =
              geometry.defaultOptions.group.parentNode.querySelector(
                `span[id="${geometry._leaflet_id}"]`
              );
            placeholder.replaceWith(geometry.defaultOptions.group);
          }
        }
      }
    }
  },

  _setZoomTransform: function (center, clampZoom) {
    var scale = this._map.getZoomScale(this._map.getZoom(), clampZoom),
      translate = center
        .multiplyBy(scale)
        .subtract(this._map._getNewPixelOrigin(center, this._map.getZoom()))
        .round();

    if (Browser.any3d) {
      DomUtil.setTransform(this._layers[clampZoom], translate, scale);
    } else {
      DomUtil.setPosition(this._layers[clampZoom], translate);
    }
  },

  /**
   * Render a <map-feature> as a Leaflet layer that can be added to a map or
   * LayerGroup as required.  Kind of a "factory" method.
   *
   * Uses this.options, so if you need to, you can construct a FeatureLayer
   * with options set as required
   *
   * @param feature - a <map-feature> element
   * @param {String} fallbackCS - "gcrs" | "pcrs"
   * @param {String} tileZoom - the zoom of the map at which the coordinates will exist
   *
   * @returns Geometry, which is an L.FeatureGroup
   * @public
   */
  createGeometry: function (feature, fallbackCS, tileZoom) {
    // was let options = this.options, but that was causing unwanted side-effects
    // because we were adding .layerBounds and .zoomBounds to it before passing
    // to _createGeometry, which meant that FeatureLayer was sprouting
    // options.layerBounds and .zoomBounds when it should not have those props
    let options = Object.assign({}, this.options);

    if (options.filter && !options.filter(feature)) {
      return;
    }

    if (feature.classList.length) {
      options.className = feature.classList.value;
    }
    // tileZoom is only used when the map-feature is discarded i.e. for rendering
    // vector tiles' feature geometries in bulk (in this case only the geomtry
    // is rendered on a tile-shaped FeatureLayer
    let zoom = feature.zoom ?? tileZoom,
      title = feature.querySelector('map-featurecaption');
    title = title
      ? title.innerHTML
      : this.options.mapEl.locale.dfFeatureCaption;

    if (feature.querySelector('map-properties')) {
      options.properties = document.createElement('div');
      options.properties.classList.add('mapml-popup-content');
      options.properties.insertAdjacentHTML(
        'afterbegin',
        feature.querySelector('map-properties').innerHTML
      );
    }
    let cs =
      feature.getElementsByTagName('map-geometry')[0]?.getAttribute('cs') ??
      fallbackCS;
    // options.layerBounds and options.zoomBounds are set by TemplatedTileLayer._createFeatures
    // each geometry needs bounds so that it can be a good community member of this._layers
    if (this._context === 'static' || this.options.query) {
      options.layerBounds = Util.extentToBounds(feature.extent, 'PCRS');
      options.zoomBounds = feature.extent.zoom;
    }
    let geom = this._geometryToLayer(feature, options, cs, +zoom, title);
    if (geom && Object.keys(geom._layers).length !== 0) {
      // if the layer is being used as a query handler output, it will have
      // a color option set.  Otherwise, copy classes from the feature
      if (!geom.options.color && feature.hasAttribute('class')) {
        geom.options.className = feature.getAttribute('class');
      }
      geom.defaultOptions = geom.options;
      this.resetStyle(geom);

      if (options.onEachFeature) {
        geom.bindTooltip(title, { interactive: true, sticky: true });
      }
      if (feature.tagName.toUpperCase() === 'MAP-FEATURE') {
        feature._groupEl = geom.options.group;
      }
      return geom;
    }
  },

  resetStyle: function (layer) {
    var style = this.options.style;
    if (style) {
      // reset any custom styles
      LeafletUtil.extend(layer.options, layer.defaultOptions);
      this._setLayerStyle(layer, style);
    }
  },

  setStyle: function (style) {
    this.eachLayer(function (layer) {
      this._setLayerStyle(layer, style);
    }, this);
  },

  _setLayerStyle: function (layer, style) {
    if (typeof style === 'function') {
      style = style(layer.feature);
    }
    if (layer.setStyle) {
      layer.setStyle(style);
    }
  },
  _removeCSS: function () {
    let toDelete = this._container.querySelectorAll(
      'link[rel=stylesheet],style'
    );
    for (let i = 0; i < toDelete.length; i++) {
      this._container.removeChild(toDelete[i]);
    }
  },
  _geometryToLayer: function (feature, vectorOptions, cs, zoom, title) {
    let geom = feature.getElementsByTagName('map-geometry')[0],
      group = [],
      groupOptions = {},
      svgGroup = SVG.create('g'),
      copyOptions = Object.assign({}, vectorOptions);
    svgGroup._featureEl = feature; // rendered <g> has a reference to map-feature
    if (geom) {
      for (let geo of geom.querySelectorAll(
        'map-polygon, map-linestring, map-multilinestring, map-point, map-multipoint'
      )) {
        group.push(
          path(
            geo,
            Object.assign(copyOptions, {
              nativeCS: cs,
              nativeZoom: zoom,
              projection: this.options.projection,
              featureID: feature.id,
              group: svgGroup,
              wrappers: this._getGeometryParents(geo.parentElement),
              featureLayer: this,
              _leafletLayer: this.options._leafletLayer
            })
          )
        );
      }
      let groupOptions = {
          group: svgGroup,
          mapmlFeature: feature,
          featureID: feature.id,
          accessibleTitle: title,
          onEachFeature: vectorOptions.onEachFeature,
          properties: vectorOptions.properties,
          _leafletLayer: this.options._leafletLayer,
          layerBounds: vectorOptions.layerBounds,
          zoomBounds: vectorOptions.zoomBounds
        },
        collections =
          geom.querySelector('map-multipolygon') ||
          geom.querySelector('map-geometrycollection');
      if (collections)
        groupOptions.wrappers = this._getGeometryParents(
          collections.parentElement
        );
      return geometry(group, groupOptions);
    }
  },

  _getGeometryParents: function (subType, elems = []) {
    if (subType && subType.tagName.toUpperCase() !== 'MAP-GEOMETRY') {
      if (
        subType.tagName.toUpperCase() === 'MAP-MULTIPOLYGON' ||
        subType.tagName.toUpperCase() === 'MAP-GEOMETRYCOLLECTION'
      )
        return this._getGeometryParents(subType.parentElement, elems);
      return this._getGeometryParents(
        subType.parentElement,
        elems.concat([subType])
      );
    } else {
      return elems;
    }
  }
});
export var mapFeatureLayer = function (mapml, options) {
  return new MapFeatureLayer(mapml, options);
};
