export var SearchBar = L.Control.extend({

	options: {
		// @option collapsed: Boolean = true
		// If `true`, the control will be collapsed into an icon and expanded on mouse hover, touch, or keyboard activation.
		collapsed: true,
		position: 'topright'
	},

    onAdd: function(map) {
		this._initLayout();
		this._map = map;
		L.DomEvent.on(this._container.getElementsByTagName("a")[0], 'keydown', this._focusSearchBar, this._container);

		// get a list of layers that are searchable
		this.searchableLayers = [];

		return this._container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

	// Expand the control container if collapsed.
	expand() {
		this._container.classList.add('leaflet-control-layers-expanded');
		this._section.style.height = null;
		return this;
	},

	// @method collapse(): this
	// Collapse the control container if expanded.
	collapse() {
		if (this._suggestion.childElementCount === 0) {
			this._container.classList.remove('leaflet-control-layers-expanded');
		}
		return this;
	},

	_initLayout() {
		const className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);

		const section = this._section = L.DomUtil.create('div', `${className}-list`);

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			L.DomEvent.on(container, {
				mouseenter: this._expandSafely,
				mouseleave: this.collapse
			}, this);
		}

		const link = this._layersLink = L.DomUtil.create('a', `leaflet-control-search-toggle`, container);
		link.href = '#';
		link.title = 'Layers';
		link.setAttribute('role', 'button');

		L.DomEvent.on(link, {
			keydown(e) {
				if (e.code === 'Enter') {
					this._expandSafely();
				}
			},
			// Certain screen readers intercept the key event and instead send a click event
			click(e) {
				L.DomEvent.preventDefault(e);
				this._expandSafely();
			}
		}, this);

		if (!collapsed) {
			this.expand();
		}

		this._input = L.DomUtil.create('input', `${className}-input`, section);
		this._input.setAttribute("list", "suggestions"); // connect to datalist
        this._input.type = 'text';
        this._input.size = '15';
		this._input.style.margin='10px';
		this._input.onkeyup = (e)=> {
			if (e.code === 'Enter') {
				this.search();
			} else {
				this.suggest();
			}
		};

		this._createSuggestions();

		container.appendChild(section);
	},

	search() {
		let input = this._container.querySelector('.leaflet-control-layers-input');
		this._updateSearchableLayers(input.value);

		// TODO - search through all layers when multiple searchable layers present, 
		// currently hardcoded to only search the first searchable layer
		fetch(this.searchableLayers[0], {
		  "headers": {
		    "accept": "text/mapml",
		  },
		  "method": "GET",
		  "mode": "cors",
		})
		.then((response) => {
			if (response.ok) {
				return response.text();	
			}
			throw new Error('Invalid Search Response');
		})
		.then((data)=> {
			// TODO - work with data variable - mapml response or geojson
			let l = document.createElement("layer-");
			l.src = this.searchableLayers[0];
			l.checked = true;

			this._map.options.mapEl.appendChild(l);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
	},

	// suggest values when user is typing in the search bar
	suggest() {
		let val = this._input.value;
		if (val.length >= 3) {
			for (let layer of [... this._map.options.mapEl.layers]) {
				if (layer._layer && layer._layer._templatedLayer.search) {
					//layer.search = layer.search.replace('QUERY', input.value);
					//let link = this.parseLink(layer._layer._templatedLayer._templates[0], val);
					//this.searchableLayers.push(link);
					let suggestionLink = layer._layer._templatedLayer._templates[0].linkEl.parentElement.querySelector("map-link[rel=searchSuggestion]");

					if (suggestionLink) {
						const query = suggestionLink.getAttribute("query");
						const desc = suggestionLink.getAttribute("desc");
						let tref = suggestionLink.getAttribute("tref");
						
						// TODO - currently hardcoded to get first map-input, need to loop through all
						let inpName = layer._layer._templatedLayer._templates[0].values[0].getAttribute("name");

						tref = tref.replace('{' + inpName + '}', val);
						fetch(tref)
						.then((response) => response.json())
						.then((data)=> {
							this.clearItems();
							for (const obj in data) {
								this.addItem(data[obj][query], data[obj][desc]);
							}
						});
					}
				}
			}
		} else {
			this.clearItems();
		}
	},

	_updateSearchableLayers(val){
		this.searchableLayers = [];
		for (let layer of [... this._map.options.mapEl.layers]) {
			if (layer._layer && layer._layer._templatedLayer?.search) {
				//layer.search = layer.search.replace('QUERY', input.value);
				let link = this.parseLink(layer._layer._templatedLayer._templates[0], val);
				this.searchableLayers.push(link);
			}
		}
		if (this.searchableLayers.length === 0) {
			this._map.options.mapEl._setControlsVisibility("search",true);
		} else {
			this._map.options.mapEl._setControlsVisibility("search",false);
		}
	},

	_focusSearchBar(e) {
		if (e.key === 'Enter') {
			this.querySelector("input").focus();
		}
	},

	parseLink(template, val) {
		let link = template.template;
		let inpName = template.values[0].getAttribute("name");
		let inpType = template.values[0].getAttribute("type");
		//let inpVal = template.values[0].innerHTML;
		link = link.replace('{' + inpName + '}',val);
		return link;
	},

	_createSuggestions() {
		this._suggestion = L.DomUtil.create(
			'datalist',
			'leaflet-searchbox-autocomplete', 
			this._container);
		this._suggestion.id = "suggestions";
		this._items = [];
	},

	addItem(value, text) {
		var listItem = L.DomUtil.create('option', 'leaflet-searchbox-autocomplete-item', this._suggestion);
        listItem.innerHTML = text;
		listItem.value = value;
        this._items.push(listItem);
	},

	clearItems() {
		this._suggestion.innerHTML = '';
		this._items = [];
	},

	_expandSafely() {
		const section = this._section;
		L.DomEvent.on(section, 'click', L.DomEvent.preventDefault);
		this.expand();
		setTimeout(() => {
			L.DomEvent.off(section, 'click', L.DomEvent.preventDefault);
		});
	}
});


export var searchBar = function (options) {
	return new SearchBar(options);
  };