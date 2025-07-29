import { LayerGroup, DomUtil } from 'leaflet';
import { renderStyles } from '../elementSupport/layers/renderStyles.js';
/**
 * Leaflet layer implementing map-extent elements
 * Extends LayerGroup to create a single layer containing "templated" layers
 * from child map-link[@tref] elements
 *
 * Similar in intent to MapFeatureLayer and MapTileLayer, which are LayerGroup or
 * GridLayer for map-feature and map-tile elements' leaflet layer object, respectively.
 *
 * This layer will be inserted into the LayerGroup hosted by the <map-layer>
 * immediately after creation, so that its index within the _layers array of
 * that LayerGroup will be equal to its z-index within the LayerGroup's container
 *
 * <map-tile row="10" col="12" src="url1"></map-tile>  LayerGroup._layers[0] <- each *set* of adjacent tiles
 * <map-tile row="11" col="12" src="url2"></map-tile>  LayerGroup._layers[0] <- is a *single* MapTileLayer
 * <map-extent units="OSMTILE" checked hidden> LayerGroup._layers[1] *each* <map-extent> is a LayerGroup of Templated*Layer.js
 * <map-feature id="a"> LayerGroup._layers[2] <- each *set* of adjacent features
 * <map-feature id="b"> LayerGroup._layers[2] <- is a single MapFeatureLayer FeatureGroup
 * <map-tile row="10" col="12" src="url3"></map-tile>  LayerGroup._layers[3]
 * <map-tile row="11" col="12" src="url4"></map-tile>  LayerGroup._layers[3]
 * <map-feature id="c"> LayerGroup._layers[4]
 * <map-feature id="d"> LayerGroup._layers[4]
 * and so on
 *
 * A constraint of <map-extent> is that it cannot be nested inside a templated
 * layer i.e. if a <map-link> retrieves a text/mapml document that contains a
 * <map-extent>, it will be ignored, otherwise there could be infinite nested
 * fetches triggered. That is why the "TemplatedFeaturesOrTilesLayer" exists - it
 * excludes <map-extent> elements.
 */
export var MapExtentLayer = LayerGroup.extend({
  initialize: function (options) {
    // Call LayerGroup's initialize to trigger Leaflet's setup
    LayerGroup.prototype.initialize.call(this, null, options);
    this._container = DomUtil.create('div', 'leaflet-layer');
    this._extentEl = this.options.extentEl;
    this.changeOpacity(this.options.opacity);
    this.setZIndex(options.zIndex);
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
  renderStyles
});
export var mapExtentLayer = function (options) {
  return new MapExtentLayer(options);
};
