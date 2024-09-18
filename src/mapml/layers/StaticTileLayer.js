import { Util } from '../utils/Util';
export var StaticTileLayer = L.GridLayer.extend({
  initialize: function (options) {
    L.setOptions(this, options);
    this.zoomBounds = this._getZoomBounds(
      options.tileContainer,
      options.maxZoomBound
    );
    L.extend(this.options, this.zoomBounds);
    this._groups = this._groupTiles(
      this.options.tileContainer.getElementsByTagName('map-tile')
    );
    this._bounds = this._getLayerBounds(this._groups, this.options.projection); //stores meter values of bounds
    this.layerBounds = this._bounds[Object.keys(this._bounds)[0]];
    for (let key of Object.keys(this._bounds)) {
      this.layerBounds.extend(this._bounds[key].min);
      this.layerBounds.extend(this._bounds[key].max);
    }
  },

  onAdd: function (map) {
    this._map = map;
    L.GridLayer.prototype.onAdd.call(this, this._map);
    this._handleMoveEnd();
  },

  getEvents: function () {
    let events = L.GridLayer.prototype.getEvents.call(this, this._map);
    this._parentOnMoveEnd = events.moveend;
    events.moveend = this._handleMoveEnd;
    events.move = () => {}; //needed to prevent moveend from running
    return events;
  },

  isVisible: function () {
    let mapZoom = this._map.getZoom();
    let zoomLevel = mapZoom;
    zoomLevel =
      zoomLevel > this.options.maxNativeZoom
        ? this.options.maxNativeZoom
        : zoomLevel;
    zoomLevel =
      zoomLevel < this.options.minNativeZoom
        ? this.options.minNativeZoom
        : zoomLevel;
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this._bounds[zoomLevel] &&
      this._bounds[zoomLevel].overlaps(
        Util.pixelToPCRSBounds(
          this._map.getPixelBounds(),
          this._map.getZoom(),
          this._map.options.projection
        )
      )
    );
  },

  //sets the bounds flag of the layer and calls default moveEnd if within bounds
  //its the zoom level is between the nativeZoom and zoom then it uses the nativeZoom value to get the bound its checking
  _handleMoveEnd: function (e) {
    if (!this.isVisible()) return; //onMoveEnd still gets fired even when layer is out of bounds??, most likely need to overrride _onMoveEnd
    this._parentOnMoveEnd();
  },

  _isValidTile(coords) {
    return this._groups[this._tileCoordsToKey(coords)];
  },

  createTile: function (coords) {
    let tileGroup = this._groups[this._tileCoordsToKey(coords)] || [],
      tileElem = document.createElement('map-tile'),
      tileSize = this.getTileSize();
    tileElem.setAttribute('col', coords.x);
    tileElem.setAttribute('row', coords.y);
    tileElem.setAttribute('zoom', coords.z);

    for (let i = 0; i < tileGroup.length; i++) {
      let tile = document.createElement('img');
      tile.width = tileSize.x;
      tile.height = tileSize.y;
      tile.alt = '';
      tile.setAttribute('role', 'presentation');
      tile.src = tileGroup[i].src;
      tileElem.appendChild(tile);
    }
    return tileElem;
  },

  _getLayerBounds: function (tileGroups, projection) {
    let layerBounds = {},
      tileSize = M[projection].options.crs.tile.bounds.max.x;
    for (let tile in tileGroups) {
      let sCoords = tile.split(':'),
        pixelCoords = {};
      pixelCoords.x = +sCoords[0] * tileSize;
      pixelCoords.y = +sCoords[1] * tileSize;
      pixelCoords.z = +sCoords[2]; //+String same as parseInt(String)
      if (sCoords[2] in layerBounds) {
        layerBounds[sCoords[2]].extend(L.point(pixelCoords.x, pixelCoords.y));
        layerBounds[sCoords[2]].extend(
          L.point(pixelCoords.x + tileSize, pixelCoords.y + tileSize)
        );
      } else {
        layerBounds[sCoords[2]] = L.bounds(
          L.point(pixelCoords.x, pixelCoords.y),
          L.point(pixelCoords.x + tileSize, pixelCoords.y + tileSize)
        );
      }
    }
    // TODO: optimize by removing 2nd loop, add util function to convert point in pixels to point in pcrs, use that instead then this loop
    // won't be needed
    for (let pixelBounds in layerBounds) {
      let zoom = +pixelBounds;
      layerBounds[pixelBounds] = Util.pixelToPCRSBounds(
        layerBounds[pixelBounds],
        zoom,
        projection
      );
    }
    return layerBounds;
  },

  _getZoomBounds: function (container, maxZoomBound) {
    if (!container) return null;
    // should read zoom information from map-meta (of layer-) instead of the zoom attribute value of map-tile
    let meta = Util._metaContentToObject(
        this.options._leafletLayer._layerEl
          .querySelector('map-meta[name=zoom]')
          .getAttribute('content')
      ),
      zoom = {},
      tiles = container.getElementsByTagName('map-tile');
    zoom.nativeZoom = +meta.value || 0;
    zoom.maxNativeZoom = 0;
    zoom.minNativeZoom = maxZoomBound;
    for (let i = 0; i < tiles.length; i++) {
      let lZoom = +tiles[i].getAttribute('zoom');
      if (!tiles[i].getAttribute('zoom')) lZoom = zoom.nativeZoom;
      zoom.minNativeZoom = Math.min(zoom.minNativeZoom, lZoom);
      zoom.maxNativeZoom = Math.max(zoom.maxNativeZoom, lZoom);
    }

    // currently the min and max zoom bounds of staticTileLayer is set based on map-meta
    // can be hard coded to only natively zoom out 2 levels, any more and too many tiles are going to be loaded in at one time
    // it will avoid lagging the users computer, but it will also cause the bug that the initial zoom level of map is inproperly set
    zoom.minZoom = +meta.min || 0;
    zoom.maxZoom = +meta.max || maxZoomBound;
    return zoom;
  },

  _groupTiles: function (tiles) {
    let tileMap = {};
    for (let i = 0; i < tiles.length; i++) {
      let tile = {};
      tile.row = +tiles[i].getAttribute('row');
      tile.col = +tiles[i].getAttribute('col');
      tile.zoom = +tiles[i].getAttribute('zoom') || this.options.nativeZoom;
      tile.src = tiles[i].getAttribute('src');
      let tileCode = tile.col + ':' + tile.row + ':' + tile.zoom;
      if (tileCode in tileMap) {
        tileMap[tileCode].push(tile);
      } else {
        tileMap[tileCode] = [tile];
      }
    }
    return tileMap;
  }
});

export var staticTileLayer = function (options) {
  return new StaticTileLayer(options);
};
