import './leaflet-src.js';
import './proj4-src.js';
import './proj4leaflet.js';

(function () {
  window.navigator.getUserMapTCRS =
    function (t) {
      if (!t.code || !t.proj4string || !t.projection || !t.definition) return {};
      M[t.projection] = new L.Proj.CRS(t.code, t.proj4string, t.definition);      //creates crs using L.Proj
      M[t.projection.toUpperCase()] = M[t.projection];                            //adds the projection uppercase to global M
      return { crs: M[t.projection], projection: t.projection, };
    };
})();