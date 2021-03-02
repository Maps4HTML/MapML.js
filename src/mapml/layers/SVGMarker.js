export var SVGMarker = L.Path.extend({
  options: {
    stroke: false,
    color: '00AEEF',
    fill: true,
    className: "mapml-marker",
  },

  initialize: function (latlng, options) {
    L.setOptions(this, options);
    this._latlng = L.latLng(latlng);
    this._svg = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 365 560" enable-background="new 0 0 365 560" xml:space="preserve">
                    <g>
                      <path fill="#00AEEF" d="M182.9,551.7c0,0.1,0.2,0.3,0.2,0.3S358.3,283,358.3,194.6c0-130.1-88.8-186.7-175.4-186.9
                        C96.3,7.9,7.5,64.5,7.5,194.6c0,88.4,175.3,357.4,175.3,357.4S182.9,551.7,182.9,551.7z M122.2,187.2c0-33.6,27.2-60.8,60.8-60.8
                        c33.6,0,60.8,27.2,60.8,60.8S216.5,248,182.9,248C149.4,248,122.2,220.8,122.2,187.2z"/>
                    </g>
                    </svg>`;
    this._icon = L.icon({
      iconUrl: "data:image/svg+xml;base64," + btoa(this._svg),
    });

  },

  _project: function () {
    this._rings = [];
    this._point = this._map.latLngToLayerPoint(this._latlng);
    //substract the pixel origin from the pixel coordinates to get the location relative to map viewport
    this._rings.push(L.point(this._point.x, this._point.y));
    this._rings.push(L.point(this._point.x - 10, this._point.y - 30));
    this._rings.push(L.point(this._point.x, this._point.y - 40));
    this._rings.push(L.point(this._point.x + 10, this._point.y - 30));

    //leaflet SVG renderer looks for and array of arrays to build polygons,
    //in this case it only deals with a rectangle so one closed array or points
    this._parts = [this._rings];
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updatePoly(this, true); //passing true creates a closed path i.e. a rectangle
  },

  getLatLngs: function () {
    return this._latlng;
  },

  getCenter: function () {
    return this._latlng;
  },

});

export var svgMarker = function (latlng, options) {
  return new SVGMarker(latlng, options);
};