export var SVGMarker = L.polygon.extend({
  initialize: function (options) {
    
  },
  onAdd: function(map){

  },
  onRemove: function(map){

  },
});

export var svgMarker = function (latlng, options) {
  return new SVGMarker(latlng, options);
};