export var ScaleBar = L.Control.extend({
    options: {
      metric: true,
      imperial: true,
      maxWidth: 100,
      updateWhenIdle: true,
      position: 'bottomleft'
    },

    onAdd: function (map) {
      let container = L.DomUtil.create('div','leaflet-control-scale');

      let scaleControl = L.control.scale(this.options);
      scaleControl.addTo(map);
      container.appendChild(scaleControl.getContainer());
      container.title = "Scale bar";
      container.setAttribute('tabindex',0);

      this._container = container; 
      this._scaleControl = scaleControl;
  
      this._updateAriaLabel(); 

      map.on('zoomend moveend', this._updateAriaLabel, this);

      return container;
    },

    onRemove: function (map) {
      map.off('zoomend moveend', this._updateAriaLabel, this);
    },

    _updateAriaLabel: function () {

      let scaleLineMetric = this._scaleControl._container.getElementsByClassName('leaflet-control-scale-line')[0].textContent.trim();
      scaleLineMetric = scaleLineMetric.replace(/(\d+)\s*m\b/g, "$1 meters");
      scaleLineMetric = scaleLineMetric.replace(/ km/g, " kilometers");

      let scaleLineImperial = this._scaleControl._container.getElementsByClassName('leaflet-control-scale-line')[1].textContent.trim();
      scaleLineImperial = scaleLineImperial.replace(/ft/g, "feet");
      scaleLineImperial = scaleLineImperial.replace(/mi/g, "miles");

      this._container.setAttribute('aria-label', `Scale bar: ${scaleLineMetric} or ${scaleLineImperial}`);
    },
  });
export var scaleBar = function (options) {
	return new ScaleBar(options);
};