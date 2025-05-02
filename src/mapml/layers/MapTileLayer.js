import { GridLayer, DomUtil, point, bounds } from 'leaflet';
import { Util } from '../utils/Util.js';

/**
 * Leaflet layer for handling map-tile elements
 * Extends GridLayer to create tiles based on map-tile elements
 *
 * Similar in intent to MapFeatureLayerGroup, which is a receiver for
 * map-feature elements' leaflet layer object
 *
 * This layer will be inserted into the LayerGroup hosted by the <map-link>
 * immediately after creation, so that its index within the _layers array of
 * that LayerGroup will be equal to its z-index within the LayerGroup's container
 *
 * <map-tile row="10" col="12" src="url1"></map-tile>  LayerGroup._layers[0] <- each set of adjacent tiles
 * <map-tile row="11" col="12" src="url2"></map-tile>  LayerGroup._layers[0] <- is a single MapTileLayer
 * <map-feature id="a"> LayerGroup._layers[1]
 * <map-feature id="b"> LayerGroup._layers[1]
 * <map-tile row="10" col="12" src="url3"></map-tile>  LayerGroup._layers[2]
 * <map-tile row="11" col="12" src="url4"></map-tile>  LayerGroup._layers[2]
 * <map-feature id="c"> LayerGroup._layers[3]
 * <map-feature id="d"> LayerGroup._layers[3]
 * and so on
 */
export var MapTileLayer = GridLayer.extend({
  initialize: function (options) {
    GridLayer.prototype.initialize.call(this, options);
    this._mapTiles = options.mapTiles || [];
    this._tileMap = {};
    this._pendingTiles = {};
    this._buildTileMap();
    this._container = DomUtil.create('div', 'leaflet-layer');
    DomUtil.addClass(this._container, 'mapml-static-tile-container');
    // Store bounds for visibility checks
    //    this.layerBounds = this._computeLayerBounds();
    //    this.zoomBounds = this._computeZoomBounds();
  },

  onAdd: function (map) {
    this.options.pane.appendChild(this._container);
    // Call the parent method
    GridLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function (map) {
    // Clean up pending tiles
    this._pendingTiles = {};
    DomUtil.remove(this._container);
  },

  /**
   * Adds a map-tile element to the layer
   * @param {HTMLTileElement} mapTile - The map-tile element to add
   */
  addMapTile: function (mapTile) {
    if (!this._mapTiles.includes(mapTile)) {
      this._mapTiles.push(mapTile);
      this._addToTileMap(mapTile);
      //      this._updateBounds();
      //      this.redraw();
    }
  },

  /**
   * Removes a map-tile element from the layer
   * @param {HTMLTileElement} mapTile - The map-tile element to remove
   */
  removeMapTile: function (mapTile) {
    const index = this._mapTiles.indexOf(mapTile);
    if (index !== -1) {
      this._mapTiles.splice(index, 1);
      this._removeFromTileMap(mapTile);
      //      this._updateBounds();
      //      this.redraw();
    }
  },

  /**
   * Checks if the layer is currently visible on the map
   * @returns {boolean} - True if the layer is visible, false otherwise
   */
  isVisible: function () {
    if (!this._map) return false;

    const mapZoom = this._map.getZoom();
    // Clamp zoom to layer's zoom bounds
    const zoomLevel = Math.max(
      this.zoomBounds.minNativeZoom,
      Math.min(mapZoom, this.zoomBounds.maxNativeZoom)
    );

    return (
      mapZoom >= this.zoomBounds.minZoom &&
      mapZoom <= this.zoomBounds.maxZoom &&
      this.layerBounds.overlaps(
        Util.pixelToPCRSBounds(
          this._map.getPixelBounds(),
          mapZoom,
          this._map.options.projection
        )
      )
    );
  },

  /**
   * Overrides GridLayer createTile to use map-tile elements
   * @param {Object} coords - Tile coordinates
   * @param {Function} done - Callback to be called when the tile is ready, with error and tile element params
   * @returns {HTMLElement} - The created tile element
   */
  createTile: function (coords, done) {
    const tileKey = this._tileCoordsToKey(coords);
    const tileSize = this.getTileSize();

    // Create container element
    const tileElement = document.createElement('div');
    tileElement.setAttribute('col', coords.x);
    tileElement.setAttribute('row', coords.y);
    tileElement.setAttribute('zoom', coords.z);
    DomUtil.addClass(tileElement, 'leaflet-tile');

    // Set size
    tileElement.style.width = tileSize.x + 'px';
    tileElement.style.height = tileSize.y + 'px';

    // Find matching tile in our map
    const matchingTile = this._tileMap[tileKey];

    if (matchingTile) {
      // Create an image element with the src from the matching map-tile
      const img = document.createElement('img');
      img.src = matchingTile.src;
      img.width = tileSize.x;
      img.height = tileSize.y;
      img.alt = '';
      img.setAttribute('role', 'presentation');
      // bidirectional link map-tile element and rendered div
      tileElement._mapTile = matchingTile;
      matchingTile._tileDiv = tileElement;

      tileElement.appendChild(img);

      // Add the loaded class manually to ensure tile is visible
      DomUtil.addClass(tileElement, 'leaflet-tile-loaded');

      // Call the done callback to signal that the tile is ready
      done(null, tileElement);
    } else {
      // The tile might be added later, register a pending tile
      if (!this._pendingTiles) {
        this._pendingTiles = {};
      }

      // Store the tile element and done callback for later update
      this._pendingTiles[tileKey] = {
        element: tileElement,
        done: done
      };

      // Don't call done yet - we'll call it when the map-tile is added
    }

    return tileElement;
  },

  /**
   * Builds the tile map from the current map-tile elements
   * @private
   */
  _buildTileMap: function () {
    this._tileMap = {};
    for (const mapTile of this._mapTiles) {
      this._addToTileMap(mapTile);
    }
  },

  /**
   * Adds a map-tile element to the tile map
   * @param {HTMLTileElement} mapTile - The map-tile element to add
   * @private
   */
  _addToTileMap: function (mapTile) {
    const tileKey = `${mapTile.col}:${mapTile.row}:${mapTile.zoom}`;
    this._tileMap[tileKey] = mapTile;

    // Check if this tile was requested but not available at that time
    if (this._pendingTiles && this._pendingTiles[tileKey]) {
      const pendingTile = this._pendingTiles[tileKey];
      const tileElement = pendingTile.element;
      const doneCallback = pendingTile.done;

      // Create and append the image to the tile
      const tileSize = this.getTileSize();
      const img = document.createElement('img');
      img.src = mapTile.src;
      img.width = tileSize.x;
      img.height = tileSize.y;
      img.alt = '';
      img.setAttribute('role', 'presentation');

      // bidirectional link map-tile element and rendered div
      tileElement._mapTile = mapTile;
      mapTile._tileDiv = tileElement;

      tileElement.appendChild(img);

      // Add the loaded class manually to ensure tile is visible
      DomUtil.addClass(tileElement, 'leaflet-tile-loaded');

      // Call the done callback to signal that the tile is now ready
      if (doneCallback) {
        doneCallback(null, tileElement);
      }

      // Remove from pending tiles
      delete this._pendingTiles[tileKey];
    }
  },
  /**
   * Removes a map-tile element from the tile map
   * @param {HTMLTileElement} mapTile - The map-tile element to remove
   * @private
   */
  _removeFromTileMap: function (mapTile) {
    const tileKey = `${mapTile.col}:${mapTile.row}:${mapTile.zoom}`;
    delete this._tileMap[tileKey];

    // Also remove from pending tiles if it exists there
    if (this._pendingTiles && this._pendingTiles[tileKey]) {
      delete this._pendingTiles[tileKey];
    }
  },

  /**
   * Updates layer bounds when tiles are added or removed
   * @private
   */
  _updateBounds: function () {
    this.layerBounds = this._computeLayerBounds();
    this.zoomBounds = this._computeZoomBounds();
  },

  /**
   * Computes the layer bounds from all map-tile elements
   * @returns {L.Bounds} - The computed layer bounds
   * @private
   */
  _computeLayerBounds: function () {
    if (this._mapTiles.length === 0) {
      return bounds([0, 0], [0, 0]);
    }

    const tilesByZoom = {};
    const projection = this.options.projection;
    const tileSize = M[projection].options.crs.tile.bounds.max.x;

    // Group tiles by zoom
    for (const mapTile of this._mapTiles) {
      const zoom = mapTile.zoom;

      if (!tilesByZoom[zoom]) {
        tilesByZoom[zoom] = [];
      }

      tilesByZoom[zoom].push({
        x: mapTile.col,
        y: mapTile.row,
        z: zoom
      });
    }

    // Calculate bounds for each zoom level
    const layerBoundsByZoom = {};
    for (const zoom in tilesByZoom) {
      const tiles = tilesByZoom[zoom];
      let pixelBounds = null;

      for (const tile of tiles) {
        const pixelX = tile.x * tileSize;
        const pixelY = tile.y * tileSize;

        if (!pixelBounds) {
          pixelBounds = bounds(
            point(pixelX, pixelY),
            point(pixelX + tileSize, pixelY + tileSize)
          );
        } else {
          pixelBounds.extend(point(pixelX, pixelY));
          pixelBounds.extend(point(pixelX + tileSize, pixelY + tileSize));
        }
      }

      if (pixelBounds) {
        layerBoundsByZoom[zoom] = Util.pixelToPCRSBounds(
          pixelBounds,
          parseInt(zoom, 10),
          projection
        );
      }
    }

    // Combine all zoom level bounds
    let combinedBounds = null;
    for (const zoom in layerBoundsByZoom) {
      if (!combinedBounds) {
        combinedBounds = layerBoundsByZoom[zoom].clone();
      } else {
        combinedBounds.extend(layerBoundsByZoom[zoom].min);
        combinedBounds.extend(layerBoundsByZoom[zoom].max);
      }
    }

    return combinedBounds || bounds([0, 0], [0, 0]);
  },

  /**
   * Computes zoom bounds from all map-tile elements
   * @returns {Object} - The computed zoom bounds
   * @private
   */
  _computeZoomBounds: function () {
    const result = {
      minZoom: Infinity,
      maxZoom: -Infinity,
      minNativeZoom: Infinity,
      maxNativeZoom: -Infinity
    };

    if (this._mapTiles.length === 0) {
      return {
        minZoom: 0,
        maxZoom: 22,
        minNativeZoom: 0,
        maxNativeZoom: 22
      };
    }

    // Find min/max zoom from map-tile elements
    for (const mapTile of this._mapTiles) {
      const zoom = mapTile.zoom;
      result.minNativeZoom = Math.min(result.minNativeZoom, zoom);
      result.maxNativeZoom = Math.max(result.maxNativeZoom, zoom);
    }

    // Set min/max zoom based on native zoom
    result.minZoom = result.minNativeZoom;
    result.maxZoom = result.maxNativeZoom;

    return result;
  }
});

export var mapTileLayer = function (options) {
  return new MapTileLayer(options);
};
