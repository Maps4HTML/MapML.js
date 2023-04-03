export var SearchBar = L.Control.extend({

	options: {
		position: 'topleft'
	},

    onAdd: function(map) {
		this._initLayout();
		this._map = map;

		L.DomEvent.on(this._button, 'click', this.search, this);

		// get a list of layers that are searchable
		this.searchableLayers = [];

		return this._container;
    },

    onRemove: function(map) {
		L.DomEvent.off(this._button);
    },

	_initLayout() {
		const className = 'mapml-search-control',
		    container = this._container = L.DomUtil.create('div', className),
			section = this._section = L.DomUtil.create('div', `${className}-section`);

		// TODO - Create a label for the search input
		this._input = L.DomUtil.create('input', `${className}-input`, section);
		this._input.setAttribute("list", "suggestions"); // connect to datalist
        this._input.type = 'search';
        this._input.size = '15';
		this._input.onkeyup = (e)=> {
			if (e.code === 'Enter') {
				this.search();
			} else {
				this.suggest();
			}
		};

		this._createSuggestions();

		this._button = L.DomUtil.create('input', `${className}-button`, section);
		this._button.type = 'button';
		this._button.title = 'Search';
		
		container.appendChild(section);
	},

	search() {
		let input = this._input;
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
	}
});


export var searchBar = function (options) {
	return new SearchBar(options);
  };