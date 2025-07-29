import {
  TileLayer,
  DomUtil,
  extend,
  bind,
  setOptions,
  SVG,
  point,
  Point,
  Util as LeafletUtil,
  Browser,
  bounds,
  GridLayer
} from 'leaflet';

import { Util } from '../utils/Util.js';
import { MapFeatureLayer } from './MapFeatureLayer.js';
import { FeatureRenderer } from '../features/featureRenderer.js';

export var TemplatedTileLayer = TileLayer.extend({
  // a TemplateTileLayer is similar to a TileLayer except its templates are
  // defined by the <map-extent><template/></map-extent>
  // content found in the MapML document.  As such, the client map does not
  // 'revisit' the server for more MapML content, it simply fills the map extent
  // with tiles for which it generates requests on demand (as the user pans/zooms/resizes
  // the map)
  initialize: function (template, options) {
    // _setUpTileTemplateVars needs options.crs, not available unless we set
    // options first...
    options.tms = template.tms;
    // it's critical to have this.options.minZoom, minNativeZoom, maxZoom, maxNativeZoom
    // because they are used by Leaflet Map and GridLayer, but we
    // don't need two copies of that info on our options object, so set the
    // .zoomBounds property (which is used externally), then delete the option
    // before unpacking the zoomBound object's properties onto this.options.minZ... etc.
    this.zoomBounds = Object.assign({}, options.zoomBounds);
    // unpack object to this.options.minZ... etc where minZ... are the props
    // of the this.zoomBounds object:
    extend(options, this.zoomBounds);
    setOptions(this, options);
    // _setup call here relies on this.options.minZ.. etc
    this._setUpTileTemplateVars(template);
    this._linkEl = options.linkEl;
    this.extentBounds = this.options.extentBounds;
    // get rid of duplicate information as it is confusing
    delete this.options.zoomBounds;
    delete this.options.extentBounds;

    this._template = template;
    this._initContainer();
    // call the parent constructor with the template tref value, per the
    // Leaflet tutorial: http://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
    TileLayer.prototype.initialize.call(
      this,
      template.template,
      extend(options, { pane: this.options.pane })
    );
  },
  onAdd: function (map) {
    this.options.pane.appendChild(this._container);
    TileLayer.prototype.onAdd.call(this, map);
    this._handleMoveEnd();
  },

  onRemove: function () {
    DomUtil.remove(this._container);
    // should clean up the container
    for (let child of this._container.children) {
      DomUtil.remove(child);
    }
  },

  getEvents: function () {
    let events = TileLayer.prototype.getEvents.call(this, this._map);
    this._parentOnMoveEnd = events.moveend;
    events.moveend = this._handleMoveEnd;
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

  _initContainer: function () {
    if (this._container) {
      return;
    }

    this._container = DomUtil.create('div', 'leaflet-layer', this.options.pane);
    DomUtil.addClass(this._container, 'mapml-templated-tile-container');
    this._updateZIndex();
  },

  _handleMoveEnd: function (e) {
    if (!this.isVisible()) return;
    this._parentOnMoveEnd();
  },
  createTile: function (coords) {
    let tileGroup = document.createElement('DIV'),
      tileSize = this.getTileSize();
    DomUtil.addClass(tileGroup, 'mapml-tile-group');
    DomUtil.addClass(tileGroup, 'leaflet-tile');

    this._template.linkEl.dispatchEvent(
      new CustomEvent('tileloadstart', {
        detail: {
          x: coords.x,
          y: coords.y,
          zoom: coords.z,
          appendTile: (elem) => {
            tileGroup.appendChild(elem);
          }
        }
      })
    );

    if (this._template.type.startsWith('image/')) {
      let tile = TileLayer.prototype.createTile.call(
        this,
        coords,
        function () {}
      );
      tile.width = tileSize.x;
      tile.height = tileSize.y;
      tileGroup.appendChild(tile);
    } else if (!this._url.includes(M.BLANK_TT_TREF)) {
      // tiles of type="text/mapml" will have to fetch content while creating
      // the tile here, unless there can be a callback associated to the element
      // that will render the content in the alread-placed tile
      // var tile = DomUtil.create('canvas', 'leaflet-tile');
      this._fetchTile(coords, tileGroup);
    }
    return tileGroup;
  },
  _mapmlTileReady: function (tile) {
    DomUtil.addClass(tile, 'leaflet-tile-loaded');
  },
  // instead of being child of a pane, the TemplatedTileLayers are 'owned' by the group,
  // and so are DOM children of the group, not the pane element (the MapLayer is
  // a child of the overlay pane and always has a set of sub-layers)
  getPane: function () {
    return this.options.pane;
  },
  _fetchTile: function (coords, tile) {
    let url = this.getTileUrl(coords);
    if (url) {
      fetch(url, { redirect: 'follow' })
        .then(function (response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
          } else {
            console.log(
              'Looks like there was a problem. Status Code: ' + response.status
            );
            return Promise.reject(response);
          }
        })
        .then(function (response) {
          return response.text();
        })
        .then((text) => {
          var parser = new DOMParser();
          return parser.parseFromString(text, 'application/xml');
        })
        .then((mapml) => {
          this._createFeatures(mapml, coords, tile);
          this._mapmlTileReady(tile);
        })
        .catch((err) => {
          console.log('Error creating tile: ' + err);
        });
    }
  },

  // TO DO: get rid of this function altogether; see TO DO below re: map-link
  // shadow root
  // _parseStylesheetAsHTML parses map-link and map-style from mapml and inserts them to the container as HTML
  _parseStylesheetAsHTML: function (mapml, base, container) {
    if (
      !(container instanceof Element) ||
      !mapml ||
      !mapml.querySelector('map-link[rel=stylesheet],map-style')
    )
      return;

    if (base instanceof Element) {
      base = base.getAttribute('href')
        ? base.getAttribute('href')
        : document.URL;
    } else if (!base || base === '' || base instanceof Object) {
      return;
    }

    var ss = [];
    var stylesheets = mapml.querySelectorAll(
      'map-link[rel=stylesheet],map-style'
    );
    for (var i = 0; i < stylesheets.length; i++) {
      if (stylesheets[i].nodeName.toUpperCase() === 'MAP-LINK') {
        var href = stylesheets[i].hasAttribute('href')
          ? new URL(stylesheets[i].getAttribute('href'), base).href
          : null;
        if (href) {
          if (!container.querySelector("link[href='" + href + "']")) {
            var linkElm = document.createElement('link');
            copyAttributes(stylesheets[i], linkElm);
            linkElm.setAttribute('href', href);
            ss.push(linkElm);
          }
        }
      } else {
        // <map-style>
        var styleElm = document.createElement('style');
        copyAttributes(stylesheets[i], styleElm);
        styleElm.textContent = stylesheets[i].textContent;
        ss.push(styleElm);
      }
    }
    // insert <link> or <style> elements after the begining  of the container
    // element, in document order as copied from original mapml document
    // note the code below assumes hrefs have been resolved and elements
    // re-parsed from xml and serialized as html elements ready for insertion
    for (var s = ss.length - 1; s >= 0; s--) {
      container.insertAdjacentElement('afterbegin', ss[s]);
    }
    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach((attribute) => {
        if (attribute.nodeName !== 'href')
          target.setAttribute(attribute.nodeName, attribute.nodeValue);
      });
    }
  },

  _createFeatures: function (markup, coords, tile) {
    // TO DO: create a shadow root for the <map-link> that hosts this layer,
    // populate it with map-tile, map-link and map-style elements that are
    // fetched.
    let stylesheets = markup.querySelector(
      'map-link[rel=stylesheet],map-style'
    );
    if (stylesheets) {
      let base =
        markup.querySelector('map-base') &&
        markup.querySelector('map-base').hasAttribute('href')
          ? new URL(markup.querySelector('map-base').getAttribute('href')).href
          : markup.URL;
      this._parseStylesheetAsHTML(markup, base, tile);
    }

    let svg = SVG.create('svg'),
      g = SVG.create('g'),
      tileSize = this._map.options.crs.options.crs.tile.bounds.max.x,
      xOffset = coords.x * tileSize,
      yOffset = coords.y * tileSize;

    let tileFeatures = new MapFeatureLayer(null, {
      projection: this._map.options.projection,
      tiles: true,
      layerBounds: this.extentBounds,
      zoomBounds: this.zoomBounds,
      interactive: false,
      mapEl: this._linkEl.getMapEl()
    });
    let fallback = Util.getNativeVariables(markup);
    // log the tiles in case there's more than one - was a dev issue with geoserver
    //    let tiles = markup.querySelectorAll('map-tile');
    //    for (let i = 0; i < tiles.length; i++) {
    //      let row = tiles[i].getAttribute('row'),
    //        col = tiles[i].getAttribute('col'),
    //        z = tiles[i].getAttribute('zoom');
    //      console.log(
    //        'Total tiles for row: ' +
    //          row +
    //          ', col: ' +
    //          col +
    //          ', z: ' +
    //          z +
    //          ': ' +
    //          tiles.length
    //      );
    //    }
    let currentTileSelector =
      '[row="' +
      coords.y +
      '"][col="' +
      coords.x +
      '"][zoom="' +
      coords.z +
      '"]';

    // this should select and process the features and tiles in DOM order
    let featuresOrTiles = markup.querySelectorAll(
      'map-feature:has(> map-geometry),map-tile' + currentTileSelector
    );
    for (let i = 0; i < featuresOrTiles.length; i++) {
      if (featuresOrTiles[i].nodeName === 'map-feature') {
        let feature = tileFeatures.createGeometry(
          featuresOrTiles[i],
          fallback.cs,
          coords.z
        );
        for (let featureID in feature._layers) {
          // layer is an M.Path instance
          let layer = feature._layers[featureID];
          FeatureRenderer.prototype._initPath(layer, false);
          // does something to layer
          layer._project(this._map, point([xOffset, yOffset]), coords.z);
          // appends the guts of layer to g
          FeatureRenderer.prototype._addPath(layer, g, false);
          // updates the guts of layer that have already been appended to g
          FeatureRenderer.prototype._updateFeature(layer);
        }
      } else {
        // render tile as an svg image element
        let tile = featuresOrTiles[i];
        // No need to append to DOM, the browser will cache it
        // observed to be a bit faster than waiting until img is appended to DOM
        const imgObj = new Image();
        imgObj.src = tile.getAttribute('src');
        let img = SVG.create('image');
        img.setAttribute('href', imgObj.src);
        g.appendChild(img);
      }
    }
    svg.setAttribute('width', tileSize.toString());
    svg.setAttribute('height', tileSize.toString());
    svg.appendChild(g);
    tile.appendChild(svg);
  },

  getTileUrl: function (coords) {
    if (
      coords.z >= this._template.tilematrix.bounds.length ||
      !this._template.tilematrix.bounds[coords.z].contains(coords)
    ) {
      return '';
    }
    var obj = {},
      linkEl = this._template.linkEl,
      zoomInput = linkEl.zoomInput;
    obj[this._template.tilematrix.col.name] = coords.x;
    obj[this._template.tilematrix.row.name] = coords.y;
    if (
      zoomInput &&
      linkEl.hasAttribute('tref') &&
      linkEl
        .getAttribute('tref')
        .includes(`{${zoomInput.getAttribute('name')}}`)
    ) {
      obj[this._template.zoom.name] = this._getZoomForUrl();
    }
    obj[this._template.pcrs.easting.left] = this._tileMatrixToPCRSPosition(
      coords,
      'top-left'
    ).x;
    obj[this._template.pcrs.easting.right] = this._tileMatrixToPCRSPosition(
      coords,
      'top-right'
    ).x;
    obj[this._template.pcrs.northing.top] = this._tileMatrixToPCRSPosition(
      coords,
      'top-left'
    ).y;
    obj[this._template.pcrs.northing.bottom] = this._tileMatrixToPCRSPosition(
      coords,
      'bottom-left'
    ).y;
    for (var v in this._template.tile) {
      if (
        ['row', 'col', 'zoom', 'left', 'right', 'top', 'bottom'].indexOf(v) < 0
      ) {
        obj[v] = this._template.tile[v];
      }
    }
    if (this._map && !this._map.options.crs.infinite) {
      let invertedY = this._globalTileRange.max.y - coords.y;
      if (this.options.tms) {
        obj[this._template.tilematrix.row.name] = invertedY;
      }
      //obj[`-${this._template.tilematrix.row.name}`] = invertedY; //leaflet has this but I dont see a use in storing row and -row as it doesnt follow that pattern
    }
    obj.r =
      this.options.detectRetina && Browser.retina && this.options.maxZoom > 0
        ? '@2x'
        : '';
    return LeafletUtil.template(this._url, obj);
  },
  _tileMatrixToPCRSPosition: function (coords, pos) {
    // this is a tile:
    //
    //   top-left         top-center           top-right
    //      +------------------+------------------+
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      + center-left    center               + center-right
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      |                  |                  |
    //      +------------------+------------------+
    //   bottom-left     bottom-center      bottom-right

    var map = this._map,
      crs = map.options.crs,
      tileSize = this.getTileSize(),
      nwPoint = coords.scaleBy(tileSize),
      sePoint = nwPoint.add(tileSize),
      centrePoint = nwPoint.add(Math.floor(tileSize / 2)),
      nw = crs.transformation.untransform(nwPoint, crs.scale(coords.z)),
      se = crs.transformation.untransform(sePoint, crs.scale(coords.z)),
      cen = crs.transformation.untransform(centrePoint, crs.scale(coords.z)),
      result = null;

    switch (pos) {
      case 'top-left':
        result = nw;
        break;
      case 'bottom-left':
        result = new Point(nw.x, se.y);
        break;
      case 'center-left':
        result = new Point(nw.x, cen.y);
        break;
      case 'top-right':
        result = new Point(se.x, nw.y);
        break;
      case 'bottom-right':
        result = se;
        break;
      case 'center-right':
        result = new Point(se.x, cen.y);
        break;
      case 'top-center':
        result = new Point(cen.x, nw.y);
        break;
      case 'bottom-center':
        result = new Point(cen.x, se.y);
        break;
      case 'center':
        result = cen;
        break;
    }
    return result;
  },
  _setUpTileTemplateVars: function (template) {
    // process the inputs associated to template and create an object named
    // tile with member properties as follows:
    // {row: 'rowvarname',
    //  col: 'colvarname',
    //  left: 'leftvarname',
    //  right: 'rightvarname',
    //  top: 'topvarname',
    //  bottom: 'bottomvarname'}
    template.tile = {};
    var inputs = template.values,
      crs = this.options.crs.options,
      zoom,
      east,
      north,
      row,
      col;

    for (var i = 0; i < template.values.length; i++) {
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position'),
        select = inputs[i].tagName.toLowerCase() === 'map-select',
        value = inputs[i].getAttribute('value'),
        min = inputs[i].getAttribute('min'),
        max = inputs[i].getAttribute('max');
      if (type === 'location' && units === 'tilematrix') {
        switch (axis) {
          case 'column':
            col = {
              name: name,
              min: crs.crs.tilematrix.horizontal.min,
              max: crs.crs.tilematrix.horizontal.max(crs.resolutions.length - 1)
            };
            if (!isNaN(Number.parseFloat(min))) {
              col.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              col.max = Number.parseFloat(max);
            }
            break;
          case 'row':
            row = {
              name: name,
              min: crs.crs.tilematrix.vertical.min,
              max: crs.crs.tilematrix.vertical.max(crs.resolutions.length - 1)
            };
            if (!isNaN(Number.parseFloat(min))) {
              row.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              row.max = Number.parseFloat(max);
            }
            break;
          case 'longitude':
          case 'easting':
            if (!east) {
              east = {
                min: crs.crs.pcrs.horizontal.min,
                max: crs.crs.pcrs.horizontal.max
              };
            }
            if (!isNaN(Number.parseFloat(min))) {
              east.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              east.max = Number.parseFloat(max);
            }
            if (position) {
              if (position.match(/.*?-left/i)) {
                east.left = name;
              } else if (position.match(/.*?-right/i)) {
                east.right = name;
              }
            }
            break;
          case 'latitude':
          case 'northing':
            if (!north) {
              north = {
                min: crs.crs.pcrs.vertical.min,
                max: crs.crs.pcrs.vertical.max
              };
            }
            if (!isNaN(Number.parseFloat(min))) {
              north.min = Number.parseFloat(min);
            }
            if (!isNaN(Number.parseFloat(max))) {
              north.max = Number.parseFloat(max);
            }
            if (position) {
              if (position.match(/top-.*?/i)) {
                north.top = name;
              } else if (position.match(/bottom-.*?/i)) {
                north.bottom = name;
              }
            }
            break;
          default:
          // unsuportted axis value
        }
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        template.tile[name] = function () {
          return parsedselect.value;
        };
      } else if (type === 'hidden') {
        // needs to be a const otherwise it gets overwritten
        /*jshint -W104 */
        const input = inputs[i];
        template.tile[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    var transformation = this.options.crs.transformation,
      tileSize = this.options.crs.options.crs.tile.bounds.max.x,
      scale = bind(this.options.crs.scale, this.options.crs),
      tilematrix2pcrs = function (c, zoom) {
        return transformation.untransform(c.multiplyBy(tileSize), scale(zoom));
      },
      pcrs2tilematrix = function (c, zoom) {
        return transformation
          .transform(c, scale(zoom))
          .divideBy(tileSize)
          .floor();
      };
    if (east && north) {
      template.pcrs = {};
      template.pcrs.bounds = bounds(
        [east.min, north.min],
        [east.max, north.max]
      );
      template.pcrs.easting = east;
      template.pcrs.northing = north;
    } else if (col && row && !isNaN(template.zoom.initialValue)) {
      // convert the tile bounds at this zoom to a pcrs bounds, then
      // go through the zoom min/max and create a tile-based bounds
      // at each zoom that applies to the col/row values that constrain what tiles
      // will be requested so that we don't generate too many 404s
      if (!template.pcrs) {
        template.pcrs = {};
        template.pcrs.easting = '';
        template.pcrs.northing = '';
      }

      template.pcrs.bounds = Util.boundsToPCRSBounds(
        bounds(point([col.min, row.min]), point([col.max, row.max])),
        template.zoom.initialValue,
        this.options.crs,
        Util.axisToCS('column')
      );

      template.tilematrix = {};
      template.tilematrix.col = col;
      template.tilematrix.row = row;
    }

    if (!template.tilematrix) {
      template.tilematrix = {};
      template.tilematrix.col = {};
      template.tilematrix.row = {};
    }
    template.tilematrix.bounds = [];
    var pcrsBounds = template.pcrs.bounds;
    // the template should _always_ have a zoom, because we force it to
    // by first processing the extent to determine the zoom and if none, adding
    // one and second by copying that zoom into the set of template variable inputs
    // even if it is not referenced by one of the template's variable references
    var zmin = this.options.minNativeZoom,
      zmax = this.options.maxNativeZoom;
    for (var z = 0; z <= zmax; z++) {
      template.tilematrix.bounds[z] =
        z >= zmin
          ? bounds(
              pcrs2tilematrix(pcrsBounds.min, z),
              pcrs2tilematrix(pcrsBounds.max, z)
            )
          : bounds(point([-1, -1]), point([-1, -1]));
    }
  },
  _clampZoom: function (zoom) {
    let clamp = GridLayer.prototype._clampZoom.call(this, zoom);
    if (this._template.step > this.options.maxNativeZoom)
      this._template.step = this.options.maxNativeZoom;

    if (zoom !== clamp) {
      zoom = clamp;
    } else {
      if (zoom % this._template.step !== 0) {
        zoom = Math.floor(zoom / this._template.step) * this._template.step;
      }
    }
    return zoom;
  }
});
export var templatedTileLayer = function (template, options) {
  return new TemplatedTileLayer(template, options);
};
