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
  // Inline the icon as data URL to avoid asset path resolution issues
  const w3icon =
    'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wD///8A6/X+N/3+/zL///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A+fz/APn8/wD7/f8A5vP9EZDI+JPL5vyA////B////wD///8A////AP///wD///8A////AP///wD///8A////ADif8wA4n/MAO6DzACSW8msAdO7/MZzz8////yD///8L////Dv///wD///8A////AP///wD///8A////AP///wAOi/EADovxAA6L8QAUjvE3HZDx1Vqw9bF7vvelX7L2wsPg+zbAvPIg9PT9QP///wD///8A////Bv///wD///8A8/n+APP5/gDz+f4A4PD9B2y49p1AoPPXDojw9bjf/EjN3PkAIBvTSDs52PTY1/dwj43pfnp45cHy8fxH////ANvu/QDc7v0A4PD9BFmv9aMAfO//AHnu/5LL+Zb///8A////AKek7T4AAMr/SUXb4gcCzv4AAMj/paPtkf///wBOrf8AT67/AC+c/A1EpPRaJJbySQB97+vA4ft/////AO3s+xgzMdfSAADL/zs32OxNSdzeJyXUv9PT9iz///8A7tuqAO7cqwDi4tAi8fr/AJrQ/QAZjvVCmtD6VtLO9Sg7ONnRAADL/wQAzv8AAMz/V1Te3e7t/Br///8A////ANu9agDSrUQAzJwclfrw14P//vA74eroPsHU9hiBduc6MS7XWyci1UIhHdQ+AADLoC0p1vn///8k////AP///wD///8A////AM+oOozBjwr/xpYb++GvRNil59E+wPjnY/nv/wC6tvIAl5LrAIF26QBhXeFy/Pz+EP///wD///8A7uC6L+DGf5jfxXy9yZ0k5r+JAP/537Vbb+DQDg3Bmuue69e4///+Q////yC3+d9z3vnxN////wD///8A////AMKQBIe8hgD/yJsd+NOvSbfOpTL4////IoThzwAAv5baAL2T/yjKqPopyaftP9Cxx/T9+hT37uMA2reLAPLm1gLDkQccwI0AZty+bE/ew3YZwY0IuPjnx23L9fI1B8Ga+QK/l/8oyqjXRNCz0uf59UH///8A5s6yAKROAADfwZsBw5IIAMGOAADjy4oA4smGAMaGAAalrVQjGcyxeAjBmbQ1za2NQdCyxiHFofR63snM////Ff///wDAhD0A27mQAMOSCADBjgAA4smGAOHIhADKhwAAjqhNAAfIqQAZxqMAEMSeAAC/l70AvZL2UNS4pf///wn///8A5MqqANy7kwDDkggAwY4AAOLJhgDhyIQAyYcAAJGpTwALyasAGcajAAfCmwACwZllAL6WoHzeyk7///8B////AOjStwDdvJUA8/8AAOH/AADgfwAA4BsAAOCBAADBgQAAwQEAANgDAADAAwAAwPMAAAAHAAACBgAAAA4AAP';
  const options = Object.assign(opts, {
    prefix: `<img src="${w3icon}" style="position: relative; top: 5px" alt="W3C Community and Business Groups logo"> <a href="https://www.w3.org/community/maps4html/">Maps for HTML Community Group</a> | <img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTIiIGhlaWdodD0iOCI+PHBhdGggZmlsbD0iIzRDN0JFMSIgZD0iTTAgMGgxMnY0SDB6Ii8+PHBhdGggZmlsbD0iI0ZGRDUwMCIgZD0iTTAgNGgxMnYzSDB6Ii8+PHBhdGggZmlsbD0iI0UwQkMwMCIgZD0iTTAgN2gxMnYxSDB6Ii8+PC9zdmc+" style="padding-right: 0.3em;" alt="Slava Ukraini"> <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> `
  });
  return new AttributionButton(options);
};
