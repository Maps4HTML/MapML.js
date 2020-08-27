import { FALLBACK_PROJECTION } from '../utils/Constants';

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
        this._map.on('moveend', this._validateExtents, this);
        this._update();
        //this._validateExtents();
        if(this._layers.length < 1 && !this._map._showControls){
          this._container.setAttribute("hidden","");
        } else {
          this._map._showControls = true;
        }
        return this._container;
    },
    onRemove: function (map) {
        map.off('moveend', this._validateExtents, this);
        // remove layer-registerd event handlers so that if the control is not
        // on the map it does not generate layer events
        for (var i = 0; i < this._layers.length; i++) {
          this._layers[i].layer.off('add remove', this._onLayerChange, this);
          this._layers[i].layer.off('extentload', this._validateExtents, this);
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
    _validateExtents: function (e) {
      //the settimeout allows the function inside the {} to be moved to the task/callback queue rather than executing immediately
      //allowing the callback function to be run after all the other moveend event handlers
      setTimeout(()=>{
        let layerTypes = ["_staticTileLayer","_imageLayer","_mapmlvectors","_templatedLayer"],layerProjection;
        for (let i = 0; i < this._layers.length; i++) {
          let count = 0, total=0;
          if(this._layers[i].layer._extent){
            layerProjection = this._layers[i].layer._extent.getAttribute('units') || 
              this._layers[i].layer._extent.getAttribute('content') ||
              this._layers[i].layer._extent.querySelector("input[type=projection]").getAttribute('value');
          } else {
            layerProjection = FALLBACK_PROJECTION;
          }
          if( !layerProjection || layerProjection === this._map.options.projection){
            for(let j = 0 ;j<layerTypes.length;j++){
              let type = layerTypes[j];
              if(this._layers[i].input.checked && this._layers[i].layer[type]){
                if(type === "_templatedLayer"){
                  for(let j =0;j<this._layers[i].layer[type]._templates.length;j++){
                    if(this._layers[i].layer[type]._templates[j].rel ==="query") continue;
                    total++;
                    if(!(this._layers[i].layer[type]._templates[j].layer.isVisible))count++;
                  }
                } else {
                  total++;
                    if(!(this._layers[i].layer[type].isVisible))count++;
                }
              }
            }
          } else{
            count = 1;
            total = 1;
          }
          let label = this._layers[i].input.labels[0].getElementsByTagName("span"),
              input = this._layers[i].input.labels[0].getElementsByTagName("input");
          if(count === total && count !== 0){
            this._layers[i].layer._layerEl.setAttribute("disabled", ""); //set a disabled attribute on the layer element
            input[0].parentElement.parentElement.parentElement.parentElement.disabled = true;
            label[0].style.fontStyle = "italic";
          } else {
            //might be better not to disable the layer controls, might want to deselect layer even when its out of bounds
            this._layers[i].layer._layerEl.removeAttribute("disabled");
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
      // verify the extent and legend for the layer to know whether to
      // disable it , add the legend link etc.
      obj.layer.on('extentload', this._validateExtents, this);
      layercontrols.layer = obj.layer;
      this._overlaysList.appendChild(layercontrols);
      return layercontrols;
    }
});
export var mapMlLayerControl = function (layers, options) {
	return new MapMLLayerControl(layers, options);
};