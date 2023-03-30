export var AnnounceScale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 100,
      updateWhenIdle: true,
    },
  
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'accessible-scalebar');
      let invisibleScale = L.control.scale(this.options);
      invisibleScale.addTo(map);
      container.appendChild(invisibleScale.getContainer());
      let invisibleScaleLine = invisibleScale._container.getElementsByClassName('leaflet-control-scale-line')[0];

      setTimeout(() => { 
        container.setAttribute('aria-label', this._setText(invisibleScaleLine));
        container.style.display = 'none';
        
      }, 0);
  
      map.on('zoomend moveend', () => {
        container.style.display = '';
        let invisibleScaleLine = invisibleScale._container.getElementsByClassName('leaflet-control-scale-line')[0];

        container.setAttribute('aria-label',  this._setText(invisibleScaleLine));
        container.style.display = 'none';
      });

      return container;
    },

    _pixelsToDistance: function (px, units) {
      let dpi = window.devicePixelRatio * 96; // default dpi
      if (units === "metric") {
        return px / dpi * 2.54; // inches to cmd
      }
      return px / dpi;
    },

    _scaleLength: function (scale) {
      let bbox = scale.getBoundingClientRect();
      return bbox.right - bbox.left;
    },

    _setText: function (invScale) {
      let text = "";

      if (this.options.metric) {
        let distance = parseFloat((this._pixelsToDistance(this._scaleLength(invScale),"metric")).toFixed(1));
        text = `${distance} centimeters to ${invScale.textContent.trim()}`;
        text = text.replace(/(\d+)\s*m\b/g, "$1 meters");
        text = text.replace(/ km/g, " kilometers");
      }
      else {
        let distance = parseFloat((this._pixelsToDistance(this._scaleLength(invScale),"imperial")).toFixed(1));
        text = `${distance} inches to ${invScale.textContent.trim()}`;
        text = text.replace(/ft/g, "feet");
        text = text.replace(/mi/g, "miles");
      }

      return text;
    }
  });
  
  export var announceScale = function (options) {
    return new AnnounceScale(options);
  };