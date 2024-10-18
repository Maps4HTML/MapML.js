import { Util } from '../utils/Util';
export var AnnounceMovement = L.Handler.extend({
  addHooks: function () {
    this._map.on({
      layeradd: this.totalBounds,
      layerremove: this.totalBounds
    });

    this._map.options.mapEl.addEventListener(
      'map-moveend',
      this.announceBounds
    );
    this._map.dragging._draggable.addEventListener('dragstart', this.dragged);
    this._map.options.mapEl.addEventListener(
      'mapfocused',
      this.focusAnnouncement
    );
  },
  removeHooks: function () {
    this._map.off({
      layeradd: this.totalBounds,
      layerremove: this.totalBounds
    });

    this._map.options.mapEl.removeEventListener(
      'map-moveend',
      this.announceBounds
    );
    this._map.dragging._draggable.removeEventListener(
      'dragstart',
      this.dragged
    );
    this._map.options.mapEl.removeEventListener(
      'mapfocused',
      this.focusAnnouncement
    );
  },

  focusAnnouncement: function () {
    let mapEl = this;
    setTimeout(function () {
      let el = mapEl.querySelector('.mapml-web-map')
        ? mapEl
            .querySelector('.mapml-web-map')
            .shadowRoot.querySelector('.leaflet-container')
        : mapEl.shadowRoot.querySelector('.leaflet-container');

      let mapZoom = mapEl._map.getZoom();
      let standard = M.options.locale.amZoom + ' ' + mapZoom;

      if (mapZoom === mapEl._map.getMaxZoom()) {
        standard = M.options.locale.amMaxZoom + ' ' + standard;
      } else if (mapZoom === mapEl._map._layersMinZoom) {
        standard = M.options.locale.amMinZoom + ' ' + standard;
      }

      el.setAttribute('aria-roledescription', 'region ' + standard);
      setTimeout(function () {
        el.removeAttribute('aria-roledescription');
      }, 2000);
    }, 0);
  },

  announceBounds: function () {
    if (this._traversalCall > 0) {
      return;
    }
    let mapZoom = this._map.getZoom();
    let mapBounds = Util.pixelToPCRSBounds(
      this._map.getPixelBounds(),
      mapZoom,
      this._map.options.projection
    );

    let visible = true;
    if (this._map.totalLayerBounds) {
      visible =
        mapZoom <= this._map.getMaxZoom() &&
        mapZoom >= this._map.getMinZoom() &&
        this._map.totalLayerBounds.overlaps(mapBounds);
    }

    let output = this.querySelector('.mapml-web-map')
      ? this.querySelector('.mapml-web-map').shadowRoot.querySelector(
          '.mapml-screen-reader-output'
        )
      : this.shadowRoot.querySelector('.mapml-screen-reader-output');

    let standard = M.options.locale.amZoom + ' ' + mapZoom;

    if (!visible) {
      let outOfBoundsPos = this._history[this._historyIndex];
      let inBoundsPos = this._history[this._historyIndex - 1];
      this.back();
      this._history.pop();

      if (outOfBoundsPos.zoom !== inBoundsPos.zoom) {
        output.innerText = M.options.locale.amZoomedOut;
      } else if (this._map.dragging._draggable.wasDragged) {
        output.innerText = M.options.locale.amDraggedOut;
      } else if (outOfBoundsPos.x > inBoundsPos.x) {
        output.innerText = M.options.locale.amEastBound;
      } else if (outOfBoundsPos.x < inBoundsPos.x) {
        output.innerText = M.options.locale.amWestBound;
      } else if (outOfBoundsPos.y < inBoundsPos.y) {
        output.innerText = M.options.locale.amNorthBound;
      } else if (outOfBoundsPos.y > inBoundsPos.y) {
        output.innerText = M.options.locale.amSouthBound;
      }
    } else {
      let prevZoom = this._history[this._historyIndex - 1]
        ? this._history[this._historyIndex - 1].zoom
        : this._history[this._historyIndex].zoom;
      if (mapZoom === this._map.getMaxZoom() && mapZoom !== prevZoom) {
        output.innerText = M.options.locale.amMaxZoom + ' ' + standard;
      } else if (mapZoom === this._map._layersMinZoom && mapZoom !== prevZoom) {
        output.innerText = M.options.locale.amMinZoom + ' ' + standard;
      } else {
        output.innerText = standard;
      }
    }
    this._map.dragging._draggable.wasDragged = false;
  },

  totalBounds: function (e) {
    // don't bother with non-MapMLLayer layers...
    if (!e.layer._layerEl) return;
    let map = this.options.mapEl;
    map.whenLayersReady().then(() => {
      let layers = map.querySelectorAll('map-layer,layer-');
      let bounds;
      for (let i = 0; i < layers.length; i++) {
        // the _layer may no longer exist if this is invoked by layerremove
        if (layers[i]._layer) {
          let extent = layers[i].extent;
          if (bounds && extent) {
            bounds.extend(Util.extentToBounds(extent, 'pcrs'));
          } else if (extent) {
            bounds = Util.extentToBounds(extent, 'pcrs');
          }
        }
      }

      this.totalLayerBounds = bounds;
    });
  },

  dragged: function () {
    this.wasDragged = true;
  }
});
