export var DebugOverlay = L.Layer.extend({

  onAdd: function (map) {

    let mapSize = map.getSize();

    //conditionally show container for debug panel/banner only when the map has enough space for it
    if (mapSize.x > 400 || mapSize.y > 300) {
      this._container = L.DomUtil.create("div", "mapml-debug", map._container);

      //adds a control panel
      /*  this._controlPanel = L.DomUtil.create("div", "mapml-debug-control mapml-debug-panel", this._container);
          let toggleGridBtn = document.createElement('button'), gridBtnText = document.createTextNode("Toggle Grid");
          toggleGridBtn.appendChild(gridBtnText);
          toggleGridBtn.overlay = this;
          L.DomEvent.on(toggleGridBtn, 'click',this._toggleGrid);
          this._controlPanel.appendChild(toggleGridBtn); */

      this._container.style.width = 150;
      this._container.style.zIndex = 10000;
      this._container.style.position = "absolute";
      this._container.style.top = "auto";
      this._container.style.bottom = "5px";
      this._container.style.left = "5px";
      this._container.style.right = "auto";
    }

    this._grid = debugGrid({
      className: "mapml-debug-grid",
      pane: map._panes.mapPane,
      zIndex: 400,
      tileSize: map.options.crs.options.crs.tile.bounds.max.x,
    });
    map.addLayer(this._grid);

    this._panel = debugPanel({
      className: "mapml-debug-panel",
      pane: this._container,
    });
    map.addLayer(this._panel);

    this._vectors = debugVectors({
      className: "mapml-debug-vectors",
      pane: map._panes.mapPane,
      toolPane: this._container,
    });
    map.addLayer(this._vectors);
  },

  onRemove: function (map) {
    map.removeLayer(this._grid);
    map.removeLayer(this._panel);
    map.removeLayer(this._vectors);
    L.DomUtil.remove(this._container);
  },

});

export var debugOverlay = function () {
  return new DebugOverlay();
};

export var DebugPanel = L.Layer.extend({

  initialize: function (options) {
    L.setOptions(this, options);
  },

  onAdd: function (map) {
    let mapSize = map.getSize();

    //conditionally show debug panel only when the map has enough space for it
    if (mapSize.x > 400 || mapSize.y > 300) {
      this._title = L.DomUtil.create("div", "mapml-debug-banner", this.options.pane);
      this._title.innerHTML = "Debug mode";

      map.debug = {};
      map.debug._infoContainer = this._debugContainer = L.DomUtil.create("div", "mapml-debug-panel", this.options.pane);

      let infoContainer = map.debug._infoContainer;

      map.debug._tileCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);
      map.debug._tileMatrixCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);
      map.debug._mapCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);
      map.debug._tcrsCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);
      map.debug._pcrsCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);
      map.debug._gcrsCoord = L.DomUtil.create("div", "mapml-debug-coordinates", infoContainer);

      this._map.on("mousemove", this._updateCoords);
    }

  },
  onRemove: function () {
    L.DomUtil.remove(this._title);
    if (this._debugContainer) {
      L.DomUtil.remove(this._debugContainer);
      this._map.off("mousemove", this._updateCoords);
    }
  },
  _updateCoords: function (e) {
    if (this.contextMenu._visible) return;
    let mapEl = this.options.mapEl,
      point = mapEl._map.project(e.latlng),
      scale = mapEl._map.options.crs.scale(+mapEl.zoom),
      pcrs = mapEl._map.options.crs.transformation.untransform(point, scale),
      tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
      pointI = point.x % tileSize, pointJ = point.y % tileSize;

    if (pointI < 0) pointI += tileSize;
    if (pointJ < 0) pointJ += tileSize;

    this.debug._tileCoord.innerHTML = `tile: i: ${Math.trunc(pointI)}, j: ${Math.trunc(pointJ)}`;
    this.debug._mapCoord.innerHTML = `map: i: ${Math.trunc(e.containerPoint.x)}, j: ${Math.trunc(e.containerPoint.y)}`;
    this.debug._gcrsCoord.innerHTML = `gcrs: lon: ${e.latlng.lng.toFixed(6)}, lat: ${e.latlng.lat.toFixed(6)}`;
    this.debug._tcrsCoord.innerHTML = `tcrs: x:${Math.trunc(point.x)}, y:${Math.trunc(point.y)}`;
    this.debug._tileMatrixCoord.innerHTML = `tilematrix: column:${Math.trunc(point.x / tileSize)}, row:${Math.trunc(point.y / tileSize)}`;
    this.debug._pcrsCoord.innerHTML = `pcrs: easting:${pcrs.x.toFixed(2)}, northing:${pcrs.y.toFixed(2)}`;
  },

});

export var debugPanel = function (options) {
  return new DebugPanel(options);
};

export var DebugGrid = L.GridLayer.extend({

  initialize: function (options) {
    L.setOptions(this, options);
    L.GridLayer.prototype.initialize.call(this, this._map);
  },

  createTile: function (coords) {
    let tile = L.DomUtil.create("div", "mapml-debug-tile");
    tile.setAttribute("col", coords.x);
    tile.setAttribute("row", coords.y);
    tile.setAttribute("zoom", coords.z);
    tile.innerHTML = [`col: ${coords.x}`, `row: ${coords.y}`, `zoom: ${coords.z}`].join(', ');

    tile.style.outline = '1px dashed red';
    return tile;
  },
});

export var debugGrid = function (options) {
  return new DebugGrid(options);
};

export var DebugVectors = L.LayerGroup.extend({
  initialize: function (options) {
    L.setOptions(this, options);
    L.LayerGroup.prototype.initialize.call(this, this._map, options);
  },
  onAdd: function (map) {
    map.on('overlayremove', this._mapLayerUpdate, this);
    map.on('overlayadd', this._mapLayerUpdate, this);
    let center = map.options.crs.transformation.transform(L.point(0, 0), map.options.crs.scale(0));
    this._centerVector = L.circle(map.options.crs.pointToLatLng(center, 0), { radius: 250 });
    this._centerVector.bindTooltip("Projection Center");

    this._addBounds(map);
  },
  onRemove: function (map) {
    this.clearLayers();
  },

  _addBounds: function (map) {
    let id = Object.keys(map._layers),
      layers = map._layers,
      colors = ["#FF5733", "#8DFF33", "#3397FF", "#E433FF", "#F3FF33"],
      j = 0;

    this.addLayer(this._centerVector);
    for (let i of id) {
      if (layers[i].layerBounds) {
        let boundsArray = [
          layers[i].layerBounds.min,
          L.point(layers[i].layerBounds.max.x, layers[i].layerBounds.min.y),
          layers[i].layerBounds.max,
          L.point(layers[i].layerBounds.min.x, layers[i].layerBounds.max.y)
        ];
        let boundsRect = projectedExtent(boundsArray, {
          color: colors[j % colors.length],
          weight: 2,
          opacity: 1,
          fillOpacity: 0.01,
          fill: true,
        });
        if (layers[i].options._leafletLayer)
          boundsRect.bindTooltip(layers[i].options._leafletLayer._title, { sticky: true });
        this.addLayer(boundsRect);
        j++;
      }
    }
  },

  _mapLayerUpdate: function (e) {
    this.clearLayers();
    this._addBounds(e.target);
  },
});

export var debugVectors = function (options) {
  return new DebugVectors(options);
};


var ProjectedExtent = L.Path.extend({

  initialize: function (locations, options) {
    //locations passed in as pcrs coordinates
    this._locations = locations;
    L.setOptions(this, options);
  },

  _project: function () {
    this._rings = [];
    let scale = this._map.options.crs.scale(this._map.getZoom()),
      map = this._map;
    for (let i = 0; i < this._locations.length; i++) {
      let point = map.options.crs.transformation.transform(this._locations[i], scale);
      //substract the pixel origin from the pixel coordinates to get the location relative to map viewport
      this._rings.push(L.point(point.x, point.y)._subtract(map.getPixelOrigin()));
    }
    //leaflet SVG renderer looks for and array of arrays to build polygons,
    //in this case it only deals with a rectangle so one closed array or points
    this._parts = [this._rings];
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updatePoly(this, true); //passing true creates a closed path i.e. a rectangle
  },

});

var projectedExtent = function (locations, options) {
  return new ProjectedExtent(locations, options);
};