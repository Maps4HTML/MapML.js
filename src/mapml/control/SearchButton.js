import { Control, DomUtil, DomEvent } from 'leaflet';

export var SearchButton = Control.extend({
  options: {
    position: 'topleft'
  },
  _getLocale: function (map) {
    return map.options.mapEl && map.options.mapEl.locale
      ? map.options.mapEl.locale
      : M.options.locale;
  },
  onAdd: function (map) {
    let locale = this._getLocale(map);
    let container = DomUtil.create('div', 'mapml-search-control leaflet-bar');

    let button = DomUtil.create(
      'button',
      'mapml-search-button mapml-button',
      container
    );
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', locale.btnSearch || 'Search');
    button.title = locale.btnSearch || 'Search';
    button.innerHTML =
      '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 15 15" fill="currentColor">' +
      '<path d="M6 0C9.31 0 12 2.69 12 6C12 7.3 11.59 8.5 10.89 9.48L14.71 13.29C15.1 13.68 15.1 14.32 14.71 14.71C14.32 15.1 13.68 15.1 13.29 14.71L9.48 10.89C8.5 11.59 7.3 12 6 12C2.69 12 0 9.31 0 6C0 2.69 2.69 0 6 0ZM6 2C3.79 2 2 3.79 2 6C2 8.21 3.79 10 6 10C8.21 10 10 8.21 10 6C10 3.79 8.21 2 6 2Z"/>' +
      '</svg>';

    DomEvent.disableClickPropagation(button);
    DomEvent.on(button, 'click', DomEvent.stop);
    DomEvent.on(button, 'click', this._openPanel, this);
    DomEvent.on(
      button,
      'keydown',
      function (e) {
        if (e.key === 'Enter') {
          DomEvent.stop(e);
          this._openPanel();
        }
      },
      this
    );

    this._button = button;

    let panel = DomUtil.create('div', 'mapml-search-panel');
    panel.setAttribute('hidden', '');
    map.getContainer().appendChild(panel);
    DomEvent.disableClickPropagation(panel);

    let input = DomUtil.create('input', 'mapml-search-input', panel);
    input.setAttribute('type', 'search');
    input.setAttribute('placeholder', locale.searchPlaceholder || 'Search...');
    input.setAttribute('aria-label', locale.btnSearch || 'Search');

    DomEvent.disableClickPropagation(input);
    DomEvent.on(
      input,
      'keydown',
      function (e) {
        if (e.key === 'Escape') {
          DomEvent.stop(e);
          this._closePanel();
        }
      },
      this
    );

    this._input = input;

    let results = DomUtil.create('div', 'mapml-search-results', panel);
    this._results = results;

    let closeBtn = DomUtil.create(
      'button',
      'mapml-search-close mapml-button',
      panel
    );
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', locale.btnClose || 'Close');
    closeBtn.title = locale.btnClose || 'Close';
    closeBtn.innerHTML =
      '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>' +
      '</svg>';

    DomEvent.disableClickPropagation(closeBtn);
    DomEvent.on(closeBtn, 'click', DomEvent.stop);
    DomEvent.on(closeBtn, 'click', this._closePanel, this);

    this._closeBtn = closeBtn;
    this._panel = panel;

    this._mapEl = map.options.mapEl;

    // Set up layer observation for disabled state
    this._onLoadedMetadata = () => this._updateDisabled();
    this._layerObserver = new MutationObserver((mutations) => {
      this._updateDisabled();
      // When new layers are added, listen for their loadedmetadata
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (
            node.nodeName &&
            (node.nodeName.toUpperCase() === 'MAP-LAYER' ||
              node.nodeName.toUpperCase() === 'LAYER-')
          ) {
            node.addEventListener('loadedmetadata', this._onLoadedMetadata);
          }
        }
      }
    });
    this._layerObserver.observe(this._mapEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['checked', 'rel']
    });
    // Attach loadedmetadata listener to existing layers
    this._mapEl
      .querySelectorAll('map-layer, layer-')
      .forEach((layer) =>
        layer.addEventListener('loadedmetadata', this._onLoadedMetadata)
      );

    this._updateDisabled();

    return container;
  },

  onRemove: function () {
    if (this._panel && this._panel.parentNode) {
      this._panel.parentNode.removeChild(this._panel);
    }
    if (this._layerObserver) {
      this._layerObserver.disconnect();
    }
    if (this._mapEl) {
      this._mapEl
        .querySelectorAll('map-layer, layer-')
        .forEach((layer) =>
          layer.removeEventListener('loadedmetadata', this._onLoadedMetadata)
        );
    }
    DomEvent.off(this._button, 'click', this._openPanel, this);
    DomEvent.off(this._closeBtn, 'click', this._closePanel, this);
  },

  _hasSearchLayers: function () {
    let layers = this._mapEl.querySelectorAll(
      'map-layer[checked], layer-[checked]'
    );
    for (let layer of layers) {
      let root = layer.src ? layer.shadowRoot : layer;
      if (root && root.querySelector('map-link[rel=search]')) {
        return true;
      }
    }
    return false;
  },

  _updateDisabled: function () {
    let hasSearch = this._hasSearchLayers();
    if (hasSearch) {
      this._button.setAttribute('aria-disabled', 'false');
    } else {
      this._button.setAttribute('aria-disabled', 'true');
      // If panel is open, close it
      if (!this._panel.hasAttribute('hidden')) {
        this._closePanel();
      }
    }
  },

  _openPanel: function () {
    if (this._button.getAttribute('aria-disabled') === 'true') return;
    this._panel.removeAttribute('hidden');
    this._input.value = '';
    this._results.innerHTML = '';
    setTimeout(() => {
      this._panel.classList.add('mapml-search-panel-open');
      this._input.focus();
    }, 0);
  },

  _closePanel: function () {
    this._panel.classList.remove('mapml-search-panel-open');
    let onEnd = () => {
      this._panel.setAttribute('hidden', '');
      this._button.focus();
      this._panel.removeEventListener('transitionend', onEnd);
    };
    this._panel.addEventListener('transitionend', onEnd);
    setTimeout(onEnd, 300);
  }
});

export var searchButton = function (options) {
  return new SearchButton(options);
};
