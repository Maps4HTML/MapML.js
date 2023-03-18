export var AnnounceScale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 100,
      updateWhenIdle: true,
    },
  
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'accessible-scalebar');
      container.style.display = 'none'; 
      let invisibleScale = 0;
      let text = "";

      if (this.options.metric) {
        invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
        let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"metric")).toFixed(1);
        text = `${distance} centimeters to ${invisibleScale.textContent.trim()}`;
        text = text.replace(/(\d+)\s*m\b/g, "$1 meters");
        text = text.replace(/ km/g, " kilometers");
      }
      else {
        invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
        let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"imperial")).toFixed(1);
        text = `${distance} inches to ${invisibleScale.textContent.trim()}`;
        text = text.replace(/ft/g, "feet");
        text = text.replace(/mi/g, "miles");
      }
      container.setAttribute('aria-label', text);
  
      map.on('zoomend moveend', () => {
        
        if (this.options.metric) {
          invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"metric")).toFixed(1);
          text = `${distance} centimeters to ${invisibleScale.textContent.trim()}`;
          text = text.replace(/(\d+)\s*m\b/g, "$1 meters");
          text = text.replace(/ km/g, " kilometers");
        }
        else {
          invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"imperial")).toFixed(1);
          text = `${distance} inches to ${invisibleScale.textContent.trim()}`;
          text = text.replace(/ft/g, "feet");
          text = text.replace(/mi/g, "miles");
        }
        container.setAttribute('aria-label', text);
      });
  
      // visually hide the accessible scalebar
      container.style.display = 'none';
  
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
  });
  
  export var announceScale = function (options) {
    return new AnnounceScale(options);
  };