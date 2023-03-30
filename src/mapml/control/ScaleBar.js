export var ScaleBar = L.Control.extend({
    options: {
      maxWidth: 100,
      updateWhenIdle: true,
      position: 'bottomleft'
    },

    _container: null,

    onAdd: function (map) {
      this._container = L.DomUtil.create('div','mapml-control-scale');

      let scaleControl = L.control.scale(this.options);
      scaleControl.addTo(map);
      this._container.appendChild(scaleControl.getContainer());
      this._container.setAttribute('tabindex',0);

      this._scaleControl = scaleControl;
      
      setTimeout(() => {
        this._updateAriaLabel(); 
      }, 0);

      map.on('zoomend moveend', this._updateAriaLabel, this);

      return this._container;
    },

    onRemove: function (map) {
      map.off('zoomend moveend', this._updateAriaLabel, this);
    },

    getContainer: function () {
      return this._container;
    },

    _pixelsToDistance: function (px, units) {
      let dpi = window.devicePixelRatio * 96; // default dpi
      if (units === "metric") {
        return px / dpi * 2.54; // inches to cm
      }
      return px / dpi;
    },

    _scaleLength: function (scale) {
      let bbox = scale.getBoundingClientRect();
      return bbox.right - bbox.left;
    },

    _updateAriaLabel: function () {
      let ariaLabel = "";
      let scaleLine = this._scaleControl.getContainer().getElementsByClassName('leaflet-control-scale-line')[0];

      if (this.options.metric) {
        let distance = parseFloat((this._pixelsToDistance(this._scaleLength(scaleLine),"metric")).toFixed(1));
        ariaLabel = `${distance} centimeters to ${scaleLine.textContent.trim()}`;
        ariaLabel = ariaLabel.replace(/(\d+)\s*m\b/g, "$1 meters");
        ariaLabel = ariaLabel.replace(/ km/g, " kilometers");
      }
      else {
        let distance = parseFloat((this._pixelsToDistance(this._scaleLength(scaleLine),"imperial")).toFixed(1));
        ariaLabel = `${distance} inches to ${scaleLine.textContent.trim()}`;
        ariaLabel = ariaLabel.replace(/ft/g, "feet");
        ariaLabel = ariaLabel.replace(/mi/g, "miles");
      }

      this._container.setAttribute('aria-label', ariaLabel);
    },
  });
export var scaleBar = function (options) {
	return new ScaleBar(options);
};
