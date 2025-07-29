import { bounds as Lbounds, point as Lpoint } from 'leaflet';

import { Util } from './mapml/utils/Util.js';
import { mapTileLayer } from './mapml/layers/MapTileLayer.js';
import { calculatePosition } from './mapml/elementSupport/layers/calculatePosition.js';

/* global M */

export class HTMLTileElement extends HTMLElement {
  static get observedAttributes() {
    return ['row', 'col', 'zoom', 'src'];
  }
  /* jshint ignore:start */
  #hasConnected; // prevents attributeChangedCallback before connectedCallback
  #initialRow;
  #initialCol;
  #initialZoom;
  /* jshint ignore:end */
  get row() {
    /* jshint ignore:start */
    return this.#hasConnected ? +this.#initialRow : +this.getAttribute('row');
    /* jshint ignore:end */
  }
  set row(val) {
    /* jshint ignore:start */
    if (this.#hasConnected) return; // Ignore after connection
    /* jshint ignore:end */
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) {
      this.setAttribute('row', parsedVal);
    }
  }
  get col() {
    /* jshint ignore:start */
    return this.#hasConnected ? +this.#initialCol : +this.getAttribute('col');
    /* jshint ignore:end */
  }
  set col(val) {
    /* jshint ignore:start */
    if (this.#hasConnected) return; // Ignore after connection
    /* jshint ignore:end */
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) {
      this.setAttribute('col', parsedVal);
    }
  }
  get zoom() {
    /* jshint ignore:start */
    return this.#hasConnected ? +this.#initialZoom : +this.getAttribute('zoom');
    /* jshint ignore:end */
  }
  set zoom(val) {
    /* jshint ignore:start */
    if (this.#hasConnected) return; // Ignore after connection
    /* jshint ignore:end */
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal) && parsedVal >= 0 && parsedVal <= 25) {
      this.setAttribute('zoom', parsedVal);
    }
  }
  get src() {
    return this.hasAttribute('src') ? this.getAttribute('src') : '';
  }
  set src(val) {
    if (val) {
      this.setAttribute('src', val);
    }
  }
  get extent() {
    if (!this._extent) {
      this._calculateExtent();
    }
    return this._extent;
  }
  get position() {
    return calculatePosition(this);
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  getAttribute(name) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'row':
          return String(this.#initialRow); /* jshint ignore:line */
        case 'col':
          return String(this.#initialCol); /* jshint ignore:line */
        case 'zoom':
          return String(this.#initialZoom); /* jshint ignore:line */
      }
    }
    return super.getAttribute(name);
  }
  setAttribute(name, value) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'row':
        case 'col':
        case 'zoom':
          return;
      }
    }
    super.setAttribute(name, value);
  }
  async connectedCallback() {
    // initialization is done in connectedCallback, attribute initialization
    // calls (which happen first) are effectively ignored, so we should be able
    // to rely on them being all correctly set by this time e.g. zoom, row, col
    // all now have a value that together identify this tiled bit of space
    // row,col,zoom can't / shouldn't change
    /* jshint ignore:start */
    this.#initialZoom = this.hasAttribute('zoom')
      ? +this.getAttribute('zoom')
      : this.getMapEl().zoom;
    this.#initialRow = this.hasAttribute('row') ? +this.getAttribute('row') : 0;
    this.#initialCol = this.hasAttribute('col') ? +this.getAttribute('col') : 0;
    this.#hasConnected = true;
    /* jshint ignore:end */
    // Get parent element to determine how to handle the tile
    // Need to handle shadow DOM correctly like map-feature does
    this._parentEl =
      this.parentNode.nodeName === 'MAP-LAYER' ||
      this.parentNode.nodeName === 'LAYER-' ||
      this.parentNode.nodeName === 'MAP-LINK'
        ? this.parentNode
        : this.parentNode.host;

    // in the case of <map-tile> that is rendered but never connected, this won't
    // matter, but it speeds up rendering for tiles that go through here...
    const imgObj = new Image();
    imgObj.src = this.getAttribute('src');

    await this._createOrGetTileLayer();
  }

  disconnectedCallback() {
    // If this is a map-tile connected to a tile layer, remove it from the layer
    if (this._tileLayer) {
      this._tileLayer.removeMapTile(this);

      // If this was the last tile in the layer, clean up the layer
      if (this._tileLayer._mapTiles && this._tileLayer._mapTiles.length === 0) {
        this._tileLayer.remove();
        this._tileLayer = null;
        delete this._tileLayer;
      }
    }
  }
  isFirst() {
    // Get the previous element sibling
    const prevSibling = this.previousElementSibling;

    // If there's no previous sibling, return true
    if (!prevSibling) {
      return true;
    }

    // Compare the node names (tag names) - return true if they're different
    return this.nodeName !== prevSibling.nodeName;
  }
  getPrevious() {
    // Check if this is the first element of a sequence
    if (this.isFirst()) {
      return null; // No previous element available
    }

    // Since we know it's not the first, we can safely return the previous element sibling
    return this.previousElementSibling;
  }
  zoomTo() {
    let extent = this.extent;
    let map = this.getMapEl()._map,
      xmin = extent.topLeft.pcrs.horizontal,
      xmax = extent.bottomRight.pcrs.horizontal,
      ymin = extent.bottomRight.pcrs.vertical,
      ymax = extent.topLeft.pcrs.vertical,
      bounds = Lbounds(Lpoint(xmin, ymin), Lpoint(xmax, ymax)),
      center = map.options.crs.unproject(bounds.getCenter(true)),
      maxZoom = extent.zoom.maxZoom,
      minZoom = extent.zoom.minZoom;
    map.setView(center, Util.getMaxZoom(bounds, map, minZoom, maxZoom), {
      animate: false
    });
  }
  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  getLayerEl() {
    return Util.getClosest(this, 'map-layer,layer-');
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'row':
        case 'col':
        case 'zoom':
          break;
        case 'src':
          if (oldValue !== newValue) {
            // If we've already calculated an extent, recalculate it
            if (this._extent) {
              this._calculateExtent();
            }

            // If this tile is connected to a tile layer, update it
            if (this._tileLayer) {
              // For src changes, normal removal works since coordinates haven't changed
              this._tileLayer.removeMapTile(this);
              this._tileLayer.addMapTile(this);
            }
          }
          break;
      }
    }
  }
  // ~copied/reimplemented from map-feature.js
  getMeta(metaName) {
    let name = metaName.toLowerCase();
    if (name !== 'cs' && name !== 'zoom' && name !== 'projection') return;
    let sdMeta = this._parentEl.shadowRoot.querySelector(
      `map-meta[name=${name}][content]`
    );
    if (this._parentEl.nodeName === 'MAP-LINK') {
      // sd.map-meta || map-extent meta || layer meta
      return sdMeta || this._parentEl.parentElement.getMeta(metaName);
    } else {
      return this._parentEl.src
        ? this._parentEl.shadowRoot.querySelector(
            `map-meta[name=${name}][content]`
          )
        : this._parentEl.querySelector(`map-meta[name=${name}][content]`);
    }
  }
  async _createOrGetTileLayer() {
    await this._parentEl.whenReady();
    if (this.isFirst()) {
      const parentElement = this._parentEl;

      // Create a new MapTileLayer
      this._tileLayer = mapTileLayer({
        projection: this.getMapEl().projection,
        opacity: 1,
        // used by map-link and map-layer, both have containers
        pane:
          parentElement._templatedLayer?.getContainer() ||
          parentElement._layer.getContainer(),
        zIndex: this.position
      });
      this._tileLayer.addMapTile(this);

      // add MapTileLayer to TemplatedFeaturesOrTilesLayer of the MapLink
      if (parentElement._templatedLayer?.addLayer) {
        parentElement._templatedLayer.addLayer(this._tileLayer);
      } else {
        // OR to the MapLayer's layer
        parentElement._layer.addLayer(this._tileLayer);
      }
    } else {
      // get the previous tile's layer
      this._tileLayer = this.getPrevious()?._tileLayer;
      if (this._tileLayer) {
        this._tileLayer.addMapTile(this);
      }
    }
  }
  _calculateExtent() {
    const mapEl = this.getMapEl();

    if (!mapEl || !mapEl._map) {
      // Can't calculate extent without a map
      return;
    }

    const map = mapEl._map;
    const projection = map.options.projection;
    const tileSize = M[projection].options.crs.tile.bounds.max.x;

    // Convert tile coordinates to pixel bounds
    const pixelX = this.col * tileSize;
    const pixelY = this.row * tileSize;
    const pixelBounds = Lbounds(
      Lpoint(pixelX, pixelY),
      Lpoint(pixelX + tileSize, pixelY + tileSize)
    );

    // Convert pixel bounds to PCRS bounds
    const pcrsBounds = Util.pixelToPCRSBounds(
      pixelBounds,
      this.zoom,
      projection
    );

    // Format the extent similar to feature extents
    this._extent = Util._convertAndFormatPCRS(
      pcrsBounds,
      map.options.crs,
      projection
    );

    // Add zoom information
    this._extent.zoom = {
      minZoom: this.zoom,
      maxZoom: this.zoom,
      minNativeZoom: this.zoom,
      maxNativeZoom: this.zoom
    };
  }
}
