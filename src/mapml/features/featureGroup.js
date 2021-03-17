export var FeatureGroup = L.FeatureGroup.extend({
  _previousFeature: function(e){
    let path = this._source._path.previousSibling;
    if(!path){
      let currentIndex = this._source._path.closest("div.mapml-layer").style.zIndex;
      let overlays = this._map.getPane("overlayPane").children;
      for(let i = overlays.length - 1; i >= 0; i--){
        let layer = overlays[i];
        if(layer.style.zIndex >= currentIndex) continue;
        path = layer.querySelector("path");
        if(path){
          path = path.parentNode.lastChild;
          break;
        }
      }
      if (!path) path = this._source._path;
    }
    path.focus();
    this._map._targets[path._leaflet_id].openTooltip();
    this._map.closePopup();
  },

  _nextFeature: function(e){
    let currFeature = this._source._parts[0].path.parentElement, path;
    if(currFeature.nextElementSibling){
      path = currFeature.nextElementSibling.querySelector('.leaflet-interactive');
    }
    if(!path){
      let currentIndex = currFeature.closest("div.mapml-layer").style.zIndex;

      for(let layer of this._map.getPane("overlayPane").children){
        if(layer.style.zIndex <= currentIndex) continue;
        path = layer.getElementsByClassName("leaflet-interactive");
        if(path.length > 0)break;
      }
      path = path.length > 0 ? path[0] : path;
    }
    path.focus();
    this._map._targets[path.parentElement._stamp].openTooltip();
    this._map.closePopup();
  },
});

export var featureGroup = function (layers, options) {
  return new FeatureGroup(layers, options);
};