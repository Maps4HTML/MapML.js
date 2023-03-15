export var AnnounceScale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 100,
      updateWhenIdle: true,
      metric: true
    },
  
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-control-scale leaflet-control-accessible-scalebar');
      container.style.display = 'none'; 
      var innerDiv = L.DomUtil.create('div', '', container);
      let invisibleScale = 0;
      let text = "";

      if (this.options.metric) {
        invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
        let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"metric")).toFixed(1);
        text = `${distance} centimeters to ${invisibleScale.textContent.trim()}`;
      }
      else {
        invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
        let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"imperial")).toFixed(1);
        text = `${distance} inches to ${invisibleScale.textContent.trim()}`;
      }

      innerDiv.innerHTML = text;
      container.setAttribute('aria-label', text);
  
      // get the physically visible scalebar and extract its distance in meters
      map.on('zoomend moveend', () => {
    
        if (this.options.metric) {
          invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"metric")).toFixed(1);
          text = `${distance} centimeters to ${invisibleScale.textContent.trim()}`;
        }
        else {
          invisibleScale = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScale),"imperial")).toFixed(1);
          text = `${distance} inches to ${invisibleScale.textContent.trim()}`;
        }

        innerDiv.innerHTML = text;
        container.setAttribute('aria-label', text);
      });
  
      // visually hide the accessible scalebar
      container.style.display = 'none';
  
      return container;
    },

    _pixelsToDistance: function (px, units) {
      let dpi = window.devicePixelRatio * 96 // default dpi;
      if (units === "metric") {
        return px / dpi * 2.54 // inches to cmd;
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


  //M.announceScale({"metric": true, "imperial": false}).addTo(this._map);