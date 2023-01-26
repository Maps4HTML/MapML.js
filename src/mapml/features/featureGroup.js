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

  onAdd: function (map) {
    L.LayerGroup.prototype.onAdd.call(this, map);
    this.updateInteraction();
  },

  updateInteraction: function () {
    let map = this._map || this.options._leafletLayer._map;
    if((this.options.onEachFeature && this.options.properties) || this.options.link)
      map.featureIndex.addToIndex(this, this.getPCRSCenter(), this.options.group);

    for (let layerID in this._layers) {
      let layer = this._layers[layerID];
      for(let part of layer._parts){
        if(layer.featureAttributes && layer.featureAttributes.tabindex)
          map.featureIndex.addToIndex(layer, layer.getPCRSCenter(), part.path);
        for(let subPart of part.subrings) {
          if(subPart.attr && subPart.attr.tabindex) map.featureIndex.addToIndex(layer, subPart.center, subPart.path);
        }
      }
    }
  },

  /**
   * Handler for focus events
   * @param {L.DOMEvent} e - Event that occurred
   * @private
   */
  _handleFocus: function(e) {
    if(([9, 16, 27, 37, 38, 39, 40].includes(e.keyCode)) && e.type === "keydown"){
      let index = this._map.featureIndex.currentIndex;
      // Down/right arrow keys replicate tabbing through the feature index
      // Up/left arrow keys replicate shift-tabbing through the feature index
      if(e.keyCode === 37 || e.keyCode === 38) {
        L.DomEvent.stop(e);
        this._map.featureIndex.inBoundFeatures[index].path.setAttribute("tabindex", -1);
        if(index === 0) {
          this._map.featureIndex.inBoundFeatures[this._map.featureIndex.inBoundFeatures.length - 1].path.focus();
          this._map.featureIndex.currentIndex = this._map.featureIndex.inBoundFeatures.length - 1;
        } else {
          this._map.featureIndex.inBoundFeatures[index - 1].path.focus();
          this._map.featureIndex.currentIndex--;
        }
      } else if (e.keyCode === 39 || e.keyCode === 40) {
        L.DomEvent.stop(e);
        this._map.featureIndex.inBoundFeatures[index].path.setAttribute("tabindex", -1);
        if(index === this._map.featureIndex.inBoundFeatures.length - 1) {
          this._map.featureIndex.inBoundFeatures[0].path.focus();
          this._map.featureIndex.currentIndex = 0;
        } else {
          this._map.featureIndex.inBoundFeatures[index + 1].path.focus();
          this._map.featureIndex.currentIndex++;
        }
      } else if(e.keyCode === 27){
        let shadowRoot = this._map.options.mapEl.shadowRoot ? this._map.options.mapEl.shadowRoot :
            this._map.options.mapEl.querySelector(".mapml-web-map").shadowRoot;
        if(shadowRoot.activeElement.nodeName !== "g") return;
        this._map._container.focus();
      } else if (e.keyCode === 9) {
        let obj = this;
        setTimeout(function () {
          obj._map.featureIndex.inBoundFeatures[0].path.setAttribute("tabindex", 0);
        }, 0);
      }
    } else if (!([9, 16, 13, 27, 37, 38, 39, 40, 49, 50, 51, 52, 53, 54, 55].includes(e.keyCode))){
      this._map.featureIndex.currentIndex = 0;
      this._map.featureIndex.inBoundFeatures[0].path.focus();
    }
  
    // 27 added so that the tooltip opens when dismissing popup with 'esc' key
    if(e.target.tagName.toUpperCase() !== "G") return;
    if(([9, 13, 16, 37, 38, 39, 40, 49, 50, 51, 52, 53, 54, 55, 27].includes(e.keyCode)) && e.type === "keyup") {
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
    this._map.featureIndex.currentIndex = Math.max(this._map.featureIndex.currentIndex - 1, 0);
    let prevFocus = this._map.featureIndex.inBoundFeatures[this._map.featureIndex.currentIndex];
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
    this._map.featureIndex.currentIndex = Math.min(this._map.featureIndex.currentIndex + 1, this._map.featureIndex.inBoundFeatures.length - 1);
    let nextFocus = this._map.featureIndex.inBoundFeatures[this._map.featureIndex.currentIndex];
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