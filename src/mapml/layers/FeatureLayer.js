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
    if (this.options.static) {
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
      L.setOptions(this.options.renderer, { pane: this._container });
    }
    if (this.options.query) {
      this._mapmlFeatures = mapml.features ? mapml.features : mapml;
      let native = M.getNativeVariables(mapml);
      this.options.nativeZoom = native.zoom;
      this.options.nativeCS = native.cs;
    } else {
      if (mapml) {
        let native = M.getNativeVariables(mapml);
        this.addData(mapml, native.cs, native.zoom);
      } else if (!mapml) {
        // use this.options._leafletLayer to distinguish the featureLayer constructed for initialization and for templated features / tiles
        if (this.options._leafletLayer) {
          // this._staticFeature should be set to true to make sure the _getEvents works properly
          this._features = {};
          this._staticFeature = true;
        }
      }
    }
  },

  isVisible: function () {
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
      let mapZoom = this._map.getZoom(),
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
            this._map.getPixelBounds(),
            mapZoom,
            this._map.options.projection
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
      this.options._leafletLayer._map._addZoomLimit(this);
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

  removeLayer: function (featureGroupLayer) {
    L.FeatureGroup.prototype.removeLayer.call(this, featureGroupLayer);
    delete this._layers[featureGroupLayer._leaflet_id];
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
      feature._featureGroup = this.addData(
        feature,
        this.options.nativeCS,
        this.options.nativeZoom
      );
      // append all map-meta from mapml document
      if (e.meta) {
        for (let i = 0; i < e.meta.length; i++) {
          feature._linkEl.shadowRoot.appendChild(e.meta[i]);
        }
      }
      feature._linkEl.shadowRoot.appendChild(feature);
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

  addData: function (mapml, nativeCS, nativeZoom) {
    var features =
        mapml.nodeType === Node.DOCUMENT_NODE || mapml.nodeName === 'LAYER-'
          ? mapml.getElementsByTagName('map-feature')
          : null,
      i,
      len,
      feature;

    var linkedStylesheets =
      mapml.nodeType === Node.DOCUMENT_NODE
        ? mapml.querySelector('map-link[rel=stylesheet],map-style')
        : null;
    if (linkedStylesheets) {
      var base =
        mapml.querySelector('map-base') &&
        mapml.querySelector('map-base').hasAttribute('href')
          ? new URL(mapml.querySelector('map-base').getAttribute('href')).href
          : mapml.URL;
      M._parseStylesheetAsHTML(mapml, base, this._container);
    }
    if (features) {
      for (i = 0, len = features.length; i < len; i++) {
        // Only add this if geometry is set and not null
        feature = features[i];
        var geometriesExist =
          feature.getElementsByTagName('map-geometry').length &&
          feature.getElementsByTagName('map-coordinates').length;
        if (geometriesExist) {
          if (mapml.nodeType === Node.DOCUMENT_NODE) {
            // if the <map-feature> element has migrated from mapml file,
            // the featureGroup object should bind with the **CLONED** map-feature element in DOM instead of the feature in mapml
            if (!feature._DOMnode) feature._DOMnode = feature.cloneNode(true);
            feature._DOMnode._featureGroup = this.addData(
              feature._DOMnode,
              nativeCS,
              nativeZoom
            );
          } else {
            feature._featureGroup = this.addData(feature, nativeCS, nativeZoom);
          }
        }
      }
      return this; //if templated this runs
    }

    //if its a mapml with no more links this runs
    var options = this.options;

    if (options.filter && !options.filter(mapml)) {
      return;
    }

    if (mapml.classList.length) {
      options.className = mapml.classList.value;
    }
    let zoom = mapml.getAttribute('zoom') || nativeZoom,
      title = mapml.querySelector('map-featurecaption');
    title = title ? title.innerHTML : 'Feature';

    if (mapml.querySelector('map-properties')) {
      options.properties = document.createElement('div');
      options.properties.classList.add('mapml-popup-content');
      options.properties.insertAdjacentHTML(
        'afterbegin',
        mapml.querySelector('map-properties').innerHTML
      );
    }

    let layer = this.geometryToLayer(mapml, options, nativeCS, +zoom, title);
    if (layer) {
      // if the layer is being used as a query handler output, it will have
      // a color option set.  Otherwise, copy classes from the feature
      if (!layer.options.color && mapml.hasAttribute('class')) {
        layer.options.className = mapml.getAttribute('class');
      }
      layer.defaultOptions = layer.options;
      this.resetStyle(layer);

      if (options.onEachFeature) {
        layer.bindTooltip(title, { interactive: true, sticky: true });
      }
      if (this._staticFeature) {
        let featureZoom = mapml.getAttribute('zoom') || nativeZoom;
        if (featureZoom in this._features) {
          this._features[featureZoom].push(layer);
        } else {
          this._features[featureZoom] = [layer];
        }
      } else {
        this.addLayer(layer);
      }
      if (mapml.tagName.toUpperCase() === 'MAP-FEATURE') {
        mapml._groupEl = layer.options.group;
      }
      return layer;
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
