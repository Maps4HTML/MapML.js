export var MapMLLayerControl = L.Control.Layers.extend({
    /* removes 'base' layers as a concept */
    options: {
      autoZIndex: false,
      sortLayers: true,
      sortFunction: function (layerA, layerB) {
        return layerA.options.zIndex < layerB.options.zIndex ? -1 : (layerA.options.zIndex > layerB.options.zIndex ? 1 : 0);
      }
    },
    initialize: function (overlays, options) {
        L.setOptions(this, options);
        
        // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
        // the array index is the id of the layer returned by L.stamp(layer) which I guess is a unique hash
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
        this._map.on('moveend', this._validateInput, this);
        L.DomEvent.on(this.options.mapEl, "layerchange", this._validateInput, this);
        this._update();
        //this._validateExtents();
        if(this._layers.length < 1 && !this._map._showControls){
          this._container.setAttribute("hidden","");
        } else{
          this._map._showControls = true;
        }
        return this._container;
    },
    onRemove: function (map) {
        map.off('moveend', this._validateInput, this);
        // remove layer-registerd event handlers so that if the control is not
        // on the map it does not generate layer events
        for (var i = 0; i < this._layers.length; i++) {
          this._layers[i].layer.off('add remove', this._onLayerChange, this);
          this._layers[i].layer.off('extentload', this._validateInput, this);
        }
    },
    addOrUpdateOverlay: function (layer, name) {
      var alreadyThere = false;
      for (var i=0;i<this._layers.length;i++) {
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
      if(this._layers.length > 0){
        this._container.removeAttribute("hidden");
        this._map._showControls = true;
      }
      return (this._map) ? this._update() : this;
    },
    removeLayer: function (layer) {
      L.Control.Layers.prototype.removeLayer.call(this, layer);
      if(this._layers.length === 0){
        this._container.setAttribute("hidden", "");
      }
    },
    _validateInput: function (e) {
      setTimeout(()=>{
        for (let i = 0; i < this._layers.length; i++) {
          if(!this._layers[i].input.labels[0])continue;
          let label = this._layers[i].input.labels[0].getElementsByTagName("span"),
              input = this._layers[i].input.labels[0].getElementsByTagName("input");
          input[0].checked = this._layers[i].layer._layerEl.checked;
          if(this._layers[i].layer._layerEl.disabled && this._layers[i].layer._layerEl.checked){
            input[0].parentElement.parentElement.parentElement.parentElement.disabled = true;
            label[0].style.fontStyle = "italic";
          } else {
            input[0].parentElement.parentElement.parentElement.parentElement.disabled = false;
            label[0].style.fontStyle = "normal";
          }
        }
      }, 0);
    },
    _withinZoomBounds: function(zoom, range) {
        return range.min <= zoom && zoom <= range.max;
    },
    _addItem: function (obj) {
      var layercontrols  =  obj.layer.getLayerUserControlsHTML();
      // the input is required by Leaflet...
      obj.input = layercontrols.querySelector('input');

      this._layerControlInputs.push(obj.input);
    		obj.input.layerId = L.stamp(obj.layer);

      L.DomEvent.on(obj.input, 'click', this._onInputClick, this);
      // this is necessary because when there are several layers in the
      // layer control, the response to the last one can be a long time
      // after the info is first displayed, so we have to go back and
      // verify the layer element is not disabled and can have an enabled input.
      obj.layer.on('extentload', this._validateInput, this);
      this._overlaysList.appendChild(layercontrols);
      return layercontrols;
    },

    //overrides collapse and conditionally collapses the panel
    collapse: function(e){
      if(e.relatedTarget && e.relatedTarget.parentElement && 
          (e.relatedTarget.className === "mapml-contextmenu mapml-layer-menu" || 
          e.relatedTarget.parentElement.className === "mapml-contextmenu mapml-layer-menu") ||
          (this._map && this._map.contextMenu._layerMenu.style.display === "block"))
       return this;

      L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
		  return this;
    }
});
export var mapMlLayerControl = function (layers, options) {
	return new MapMLLayerControl(layers, options);
};