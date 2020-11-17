export var ReloadButton = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd: function (map) {
    let container = L.DomUtil.create("div", "mapml-reload-button leaflet-bar");

    let link = L.DomUtil.create("a", "mapml-reload-button", container);
    link.innerHTML = "&#x021BA";
    link.href = "#";
    link.title = "Reload";
    link.setAttribute('role', 'button');
    link.setAttribute('aria-label', "Reload");

    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, 'click', L.DomEvent.stop);
    L.DomEvent.on(link, 'click', this._goReload, this);

    this._reloadButton = link;

    this._updateDisabled();
    map.on('moveend', this._updateDisabled, this);

    return container;
  },

  onRemove: function (map) {
    map.off('moveend', this._updateDisabled, this);
  },

  disable: function () {
    this._disabled = true;
    this._updateDisabled();
    return this;
  },

  enable: function () {
    this._disabled = false;
    this._updateDisabled();
    return this;
  },

  _goReload: function (e) {
    if (!this._disabled && this._map.options.mapEl._history.length > 1) {
      this._map.options.mapEl.reload();
    }
  },

  _updateDisabled: function () {
    setTimeout(() => {
      L.DomUtil.removeClass(this._reloadButton, "leaflet-disabled");
      this._reloadButton.setAttribute("aria-disabled", "false");

      if (this._map && (this._disabled || this._map.options.mapEl._history.length <= 1)) {
        L.DomUtil.addClass(this._reloadButton, "leaflet-disabled");
        this._reloadButton.setAttribute("aria-disabled", "true");
      }
    }, 0);
  }
});

export var reloadButton = function (options) {
  return new ReloadButton(options);
};