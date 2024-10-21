import { LayerGroup, DomUtil } from 'leaflet';

export var ExtentLayer = LayerGroup.extend({
  initialize: function (options) {
    // Call LayerGroup's initialize to trigger Leaflet's setup
    LayerGroup.prototype.initialize.call(this, null, options);
    this._container = DomUtil.create('div', 'leaflet-layer');
    this._extentEl = this.options.extentEl;
    this.changeOpacity(this.options.opacity);
    // Add class to the container
    DomUtil.addClass(this._container, 'mapml-extentlayer-container');
  },
  getEvents: function () {
    return {
      zoomstart: this._onZoomStart
    };
  },
  _onZoomStart: function () {
    this.closePopup();
  },
  getContainer: function () {
    return this._container;
  },
  onAdd: function (map) {
    LayerGroup.prototype.onAdd.call(this, map);
    let pane = this.options.extentEl.parentLayer._layer._container;
    pane.appendChild(this._container);
  },
  redraw: function () {
    this.eachLayer(function (layer) {
      layer.redraw();
    });
  },
  //addTo: function(map) {
  //for(let i = 0; i < this._templates.length; i++){
  //    this._templates[0].layer.addTo(map);
  //}
  //},
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
  },
  _updateZIndex: function () {
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },
  onRemove: function () {
    LayerGroup.prototype.onRemove.call(this, this._map);
    DomUtil.remove(this._container);
  },

  _previousFeature: function (e) {
    if (this._count + -1 >= 0) {
      this._count--;
      this._map.fire('featurepagination', {
        i: this._count,
        popup: this
      });
    }
  },

  _nextFeature: function (e) {
    if (this._count + 1 < this._source._totalFeatureCount) {
      this._count++;
      this._map.fire('featurepagination', {
        i: this._count,
        popup: this
      });
    }
  },

  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._extentEl._opacity = opacity;
    if (this._extentEl._opacitySlider)
      this._extentEl._opacitySlider.value = opacity;
  },
  appendStyleLink: function (mapLink) {
    if (!mapLink.link) return;
    let positionAndNode = this._getStylePositionAndNode();
    positionAndNode.node.insertAdjacentElement(
      positionAndNode.position,
      mapLink.link
    );
  },
  _getStylePositionAndNode: function () {
    return this._container.lastChild &&
      (this._container.lastChild.nodeName.toUpperCase() === 'SVG' ||
        this._container.lastChild.classList.contains('mapml-vector-container'))
      ? { position: 'beforebegin', node: this._container.lastChild }
      : this._container.lastChild
      ? { position: 'afterend', node: this._container.lastChild }
      : { position: 'afterbegin', node: this._container };
  },
  appendStyleElement: function (mapStyle) {
    if (!mapStyle.styleElement) return;
    let positionAndNode = this._getStylePositionAndNode();
    positionAndNode.node.insertAdjacentElement(
      positionAndNode.position,
      mapStyle.styleElement
    );
  }
});
export var extentLayer = function (options) {
  return new ExtentLayer(options);
};
