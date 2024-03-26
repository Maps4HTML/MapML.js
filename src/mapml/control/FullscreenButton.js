export var FullscreenButton = L.Control.extend({
  options: {
    position: 'topleft',
    title: {
      false: 'View Fullscreen',
      true: 'Exit Fullscreen'
    }
  },

  onAdd: function (map) {
    var container = L.DomUtil.create(
      'div',
      'leaflet-control-fullscreen leaflet-bar leaflet-control'
    );

    this.link = L.DomUtil.create(
      'a',
      'leaflet-control-fullscreen-button leaflet-bar-part',
      container
    );
    this.link.href = '#';
    this.link.setAttribute('role', 'button');

    this._map = map;
    this._map.on('fullscreenchange', this._toggleTitle, this);
    this._toggleTitle();

    L.DomEvent.on(this.link, 'click', this._click, this);

    return container;
  },

  onRemove: function (map) {
    map.off('fullscreenchange', this._toggleTitle, this);
  },

  _click: function (e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this._map.toggleFullscreen(this.options);
  },

  _toggleTitle: function () {
    this.link.title = this.options.title[this._map.isFullscreen()];
  }
});

L.Map.include({
  isFullscreen: function () {
    return this._isFullscreen || false;
  },
  getClosest: function (node, selector) {
    if (!node) {
      return null;
    }
    if (node instanceof ShadowRoot) {
      return this.getClosest(node.host, selector);
    }

    if (node instanceof HTMLElement) {
      if (node.matches(selector)) {
        return node;
      } else {
        return this.getClosest(node.parentNode, selector);
      }
    }

    return this.getClosest(node.parentNode, selector);
  },
  getMapEl: function () {
    return this.getClosest(this._container, 'mapml-viewer,map[is=web-map]');
  },

  toggleFullscreen: function () {
    // the <map> element can't contain a shadow root, so we used a child <div>
    // <mapml-viewer> can contain a shadow root, so return it directly
    var mapEl = this.getMapEl();
    if (this.isFullscreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } else {
      if (mapEl.requestFullscreen) {
        mapEl.requestFullscreen();
      }
    }
    this.getContainer().focus();
  },

  _setFullscreen: function (fullscreen) {
    this._isFullscreen = fullscreen;
    var container = this._container;
    if (fullscreen) {
      L.DomUtil.addClass(container, 'mapml-fullscreen-on');
    } else {
      L.DomUtil.removeClass(container, 'mapml-fullscreen-on');
    }
    this.invalidateSize();
  },

  _onFullscreenChange: function (e) {
    var fullscreenElement = document.fullscreenElement,
      mapEl = this.getMapEl();

    if (fullscreenElement === mapEl && !this._isFullscreen) {
      this._setFullscreen(true);
      this.fire('fullscreenchange');
    } else if (fullscreenElement !== mapEl && this._isFullscreen) {
      this._setFullscreen(false);
      this.fire('fullscreenchange');
    }
  }
});

L.Map.mergeOptions({
  fullscreenControl: false
});

L.Map.addInitHook(function () {
  if (this.options.fullscreenControl) {
    this.fullscreenControl = new FullscreenButton(
      this.options.fullscreenControl
    );
    this.addControl(this.fullscreenControl);
  }

  var onFullscreenChange = L.bind(this._onFullscreenChange, this);

  this.whenReady(function () {
    L.DomEvent.on(document, 'fullscreenchange', onFullscreenChange);
  });

  this.on('unload', function () {
    L.DomEvent.off(document, 'fullscreenchange', onFullscreenChange);
  });
});

export var fullscreenButton = function (options) {
  return new FullscreenButton(options);
};
