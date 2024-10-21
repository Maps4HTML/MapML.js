import { Control, DomUtil, DomEvent, Map, Util as LeafletUtil } from 'leaflet';
import { Util } from '../utils/Util.js';

export var FullscreenButton = Control.extend({
  options: {
    position: 'topleft',
    title: {
      false: M.options.locale.btnFullScreen,
      true: M.options.locale.btnExitFullScreen
    }
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    let locale = this._getLocale(map);
    this.options.title = {
      false: locale.btnFullScreen,
      true: locale.btnExitFullScreen
    };
    var container = DomUtil.create(
      'div',
      'leaflet-control-fullscreen leaflet-bar leaflet-control'
    );

    this.link = DomUtil.create(
      'a',
      'leaflet-control-fullscreen-button leaflet-bar-part',
      container
    );
    this.link.href = '#';
    this.link.setAttribute('role', 'button');

    this._map = map;
    this._map.on('fullscreenchange', this._toggleTitle, this);
    this._toggleTitle();

    DomEvent.on(this.link, 'click', this._click, this);

    return container;
  },

  onRemove: function (map) {
    map.off('fullscreenchange', this._toggleTitle, this);
  },

  _click: function (e) {
    DomEvent.stopPropagation(e);
    DomEvent.preventDefault(e);
    this._map.toggleFullscreen(this.options);
  },

  _toggleTitle: function () {
    this.link.title = this.options.title[this._map.isFullscreen()];
  }
});

Map.include({
  isFullscreen: function () {
    return this._isFullscreen || false;
  },

  toggleFullscreen: function (options) {
    // the <map> element can't contain a shadow root, so we used a child <div>
    // <mapml-viewer> can contain a shadow root, so return it directly
    var mapEl = Util.getClosest(
      this.getContainer(),
      'mapml-viewer,[is=web-map]'
    );
    if (this.isFullscreen()) {
      if (options && options.pseudoFullscreen) {
        this._disablePseudoFullscreen(mapEl);
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else {
        this._disablePseudoFullscreen(mapEl);
      }
    } else {
      if (options && options.pseudoFullscreen) {
        this._enablePseudoFullscreen(mapEl);
      } else if (mapEl.requestFullscreen) {
        mapEl.requestFullscreen();
      } else if (mapEl.mozRequestFullScreen) {
        mapEl.mozRequestFullScreen();
      } else if (mapEl.webkitRequestFullscreen) {
        mapEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (mapEl.msRequestFullscreen) {
        mapEl.msRequestFullscreen();
      } else {
        this._enablePseudoFullscreen(mapEl);
      }
    }
    this.getContainer().focus();
  },

  _enablePseudoFullscreen: function (container) {
    DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
    this._setFullscreen(true);
    this.fire('fullscreenchange');
  },

  _disablePseudoFullscreen: function (container) {
    DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
    this._setFullscreen(false);
    this.fire('fullscreenchange');
  },

  _setFullscreen: function (fullscreen) {
    this._isFullscreen = fullscreen;
    var container = Util.getClosest(
      this.getContainer(),
      'mapml-viewer,[is=web-map]'
    );
    if (fullscreen) {
      DomUtil.addClass(container, 'mapml-fullscreen-on');
    } else {
      DomUtil.removeClass(container, 'mapml-fullscreen-on');
    }
    this.invalidateSize();
  },

  _onFullscreenChange: function (e) {
    var fullscreenElement = Util.getClosest(this.getContainer(), ':fullscreen'),
      mapEl = Util.getClosest(this.getContainer(), 'mapml-viewer,[is=web-map]');
    if (fullscreenElement === mapEl && !this._isFullscreen) {
      this._setFullscreen(true);
      this.fire('fullscreenchange');
    } else if (fullscreenElement !== mapEl && this._isFullscreen) {
      this._setFullscreen(false);
      this.fire('fullscreenchange');
    }
  }
});

Map.mergeOptions({
  fullscreenControl: false
});

Map.addInitHook(function () {
  if (this.options.fullscreenControl) {
    this.fullscreenControl = new FullscreenButton(
      this.options.fullscreenControl
    );
    this.addControl(this.fullscreenControl);
  }

  var fullscreenchange;

  if ('onfullscreenchange' in document) {
    fullscreenchange = 'fullscreenchange';
  } else if ('onmozfullscreenchange' in document) {
    fullscreenchange = 'mozfullscreenchange';
  } else if ('onwebkitfullscreenchange' in document) {
    fullscreenchange = 'webkitfullscreenchange';
  } else if ('onmsfullscreenchange' in document) {
    fullscreenchange = 'MSFullscreenChange';
  }

  if (fullscreenchange) {
    var onFullscreenChange = LeafletUtil.bind(this._onFullscreenChange, this);

    this.whenReady(function () {
      DomEvent.on(document, fullscreenchange, onFullscreenChange);
    });

    this.on('unload', function () {
      DomEvent.off(document, fullscreenchange, onFullscreenChange);
    });
  }
});

export var fullscreenButton = function (options) {
  return new FullscreenButton(options);
};
