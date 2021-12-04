export var FeatureGroup = L.FeatureGroup.extend({

  /**
   * Initialize the feature group
   * @param {M.Feature[]} layers
   * @param {Object} options
   */
  initialize: function (layers, options) {
    if(options.wrappers && options.wrappers.length > 0)
      options = Object.assign(M.Feature.prototype._convertWrappers(options.wrappers), options);

    L.LayerGroup.prototype.initialize.call(this, layers, options);

    if((this.options.onEachFeature && this.options.properties) || this.options.link) {
      L.DomUtil.addClass(this.options.group, "leaflet-interactive");
      L.DomEvent.on(this.options.group, "keyup keydown mousedown", this._handleFocus, this);
      let firstLayer = layers[Object.keys(layers)[0]];
      if(layers.length === 1 && firstLayer.options.link) this.options.link = firstLayer.options.link;
      if(this.options.link){
        M.Feature.prototype.attachLinkHandler.call(this, this.options.group, this.options.link, this.options._leafletLayer);
        this.options.group.setAttribute('role', 'link');
      } else {
        this.options.group.setAttribute("aria-expanded", "false");
        this.options.group.setAttribute('role', 'button');
        this.options.onEachFeature(this.options.properties, this);
        this.off("click", this._openPopup);
      }
    }

    this.options.group.setAttribute('aria-label', this.options.accessibleTitle);
    if(this.options.featureID) this.options.group.setAttribute("data-fid", this.options.featureID);
  },

  _updateInteraction: function () {
    if((this.options.onEachFeature && this.options.properties) || this.options.link)
      this.options._leafletLayer._map.options.mapEl._addToIndex(this, this.getPCRSCenter(), this.options.group);
  },

  /**
   * Handler for focus events
   * @param {L.DOMEvent} e - Event that occurred
   * @private
   */
  _handleFocus: function(e) {
    if(e.target.tagName.toUpperCase() !== "G") return;
    if((e.keyCode === 9 || e.keyCode === 16) && e.type === "keydown"){
      let index = this.options._leafletLayer._map.options.mapEl._currFeatureIndex;
      if(e.keyCode === 9 && e.shiftKey) {
        if(index === this.options._leafletLayer._map.options.mapEl._featureIndexOrder.length - 1)
          this.options._leafletLayer._map.options.mapEl._featureIndexOrder[index].path.setAttribute("tabindex", -1);
        if(index !== 0){
          L.DomEvent.stop(e);
          this.options._leafletLayer._map.options.mapEl._featureIndexOrder[index - 1].path.focus();
          this.options._leafletLayer._map.options.mapEl._currFeatureIndex--;
        }
      } else if (e.keyCode === 9) {
        if(index !== this.options._leafletLayer._map.options.mapEl._featureIndexOrder.length - 1) {
          L.DomEvent.stop(e);
          this.options._leafletLayer._map.options.mapEl._featureIndexOrder[index + 1].path.focus();
          this.options._leafletLayer._map.options.mapEl._currFeatureIndex++;
        } else {
          this.options._leafletLayer._map.options.mapEl._featureIndexOrder[0].path.setAttribute("tabindex", -1);
          this.options._leafletLayer._map.options.mapEl._featureIndexOrder[index].path.setAttribute("tabindex", 0);
        }
      }
    } else if (!(e.keyCode === 9 || e.keyCode === 16 || e.keyCode === 13)){
      this.options._leafletLayer._map.options.mapEl._currFeatureIndex = 0;
      this.options._leafletLayer._map.options.mapEl._featureIndexOrder[0].path.focus();
    }
    if((e.keyCode === 9 || e.keyCode === 16 || e.keyCode === 13) && e.type === "keyup") {
      this.openTooltip();
    } else if (e.keyCode === 13 || e.keyCode === 32){
      this.closeTooltip();
      if(!this.options.link && this.options.onEachFeature){
        L.DomEvent.stop(e);
        this.openPopup();
      }
    } else {
      this.closeTooltip();
    }
  },

  /**
   * Add a M.Feature to the M.FeatureGroup
   * @param layer
   */
  addLayer: function (layer) {
    if(!layer.options.link && layer.options.interactive) {
      this.options.onEachFeature(this.options.properties, layer);
    }
    L.FeatureGroup.prototype.addLayer.call(this, layer);
  },

  /**
   * Focuses the previous function in the sequence on previous button press
   * @param e
   * @private
   */
  _previousFeature: function(e){
    L.DomEvent.stop(e);
    this._map.options.mapEl._currFeatureIndex = Math.max(this._map.options.mapEl._currFeatureIndex - 1, 0);
    let prevFocus = this._map.options.mapEl._featureIndexOrder[this._map.options.mapEl._currFeatureIndex];
    prevFocus.path.focus();
    this._map.closePopup();
  },

  /**
   * Focuses next feature in sequence
   * @param e
   * @private
   */
  _nextFeature: function(e){
    L.DomEvent.stop(e);
    this._map.options.mapEl._currFeatureIndex = Math.min(this._map.options.mapEl._currFeatureIndex + 1, this._map.options.mapEl._featureIndexOrder.length - 1);
    let nextFocus = this._map.options.mapEl._featureIndexOrder[this._map.options.mapEl._currFeatureIndex];
    nextFocus.path.focus();
    this._map.closePopup();
  },

  getPCRSCenter: function () {
    let bounds;
    for(let l in this._layers){
      let layer = this._layers[l];
      if (!bounds) {
        bounds = L.bounds(layer.getPCRSCenter(), layer.getPCRSCenter());
      } else {
        bounds.extend(layer.getPCRSCenter());
      }
    }
    return bounds.getCenter();
  },
});

/**
 * Returns new M.FeatureGroup
 * @param {M.Feature[]} layers - Layers belonging to feature group
 * @param {Object} options - Options for the feature group
 * @returns {M.FeatureGroup}
 */
export var featureGroup = function (layers, options) {
  return new FeatureGroup(layers, options);
};