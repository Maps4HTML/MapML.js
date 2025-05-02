import { bounds as Lbounds, point as Lpoint } from 'leaflet';

import { Util } from './mapml/utils/Util.js';
import { mapTileLayer } from './mapml/layers/MapTileLayer.js';

/* global M */

export class HTMLTileElement extends HTMLElement {
  static get observedAttributes() {
    return ['row', 'col', 'zoom', 'src'];
  }
  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get row() {
    return +(this.hasAttribute('row') ? this.getAttribute('row') : 0);
  }
  set row(val) {
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) {
      this.setAttribute('row', parsedVal);
    }
  }
  get col() {
    return +(this.hasAttribute('col') ? this.getAttribute('col') : 0);
  }
  set col(val) {
    var parsedVal = parseInt(val, 10);
    if (!isNaN(parsedVal)) {
      this.setAttribute('col', parsedVal);
    }
  }
  get zoom() {
    // for templated or queried features ** native zoom is only used for zoomTo() **
    let meta = {},
      metaEl = this.getMeta('zoom');
    if (metaEl)
      meta = Util._metaContentToObject(metaEl.getAttribute('content'));
    if (this._parentElement.nodeName === 'MAP-LINK') {
      // nativeZoom = zoom attribute || (sd.map-meta zoom 'value'  || 'max') || this._initialZoom
      return +(this.hasAttribute('zoom')
        ? this.getAttribute('zoom')
        : meta.value
        ? meta.value
        : meta.max
        ? meta.max
        : this._initialZoom);
    } else {
      // for "static" features
      // nativeZoom zoom attribute || this._initialZoom
      // NOTE we don't use map-meta here, because the map-meta is the minimum
      // zoom bounds for the layer, and is extended by additional features
      // if added / removed during layer lifetime
      return +(this.hasAttribute('zoom')
        ? this.getAttribute('zoom')
        : this._initialZoom);
    }
  }
  set zoom(val) {
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
  constructor() {
    // Always call super first in constructor
    super();
  }
  async connectedCallback() {
    // initialization is done in connectedCallback, attribute initialization
    // calls (which happen first) are effectively ignored, so we should be able
    // to rely on them being all correctly set by this time e.g. zoom, row, col
    // all now have a value that together identify this tiled bit of space
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    // set the initial zoom of the map when features connected
    // used for fallback zoom getter for static features
    // ~copied from map-feature.js
    this._initialZoom = this.getMapEl().zoom;
    // Get parent element to determine how to handle the tile
    // Need to handle shadow DOM correctly like map-feature does
    this._parentElement =
      this.parentNode.nodeName.toUpperCase() === 'MAP-LAYER' ||
      this.parentNode.nodeName.toUpperCase() === 'LAYER-' ||
      this.parentNode.nodeName.toUpperCase() === 'MAP-LINK'
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
        case 'src':
        case 'row':
        case 'col':
        case 'zoom':
          if (oldValue !== newValue) {
            // If we've already calculated an extent, recalculate it
            if (this._extent) {
              this._calculateExtent();
            }

            // If this tile is connected to a tile layer, update it
            if (this._tileLayer) {
              // Remove and re-add to update the tile's position
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
    let sdMeta = this._parentElement.shadowRoot.querySelector(
      `map-meta[name=${name}][content]`
    );
    if (this._parentElement.nodeName === 'MAP-LINK') {
      // sd.map-meta || map-extent meta || layer meta
      return sdMeta || this._parentElement.parentElement.getMeta(metaName);
    } else {
      return this._parentElement.src
        ? this._parentElement.shadowRoot.querySelector(
            `map-meta[name=${name}][content]`
          )
        : this._parentElement.querySelector(`map-meta[name=${name}][content]`);
    }
  }
  async _createOrGetTileLayer() {
    await this._parentElement.whenReady();
    if (this.isFirst()) {
      const parentElement = this._parentElement;

      // Create a new MapTileLayer
      this._tileLayer = mapTileLayer({
        projection: this.getMapEl().projection,
        opacity: 1,
        // used by map-link and map-layer, both have containers
        pane:
          parentElement._templatedLayer?.getContainer() ||
          parentElement._layer.getContainer()
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
