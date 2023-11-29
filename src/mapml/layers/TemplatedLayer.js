export var TemplatedLayer = L.LayerGroup.extend({
  initialize: function (options) {
    // TODO: should invoke prototype.initialize to trigger the leaflet initialization for proper setup
    //       otherwise the initialize we provide will override the init that leaflet provides
    //       but we still need to create the container and the pane by ourselves
    L.LayerGroup.prototype.initialize.call(this, null, options);
    this._container = L.DomUtil.create('div', 'leaflet-layer');
    this._extentEl = this.options.extentEl;
    this.changeOpacity(this.options.opacity);
    // TODO: need renaming ex. mapml-extentLayer-container
    L.DomUtil.addClass(this._container, 'mapml-templatedlayer-container');
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
    L.LayerGroup.prototype.onAdd.call(this, map);
    // add to this.options.pane
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
    L.LayerGroup.prototype.onRemove.call(this, this._map);
    L.DomUtil.remove(this._container);
  },

  _previousFeature: function (e) {
    if (this._count + -1 >= 0) {
      this._count--;
      this._map.fire('featurepagination', { i: this._count, popup: this });
    }
  },

  _nextFeature: function (e) {
    if (this._count + 1 < this._source._totalFeatureCount) {
      this._count++;
      this._map.fire('featurepagination', { i: this._count, popup: this });
    }
  },

  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._extentEl._opacity = opacity;
    if (this._extentEl._opacitySlider)
      this._extentEl._opacitySlider.value = opacity;
  }
});
export var templatedLayer = function (options) {
  return new TemplatedLayer(options);
};
