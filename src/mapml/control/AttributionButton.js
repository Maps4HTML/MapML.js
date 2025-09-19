import { Control, DomUtil, DomEvent, Map } from 'leaflet';

export var AttributionButton = Control.Attribution.extend({
  _getLocale: function () {
    return this.options.mapEl && this.options.mapEl.locale
      ? this.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    map.attributionControl = this;
    this._container = DomUtil.create('details', 'leaflet-control-attribution');
    DomEvent.disableClickPropagation(this._container);

    for (var i in map._layers) {
      if (map._layers[i].getAttribution) {
        this.addAttribution(map._layers[i].getAttribution());
      }
    }

    this._update();

    map.on('layeradd', this._addAttribution, this);

    let dialog = document.createElement('dialog');
    dialog.setAttribute('class', 'shortcuts-dialog');
    dialog.setAttribute('autofocus', '');
    dialog.onclick = function (e) {
      e.stopPropagation();
    };
    let locale = this._getLocale();
    dialog.innerHTML =
      `<b>${locale.kbdShortcuts} </b><button aria-label="Close" onclick='this.parentElement.close()'>X</button>` +
      `<ul><b>${locale.kbdMovement}</b><li><kbd>&#8593</kbd> ${locale.kbdPanUp}</li><li><kbd>&#8595</kbd> ${locale.kbdPanDown}</li><li><kbd>&#8592</kbd> ${locale.kbdPanLeft}</li><li><kbd>&#8594</kbd> ${locale.kbdPanRight}</li><li><kbd>+</kbd> ${locale.btnZoomIn}</li><li><kbd>-</kbd> ${locale.btnZoomOut}</li><li><kbd>shift</kbd> + <kbd>&#8592/&#8593/&#8594/&#8595</kbd> 3x ${locale.kbdPanIncrement}</li><li><kbd>ctrl</kbd> + <kbd>&#8592/&#8593/&#8594/&#8595</kbd> 0.2x ${locale.kbdPanIncrement}</li><li><kbd>shift</kbd> + <kbd>+/-</kbd> ${locale.kbdZoom}</li></ul>` +
      `<ul><b>${locale.kbdFeature}</b><li><kbd>&#8592/&#8593</kbd> ${locale.kbdPrevFeature}</li><li><kbd>&#8594/&#8595</kbd> ${locale.kbdNextFeature}</li></ul>`;
    map._container.appendChild(dialog);

    return this._container;
  },

  _update: function () {
    if (!this._map) {
      return;
    }

    var attribs = [];

    for (var i in this._attributions) {
      if (this._attributions[i]) {
        attribs.push(i);
      }
    }

    var prefixAndAttribs = [];

    if (this.options.prefix) {
      prefixAndAttribs.push(this.options.prefix);
    }
    if (attribs.length) {
      prefixAndAttribs.push(attribs.join(', '));
    }
    let locale = this._getLocale();
    this._container.innerHTML =
      `<summary><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg></summary>` +
      '<div class="mapml-attribution-container">' +
      `<button onclick="this.closest(\'.leaflet-container\').querySelector(\'.shortcuts-dialog\').showModal()" class="shortcuts-button mapml-button">${locale.kbdShortcuts}</button> | ` +
      prefixAndAttribs.join(' <span aria-hidden="true">|</span> ') +
      '</div>';
    this._container.setAttribute('role', 'group');
    this._container.setAttribute('aria-label', `${locale.btnAttribution}`);
  }
});

Map.mergeOptions({
  attributionControl: false,
  toggleableAttributionControl: true
});

Map.addInitHook(function () {
  if (this.options.toggleableAttributionControl) {
    attributionButton({ mapEl: this.options.mapEl }).addTo(this);
  }
});

export var attributionButton = function (opts) {
  /* jshint ignore:start */
  const w3icon = new URL('images/w3community.ico', import.meta.url).href;
  /* jshint ignore:end */
  const options = Object.assign(opts, {
    prefix: `<img src="${w3icon}" style="position: relative; top: 5px" alt="W3C Community and Business Groups logo"> <a href="https://www.w3.org/community/maps4html/">Maps for HTML Community Group</a> | <img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTIiIGhlaWdodD0iOCI+PHBhdGggZmlsbD0iIzRDN0JFMSIgZD0iTTAgMGgxMnY0SDB6Ii8+PHBhdGggZmlsbD0iI0ZGRDUwMCIgZD0iTTAgNGgxMnYzSDB6Ii8+PHBhdGggZmlsbD0iI0UwQkMwMCIgZD0iTTAgN2gxMnYxSDB6Ii8+PC9zdmc+" style="padding-right: 0.3em;" alt="Slava Ukraini"> <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> `
  });
  return new AttributionButton(options);
};
