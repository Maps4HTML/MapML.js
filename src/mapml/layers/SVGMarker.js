export var SVGMarker = L.Path.extend({
  options: {
    stroke: true,
    fillColor: '#2e91bf',
    color: '#ffffff',
    fill: true,
    className: "mapml-marker",
    fillOpacity: 1,
    weight: 1,
  },

  initialize: function (latlng, options) {
    L.setOptions(this, options);
    this._latlng = L.latLng(latlng);
  },

  _project: function () {
    this._rings = [];
    this._point = this._map.latLngToLayerPoint(this._latlng);
  },

  _update: function () {
    if (!this._map) return;
    this._path.setAttribute("d", this.generateMarkerPath(this._point));
  },

  getLatLngs: function () {
    return this._latlng;
  },

  getCenter: function () {
    return this._latlng;
  },

  generateMarkerPath: function (p) {
    return `M${p.x} ${p.y} L${p.x - 12.5} ${p.y - 30} C${p.x - 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 30} L${p.x} ${p.y}z`;
  },

});

export var svgMarker = function (latlng, options) {
  return new SVGMarker(latlng, options);
};