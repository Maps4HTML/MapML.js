import { Control, DomEvent, DomUtil, setOptions, stamp } from 'leaflet';

// Refactored LayerControl to remove global L dependency
export var LayerControl = Control.Layers.extend({
  options: {
    autoZIndex: false,
    sortLayers: true,
    sortFunction: function (layerA, layerB) {
      return layerA.options.zIndex < layerB.options.zIndex
        ? -1
        : layerA.options.zIndex > layerB.options.zIndex
        ? 1
        : 0;
    }
  },
  initialize: function (overlays, options) {
    setOptions(this, options);

    // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
    // the array index is the id of the layer returned by stamp(layer) which I guess is a unique hash
    this._layerControlInputs = [];
    this._layers = [];
    this._lastZIndex = 0;
    this._handlingClick = false;

    for (var i in overlays) {
      this._addLayer(overlays[i], i, true);
    }
  },
  onAdd: function () {
    this._initLayout();
    // Adding event on layer control button
    DomEvent.on(
      this._container.getElementsByTagName('a')[0],
      'keydown',
      this._focusFirstLayer,
      this._container
    );
    DomEvent.on(
      this._container,
      'contextmenu',
      this._preventDefaultContextMenu,
      this
    );
    this._update();
    if (this._layers.length < 1 && !this._map._showControls) {
      this._container.setAttribute('hidden', '');
    } else {
      this._map._showControls = true;
    }
    return this._container;
  },
  onRemove: function (map) {
    DomEvent.off(
      this._container.getElementsByTagName('a')[0],
      'keydown',
      this._focusFirstLayer,
      this._container
    );
  },
  addOrUpdateOverlay: function (layer, name) {
    var alreadyThere = false;
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i].layer === layer) {
        alreadyThere = true;
        this._layers[i].name = name;
        // replace the controls with updated controls if necessary.
        break;
      }
    }
    if (!alreadyThere) {
      this.addOverlay(layer, name);
    }
    if (this._layers.length > 0) {
      this._container.removeAttribute('hidden');
      this._map._showControls = true;
    }
    return this._map ? this._update() : this;
  },
  removeLayer: function (layer) {
    Control.Layers.prototype.removeLayer.call(this, layer);
    if (this._layers.length === 0) {
      this._container.setAttribute('hidden', '');
    }
  },

  _checkDisabledLayers: function () {},

  // focus the first layer in the layer control when enter is pressed
  _focusFirstLayer: function (e) {
    if (
      e.key === 'Enter' &&
      this.className ===
        'leaflet-control-layers leaflet-control leaflet-control-layers-expanded'
    ) {
      var elem =
        this.children[1].children[2].children[0].children[0].children[0]
          .children[0];
      if (elem) setTimeout(() => elem.focus(), 0);
    }
  },

  // imported from leaflet with slight modifications
  // for layerControl ordering based on zIndex
  _update: function () {
    if (!this._container) {
      return this;
    }

    DomUtil.empty(this._baseLayersList);
    DomUtil.empty(this._overlaysList);

    this._layerControlInputs = [];
    var baseLayersPresent,
      overlaysPresent,
      i,
      obj,
      baseLayersCount = 0;

    // <----------- MODIFICATION from the default _update method
    // sort the layercontrol layers object based on the zIndex
    // provided by MapLayer
    if (this.options.sortLayers) {
      this._layers.sort((a, b) =>
        this.options.sortFunction(a.layer, b.layer, a.name, b.name)
      );
    }

    for (i = 0; i < this._layers.length; i++) {
      obj = this._layers[i];
      this._addItem(obj);
      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
      baseLayersCount += !obj.overlay ? 1 : 0;
    }

    // Hide base layers section if there's only one layer.
    if (this.options.hideSingleBase) {
      baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
      this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
    }

    this._separator.style.display =
      overlaysPresent && baseLayersPresent ? '' : 'none';

    return this;
  },

  _addItem: function (obj) {
    var layercontrols = obj.layer._layerEl._layerControlHTML;
    // the input is required by Leaflet...
    obj.input = layercontrols.querySelector(
      'input.leaflet-control-layers-selector'
    );

    this._layerControlInputs.push(obj.input);
    obj.input.layerId = stamp(obj.layer);

    this._overlaysList.appendChild(layercontrols);
    return layercontrols;
  },

  //overrides collapse and conditionally collapses the panel
  collapse: function (e) {
    // if layer control is not expanded, return
    if (!this._container.className.includes('expanded')) {
      return;
    }
    // return if layer contextmenu is still open
    if (
      !this._map.contextMenu._extentLayerMenu.hidden ||
      !this._map.contextMenu._layerMenu.hidden
    ) {
      return;
    }
    if (
      e.target.tagName === 'SELECT' ||
      (e.relatedTarget &&
        e.relatedTarget.parentElement &&
        (e.relatedTarget.className === 'mapml-contextmenu mapml-layer-menu' ||
          e.relatedTarget.parentElement.className ===
            'mapml-contextmenu mapml-layer-menu')) ||
      (this._map && this._map.contextMenu._layerMenu.style.display === 'block')
    )
      return this;

    DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
    if (e.originalEvent?.pointerType === 'touch') {
      this._container._isExpanded = false;
    }
    return this;
  },
  _preventDefaultContextMenu: function (e) {
    let latlng = this._map.mouseEventToLatLng(e);
    let containerPoint = this._map.mouseEventToContainerPoint(e);
    e.preventDefault();
    // for touch devices, when the layer control is not expanded,
    // the layer context menu should not show on map
    if (!this._container._isExpanded && e.pointerType === 'touch') {
      this._container._isExpanded = true;
      return;
    }
    this._map.fire('contextmenu', {
      originalEvent: e,
      containerPoint: containerPoint,
      latlng: latlng
    });
  }
});
export var layerControl = function (layers, options) {
  return new LayerControl(layers, options);
};
