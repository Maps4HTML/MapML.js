export var geolocationButton = function (map) {
    var CustomMarker = L.Marker.extend({
        options: {
            title: 'My Location',
        },
        initialize(latlng, options) {
          L.Util.setOptions(this, options);
          this._latlng = latlng;
          this.createIcon();
        },
        /**
         * Create a styled circle location marker
         */
        createIcon() {
          const opt = this.options;
    
          let style = "";
    
          if (opt.color !== undefined) {
            style += `stroke:${opt.color};`;
          }
          if (opt.weight !== undefined) {
            style += `stroke-width:${opt.weight};`;
          }
          if (opt.fillColor !== undefined) {
            style += `fill:${opt.fillColor};`;
          }
          if (opt.fillOpacity !== undefined) {
            style += `fill-opacity:${opt.fillOpacity};`;
          }
          if (opt.opacity !== undefined) {
            style += `opacity:${opt.opacity};`;
          }
    
          const icon = this._getIconSVG(opt, style);
    
          this._locationIcon = L.divIcon({
            className: icon.className,
            html: icon.svg,
            iconSize: [icon.w, icon.h]
          });
    
          this.setIcon(this._locationIcon);
        },
    
        /**
         * Return the raw svg for the shape
         *
         * Split so can be easily overridden
         */
        _getIconSVG(options, style) {
          const r = options.radius;
          const w = options.weight;
          const s = r + w;
          const s2 = s * 2;
          const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" width="${s2}" height="${s2}" version="1.1" viewBox="-${s} -${s} ${s2} ${s2}">` +
            '<circle r="' +
            r +
            '" style="' +
            style +
            '" />' +
            "</svg>";
          return {
            className: "leaflet-control-locate-location",
            svg,
            w: s2,
            h: s2
          };
        },
    
        setStyle(style) {
          L.Util.setOptions(this, style);
          this.createIcon();
        }
    });
    return L.control.locate({
        markerClass: CustomMarker,
        showPopup: false,
        strings: {
          title: M.options.locale.btnLocTrackOff 
        },
        position: "bottomright",
        locateOptions: {
          maxZoom: 16
        },
    }).addTo(map);
};
