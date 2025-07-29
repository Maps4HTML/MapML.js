import {
  LayerGroup,
  DomUtil,
  extend,
  setOptions,
  Util as LeafletUtil
} from 'leaflet';
import { Util } from '../utils/Util.js';
import { mapTileLayer } from './MapTileLayer.js';
import { renderStyles } from '../elementSupport/layers/renderStyles.js';

/**
 * LayerGroup for managing map-tile and map-feature elements retrieved via
 * <map-link rel="features" tref="..."></map-link>
 *
 * Layers in this layer group will correspond to the following MapML elements
 * retrieved by the template processing:
 *
 * <map-tile row="10" col="12" src="url1"></map-tile>  LayerGroup._layers[0] <- each set of adjacent tiles
 * <map-tile row="11" col="12" src="url2"></map-tile>  LayerGroup._layers[0] <- is a single MapTileLayer
 * <map-feature id="a"> LayerGroup._layers[1] <- each set of adjacent features
 * <map-feature id="b"> LayerGroup._layers[1] <- is a single MapFeatureLayer
 * <map-tile row="10" col="12" src="url3"></map-tile>  LayerGroup._layers[2]
 * <map-tile row="11" col="12" src="url4"></map-tile>  LayerGroup._layers[2]
 * <map-feature id="c"> LayerGroup._layers[3]
 * <map-feature id="d"> LayerGroup._layers[3]
 * etc
 *
 *
 *
 * Extends LayerGroup
 */
export var TemplatedFeaturesOrTilesLayer = LayerGroup.extend({
  initialize: function (template, options) {
    LayerGroup.prototype.initialize.call(this, []);
    this._template = template;
    this._container = DomUtil.create('div', 'leaflet-layer');
    DomUtil.addClass(this._container, 'mapml-features-tiles-container');
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of duplicate info, it can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;

    this._linkEl = options.linkEl;
    setOptions(this, extend(options, this._setUpTemplateVars(template)));
  },
  /**
   * @override
   * According to https://leafletjs.com/reference.html#layer-extension-methods
   * every Layer instance should override onAdd, onRemove, getEvents, getAttribution
   * and beforeAdd
   *
   * @param {Map} map - the Leaflet map to which this layer is added
   */
  onAdd: function (map) {
    this._map = map;
    // this causes the layer to actually render...
    this.options.pane.appendChild(this._container);
    this._onMoveEnd(); // load content

    // The parent method adds constituent layers to the map
    LayerGroup.prototype.onAdd.call(this, map);
  },

  onRemove: function (map) {
    // Remove container from DOM, but don't delete it
    DomUtil.remove(this._container);
    // clean up the container
    for (let child of this._container.children) {
      DomUtil.remove(child);
    }

    // Remove each layer from the map, but does not clearLayers
    LayerGroup.prototype.onRemove.call(this, map);
  },
  getContainer: function () {
    return this._container;
  },
  getEvents: function () {
    var events = {
      moveend: this._onMoveEnd
    };
    return events;
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
  redraw: function () {
    this._onMoveEnd();
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

    const getUrl = ((zoom, bounds) => {
      if (zoom === undefined) zoom = this._map.getZoom();
      if (bounds === undefined) bounds = this._map.getPixelBounds();
      const _TCRSToPCRS = (coords, zoom) => {
        // TCRS pixel point to Projected CRS point (in meters, presumably)
        var map = this._map,
          crs = map.options.crs,
          loc = crs.transformation.untransform(coords, crs.scale(zoom));
        return loc;
      };
      var obj = {};
      if (this.options.param.zoom) {
        obj[this.options.param.zoom] = zoom;
      }
      if (this.options.param.width) {
        obj[this.options.param.width] = this._map.getSize().x;
      }
      if (this.options.param.height) {
        obj[this.options.param.height] = this._map.getSize().y;
      }
      if (this.options.param.bottom) {
        obj[this.options.param.bottom] = _TCRSToPCRS(bounds.max, zoom).y;
      }
      if (this.options.param.left) {
        obj[this.options.param.left] = _TCRSToPCRS(bounds.min, zoom).x;
      }
      if (this.options.param.top) {
        obj[this.options.param.top] = _TCRSToPCRS(bounds.min, zoom).y;
      }
      if (this.options.param.right) {
        obj[this.options.param.right] = _TCRSToPCRS(bounds.max, zoom).x;
      }
      // hidden and other variables that may be associated
      for (var v in this.options.param) {
        if (
          ['width', 'height', 'left', 'right', 'top', 'bottom', 'zoom'].indexOf(
            v
          ) < 0
        ) {
          obj[v] = this.options.param[v];
        }
      }
      return LeafletUtil.template(this._template.template, obj);
    }).bind(this);
    var url = getUrl(steppedZoom, scaleBounds);
    this._url = url;

    // do cleaning up for new request
    this.clearLayers();
    // shadow may has not yet attached to <map-extent> for the first-time rendering
    if (this._linkEl.shadowRoot) {
      this._linkEl.shadowRoot.innerHTML = '';
    }
    const removeCSS = (container) => {
      const styleElements = container.querySelectorAll(
        'link[rel=stylesheet],style'
      );
      styleElements.forEach((element) => element.remove());
    };
    removeCSS(this._container);

    //Leave the layers cleared if the layer is not visible
    if (!this.isVisible()) {
      this._url = '';
      return;
    }

    let mapml,
      headers = new Headers({
        Accept: 'text/mapml'
      }),
      linkEl = this._linkEl,
      getMapML = (url) => {
        return fetch(url, { redirect: 'follow', headers: headers })
          .then(function (response) {
            return response.text();
          })
          .then(function (text) {
            let parser = new DOMParser();
            mapml = parser.parseFromString(text, 'application/xml');
            let frag = document.createDocumentFragment();
            const legalContentQuery = `
                map-head > map-link,
                map-body > map-link,
                map-head > map-meta,
                map-body > map-meta,
                map-head > map-style,
                map-body > map-style,
                map-tile,
                map-feature
            `.trim(); // excludes map-extent
            let elements = mapml.querySelectorAll(legalContentQuery);
            for (let i = 0; i < elements.length; i++) {
              frag.appendChild(elements[i]);
            }
            linkEl.shadowRoot.appendChild(frag);
          });
      };
    const map = this._map;
    getMapML(this._url)
      .then(() => {
        //Fires event for feature index overlay to check overlaps
        map.fire('templatedfeatureslayeradd');
        this.eachLayer(function (layer) {
          if (layer._path) {
            if (layer._path.getAttribute('d') !== 'M0 0') {
              layer._path.setAttribute('tabindex', 0);
            } else {
              layer._path.removeAttribute('tabindex');
            }
            if (layer._path.childElementCount === 0) {
              let title = document.createElement('title');
              title.innerText = this._linkEl.getMapEl().locale.dfFeatureCaption;
              layer._path.appendChild(title);
            }
          }
        }, this);
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  _setUpTemplateVars: function (template) {
    // process the inputs and create an object named "param"
    // with member properties as follows:
    // {width: {name: 'widthvarname'}, // value supplied by map if necessary
    //  height: {name: 'heightvarname'}, // value supplied by map if necessary
    //  left: {name: 'leftvarname', axis: 'leftaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
    //  right: {name: 'rightvarname', axis: 'rightaxisname'}, // axis name (coordinate system of) drives the value supplied by the map
    //  top: {name: 'topvarname', axis: 'topaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
    //  bottom: {name: 'bottomvarname', axis: 'bottomaxisname'} // axis name drives (coordinate system of) the value supplied by the map
    //  zoom: {name: 'zoomvarname'}
    //  hidden: [{name: name, value: value}]}

    var templateVarNames = { param: {} },
      inputs = template.values;
    templateVarNames.param.hidden = [];
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
        templateVarNames.param.width = name;
      } else if (type === 'height') {
        templateVarNames.param.height = name;
      } else if (type === 'zoom') {
        templateVarNames.param.zoom = name;
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
                templateVarNames.param.left = name;
              } else if (position.match(/.*?-right/i)) {
                templateVarNames.param.right = name;
              }
            }
            break;
          case 'y':
          case 'latitude':
          case 'northing':
            if (position) {
              if (position.match(/top-.*?/i)) {
                templateVarNames.param.top = name;
              } else if (position.match(/bottom-.*?/i)) {
                templateVarNames.param.bottom = name;
              }
            }
            break;
        }
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        templateVarNames.param[name] = function () {
          return parsedselect.value;
        };
        // projection is deprecated, make it hidden
      } else {
        /*jshint -W104 */
        const input = inputs[i];
        templateVarNames.param[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    return templateVarNames;
  },
  renderStyles
});

export var templatedFeaturesOrTilesLayer = function (template, options) {
  return new TemplatedFeaturesOrTilesLayer(template, options);
};
