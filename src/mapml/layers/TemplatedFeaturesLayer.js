import { Util } from '../utils/Util';
import { featureLayer } from '../layers/FeatureLayer';
import { featureRenderer } from '../features/featureRenderer';

export var TemplatedFeaturesLayer = L.Layer.extend({
  // this and M.ImageLayer could be merged or inherit from a common parent
  initialize: function (template, options) {
    this._template = template;
    this._container = L.DomUtil.create('div', 'leaflet-layer');
    L.DomUtil.addClass(this._container, 'mapml-features-container');
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of duplicate info, it can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;
    this._linkEl = options.linkEl;
    L.setOptions(
      this,
      L.extend(options, this._setUpFeaturesTemplateVars(template))
    );
  },

  isVisible: function () {
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },

  getEvents: function () {
    var events = {
      moveend: this._onMoveEnd
    };
    return events;
  },
  onAdd: function (map) {
    this._map = map;
    // this causes the layer (this._features) to actually render...
    this.options.pane.appendChild(this._container);
    var opacity = this.options.opacity || 1,
      container = this._container;
    if (!this._features) {
      this._features = featureLayer(null, {
        // pass the vector layer a renderer of its own, otherwise leaflet
        // puts everything into the overlayPane
        renderer: featureRenderer(),
        // pass the vector layer the container for the parent into which
        // it will append its own container for rendering into
        pane: container,
        // the bounds will be static, fixed, constant for the lifetime of the layer
        layerBounds: this.extentBounds,
        zoomBounds: this.zoomBounds,
        opacity: opacity,
        projection: map.options.projection,
        mapEl: this._linkEl.getMapEl(),
        onEachFeature: function (properties, geometry) {
          // need to parse as HTML to preserve semantics and styles
          var c = document.createElement('div');
          c.classList.add('mapml-popup-content');
          c.insertAdjacentHTML('afterbegin', properties.innerHTML);
          geometry.bindPopup(c, { autoClose: false, minWidth: 108 });
        }
      });
      L.extend(this._features.options, { _leafletLayer: this._features });
      this._features._layerEl = this._linkEl.getLayerEl();
    } else {
      this._features.eachLayer((layer) => layer.addTo(map));
    }
    this._onMoveEnd();
  },
  onRemove: function () {
    if (this._features) this._features.eachLayer((layer) => layer.remove());
    L.DomUtil.remove(this._container);
  },
  appendStyleLink: function (mapLink) {
    if (!mapLink.link) return;
    let positionAndNode = this._getStylePositionAndNode();
    positionAndNode.node.insertAdjacentElement(
      positionAndNode.position,
      mapLink.link
    );
  },
  _getStylePositionAndNode: function () {
    return this._container.lastChild &&
      (this._container.lastChild.nodeName.toUpperCase() === 'SVG' ||
        this._container.lastChild.classList.contains('mapml-vector-container'))
      ? { position: 'beforebegin', node: this._container.lastChild }
      : this._container.lastChild
      ? { position: 'afterend', node: this._container.lastChild }
      : { position: 'afterbegin', node: this._container };
  },
  appendStyleElement: function (mapStyle) {
    if (!mapStyle.styleElement) return;
    let positionAndNode = this._getStylePositionAndNode();
    positionAndNode.node.insertAdjacentElement(
      positionAndNode.position,
      mapStyle.styleElement
    );
  },
  redraw: function () {
    this._onMoveEnd();
  },

  _removeCSS: function () {
    let toDelete = this._container.querySelectorAll(
      'link[rel=stylesheet],style'
    );
    for (let i = 0; i < toDelete.length; i++) {
      let parent = toDelete[i].parentNode;
      parent.removeChild(toDelete[i]);
    }
  },

  _onMoveEnd: function () {
    let history = this._map.options.mapEl._history;
    let current = history[history.length - 1];
    let previous = history[history.length - 2] ?? current;
    let step = this._template.step;
    let mapZoom = this._map.getZoom();
    let steppedZoom = mapZoom;
    //If zooming out from one step interval into a lower one or panning, set the stepped zoom
    if (
      (step !== '1' &&
        (mapZoom + 1) % step === 0 &&
        current.zoom === previous.zoom - 1) ||
      current.zoom === previous.zoom ||
      Math.floor(mapZoom / step) * step !==
        Math.floor(previous.zoom / step) * step
    ) {
      steppedZoom = Math.floor(mapZoom / step) * step;
    }
    //No request needed if in a step interval (unless panning)
    else if (mapZoom % this._template.step !== 0) return;

    let scaleBounds = this._map.getPixelBounds(
      this._map.getCenter(),
      steppedZoom
    );

    // should set this.isVisible properly BEFORE return, otherwise will cause layer-.validateDisabled not work properly
    let url = this._getfeaturesUrl(steppedZoom, scaleBounds);
    // No request needed if the current template url is the same as the url to request
    if (url === this._url) return;

    // do cleaning up for new request
    this._features.clearLayers();
    // shadow may has not yet attached to <map-extent> for the first-time rendering
    if (this._linkEl.shadowRoot) {
      this._linkEl.shadowRoot.innerHTML = '';
    }
    this._removeCSS();
    //Leave the layers cleared if the layer is not visible
    if (!this.isVisible() && steppedZoom === mapZoom) {
      this._url = '';
      return;
    }

    // TODO add preference with a bit less weight than that for text/mapml; 0.8 for application/geo+json; 0.6
    var mapml,
      headers = new Headers({
        Accept: 'text/mapml;q=0.9,application/geo+json;q=0.8'
      }),
      parser = new DOMParser(),
      featureLayer = this._features,
      linkEl = this._linkEl,
      map = this._map,
      context = this,
      MAX_PAGES = 10,
      // TODO: Fetching logic should migrate to map-link
      _pullFeatureFeed = function (url, limit) {
        return fetch(url, { redirect: 'follow', headers: headers })
          .then(function (response) {
            return response.text();
          })
          .then(function (text) {
            //TODO wrap this puppy in a try/catch/finally to parse application/geo+json if necessary
            mapml = parser.parseFromString(text, 'application/xml');
            var base = new URL(
              mapml.querySelector('map-base')
                ? mapml.querySelector('map-base').getAttribute('href')
                : url
            ).href;
            url = mapml.querySelector('map-link[rel=next]')
              ? mapml.querySelector('map-link[rel=next]').getAttribute('href')
              : null;
            url = url ? new URL(url, base).href : null;
            let frag = document.createDocumentFragment();
            let elements = mapml.querySelectorAll('map-head > *, map-body > *');
            for (let i = 0; i < elements.length; i++) {
              frag.appendChild(elements[i]);
            }
            linkEl.shadowRoot.appendChild(frag);
            let features = linkEl.shadowRoot.querySelectorAll('map-feature');
            let featuresReady = [];
            for (let i = 0; i < features.length; i++) {
              featuresReady.push(features[i].whenReady());
            }
            Promise.allSettled(featuresReady).then(() => {
              for (let i = 0; i < features.length; i++) {
                features[i].addFeature(featureLayer);
              }
            });
            if (url && --limit) {
              return _pullFeatureFeed(url, limit);
            }
          });
      };
    this._url = url;
    _pullFeatureFeed(url, MAX_PAGES)
      .then(function () {
        map.addLayer(featureLayer);
        //Fires event for feature index overlay
        map.fire('templatedfeatureslayeradd');
        TemplatedFeaturesLayer.prototype._updateTabIndex(context);
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();
    return this;
  },
  _updateTabIndex: function (context) {
    let c = context || this;
    for (let layerNum in c._features._layers) {
      let layer = c._features._layers[layerNum];
      if (layer._path) {
        if (layer._path.getAttribute('d') !== 'M0 0') {
          layer._path.setAttribute('tabindex', 0);
        } else {
          layer._path.removeAttribute('tabindex');
        }
        if (layer._path.childElementCount === 0) {
          let title = document.createElement('title');
          title.innerText = 'Feature';
          layer._path.appendChild(title);
        }
      }
    }
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
  _getfeaturesUrl: function (zoom, bounds) {
    if (zoom === undefined) zoom = this._map.getZoom();
    if (bounds === undefined) bounds = this._map.getPixelBounds();
    var obj = {};
    if (this.options.feature.zoom) {
      obj[this.options.feature.zoom] = zoom;
    }
    if (this.options.feature.width) {
      obj[this.options.feature.width] = this._map.getSize().x;
    }
    if (this.options.feature.height) {
      obj[this.options.feature.height] = this._map.getSize().y;
    }
    if (this.options.feature.bottom) {
      obj[this.options.feature.bottom] = this._TCRSToPCRS(bounds.max, zoom).y;
    }
    if (this.options.feature.left) {
      obj[this.options.feature.left] = this._TCRSToPCRS(bounds.min, zoom).x;
    }
    if (this.options.feature.top) {
      obj[this.options.feature.top] = this._TCRSToPCRS(bounds.min, zoom).y;
    }
    if (this.options.feature.right) {
      obj[this.options.feature.right] = this._TCRSToPCRS(bounds.max, zoom).x;
    }
    // hidden and other variables that may be associated
    for (var v in this.options.feature) {
      if (
        ['width', 'height', 'left', 'right', 'top', 'bottom', 'zoom'].indexOf(
          v
        ) < 0
      ) {
        obj[v] = this.options.feature[v];
      }
    }
    return L.Util.template(this._template.template, obj);
  },
  _TCRSToPCRS: function (coords, zoom) {
    // TCRS pixel point to Projected CRS point (in meters, presumably)
    var map = this._map,
      crs = map.options.crs,
      loc = crs.transformation.untransform(coords, crs.scale(zoom));
    return loc;
  },
  _setUpFeaturesTemplateVars: function (template) {
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

    var featuresVarNames = { feature: {} },
      inputs = template.values;
    featuresVarNames.feature.hidden = [];
    for (var i = 0; i < inputs.length; i++) {
      // this can be removed when the spec removes the deprecated inputs...
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position'),
        value = inputs[i].getAttribute('value'),
        select = inputs[i].tagName.toLowerCase() === 'map-select';
      if (type === 'width') {
        featuresVarNames.feature.width = name;
      } else if (type === 'height') {
        featuresVarNames.feature.height = name;
      } else if (type === 'zoom') {
        featuresVarNames.feature.zoom = name;
      } else if (
        type === 'location' &&
        (units === 'pcrs' || units === 'gcrs')
      ) {
        //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting">
        switch (axis) {
          case 'x':
          case 'longitude':
          case 'easting':
            if (position) {
              if (position.match(/.*?-left/i)) {
                featuresVarNames.feature.left = name;
              } else if (position.match(/.*?-right/i)) {
                featuresVarNames.feature.right = name;
              }
            }
            break;
          case 'y':
          case 'latitude':
          case 'northing':
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
        featuresVarNames.feature[name] = function () {
          return parsedselect.value;
        };
        // projection is deprecated, make it hidden
      } else {
        /*jshint -W104 */
        const input = inputs[i];
        featuresVarNames.feature[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    return featuresVarNames;
  }
});
export var templatedFeaturesLayer = function (template, options) {
  return new TemplatedFeaturesLayer(template, options);
};
