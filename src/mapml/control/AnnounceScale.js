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
      let text = "";
      let invisibleScaleLine = invisibleScale._container.getElementsByClassName('leaflet-control-scale-line')[0];

      setTimeout(() => {
        if (this.options.metric) {
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScaleLine),"metric")).toFixed(1);
          text = `${distance} centimeters to ${invisibleScaleLine.textContent.trim()}`;
          text = text.replace(/(\d+)\s*m\b/g, "$1 meters");
          text = text.replace(/ km/g, " kilometers");
        }
        else {
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScaleLine),"imperial")).toFixed(1);
          text = `${distance} inches to ${invisibleScaleLine.textContent.trim()}`;
          text = text.replace(/ft/g, "feet");
          text = text.replace(/mi/g, "miles");
        }

        container.setAttribute('aria-label', text);

        container.style.display = 'none';
        
      }, 0);
  
      map.on('zoomend moveend', () => {
        container.style.display = '';
        let invisibleScaleLine = invisibleScale._container.getElementsByClassName('leaflet-control-scale-line')[0];
        
        if (this.options.metric) {
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScaleLine),"metric")).toFixed(1);
          text = `${distance} centimeters to ${invisibleScaleLine.textContent.trim()}`;
          text = text.replace(/(\d+)\s*m\b/g, "$1 meters");
          text = text.replace(/ km/g, " kilometers");
        }
        else {
          let distance = (this._pixelsToDistance(this._scaleLength(invisibleScaleLine),"imperial")).toFixed(1);
          text = `${distance} inches to ${invisibleScaleLine.textContent.trim()}`;
          text = text.replace(/ft/g, "feet");
          text = text.replace(/mi/g, "miles");
        }
        container.setAttribute('aria-label', text);
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
  });
  
  export var announceScale = function (options) {
    return new AnnounceScale(options);
  };