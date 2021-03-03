export var FeatureRenderer = L.SVG.extend({
  getPolyPath: function (coords, interactive = false) {

  },

  coordinatesToArray: function (coords) {

  },
});

export var featureRenderer = function () {
  return new FeatureRenderer();
};