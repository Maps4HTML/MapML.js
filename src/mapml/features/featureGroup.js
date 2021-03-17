export var FeatureGroup = L.FeatureGroup.extend({
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
    this._map._targets[group._leaflet_id].openTooltip();
    this._map.closePopup();
  },

  _nextFeature: function(e){
    let group = this._source.group.nextSibling;
    if(!group){
      let currentIndex = this._source.group.closest("div.mapml-layer").style.zIndex;

      for(let layer of this._map.getPane("overlayPane").children){
        if(layer.style.zIndex <= currentIndex) continue;
        group = layer.querySelectorAll("g.leaflet-interactive");
        if(group.length > 0)break;
      }
      group = group.length > 0 ? group[0] : group;
    }
    group.focus();
    this._map._targets[group._leaflet_id].openTooltip();
    this._map.closePopup();
  },
});

export var featureGroup = function (layers, options) {
  return new FeatureGroup(layers, options);
};