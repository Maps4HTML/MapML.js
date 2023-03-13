export var ScaleBar = L.Control.extend({
    options: {
      metric: true,
      imperial: true,
      maxWidth: 100,
      updateWhenIdle: true,
      position: 'bottomleft'
    },

    onAdd: function (map) {
      let container = L.DomUtil.create('div','leaflet-control-scale');

      L.control.scale(this.options).addTo(map);

      return container;
    },
  });
export var scaleBar = function (options) {
	return new ScaleBar(options);
};