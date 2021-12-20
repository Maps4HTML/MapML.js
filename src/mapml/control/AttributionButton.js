export var AttributionButton = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="https://www.w3.org/community/maps4html/">Maps for HTML Community Group</a> <span aria-hidden="true">|</span> <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.Util.setOptions(this, options);
		this._attributions = {};
	},

	onAdd: function (map) {
		map.attributionControl = this;
		this._container = L.DomUtil.create('details', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}

		this._update();

		map.on('layeradd', this._addAttribution, this);

		return this._container;
	},

	onRemove: function (map) {
		map.off('layeradd', this._addAttribution, this);
	},

	_addAttribution: function (ev) {
		if (ev.layer.getAttribution) {
			this.addAttribution(ev.layer.getAttribution());
			ev.layer.once('remove', function () {
				this.removeAttribution(ev.layer.getAttribution());
			}, this);
		}
	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return this; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return this; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = '<summary title="Map data attribution"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></summary>' + '<div class="mapml-attribution-container">' + prefixAndAttribs.join(' <span aria-hidden="true">|</span> ') + '</div>';

	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		new AttributionButton().addTo(this);
	}
});

export var attributionButton = function (options) {
	return new AttributionButton(options);
};
