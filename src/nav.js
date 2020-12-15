import './leaflet-src.js';
import './proj4-src.js';
import './proj4leaflet.js';

(function () {
  window.navigator.getUserMapTCRS =
    function (t) {
      if (!t.code || !t.proj4string || !t.projection || !t.definition) return {};
      let crs = new L.Proj.CRS(t.code, t.proj4string, t.definition);
      M[t.projection] = crs;
      return { crs: crs, projection: t.projection, };
    };
})();