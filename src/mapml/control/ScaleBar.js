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

      let scaleControl = L.control.scale(this.options);
      scaleControl.addTo(map);
      container.appendChild(scaleControl.getContainer());

      return container;
    },
  });
export var scaleBar = function (options) {
	return new ScaleBar(options);
};