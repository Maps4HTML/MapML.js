export var FeatureLayer = L.FeatureGroup.extend({
  /*
   * M.MapML turns any MapML feature data into a Leaflet layer. Based on L.GeoJSON.
   *
   * Used by MapMLLayer to create _mapmlvectors property, used to render features
   */
  initialize: function (mapml, options) {
    /*
        mapml:
        1. for query: an array of map-feature elements that it fetches
        2. for static templated feature: null
        3. for non-templated feature: layer- (with no src) or mapml file (with src)
      */
    // options.extent: when you use a FeatureLayer, you can either get it to calculate the
    // .layerBounds dynamically (the default), based on adds/removes of features from the layer/
    // or you can construct it with a bounds (via options.extent),
    // which will then remain static for the lifetime of the layer

    L.FeatureGroup.prototype.initialize.call(this, null, options);
    // this.options.static is false ONLY for tiled vector features
    // this._staticFeature is ONLY true when not used by TemplatedFeaturesLayer
    // this.options.query true when created by QueryHandler.js

    if (!this.options.tiles) {
      // not a tiled vector layer
      this._container = null;
      if (this.options.query) {
        this._container = L.DomUtil.create(
          'div',
          'leaflet-layer',
          this.options.pane
        );
        // must have leaflet-pane class because of new/changed rule in leaflet.css
        // info: https://github.com/Leaflet/Leaflet/pull/4597
        L.DomUtil.addClass(
          this._container,
          'leaflet-pane mapml-vector-container'
        );
      } else if (this.options._leafletLayer) {
        this._container = L.DomUtil.create(
          'div',
          'leaflet-layer',
          this.options.pane
        );
        L.DomUtil.addClass(
          this._container,
          'leaflet-pane mapml-vector-container'
        );
        // static mapmlvector should always at the top
        //        this._container.style.zIndex = 1000;
      } else {
        // if the current featureLayer is a sublayer of templatedFeatureLayer,
        // append <svg> directly to the templated feature container (passed in as options.pane)
        this._container = this.options.pane;
        L.DomUtil.addClass(
          this._container,
          'leaflet-pane mapml-vector-container'
        );
      }
      L.setOptions(this.options.renderer, { pane: this._container });
    }
    if (this.options.query) {
      this._mapmlFeatures = mapml.features ? mapml.features : mapml;
    } else if (!mapml) {
      // use this.options._leafletLayer to distinguish the featureLayer constructed for initialization and for templated features / tiles
      if (this.options._leafletLayer) {
        // this._staticFeature should be set to true to make sure the _getEvents works properly
        this._features = {};
        this._staticFeature = true;
      }
    }
  },

  isVisible: function () {
    let map = this.options.mapEl._map;
    // if query, isVisible is unconditionally true
    if (this.options.query) return true;
    // if the featureLayer is for static features, i.e. it is the mapmlvector layer,
    // if it is empty, isVisible = false
    // this._staticFeature: flag to determine if the featureLayer is used by static features only
    // this._features: check if the current static featureLayer is empty
    // (Object.keys(this._features).length === 0 => this._features is an empty object)
    else if (this._staticFeature && Object.keys(this._features).length === 0) {
      return false;
    } else {
      let mapZoom = map.getZoom(),
        withinZoom = this.zoomBounds
          ? mapZoom <= this.zoomBounds.maxZoom &&
            mapZoom >= this.zoomBounds.minZoom
          : false;
      return (
        withinZoom &&
        this._layers &&
        this.layerBounds &&
        this.layerBounds.overlaps(
          M.pixelToPCRSBounds(
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
    L.FeatureGroup.prototype.onAdd.call(this, map);
    if (this._staticFeature) {
      this._resetFeatures();
      map._addZoomLimit(this);
    }
    if (this._mapmlFeatures)
      map.on('featurepagination', this.showPaginationFeature, this);
  },

  onRemove: function (map) {
    if (this._mapmlFeatures) {
      map.off('featurepagination', this.showPaginationFeature, this);
      delete this._mapmlFeatures;
      L.DomUtil.remove(this._container);
    }
    L.FeatureGroup.prototype.onRemove.call(this, map);
    this._map.featureIndex.cleanIndex();
  },

  removeLayer: function (featureToRemove) {
    L.FeatureGroup.prototype.removeLayer.call(this, featureToRemove);
    delete this._layers[featureToRemove._leaflet_id];
  },
  _removeFromFeaturesList: function (layer) {
    for (let zoom in this._features)
      for (let i = 0; i < this._features[zoom].length; ++i) {
        let feature = this._features[zoom][i];
        if (feature._leaflet_id === layer._leaflet_id) {
          this._features[zoom].splice(i, 1);
          break;
        }
      }
  },
  getEvents: function () {
    if (this._staticFeature) {
      return {
        moveend: this._handleMoveEnd,
        zoomend: this._handleZoomEnd
      };
    }
    return {};
  },

  // for query
  showPaginationFeature: function (e) {
    if (this.options.query && this._mapmlFeatures[e.i]) {
      let feature = this._mapmlFeatures[e.i];
      if (e.type === 'featurepagination') {
        // remove map-feature only (keep meta's) when paginating
        feature._linkEl.shadowRoot.querySelector('map-feature')?.remove();
      } else {
        // empty the map-extent shadowRoot
        // remove the prev / next one <map-feature> and <map-meta>'s from shadow if there is any
        feature._linkEl.shadowRoot.replaceChildren();
      }
      this.clearLayers();
      // append all map-meta from mapml document
      if (e.meta) {
        for (let i = 0; i < e.meta.length; i++) {
          feature._linkEl.shadowRoot.appendChild(e.meta[i]);
        }
      }
      feature._linkEl.shadowRoot.appendChild(feature);
      let fallbackZoom = feature._getFallbackZoom();
      let fallbackCS = feature._getFallbackCS();
      feature._geometry = this.addData(feature, fallbackCS, fallbackZoom);
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
      this._resetFeatures();
    }
  },

  // remove or add features based on the min max attribute of the features,
  //  and add placeholders to maintain position
  _resetFeatures: function () {
    // since features are removed and re-added by zoom level, need to clean the feature index before re-adding
    if (this._map) this._map.featureIndex.cleanIndex();
    let map = this._map || this.options._leafletLayer._map;
    if (this._features) {
      for (let zoom in this._features) {
        for (let k = 0; k < this._features[zoom].length; k++) {
          let featureGroupLayer = this._features[zoom][k],
            checkRender = featureGroupLayer._checkRender(
              map.getZoom(),
              this.zoomBounds.minZoom,
              this.zoomBounds.maxZoom
            );
          if (!checkRender) {
            let placeholder = document.createElement('span');
            placeholder.id = featureGroupLayer._leaflet_id;
            featureGroupLayer.defaultOptions.group.insertAdjacentElement(
              'beforebegin',
              placeholder
            );
            // removing the rendering without removing the feature from the feature list
            this.removeLayer(featureGroupLayer);
          } else if (
            // checking for _map so we do not enter this code block during the connectedCallBack of the map-feature
            !map.hasLayer(featureGroupLayer) &&
            !featureGroupLayer._map
          ) {
            this.addLayer(featureGroupLayer);
            // update the layerbounds
            let placeholder =
              featureGroupLayer.defaultOptions.group.parentNode.querySelector(
                `span[id="${featureGroupLayer._leaflet_id}"]`
              );
            placeholder.replaceWith(featureGroupLayer.defaultOptions.group);
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

    if (any3d) {
      L.setTransform(this._layers[clampZoom], translate, scale);
    } else {
      L.setPosition(this._layers[clampZoom], translate);
    }
  },

  addData: function (feature, fallbackCS, fallbackZoom) {
    //if its a mapml with no more links this runs
    var options = this.options;

    if (options.filter && !options.filter(feature)) {
      return;
    }

    if (feature.classList.length) {
      options.className = feature.classList.value;
    }
    let zoom = feature.getAttribute('zoom') || fallbackZoom,
      title = feature.querySelector('map-featurecaption');
    title = title ? title.innerHTML : 'Feature';

    if (feature.querySelector('map-properties')) {
      options.properties = document.createElement('div');
      options.properties.classList.add('mapml-popup-content');
      options.properties.insertAdjacentHTML(
        'afterbegin',
        feature.querySelector('map-properties').innerHTML
      );
    }

    let geometry = this.geometryToLayer(
      feature,
      options,
      fallbackCS,
      +zoom,
      title
    );
    if (geometry) {
      // if the layer is being used as a query handler output, it will have
      // a color option set.  Otherwise, copy classes from the feature
      if (!geometry.options.color && feature.hasAttribute('class')) {
        geometry.options.className = feature.getAttribute('class');
      }
      geometry.defaultOptions = geometry.options;
      this.resetStyle(geometry);

      if (options.onEachFeature) {
        geometry.bindTooltip(title, { interactive: true, sticky: true });
      }
      if (this._staticFeature) {
        let featureZoom = feature.getAttribute('zoom') || fallbackZoom;
        if (featureZoom in this._features) {
          this._features[featureZoom].push(geometry);
        } else {
          this._features[featureZoom] = [geometry];
        }
      }
      if (feature.tagName.toUpperCase() === 'MAP-FEATURE') {
        feature._groupEl = geometry.options.group;
      }
      return geometry;
    }
  },

  resetStyle: function (layer) {
    var style = this.options.style;
    if (style) {
      // reset any custom styles
      L.Util.extend(layer.options, layer.defaultOptions);
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
  geometryToLayer: function (mapml, vectorOptions, nativeCS, zoom, title) {
    let geometry =
        mapml.tagName.toUpperCase() === 'MAP-FEATURE'
          ? mapml.getElementsByTagName('map-geometry')[0]
          : mapml,
      cs = geometry?.getAttribute('cs') || nativeCS,
      group = [],
      groupOptions = {},
      svgGroup = L.SVG.create('g'),
      copyOptions = Object.assign({}, vectorOptions);
    if (geometry) {
      for (let geo of geometry.querySelectorAll(
        'map-polygon, map-linestring, map-multilinestring, map-point, map-multipoint'
      )) {
        group.push(
          M.path(
            geo,
            Object.assign(copyOptions, {
              nativeCS: cs,
              nativeZoom: zoom,
              projection: this.options.projection,
              featureID: mapml.id,
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
          mapmlFeature: mapml,
          featureID: mapml.id,
          accessibleTitle: title,
          onEachFeature: vectorOptions.onEachFeature,
          properties: vectorOptions.properties,
          _leafletLayer: this.options._leafletLayer
        },
        collections =
          geometry.querySelector('map-multipolygon') ||
          geometry.querySelector('map-geometrycollection');
      if (collections)
        groupOptions.wrappers = this._getGeometryParents(
          collections.parentElement
        );
      return M.geometry(group, groupOptions);
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
export var featureLayer = function (mapml, options) {
  return new FeatureLayer(mapml, options);
};
