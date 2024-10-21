import { Layer, DomUtil, DomEvent } from 'leaflet';

export var Crosshair = Layer.extend({
  onAdd: function (map) {
    // SVG crosshair design from https://github.com/xguaita/Leaflet.MapCenterCoord/blob/master/src/icons/MapCenterCoordIcon1.svg?short_path=81a5c76
    // Optimized with SVGOMG: https://jakearchibald.github.io/svgomg/
    let svgInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 100 100"><g stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><circle cx="50.028" cy="50.219" r="3.923" stroke-width="2" color="currentColor" overflow="visible"/><path stroke-width="3" d="M4.973 54.424h31.768a4.204 4.204 0 1 0 0-8.409H4.973A4.203 4.203 0 0 0 .77 50.22a4.203 4.203 0 0 0 4.204 4.205z" color="currentColor" overflow="visible"/><path stroke-width="3" d="M54.232 5.165a4.204 4.204 0 1 0-8.408 0v31.767a4.204 4.204 0 1 0 8.408 0V5.165z"/><path stroke-width="3" d="M99.288 50.22a4.204 4.204 0 0 0-4.204-4.205H63.317a4.204 4.204 0 1 0 0 8.409h31.767a4.205 4.205 0 0 0 4.204-4.205zM45.823 95.274a4.204 4.204 0 1 0 8.409 0V63.506a4.204 4.204 0 1 0-8.409 0v31.768z" color="currentColor" overflow="visible"/></g></svg>`;

    this._container = DomUtil.create('div', 'mapml-crosshair', map._container);
    this._container.innerHTML = svgInnerHTML;
    map.isFocused = false;
    this._isQueryable = false;

    map.on(
      'layerchange layeradd layerremove overlayremove',
      this._toggleEvents,
      this
    );
    map.on('popupopen', this._isMapFocused, this);
    DomEvent.on(
      map._container,
      'keydown keyup mousedown',
      this._isMapFocused,
      this
    );

    this._addOrRemoveCrosshair();
  },

  onRemove: function (map) {
    map.off(
      'layerchange layeradd layerremove overlayremove',
      this._toggleEvents
    );
    map.off('popupopen', this._isMapFocused);
    DomEvent.off(map._container, 'keydown keyup mousedown', this._isMapFocused);
  },

  _toggleEvents: function () {
    if (this._hasQueryableLayer()) {
      this._map.on('viewreset move moveend', this._addOrRemoveCrosshair, this);
    } else {
      this._map.off('viewreset move moveend', this._addOrRemoveCrosshair, this);
    }
    this._addOrRemoveCrosshair();
  },

  _addOrRemoveCrosshair: function (e) {
    if (this._hasQueryableLayer()) {
      this._container.removeAttribute('hidden');
    } else {
      this._container.setAttribute('hidden', '');
    }
  },

  _addOrRemoveMapOutline: function (e) {
    let mapContainer = this._map._container;
    if (this._map.isFocused && !this._outline) {
      this._outline = DomUtil.create('div', 'mapml-outline', mapContainer);
    } else if (!this._map.isFocused && this._outline) {
      DomUtil.remove(this._outline);
      delete this._outline;
    }
  },

  _hasQueryableLayer: function () {
    let layers = this._map.options.mapEl.layers;
    if (this._map.isFocused) {
      for (let layer of layers) {
        if (layer.queryable()) {
          return true;
        }
      }
    }
    return false;
  },

  // TODO: should be merged with the 'mapfocused' event emitted by mapml-viewer and map, not trivial
  _isMapFocused: function (e) {
    //set this._map.isFocused = true if arrow buttons are used
    if (!this._map._container.parentNode.activeElement) {
      this._map.isFocused = false;
      return;
    }
    let isLeafletContainer =
      this._map._container.parentNode.activeElement.classList.contains(
        'leaflet-container'
      );
    if (
      isLeafletContainer &&
      ['keydown'].includes(e.type) &&
      e.shiftKey &&
      e.keyCode === 9
    ) {
      this._map.isFocused = false;
    } else
      this._map.isFocused =
        isLeafletContainer && ['keyup', 'keydown'].includes(e.type);

    if (this._map.isFocused) this._map.fire('mapkeyboardfocused');
    this._addOrRemoveMapOutline();
    this._addOrRemoveCrosshair();
  }
});

export var crosshair = function (options) {
  return new Crosshair(options);
};
