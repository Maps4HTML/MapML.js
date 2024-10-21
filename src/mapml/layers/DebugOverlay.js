import {
  Layer,
  DomUtil,
  GridLayer,
  LayerGroup,
  Path,
  point,
  circle,
  bounds,
  setOptions
} from 'leaflet';

export var DebugOverlay = Layer.extend({
  onAdd: function (map) {
    let mapSize = map.getSize();

    //conditionally show container for debug panel/banner only when the map has enough space for it
    if (mapSize.x > 400 || mapSize.y > 300) {
      this._container = DomUtil.create('table', 'mapml-debug', map._container);

      this._panel = debugPanel({
        className: 'mapml-debug-panel',
        pane: this._container
      });
      map.addLayer(this._panel);
    }

    this._grid = debugGrid({
      className: 'mapml-debug-grid',
      pane: map._panes.mapPane,
      zIndex: 400,
      tileSize: map.options.crs.options.crs.tile.bounds.max.x
    });
    map.addLayer(this._grid);

    this._vectors = debugVectors({
      className: 'mapml-debug-vectors',
      pane: map._panes.mapPane,
      toolPane: this._container
    });
    map.addLayer(this._vectors);
  },

  onRemove: function (map) {
    map.removeLayer(this._grid);
    map.removeLayer(this._vectors);
    if (this._panel) {
      //conditionally remove the panel, as it's not always added
      map.removeLayer(this._panel);
      DomUtil.remove(this._container);
    }
  }
});

export var debugOverlay = function () {
  return new DebugOverlay();
};

export var DebugPanel = Layer.extend({
  initialize: function (options) {
    setOptions(this, options);
  },

  onAdd: function (map) {
    this._title = DomUtil.create(
      'caption',
      'mapml-debug-banner',
      this.options.pane
    );
    this._title.innerHTML = 'Debug mode';

    map.debug = {};
    map.debug._infoContainer = this._debugContainer = DomUtil.create(
      'tbody',
      'mapml-debug-panel',
      this.options.pane
    );

    let infoContainer = map.debug._infoContainer;

    map.debug._tileCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._tileMatrixCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._mapCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._tcrsCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._pcrsCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );
    map.debug._gcrsCoord = DomUtil.create(
      'tr',
      'mapml-debug-coordinates',
      infoContainer
    );

    this._map.on('mousemove', this._updateCoords);
  },
  onRemove: function () {
    DomUtil.remove(this._title);
    if (this._debugContainer) {
      DomUtil.remove(this._debugContainer);
      this._map.off('mousemove', this._updateCoords);
    }
  },
  _updateCoords: function (e) {
    if (this.contextMenu._visible) return;
    let mapEl = this.options.mapEl,
      pointCoords = mapEl._map.project(e.latlng),
      scale = mapEl._map.options.crs.scale(+mapEl.zoom),
      pcrs = mapEl._map.options.crs.transformation.untransform(
        pointCoords,
        scale
      ),
      tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
      pointI = pointCoords.x % tileSize,
      pointJ = pointCoords.y % tileSize;

    if (pointI < 0) pointI += tileSize;
    if (pointJ < 0) pointJ += tileSize;

    this.debug._tileCoord.innerHTML = `
      <th scope="row">tile: </th>
      <td>i: ${Math.trunc(pointI)}, </td>
      <td>j: ${Math.trunc(pointJ)}</td>
      `;
    this.debug._mapCoord.innerHTML = `
      <th scope="row">map: </th>
      <td>i: ${Math.trunc(e.containerPoint.x)}, </td>
      <td>j: ${Math.trunc(e.containerPoint.y)}</td>
      `;
    this.debug._gcrsCoord.innerHTML = `
      <th scope="row">gcrs: </th>
      <td>lon: ${e.latlng.lng.toFixed(6)}, </td>
      <td>lat: ${e.latlng.lat.toFixed(6)}</td>
      `;
    this.debug._tcrsCoord.innerHTML = `
      <th scope="row">tcrs: </th>
      <td>x: ${Math.trunc(pointCoords.x)}, </td>
      <td>y: ${Math.trunc(pointCoords.y)}</td>
      `;
    this.debug._tileMatrixCoord.innerHTML = `
      <th scope="row">tilematrix: </th>
      <td>column: ${Math.trunc(pointCoords.x / tileSize)}, </td>
      <td>row: ${Math.trunc(pointCoords.y / tileSize)}</td>
      `;
    this.debug._pcrsCoord.innerHTML = `
      <th scope="row">pcrs: </th>
      <td>easting: ${pcrs.x.toFixed(2)}, </td>
      <td>northing: ${pcrs.y.toFixed(2)}</td>
      `;
  }
});

export var debugPanel = function (options) {
  return new DebugPanel(options);
};

export var DebugGrid = GridLayer.extend({
  initialize: function (options) {
    setOptions(this, options);
    GridLayer.prototype.initialize.call(this, this._map);
  },

  createTile: function (coords) {
    let tile = DomUtil.create('div', 'mapml-debug-tile');
    tile.setAttribute('col', coords.x);
    tile.setAttribute('row', coords.y);
    tile.setAttribute('zoom', coords.z);
    tile.innerHTML = [
      `col: ${coords.x}`,
      `row: ${coords.y}`,
      `zoom: ${coords.z}`
    ].join(', ');

    tile.style.outline = '1px dashed red';
    return tile;
  }
});

export var debugGrid = function (options) {
  return new DebugGrid(options);
};

export var DebugVectors = LayerGroup.extend({
  initialize: function (options) {
    setOptions(this, options);
    LayerGroup.prototype.initialize.call(this, this._map, options);
  },
  onAdd: function (map) {
    map.on('overlayremove', this._mapLayerUpdate, this);
    map.on('overlayadd', this._mapLayerUpdate, this);
    let center = map.options.crs.transformation.transform(
      point(0, 0),
      map.options.crs.scale(0)
    );
    this._centerVector = circle(map.options.crs.pointToLatLng(center, 0), {
      radius: 250,
      className: 'mapml-debug-vectors projection-centre'
    });
    this._centerVector.bindTooltip('Projection Center');

    this._addBounds(map);
  },
  onRemove: function (map) {
    this.clearLayers();
  },

  _addBounds: function (map) {
    // to delay the addBounds to wait for the layer.extentbounds / layer.layerbounds to be ready when the map-layer checked attribute is changed
    setTimeout(() => {
      let id = Object.keys(map._layers),
        layers = map._layers,
        colors = ['#FF5733', '#8DFF33', '#3397FF', '#E433FF', '#F3FF33'],
        j = 0;

      this.addLayer(this._centerVector);

      for (let i of id) {
        if (layers[i].layerBounds || layers[i].extentBounds) {
          let boundsArray;
          if (layers[i].layerBounds) {
            boundsArray = [
              layers[i].layerBounds.min,
              point(layers[i].layerBounds.max.x, layers[i].layerBounds.min.y),
              layers[i].layerBounds.max,
              point(layers[i].layerBounds.min.x, layers[i].layerBounds.max.y)
            ];
          } else {
            boundsArray = [
              layers[i].extentBounds.min,
              point(layers[i].extentBounds.max.x, layers[i].extentBounds.min.y),
              layers[i].extentBounds.max,
              point(layers[i].extentBounds.min.x, layers[i].extentBounds.max.y)
            ];
          }

          // boundsTestTag adds the value of from the <map-layer@data-testid> element
          // if it exists. this simplifies debugging because the svg path will be
          // tagged with the layer it came from
          let boundsTestTag =
            layers[i].extentBounds &&
            layers[i].options.linkEl.getLayerEl().hasAttribute('data-testid')
              ? layers[i].options.linkEl
                  .getLayerEl()
                  .getAttribute('data-testid')
              : layers[i].layerBounds &&
                layers[i].options?._leafletLayer?._layerEl?.hasAttribute(
                  'data-testid'
                )
              ? layers[i].options._leafletLayer._layerEl.getAttribute(
                  'data-testid'
                )
              : '';
          let boundsRect = projectedExtent(boundsArray, {
            className: this.options.className.concat(' ', boundsTestTag),
            color: colors[j % colors.length],
            weight: 2,
            opacity: 1,
            fillOpacity: 0.01,
            fill: true
          });
          if (layers[i].options._leafletLayer)
            boundsRect.bindTooltip(layers[i].options._leafletLayer._title, {
              sticky: true
            });
          this.addLayer(boundsRect);
          j++;
        }
      }

      if (map.totalLayerBounds) {
        let totalBoundsArray = [
          map.totalLayerBounds.min,
          point(map.totalLayerBounds.max.x, map.totalLayerBounds.min.y),
          map.totalLayerBounds.max,
          point(map.totalLayerBounds.min.x, map.totalLayerBounds.max.y)
        ];

        let totalBounds = projectedExtent(totalBoundsArray, {
          className: 'mapml-debug-vectors mapml-total-bounds',
          color: '#808080',
          weight: 5,
          opacity: 0.5,
          fill: false
        });
        this.addLayer(totalBounds);
      }
    }, 0);
  },

  _mapLayerUpdate: function (e) {
    this.clearLayers();
    this._addBounds(e.target);
  }
});

export var debugVectors = function (options) {
  return new DebugVectors(options);
};

var ProjectedExtent = Path.extend({
  getCenter: function (round) {
    let crs = this._map.options.crs;
    return crs.unproject(bounds(this._locations).getCenter());
  },

  options: {
    className: 'mapml-debug-extent'
  },
  initialize: function (locations, options) {
    //locations passed in as pcrs coordinates
    this._locations = locations;
    setOptions(this, options);
  },

  _project: function () {
    this._rings = [];
    let scale = this._map.options.crs.scale(this._map.getZoom()),
      map = this._map;
    for (let i = 0; i < this._locations.length; i++) {
      let pt0 = map.options.crs.transformation.transform(
        this._locations[i],
        scale
      );
      //substract the pixel origin from the pixel coordinates to get the location relative to map viewport
      this._rings.push(point(pt0.x, pt0.y)._subtract(map.getPixelOrigin()));
    }
    //leaflet SVG renderer looks for and array of arrays to build polygons,
    //in this case it only deals with a rectangle so one closed array or points
    this._parts = [this._rings];
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updatePoly(this, true); //passing true creates a closed path i.e. a rectangle
  }
});

var projectedExtent = function (locations, options) {
  return new ProjectedExtent(locations, options);
};
