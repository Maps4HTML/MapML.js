export var Polygon = L.Path.extend({
  initialize: function (mapml, options) {
    L.setOptions(this, options);
    this._markup = mapml;
  },


});

export var polygon = function (mapml, options) {
  return new Polygon(mapml, options);
};