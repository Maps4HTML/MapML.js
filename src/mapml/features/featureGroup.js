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
      this.options.group.setAttribute('tabindex', '0');
      L.DomUtil.addClass(this.options.group, "leaflet-interactive");
      L.DomEvent.on(this.options.group, "keyup keydown mousedown", this._handleFocus, this);
      let firstLayer = layers[Object.keys(layers)[0]];
      if(layers.length === 1 && firstLayer.options.link) this.options.link = firstLayer.options.link;
      if(this.options.link){
        M.Feature.prototype.attachLinkHandler.call(this, this.options.group, this.options.link, this.options._leafletLayer);
        this.options.group.setAttribute('role', 'link');
      } else {
        this.options.group.setAttribute("aria-expanded", "false");
        // fix issue https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/423
        this.options.group.setAttribute('role', 'button');
        this.options.onEachFeature(this.options.properties, this);
        this.off("click", this._openPopup);
      }
    }

    this.options.group.setAttribute('aria-label', this.options.accessibleTitle);
    if(this.options.featureID) this.options.group.setAttribute("data-fid", this.options.featureID);
  },

  /**
   * Handler for focus events
   * @param {L.DOMEvent} e - Event that occurred
   * @private
   */
  _handleFocus: function(e) {
    if(e.target.tagName.toUpperCase() !== "G") return;
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