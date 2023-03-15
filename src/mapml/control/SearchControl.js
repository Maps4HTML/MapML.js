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

		return this._container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

	// Expand the control container if collapsed.
	expand() {
		console.log("expand called");
		this._container.classList.add('leaflet-control-layers-expanded');
		this._section.style.height = null;
		return this;
	},

	// @method collapse(): this
	// Collapse the control container if expanded.
	collapse() {
		console.log("collapse called");
		this._container.classList.remove('leaflet-control-layers-expanded');
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

		const link = this._layersLink = L.DomUtil.create('a', `${className}-toggle`, container);
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

		// for testing
		this._img = L.DomUtil.create('img', `${className}-img`, section);
        this._img.src = './dist/images/layers-2x.png';
        this._img.style.width = '30px';

		this._input = L.DomUtil.create('input', `${className}-input`, section);
        this._input.type = 'text';
        this._input.size = '15';

		container.appendChild(section);
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