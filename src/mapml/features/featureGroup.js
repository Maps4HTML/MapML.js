export var FeatureGroup = L.FeatureGroup.extend({
  /**
   * Adds layer to feature group
   * @param {M.Feature} layer - The layer to be added
   */
  addLayer: function (layer) {
    layer.openTooltip = () => { this.openTooltip(); };         // needed to open tooltip of child features
    layer.closeTooltip = () => { this.closeTooltip(); };       // needed to close tooltip of child features
    L.FeatureGroup.prototype.addLayer.call(this, layer);
  },

  /**
   * Focuses the previous function in the sequence on previous button press
   * @param e
   * @private
   */
  _previousFeature: function(e){
    let group = this._source.group.previousSibling;
    if(!group){
      let currentIndex = this._source.group.closest("div.mapml-layer").style.zIndex;
      let overlays = this._map.getPane("overlayPane").children;
      for(let i = overlays.length - 1; i >= 0; i--){
        let layer = overlays[i];
        if(layer.style.zIndex >= currentIndex) continue;
        group = layer.querySelector("g.leaflet-interactive");
        if(group){
          group = group.parentNode.lastChild;
          break;
        }
      }
      if (!group) group = this._source.group;
    }
    group.focus();
    this._map.closePopup();
  },

  /**
   * Focuses next feature in sequence
   * @param e
   * @private
   */
  _nextFeature: function(e){
    let group = this._source.group.nextSibling;
    if(!group){
      let currentIndex = this._source.group.closest("div.mapml-layer").style.zIndex;

      for(let layer of this._map.getPane("overlayPane").children){
        if(layer.style.zIndex <= currentIndex) continue;
        group = layer.querySelectorAll("g.leaflet-interactive");
        if(group.length > 0)break;
      }
      group = group && group.length > 0 ? group[0] : this._source.group;
    }
    group.focus();
    this._map.closePopup();
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