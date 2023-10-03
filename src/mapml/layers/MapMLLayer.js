/* global M */

import { FALLBACK_PROJECTION, BLANK_TT_TREF } from '../utils/Constants';

export var MapMLLayer = L.Layer.extend({
  // zIndex has to be set, for the case where the layer is added to the
  // map before the layercontrol is used to control it (where autoZindex is used)
  // e.g. in the raw MapML-Leaflet-Client index.html page.
  options: {
    maxNext: 10,
    zIndex: 0,
    maxZoom: 25,
    opacity: '1.0'
  },
  // initialize is executed before the layer is added to a map
  initialize: function (href, layerEl, mapml, options) {
    // in the custom element, the attribute is actually 'src'
    // the _href version is the URL received from layer-@src
    if (href) {
      this._href = href;
    }
    let local;
    this._layerEl = layerEl;
    local = layerEl.querySelector('map-feature,map-tile,map-extent')
      ? true
      : false;
    this._content = local ? layerEl : mapml;
    L.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-layer');
    this.changeOpacity(this.options.opacity);
    L.DomUtil.addClass(this._container, 'mapml-layer');
    this._imageContainer = L.DomUtil.create(
      'div',
      'leaflet-layer',
      this._container
    );
    L.DomUtil.addClass(this._imageContainer, 'mapml-image-container');

    // this layer 'owns' a mapmlTileLayer, which is a subclass of L.GridLayer
    // it 'passes' what tiles to load via the content of this._mapmlTileContainer
    this._mapmlTileContainer = L.DomUtil.create(
      'div',
      'mapml-tile-container',
      this._container
    );
    // hit the service to determine what its extent might be
    // OR use the extent of the content provided

    this._initialize(local ? layerEl : mapml);

    // a default extent can't be correctly set without the map to provide
    // its bounds , projection, zoom range etc, so if that stuff's not
    // established by metadata in the content, we should use map properties
    // to set the extent, but the map won't be available until the <layer>
    // element is attached to the <map> element, wait for that to happen.
    this.on('attached', this._validateExtent, this);
    // weirdness.  options is actually undefined here, despite the hardcoded
    // options above. If you use this.options, you see the options defined
    // above.  Not going to change this, but failing to understand ATM.
    // may revisit some time.
    this.validProjection = true;
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._updateZIndex();

    return this;
  },
  getHref: function () {
    return this._href ?? '';
  },
  _updateZIndex: function () {
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
  },
  // remove all the extents before removing the layer from the map
  _removeExtents: function (map) {
    if (this._properties._mapExtents) {
      for (let i = 0; i < this._properties._mapExtents.length; i++) {
        if (this._properties._mapExtents[i].templatedLayer) {
          map.removeLayer(this._properties._mapExtents[i].templatedLayer);
        }
      }
    }
    if (this._properties._queries) {
      delete this._properties._queries;
    }
  },
  _changeOpacity: function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this.changeOpacity(e.target.value);
    }
  },
  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._layerEl._opacity = opacity;
    if (this.opacityEl) this.opacityEl.value = opacity;
  },
  _changeExtentOpacity: function (e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this.templatedLayer.changeOpacity(e.target.value);
      this._templateVars.opacity = e.target.value;
    }
  },
  _changeExtent: function (e, extentEl) {
    if (e.target.checked) {
      extentEl.checked = true;
      if (this._layerEl.checked) {
        extentEl.templatedLayer = M.templatedLayer(extentEl._templateVars, {
          pane: this._container,
          opacity: extentEl._templateVars.opacity,
          _leafletLayer: this,
          crs: extentEl.crs,
          extentZIndex: extentEl.extentZIndex,
          extentEl: extentEl._DOMnode || extentEl
        }).addTo(this._map);
        extentEl.templatedLayer.setZIndex();
        this._setLayerElExtent();
      }
    } else {
      L.DomEvent.stopPropagation(e);
      extentEl.checked = false;
      if (this._layerEl.checked) this._map.removeLayer(extentEl.templatedLayer);
      this._setLayerElExtent();
    }
  },
  titleIsReadOnly() {
    return !!this._titleIsReadOnly;
  },
  setName(newName) {
    // a layer's accessible name is set by the <map-title>, if present
    // if it's not available the <layer- label="accessible-name"> attribute
    // can be used
    if (!this.titleIsReadOnly()) {
      this._title = newName;
      this._mapmlLayerItem.querySelector('.mapml-layer-item-name').innerHTML =
        newName;
    }
  },
  getName() {
    return this._title;
  },

  onAdd: function (map) {
    if (this._properties && !this._validProjection(map)) {
      this.validProjection = false;
      return;
    }
    this._map = map;
    if (this._mapmlvectors) map.addLayer(this._mapmlvectors);

    if (!this._imageLayer) {
      this._imageLayer = L.layerGroup();
    }
    map.addLayer(this._imageLayer);
    // the layer._imageContainer property contains an element in which
    // content will be maintained

    //only add the layer if there are tiles to be rendered
    if (this._staticTileLayer) {
      map.addLayer(this._staticTileLayer);
    }

    const createAndAdd = createAndAddTemplatedLayers.bind(this);
    // if the extent has been initialized and received, update the map,
    if (
      this._properties &&
      this._properties._mapExtents &&
      this._properties._mapExtents[0]._templateVars
    ) {
      createAndAdd();
    }
    this._setLayerElExtent();

    this.setZIndex(this.options.zIndex);
    this.getPane().appendChild(this._container);
    setTimeout(() => {
      map.fire('checkdisabled');
    }, 0);
    map.on('popupopen', this._attachSkipButtons, this);

    function createAndAddTemplatedLayers() {
      if (this._properties && this._properties._mapExtents) {
        for (let i = 0; i < this._properties._mapExtents.length; i++) {
          if (
            this._properties._mapExtents[i]._templateVars &&
            this._properties._mapExtents[i].checked
          ) {
            if (!this._properties._mapExtents[i].extentZIndex)
              this._properties._mapExtents[i].extentZIndex = i;
            this._templatedLayer = M.templatedLayer(
              this._properties._mapExtents[i]._templateVars,
              {
                pane: this._container,
                opacity: this._properties._mapExtents[i]._templateVars.opacity,
                _leafletLayer: this,
                crs: this._properties.crs,
                extentZIndex: this._properties._mapExtents[i].extentZIndex,
                // when a <map-extent> migrates from a remote mapml file and attaches to the shadow of <layer- >
                // this._properties._mapExtents[i] refers to the <map-extent> in remote mapml
                extentEl:
                  this._properties._mapExtents[i]._DOMnode ||
                  this._properties._mapExtents[i]
              }
            ).addTo(map);
            this._properties._mapExtents[i].templatedLayer =
              this._templatedLayer;
            if (this._templatedLayer._queries) {
              if (!this._properties._queries) this._properties._queries = [];
              this._properties._queries = this._properties._queries.concat(
                this._templatedLayer._queries
              );
            }
          }
          if (this._properties._mapExtents[i].hasAttribute('opacity')) {
            let opacity =
              this._properties._mapExtents[i].getAttribute('opacity');
            this._properties._mapExtents[i].templatedLayer.changeOpacity(
              opacity
            );
          }
        }
      }
    }
  },

  _validProjection: function (map) {
    let noLayer = false;
    if (this._properties && this._properties._mapExtents) {
      for (let i = 0; i < this._properties._mapExtents.length; i++) {
        if (this._properties._mapExtents[i]._templateVars) {
          for (let template of this._properties._mapExtents[i]._templateVars)
            if (
              !template.projectionMatch &&
              template.projection !== map.options.projection
            ) {
              noLayer = true; // if there's a single template where projections don't match, set noLayer to true
              break;
            }
        }
      }
    }
    return !(noLayer || this.getProjection() !== map.options.projection);
  },

  //sets the <layer-> elements .bounds property
  _setLayerElExtent: function () {
    let bounds,
      zoomMax,
      zoomMin,
      maxNativeZoom,
      minNativeZoom,
      zoomBounds = {
        minZoom: 0,
        maxZoom: 0,
        maxNativeZoom: 0,
        minNativeZoom: 0
      };
    let layerTypes = [
      '_staticTileLayer',
      '_imageLayer',
      '_mapmlvectors',
      '_templatedLayer'
    ];
    layerTypes.forEach((type) => {
      if (this[type]) {
        if (type === '_templatedLayer') {
          for (let i = 0; i < this._properties._mapExtents.length; i++) {
            for (
              let j = 0;
              j < this._properties._mapExtents[i]._templateVars.length;
              j++
            ) {
              let inputData = M._extractInputBounds(
                this._properties._mapExtents[i]._templateVars[j]
              );
              this._properties._mapExtents[i]._templateVars[
                j
              ].tempExtentBounds = inputData.bounds;
              this._properties._mapExtents[i]._templateVars[
                j
              ].extentZoomBounds = inputData.zoomBounds;
            }
          }
          for (let i = 0; i < this._properties._mapExtents.length; i++) {
            if (this._properties._mapExtents[i].checked) {
              for (
                let j = 0;
                j < this._properties._mapExtents[i]._templateVars.length;
                j++
              ) {
                if (!bounds) {
                  bounds =
                    this._properties._mapExtents[i]._templateVars[j]
                      .tempExtentBounds;
                  zoomMax =
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.maxZoom;
                  zoomMin =
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.minZoom;
                  maxNativeZoom =
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.maxNativeZoom;
                  minNativeZoom =
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.minNativeZoom;
                } else {
                  bounds.extend(
                    this._properties._mapExtents[i]._templateVars[j]
                      .tempExtentBounds.min
                  );
                  bounds.extend(
                    this._properties._mapExtents[i]._templateVars[j]
                      .tempExtentBounds.max
                  );
                  zoomMax = Math.max(
                    zoomMax,
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.maxZoom
                  );
                  zoomMin = Math.min(
                    zoomMin,
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.minZoom
                  );
                  maxNativeZoom = Math.max(
                    maxNativeZoom,
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.maxNativeZoom
                  );
                  minNativeZoom = Math.min(
                    minNativeZoom,
                    this._properties._mapExtents[i]._templateVars[j]
                      .extentZoomBounds.minNativeZoom
                  );
                }
              }
            }
          }
          zoomBounds.minZoom = zoomMin;
          zoomBounds.maxZoom = zoomMax;
          zoomBounds.minNativeZoom = minNativeZoom;
          zoomBounds.maxNativeZoom = maxNativeZoom;
          this._properties.zoomBounds = zoomBounds;
          this._properties.layerBounds = bounds;
          // assign each template the layer and zoom bounds
          for (let i = 0; i < this._properties._mapExtents.length; i++) {
            this._properties._mapExtents[i].templatedLayer.layerBounds = bounds;
            this._properties._mapExtents[i].templatedLayer.zoomBounds =
              zoomBounds;
          }
        } else if (type === '_staticTileLayer') {
          if (this[type].layerBounds) {
            if (!bounds) {
              bounds = this[type].layerBounds;
              zoomBounds = this[type].zoomBounds;
            } else {
              bounds.extend(this[type].layerBounds.min);
              bounds.extend(this[type].layerBounds.max);
            }
          }
        } else if (type === '_imageLayer') {
          if (this[type].layerBounds) {
            if (!bounds) {
              bounds = this[type].layerBounds;
              zoomBounds = this[type].zoomBounds;
            } else {
              bounds.extend(this[type].layerBounds.min);
              bounds.extend(this[type].layerBounds.max);
            }
          }
        } else if (
          // only process extent if mapmlvectors is not empty
          type === '_mapmlvectors' &&
          Object.keys(this[type]._layers).length !== 0
        ) {
          if (this[type].layerBounds) {
            if (!bounds) {
              bounds = this[type].layerBounds;
              zoomBounds = this[type].zoomBounds;
            } else {
              bounds.extend(this[type].layerBounds.min);
              bounds.extend(this[type].layerBounds.max);
            }
          }
        }
      }
    });
    if (bounds) {
      //assigns the formatted extent object to .extent and spreads the zoom ranges to .extent also
      this._layerEl.extent = Object.assign(
        M._convertAndFormatPCRS(
          bounds,
          this._properties.crs,
          this._properties.projection
        ),
        { zoom: zoomBounds }
      );
    }
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },
  getEvents: function () {
    return { zoomanim: this._onZoomAnim };
  },
  redraw: function () {
    // for now, only redraw templated layers.
    if (this._properties._mapExtents) {
      for (let i = 0; i < this._properties._mapExtents.length; i++) {
        if (this._properties._mapExtents[i].templatedLayer) {
          this._properties._mapExtents[i].templatedLayer.redraw();
        }
      }
    }
  },
  _onZoomAnim: function (e) {
    // this callback will be invoked AFTER <layer- > has been removed
    // but due to the characteristic of JavaScript, the context (this pointer) can still be used
    // the easiest way to solve this:
    if (!this._map) {
      return;
    }
    // get the min and max zooms from all extents
    var toZoom = e.zoom,
      zoom =
        this._properties && this._properties._mapExtents
          ? this._properties._mapExtents[0].querySelector(
              'map-input[type=zoom]'
            )
          : null,
      min =
        zoom && zoom.hasAttribute('min')
          ? parseInt(zoom.getAttribute('min'))
          : this._map.getMinZoom(),
      max =
        zoom && zoom.hasAttribute('max')
          ? parseInt(zoom.getAttribute('max'))
          : this._map.getMaxZoom();
    if (zoom) {
      for (let i = 1; i < this._properties._mapExtents.length; i++) {
        zoom = this._properties._mapExtents[i].querySelector(
          'map-input[type=zoom]'
        );
        if (zoom && zoom.hasAttribute('min')) {
          min = Math.min(parseInt(zoom.getAttribute('min')), min);
        }
        if (zoom && zoom.hasAttribute('max')) {
          max = Math.max(parseInt(zoom.getAttribute('max')), max);
        }
      }
    }
    var canZoom =
      (toZoom < min && this._properties.zoomout) ||
      (toZoom > max && this._properties.zoomin);
    if (!(min <= toZoom && toZoom <= max)) {
      if (this._properties.zoomin && toZoom > max) {
        // this._href is the 'original' url from which this layer came
        // since we are following a zoom link we will be getting a new
        // layer almost, resetting child content as appropriate
        this._href = this._properties.zoomin;
        this._layerEl.src = this._properties.zoomin;
        // this.href is the "public" property. When a dynamic layer is
        // accessed, this value changes with every new extent received
        this.href = this._properties.zoomin;
        this._layerEl.src = this._properties.zoomin;
      } else if (this._properties.zoomout && toZoom < min) {
        this._href = this._properties.zoomout;
        this.href = this._properties.zoomout;
        this._layerEl.src = this._properties.zoomout;
      }
    }
    if (this._templatedLayer && canZoom) {
      // get the new extent
      //this._initExtent();
    }
  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    if (this._staticTileLayer) map.removeLayer(this._staticTileLayer);
    if (this._mapmlvectors) map.removeLayer(this._mapmlvectors);
    if (this._imageLayer) map.removeLayer(this._imageLayer);
    if (this._properties && this._properties._mapExtents)
      this._removeExtents(map);

    map.fire('checkdisabled');
    map.off('popupopen', this._attachSkipButtons);
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  getLayerUserControlsHTML: function () {
    return this._mapmlLayerItem
      ? this._mapmlLayerItem
      : this._createLayerControlHTML();
  },
  _createLayerControlHTML: function () {
    if (!this._mapmlLayerItem) {
      var fieldset = L.DomUtil.create('fieldset', 'mapml-layer-item'),
        input = L.DomUtil.create('input'),
        layerItemName = L.DomUtil.create('span', 'mapml-layer-item-name'),
        settingsButtonNameIcon = L.DomUtil.create('span'),
        layerItemProperty = L.DomUtil.create(
          'div',
          'mapml-layer-item-properties',
          fieldset
        ),
        layerItemSettings = L.DomUtil.create(
          'div',
          'mapml-layer-item-settings',
          fieldset
        ),
        itemToggleLabel = L.DomUtil.create(
          'label',
          'mapml-layer-item-toggle',
          layerItemProperty
        ),
        layerItemControls = L.DomUtil.create(
          'div',
          'mapml-layer-item-controls',
          layerItemProperty
        ),
        opacityControl = L.DomUtil.create(
          'details',
          'mapml-layer-item-opacity mapml-control-layers',
          layerItemSettings
        ),
        opacity = L.DomUtil.create('input'),
        opacityControlSummary = L.DomUtil.create('summary'),
        svgSettingsControlIcon = L.SVG.create('svg'),
        settingsControlPath1 = L.SVG.create('path'),
        settingsControlPath2 = L.SVG.create('path'),
        extentsFieldset = L.DomUtil.create(
          'fieldset',
          'mapml-layer-grouped-extents'
        ),
        mapEl = this._layerEl.parentNode;
      this.opacityEl = opacity;
      this._mapmlLayerItem = fieldset;

      // append the paths in svg for the remove layer and toggle icons
      svgSettingsControlIcon.setAttribute('viewBox', '0 0 24 24');
      svgSettingsControlIcon.setAttribute('height', '22');
      svgSettingsControlIcon.setAttribute('width', '22');
      svgSettingsControlIcon.setAttribute('fill', 'currentColor');
      settingsControlPath1.setAttribute('d', 'M0 0h24v24H0z');
      settingsControlPath1.setAttribute('fill', 'none');
      settingsControlPath2.setAttribute(
        'd',
        'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
      );
      svgSettingsControlIcon.appendChild(settingsControlPath1);
      svgSettingsControlIcon.appendChild(settingsControlPath2);

      layerItemSettings.hidden = true;
      settingsButtonNameIcon.setAttribute('aria-hidden', true);

      let removeControlButton = L.DomUtil.create(
        'button',
        'mapml-layer-item-remove-control',
        layerItemControls
      );
      removeControlButton.type = 'button';
      removeControlButton.title = 'Remove Layer';
      removeControlButton.innerHTML =
        "<span aria-hidden='true'>&#10005;</span>";
      removeControlButton.classList.add('mapml-button');
      //L.DomEvent.disableClickPropagation(removeControlButton);
      L.DomEvent.on(removeControlButton, 'click', L.DomEvent.stop);
      L.DomEvent.on(
        removeControlButton,
        'click',
        (e) => {
          let fieldset = 0,
            elem,
            root;
          root =
            mapEl.tagName === 'MAPML-VIEWER'
              ? mapEl.shadowRoot
              : mapEl.querySelector('.mapml-web-map').shadowRoot;
          if (
            e.target.closest('fieldset').nextElementSibling &&
            !e.target.closest('fieldset').nextElementSibling.disbaled
          ) {
            elem = e.target.closest('fieldset').previousElementSibling;
            while (elem) {
              fieldset += 2; // find the next layer menu item
              elem = elem.previousElementSibling;
            }
          } else {
            // focus on the link
            elem = 'link';
          }
          mapEl.removeChild(
            e.target.closest('fieldset').querySelector('span').layer._layerEl
          );
          elem = elem
            ? root.querySelector('.leaflet-control-attribution')
                .firstElementChild
            : (elem = root.querySelectorAll('input')[fieldset]);
          elem.focus();
        },
        this
      );

      let itemSettingControlButton = L.DomUtil.create(
        'button',
        'mapml-layer-item-settings-control',
        layerItemControls
      );
      itemSettingControlButton.type = 'button';
      itemSettingControlButton.title = 'Layer Settings';
      itemSettingControlButton.setAttribute('aria-expanded', false);
      itemSettingControlButton.classList.add('mapml-button');
      L.DomEvent.on(
        itemSettingControlButton,
        'click',
        (e) => {
          let layerControl = this._layerEl._layerControl._container;
          if (!layerControl._isExpanded && e.pointerType === 'touch') {
            layerControl._isExpanded = true;
            return;
          }
          if (layerItemSettings.hidden === true) {
            itemSettingControlButton.setAttribute('aria-expanded', true);
            layerItemSettings.hidden = false;
          } else {
            itemSettingControlButton.setAttribute('aria-expanded', false);
            layerItemSettings.hidden = true;
          }
        },
        this
      );

      input.defaultChecked = this._map ? true : false;
      input.type = 'checkbox';
      input.setAttribute('class', 'leaflet-control-layers-selector');
      layerItemName.layer = this;

      if (this._legendUrl) {
        var legendLink = document.createElement('a');
        legendLink.text = ' ' + this._title;
        legendLink.href = this._legendUrl;
        legendLink.target = '_blank';
        legendLink.draggable = false;
        layerItemName.appendChild(legendLink);
      } else {
        layerItemName.innerHTML = this._title;
      }
      layerItemName.id =
        'mapml-layer-item-name-{' + L.stamp(layerItemName) + '}';
      opacityControlSummary.innerText = 'Opacity';
      opacityControlSummary.id =
        'mapml-layer-item-opacity-' + L.stamp(opacityControlSummary);
      opacityControl.appendChild(opacityControlSummary);
      opacityControl.appendChild(opacity);
      opacity.setAttribute('type', 'range');
      opacity.setAttribute('min', '0');
      opacity.setAttribute('max', '1.0');
      opacity.setAttribute('value', this._container.style.opacity || '1.0');
      opacity.setAttribute('step', '0.1');
      opacity.setAttribute('aria-labelledby', opacityControlSummary.id);
      opacity.value = this._container.style.opacity || '1.0';

      fieldset.setAttribute('aria-grabbed', 'false');
      fieldset.setAttribute('aria-labelledby', layerItemName.id);

      fieldset.ontouchstart = fieldset.onmousedown = (downEvent) => {
        if (
          (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
            downEvent.target.tagName.toLowerCase() !== 'input') ||
          downEvent.target.tagName.toLowerCase() === 'label'
        ) {
          downEvent =
            downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;
          let control = fieldset,
            controls = fieldset.parentNode,
            moving = false,
            yPos = downEvent.clientY;

          document.body.ontouchmove = document.body.onmousemove = (
            moveEvent
          ) => {
            moveEvent.preventDefault();
            moveEvent =
              moveEvent instanceof TouchEvent
                ? moveEvent.touches[0]
                : moveEvent;

            // Fixes flickering by only moving element when there is enough space
            let offset = moveEvent.clientY - yPos;
            moving = Math.abs(offset) > 5 || moving;
            if (
              (controls && !moving) ||
              (controls && controls.childElementCount <= 1) ||
              controls.getBoundingClientRect().top >
                control.getBoundingClientRect().bottom ||
              controls.getBoundingClientRect().bottom <
                control.getBoundingClientRect().top
            ) {
              return;
            }

            controls.classList.add('mapml-draggable');
            control.style.transform = 'translateY(' + offset + 'px)';
            control.style.pointerEvents = 'none';

            let x = moveEvent.clientX,
              y = moveEvent.clientY,
              root =
                mapEl.tagName === 'MAPML-VIEWER'
                  ? mapEl.shadowRoot
                  : mapEl.querySelector('.mapml-web-map').shadowRoot,
              elementAt = root.elementFromPoint(x, y),
              swapControl =
                !elementAt || !elementAt.closest('fieldset')
                  ? control
                  : elementAt.closest('fieldset');

            swapControl =
              Math.abs(offset) <= swapControl.offsetHeight
                ? control
                : swapControl;

            control.setAttribute('aria-grabbed', 'true');
            control.setAttribute('aria-dropeffect', 'move');
            if (swapControl && controls === swapControl.parentNode) {
              swapControl =
                swapControl !== control.nextSibling
                  ? swapControl
                  : swapControl.nextSibling;
              if (control !== swapControl) {
                yPos = moveEvent.clientY;
                control.style.transform = null;
              }
              controls.insertBefore(control, swapControl);
            }
          };

          document.body.ontouchend = document.body.onmouseup = () => {
            control.setAttribute('aria-grabbed', 'false');
            control.removeAttribute('aria-dropeffect');
            control.style.pointerEvents = null;
            control.style.transform = null;
            let controlsElems = controls.children,
              zIndex = 1;
            // re-order layer elements DOM order
            for (let c of controlsElems) {
              let layerEl = c.querySelector('span').layer._layerEl;
              layerEl.setAttribute('data-moving', '');
              mapEl.insertAdjacentElement('beforeend', layerEl);
              layerEl.removeAttribute('data-moving');
            }
            // update zIndex of all layer- elements
            let layers = mapEl.querySelectorAll('layer-');
            for (let i = 0; i < layers.length; i++) {
              let layer = layers[i]._layer;
              if (layer.options.zIndex !== zIndex) {
                layer.setZIndex(zIndex);
              }
              zIndex++;
            }
            controls.classList.remove('mapml-draggable');
            document.body.ontouchmove =
              document.body.onmousemove =
              document.body.onmouseup =
                null;
          };
        }
      };

      L.DomEvent.on(opacity, 'change', this._changeOpacity, this);

      itemToggleLabel.appendChild(input);
      itemToggleLabel.appendChild(layerItemName);
      itemSettingControlButton.appendChild(settingsButtonNameIcon);
      settingsButtonNameIcon.appendChild(svgSettingsControlIcon);

      if (this._styles) {
        layerItemSettings.appendChild(this._styles);
      }

      if (this._userInputs) {
        var frag = document.createDocumentFragment();
        var templates = this._properties._templateVars;
        if (templates) {
          for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            for (var j = 0; j < template.values.length; j++) {
              var mapmlInput = template.values[j],
                id = '#' + mapmlInput.getAttribute('id');
              // don't add it again if it is referenced > once
              if (
                mapmlInput.tagName.toLowerCase() === 'map-select' &&
                !frag.querySelector(id)
              ) {
                // generate a <details><summary></summary><select...></details>
                var selectdetails = L.DomUtil.create(
                    'details',
                    'mapml-layer-item-time mapml-control-layers',
                    frag
                  ),
                  selectsummary = L.DomUtil.create('summary'),
                  selectSummaryLabel = L.DomUtil.create('label');
                selectSummaryLabel.innerText = mapmlInput.getAttribute('name');
                selectSummaryLabel.setAttribute(
                  'for',
                  mapmlInput.getAttribute('id')
                );
                selectsummary.appendChild(selectSummaryLabel);
                selectdetails.appendChild(selectsummary);
                selectdetails.appendChild(mapmlInput.htmlselect);
              }
            }
          }
        }
        layerItemSettings.appendChild(frag);
      }

      // if there are extents, add them to the layer control
      if (this._properties && this._properties._mapExtents) {
        var allHidden = true;
        this._layerItemSettingsHTML = layerItemSettings;
        this._propertiesGroupAnatomy = extentsFieldset;
        extentsFieldset.setAttribute('aria-label', 'Sublayers');
        for (let j = 0; j < this._properties._mapExtents.length; j++) {
          extentsFieldset.appendChild(
            this._properties._mapExtents[j].extentAnatomy
          );
          if (!this._properties._mapExtents[j].hidden) allHidden = false;
        }
        if (!allHidden) layerItemSettings.appendChild(extentsFieldset);
      }
    }
    return this._mapmlLayerItem;
  },
  getBase: function () {
    return new URL(
      this._content.querySelector('map-base')
        ? this._content.querySelector('map-base').getAttribute('href')
        : this._content.nodeName === 'LAYER-'
        ? this._content.baseURI
        : this._href,
      this._href
    ).href;
  },
  _initialize: function (content) {
    if (!this._href && !content) {
      return;
    }
    var layer = this;
    // the this._href (comes from layer@src) should take precedence over
    // content of the <layer> element, but if no this._href / src is provided
    // but there *is* child content of the <layer> element (which is copied/
    // referred to by this._content), we should use that content.
    _processContent.call(this, content, this._href ? false : true);
    function _processContent(mapml, local) {
      var base = new URL(
        mapml.querySelector('map-base')
          ? mapml.querySelector('map-base').getAttribute('href')
          : local
          ? mapml.baseURI
          : layer._href,
        layer._href
      ).href;
      layer._properties = {};
      // sets layer._properties.projection
      determineLayerProjection();
      // requires that layer._properties.projection be set
      if (selectMatchingAlternateProjection()) return;
      // set layer._properties._mapExtents and layer._properties._templateVars
      if (layer._properties.crs) processExtents();
      layer._styles = getAlternateStyles();
      parseLicenseAndLegend();
      setLayerTitle();
      setZoomInOrOutLinks();
      // crs is only set if the layer has the same projection as the map
      if (layer._properties.crs) processTiles();
      processFeatures();
      M._parseStylesheetAsHTML(mapml, base, layer._container);
      layer._validateExtent();
      copyRemoteContentToShadowRoot();
      // update controls if needed based on mapml-viewer controls/controlslist attribute
      if (layer._layerEl.parentElement) {
        // if layer does not have a parent Element, do not need to set Controls
        layer._layerEl.parentElement._toggleControls();
      }
      // local functions
      // sets layer._properties.projection.  Supposed to replace / simplify
      // the dependencies on convoluted getProjection() interface, but doesn't quite
      // succeed, yet.
      function determineLayerProjection() {
        let projection = layer.options.mapprojection;
        if (mapml.querySelector('map-meta[name=projection][content]')) {
          projection =
            M._metaContentToObject(
              mapml
                .querySelector('map-meta[name=projection]')
                .getAttribute('content')
            ).content || projection;
        } else if (mapml.querySelector('map-extent[units]')) {
          const getProjectionFrom = (extents) => {
            let extentProj = extents[0].attributes.units.value;
            let isMatch = true;
            for (let i = 0; i < extents.length; i++) {
              if (extentProj !== extents[i].attributes.units.value) {
                isMatch = false;
              }
            }
            return isMatch ? extentProj : null;
          };
          projection =
            getProjectionFrom(
              Array.from(mapml.querySelectorAll('map-extent[units]'))
            ) || projection;
        } else {
          console.log(
            `A projection was not assigned to the '${layer._layerEl.label}' Layer. Please specify a projection for that layer using a map-meta element. See more here - https://maps4html.org/web-map-doc/docs/elements/meta/`
          );
        }
        layer._properties.projection = projection;
        if (layer._properties.projection === layer.options.mapprojection) {
          layer._properties.crs = M[layer._properties.projection];
        }
      }
      // determine if, where there's no match of the current layer's projection
      // and that of the map, if there is a linked alternate text/mapml
      // resource that matches the map's projection
      function selectMatchingAlternateProjection() {
        let selectedAlternate =
          layer._properties.projection !== layer.options.mapprojection &&
          mapml.querySelector(
            'map-head map-link[rel=alternate][projection=' +
              layer.options.mapprojection +
              '][href]'
          );
        try {
          if (selectedAlternate) {
            let url = new URL(selectedAlternate.getAttribute('href'), base)
              .href;
            layer._layerEl.dispatchEvent(
              new CustomEvent('changeprojection', {
                detail: {
                  href: url
                }
              })
            );
            return true;
            //if this is the only layer, but the projection doesn't match,
            // set the map's projection to that of the layer
          } else if (
            layer._properties.projection !== layer.options.mapprojection &&
            layer._layerEl.parentElement.layers.length === 1
          ) {
            layer._layerEl.parentElement.projection =
              layer._properties.projection;
            return true;
          }
        } catch (error) {}
        return false;
      }
      // initialize layer._properties._mapExtents (and associated/derived/convenience property _templateVars
      function processExtents() {
        let projectionMatch =
          layer._properties.projection === layer.options.mapprojection;
        let extents = mapml.querySelectorAll('map-extent[units]');
        if (extents.length === 0) {
          return;
        }
        layer._properties._mapExtents = []; // stores all the map-extent elements in the layer
        layer._properties._templateVars = []; // stores all template variables coming from all extents
        for (let j = 0; j < extents.length; j++) {
          if (
            extents[j].querySelector(
              'map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]'
            )
          ) {
            extents[j]._templateVars = _initTemplateVars.call(
              layer,
              extents[j],
              mapml.querySelector('map-meta[name=extent]'),
              layer._properties.projection,
              mapml,
              base,
              projectionMatch
            );
            extents[j].extentAnatomy = createLayerControlExtentHTML.call(
              layer,
              extents[j]
            );
            layer._properties._mapExtents.push(extents[j]);
            // get rid of layer._properties._templateVars, TBD.
            layer._properties._templateVars =
              layer._properties._templateVars.concat(extents[j]._templateVars);
          }
        }
      }
      function createLayerControlExtentHTML(mapExtent) {
        var extent = L.DomUtil.create('fieldset', 'mapml-layer-extent'),
          extentProperties = L.DomUtil.create(
            'div',
            'mapml-layer-item-properties',
            extent
          ),
          extentSettings = L.DomUtil.create(
            'div',
            'mapml-layer-item-settings',
            extent
          ),
          extentLabel = L.DomUtil.create(
            'label',
            'mapml-layer-item-toggle',
            extentProperties
          ),
          input = L.DomUtil.create('input'),
          svgExtentControlIcon = L.SVG.create('svg'),
          extentControlPath1 = L.SVG.create('path'),
          extentControlPath2 = L.SVG.create('path'),
          extentNameIcon = L.DomUtil.create('span'),
          extentItemControls = L.DomUtil.create(
            'div',
            'mapml-layer-item-controls',
            extentProperties
          ),
          opacityControl = L.DomUtil.create(
            'details',
            'mapml-layer-item-opacity',
            extentSettings
          ),
          extentOpacitySummary = L.DomUtil.create(
            'summary',
            '',
            opacityControl
          ),
          mapEl = this._layerEl.parentNode,
          layerEl = this._layerEl,
          opacity = L.DomUtil.create('input', '', opacityControl);
        extentSettings.hidden = true;
        extent.setAttribute('aria-grabbed', 'false');
        if (!mapExtent.hasAttribute('label')) {
          // if a label attribute is not present, set it to hidden in layer control
          extent.setAttribute('hidden', '');
          mapExtent.hidden = true;
        }

        // append the svg paths
        svgExtentControlIcon.setAttribute('viewBox', '0 0 24 24');
        svgExtentControlIcon.setAttribute('height', '22');
        svgExtentControlIcon.setAttribute('width', '22');
        extentControlPath1.setAttribute('d', 'M0 0h24v24H0z');
        extentControlPath1.setAttribute('fill', 'none');
        extentControlPath2.setAttribute(
          'd',
          'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
        );
        svgExtentControlIcon.appendChild(extentControlPath1);
        svgExtentControlIcon.appendChild(extentControlPath2);

        let removeExtentButton = L.DomUtil.create(
          'button',
          'mapml-layer-item-remove-control',
          extentItemControls
        );
        removeExtentButton.type = 'button';
        removeExtentButton.title = 'Remove Sub Layer';
        removeExtentButton.innerHTML =
          "<span aria-hidden='true'>&#10005;</span>";
        removeExtentButton.classList.add('mapml-button');
        L.DomEvent.on(removeExtentButton, 'click', L.DomEvent.stop);
        L.DomEvent.on(
          removeExtentButton,
          'click',
          (e) => {
            let allRemoved = true;
            e.target.checked = false;
            mapExtent.removed = true;
            mapExtent.checked = false;
            if (this._layerEl.checked) this._changeExtent(e, mapExtent);
            mapExtent.extentAnatomy.parentNode.removeChild(
              mapExtent.extentAnatomy
            );
            for (let j = 0; j < this._properties._mapExtents.length; j++) {
              if (!this._properties._mapExtents[j].removed) allRemoved = false;
            }
            if (allRemoved)
              this._layerItemSettingsHTML.removeChild(
                this._propertiesGroupAnatomy
              );
          },
          this
        );

        let extentsettingsButton = L.DomUtil.create(
          'button',
          'mapml-layer-item-settings-control',
          extentItemControls
        );
        extentsettingsButton.type = 'button';
        extentsettingsButton.title = 'Extent Settings';
        extentsettingsButton.setAttribute('aria-expanded', false);
        extentsettingsButton.classList.add('mapml-button');
        L.DomEvent.on(
          extentsettingsButton,
          'click',
          (e) => {
            if (extentSettings.hidden === true) {
              extentsettingsButton.setAttribute('aria-expanded', true);
              extentSettings.hidden = false;
            } else {
              extentsettingsButton.setAttribute('aria-expanded', false);
              extentSettings.hidden = true;
            }
          },
          this
        );

        extentNameIcon.setAttribute('aria-hidden', true);
        extentLabel.appendChild(input);
        extentsettingsButton.appendChild(extentNameIcon);
        extentNameIcon.appendChild(svgExtentControlIcon);
        extentOpacitySummary.innerText = 'Opacity';
        extentOpacitySummary.id =
          'mapml-layer-item-opacity-' + L.stamp(extentOpacitySummary);
        opacity.setAttribute('type', 'range');
        opacity.setAttribute('min', '0');
        opacity.setAttribute('max', '1.0');
        opacity.setAttribute('step', '0.1');
        opacity.setAttribute(
          'aria-labelledby',
          'mapml-layer-item-opacity-' + L.stamp(extentOpacitySummary)
        );
        let opacityValue = mapExtent.hasAttribute('opacity')
          ? mapExtent.getAttribute('opacity')
          : '1.0';
        mapExtent._templateVars.opacity = opacityValue;
        opacity.setAttribute('value', opacityValue);
        opacity.value = opacityValue;
        L.DomEvent.on(opacity, 'change', this._changeExtentOpacity, mapExtent);

        var extentItemNameSpan = L.DomUtil.create(
          'span',
          'mapml-layer-item-name',
          extentLabel
        );
        input.defaultChecked = mapExtent ? true : false;
        mapExtent.checked = input.defaultChecked;
        input.type = 'checkbox';
        extentItemNameSpan.innerHTML = mapExtent.getAttribute('label');
        L.DomEvent.on(input, 'change', (e) => {
          this._changeExtent(e, mapExtent);
        });
        extentItemNameSpan.id =
          'mapml-extent-item-name-{' + L.stamp(extentItemNameSpan) + '}';
        extent.setAttribute('aria-labelledby', extentItemNameSpan.id);
        extentItemNameSpan.extent = mapExtent;

        extent.ontouchstart = extent.onmousedown = (downEvent) => {
          if (
            (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
              downEvent.target.tagName.toLowerCase() !== 'input') ||
            downEvent.target.tagName.toLowerCase() === 'label'
          ) {
            downEvent.stopPropagation();
            downEvent =
              downEvent instanceof TouchEvent
                ? downEvent.touches[0]
                : downEvent;

            let control = extent,
              controls = extent.parentNode,
              moving = false,
              yPos = downEvent.clientY;

            document.body.ontouchmove = document.body.onmousemove = (
              moveEvent
            ) => {
              moveEvent.preventDefault();
              moveEvent =
                moveEvent instanceof TouchEvent
                  ? moveEvent.touches[0]
                  : moveEvent;

              // Fixes flickering by only moving element when there is enough space
              let offset = moveEvent.clientY - yPos;
              moving = Math.abs(offset) > 5 || moving;
              if (
                (controls && !moving) ||
                (controls && controls.childElementCount <= 1) ||
                controls.getBoundingClientRect().top >
                  control.getBoundingClientRect().bottom ||
                controls.getBoundingClientRect().bottom <
                  control.getBoundingClientRect().top
              ) {
                return;
              }

              controls.classList.add('mapml-draggable');
              control.style.transform = 'translateY(' + offset + 'px)';
              control.style.pointerEvents = 'none';

              let x = moveEvent.clientX,
                y = moveEvent.clientY,
                root =
                  mapEl.tagName === 'MAPML-VIEWER'
                    ? mapEl.shadowRoot
                    : mapEl.querySelector('.mapml-web-map').shadowRoot,
                elementAt = root.elementFromPoint(x, y),
                swapControl =
                  !elementAt || !elementAt.closest('fieldset')
                    ? control
                    : elementAt.closest('fieldset');

              swapControl =
                Math.abs(offset) <= swapControl.offsetHeight
                  ? control
                  : swapControl;

              control.setAttribute('aria-grabbed', 'true');
              control.setAttribute('aria-dropeffect', 'move');
              if (swapControl && controls === swapControl.parentNode) {
                swapControl =
                  swapControl !== control.nextSibling
                    ? swapControl
                    : swapControl.nextSibling;
                if (control !== swapControl) {
                  yPos = moveEvent.clientY;
                  control.style.transform = null;
                }
                controls.insertBefore(control, swapControl);
              }
            };

            document.body.ontouchend = document.body.onmouseup = () => {
              control.setAttribute('aria-grabbed', 'false');
              control.removeAttribute('aria-dropeffect');
              control.style.pointerEvents = null;
              control.style.transform = null;
              let controlsElems = controls.children,
                zIndex = 0;
              for (let c of controlsElems) {
                let extentEl = c.querySelector('span').extent;

                extentEl.setAttribute('data-moving', '');
                layerEl.insertAdjacentElement('beforeend', extentEl);
                extentEl.removeAttribute('data-moving');

                extentEl.extentZIndex = zIndex;
                extentEl.templatedLayer.setZIndex(zIndex);
                zIndex++;
              }
              controls.classList.remove('mapml-draggable');
              document.body.ontouchmove =
                document.body.onmousemove =
                document.body.ontouchend =
                document.body.onmouseup =
                  null;
            };
          }
        };
        return extent;
      }
      function _initTemplateVars(
        serverExtent,
        metaExtent,
        projection,
        mapml,
        base,
        projectionMatch
      ) {
        var templateVars = [];
        // set up the URL template and associated inputs (which yield variable values when processed)
        var tlist = serverExtent.querySelectorAll(
            'map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]'
          ),
          varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g'),
          zoomInput = serverExtent.querySelector('map-input[type="zoom" i]'),
          includesZoom = false,
          extentFallback = {};

        extentFallback.zoom = 0;
        if (metaExtent) {
          let content = M._metaContentToObject(
              metaExtent.getAttribute('content')
            ),
            cs;

          extentFallback.zoom = content.zoom || extentFallback.zoom;

          let metaKeys = Object.keys(content);
          for (let i = 0; i < metaKeys.length; i++) {
            if (!metaKeys[i].includes('zoom')) {
              cs = M.axisToCS(metaKeys[i].split('-')[2]);
              break;
            }
          }
          let axes = M.csToAxes(cs);
          extentFallback.bounds = M.boundsToPCRSBounds(
            L.bounds(
              L.point(
                +content[`top-left-${axes[0]}`],
                +content[`top-left-${axes[1]}`]
              ),
              L.point(
                +content[`bottom-right-${axes[0]}`],
                +content[`bottom-right-${axes[1]}`]
              )
            ),
            extentFallback.zoom,
            projection,
            cs
          );
        } else {
          // for custom projections, M[projection] may not be loaded, so uses M['OSMTILE'] as backup, this code will need to get rerun once projection is changed and M[projection] is available
          // TODO: This is a temporary fix, _initTemplateVars (or processinitialextent) should not be called when projection of the layer and map do not match, this should be called/reinitialized once the layer projection matches with the map projection
          let fallbackProjection = M[projection] || M.OSMTILE;
          extentFallback.bounds = fallbackProjection.options.crs.pcrs.bounds;
        }

        for (var i = 0; i < tlist.length; i++) {
          var t = tlist[i],
            template = t.getAttribute('tref');
          t.zoomInput = zoomInput;
          if (!template) {
            template = BLANK_TT_TREF;
            let blankInputs = mapml.querySelectorAll('map-input');
            for (let i of blankInputs) {
              template += `{${i.getAttribute('name')}}`;
            }
          }

          var v,
            title = t.hasAttribute('title')
              ? t.getAttribute('title')
              : 'Query this layer',
            vcount = template.match(varNamesRe),
            trel =
              !t.hasAttribute('rel') ||
              t.getAttribute('rel').toLowerCase() === 'tile'
                ? 'tile'
                : t.getAttribute('rel').toLowerCase(),
            ttype = !t.hasAttribute('type')
              ? 'image/*'
              : t.getAttribute('type').toLowerCase(),
            inputs = [],
            tms = t && t.hasAttribute('tms');
          var zoomBounds = mapml.querySelector('map-meta[name=zoom]')
            ? M._metaContentToObject(
                mapml
                  .querySelector('map-meta[name=zoom]')
                  .getAttribute('content')
              )
            : undefined;
          while ((v = varNamesRe.exec(template)) !== null) {
            var varName = v[1],
              inp = serverExtent.querySelector(
                'map-input[name=' +
                  varName +
                  '],map-select[name=' +
                  varName +
                  ']'
              );
            if (inp) {
              if (
                inp.hasAttribute('type') &&
                inp.getAttribute('type') === 'location' &&
                (!inp.hasAttribute('min') || !inp.hasAttribute('max')) &&
                inp.hasAttribute('axis') &&
                !['i', 'j'].includes(inp.getAttribute('axis').toLowerCase())
              ) {
                if (
                  zoomInput &&
                  template.includes(`{${zoomInput.getAttribute('name')}}`)
                ) {
                  zoomInput.setAttribute('value', extentFallback.zoom);
                }
                let axis = inp.getAttribute('axis'),
                  axisBounds = M.convertPCRSBounds(
                    extentFallback.bounds,
                    extentFallback.zoom,
                    projection,
                    M.axisToCS(axis)
                  );
                inp.setAttribute('min', axisBounds.min[M.axisToXY(axis)]);
                inp.setAttribute('max', axisBounds.max[M.axisToXY(axis)]);
              }

              inputs.push(inp);
              includesZoom =
                includesZoom ||
                (inp.hasAttribute('type') &&
                  inp.getAttribute('type').toLowerCase() === 'zoom');
              if (inp.tagName.toLowerCase() === 'map-select') {
                // use a throwaway div to parse the input from MapML into HTML
                var div = document.createElement('div');
                div.insertAdjacentHTML('afterbegin', inp.outerHTML);
                // parse
                inp.htmlselect = div.querySelector('map-select');
                inp.htmlselect = transcribe(inp.htmlselect);

                // this goes into the layer control, so add a listener
                L.DomEvent.on(inp.htmlselect, 'change', layer.redraw, layer);
                if (!layer._userInputs) {
                  layer._userInputs = [];
                }
                layer._userInputs.push(inp.htmlselect);
              }
              // TODO: if this is an input@type=location
              // get the TCRS min,max attribute values at the identified zoom level
              // save this information as properties of the serverExtent,
              // perhaps as a bounds object so that it can be easily used
              // later by the layer control to determine when to enable
              // disable the layer for drawing.
            } else {
              console.log(
                'input with name=' +
                  varName +
                  ' not found for template variable of same name'
              );
              // no match found, template won't be used
              break;
            }
          }
          if (
            (template && vcount.length === inputs.length) ||
            template === BLANK_TT_TREF
          ) {
            if (trel === 'query') {
              layer.queryable = true;
            }
            if (!includesZoom && zoomInput) {
              inputs.push(zoomInput);
            }
            let step = zoomInput ? zoomInput.getAttribute('step') : 1;
            if (!step || step === '0' || isNaN(step)) step = 1;
            // template has a matching input for every variable reference {varref}
            templateVars.push({
              template: decodeURI(new URL(template, base)),
              linkEl: t,
              title: title,
              rel: trel,
              type: ttype,
              values: inputs,
              zoomBounds: zoomBounds,
              extentPCRSFallback: { bounds: extentFallback.bounds },
              projectionMatch: projectionMatch,
              projection:
                serverExtent.getAttribute('units') || FALLBACK_PROJECTION,
              tms: tms,
              step: step
            });
          }
        }
        return templateVars;
      }
      function transcribe(element) {
        var select = document.createElement('select');
        var elementAttrNames = element.getAttributeNames();

        for (let i = 0; i < elementAttrNames.length; i++) {
          select.setAttribute(
            elementAttrNames[i],
            element.getAttribute(elementAttrNames[i])
          );
        }

        var options = element.children;

        for (let i = 0; i < options.length; i++) {
          var option = document.createElement('option');
          var optionAttrNames = options[i].getAttributeNames();

          for (let j = 0; j < optionAttrNames.length; j++) {
            option.setAttribute(
              optionAttrNames[j],
              options[i].getAttribute(optionAttrNames[j])
            );
          }

          option.innerHTML = options[i].innerHTML;
          select.appendChild(option);
        }
        return select;
      }
      function setZoomInOrOutLinks() {
        var zoomin = mapml.querySelector('map-link[rel=zoomin]'),
          zoomout = mapml.querySelector('map-link[rel=zoomout]');
        if (zoomin) {
          layer._properties.zoomin = new URL(
            zoomin.getAttribute('href'),
            base
          ).href;
        }
        if (zoomout) {
          layer._properties.zoomout = new URL(
            zoomout.getAttribute('href'),
            base
          ).href;
        }
      }
      function processFeatures() {
        let native = M.getNativeVariables(layer._content);
        layer._mapmlvectors = M.featureLayer(null, {
          // pass the vector layer a renderer of its own, otherwise leaflet
          // puts everything into the overlayPane
          renderer: M.featureRenderer(),
          // pass the vector layer the container for the parent into which
          // it will append its own container for rendering into
          pane: layer._container,
          opacity: layer.options.opacity,
          projection: layer._properties.projection,
          // by NOT passing options.extent, we are asking the FeatureLayer
          // to dynamically update its .layerBounds property as features are
          // added or removed from it
          native: native,
          // each owned child layer gets a reference to the root layer
          _leafletLayer: layer,
          static: true,
          onEachFeature: function (properties, geometry) {
            // need to parse as HTML to preserve semantics and styles
            if (properties) {
              var c = document.createElement('div');
              c.classList.add('mapml-popup-content');
              c.insertAdjacentHTML('afterbegin', properties.innerHTML);
              geometry.bindPopup(c, { autoClose: false, minWidth: 165 });
            }
          }
        });
      }
      function processTiles() {
        if (mapml.querySelector('map-tile')) {
          var tiles = document.createElement('map-tiles'),
            zoom =
              mapml.querySelector('map-meta[name=zoom][content]') ||
              mapml.querySelector('map-input[type=zoom][value]');
          tiles.setAttribute(
            'zoom',
            (zoom && zoom.getAttribute('content')) ||
              (zoom && zoom.getAttribute('value')) ||
              '0'
          );
          var newTiles = mapml.getElementsByTagName('map-tile');
          for (var nt = 0; nt < newTiles.length; nt++) {
            tiles.appendChild(document.importNode(newTiles[nt], true));
          }
          layer._mapmlTileContainer.appendChild(tiles);
          layer._staticTileLayer = M.staticTileLayer({
            pane: layer._container,
            _leafletLayer: layer,
            projection: layer._properties.projection,
            className: 'mapml-static-tile-layer',
            tileContainer: layer._mapmlTileContainer,
            maxZoomBound: layer._properties.crs.options.resolutions.length - 1,
            tileSize: layer._properties.crs.options.crs.tile.bounds.max.x
          });
        }
      }
      function getAlternateStyles() {
        var styleLinks = mapml.querySelectorAll(
          'map-link[rel=style],map-link[rel="self style"],map-link[rel="style self"]'
        );
        if (styleLinks.length > 1) {
          var stylesControl = document.createElement('details'),
            stylesControlSummary = document.createElement('summary');
          stylesControlSummary.innerText = 'Style';
          stylesControl.appendChild(stylesControlSummary);

          var changeStyle = function (e) {
            L.DomEvent.stop(e);
            layer._layerEl.dispatchEvent(
              new CustomEvent('changestyle', {
                detail: {
                  src: e.target.getAttribute('data-href')
                }
              })
            );
          };

          for (var j = 0; j < styleLinks.length; j++) {
            var styleOption = document.createElement('div'),
              styleOptionInput = styleOption.appendChild(
                document.createElement('input')
              );
            styleOptionInput.setAttribute('type', 'radio');
            styleOptionInput.setAttribute(
              'id',
              'rad-' + L.stamp(styleOptionInput)
            );
            styleOptionInput.setAttribute('name', 'styles-' + layer._title);
            styleOptionInput.setAttribute(
              'value',
              styleLinks[j].getAttribute('title')
            );
            styleOptionInput.setAttribute(
              'data-href',
              new URL(styleLinks[j].getAttribute('href'), base).href
            );
            var styleOptionLabel = styleOption.appendChild(
              document.createElement('label')
            );
            styleOptionLabel.setAttribute(
              'for',
              'rad-' + L.stamp(styleOptionInput)
            );
            styleOptionLabel.innerText = styleLinks[j].getAttribute('title');
            if (
              styleLinks[j].getAttribute('rel') === 'style self' ||
              styleLinks[j].getAttribute('rel') === 'self style'
            ) {
              styleOptionInput.checked = true;
            }
            stylesControl.appendChild(styleOption);
            L.DomUtil.addClass(
              stylesControl,
              'mapml-layer-item-style mapml-control-layers'
            );
            L.DomEvent.on(styleOptionInput, 'click', changeStyle, layer);
          }
          return stylesControl;
        }
      }
      function setLayerTitle() {
        if (mapml.querySelector('map-title')) {
          layer._title = mapml.querySelector('map-title').textContent.trim();
          layer._titleIsReadOnly = true;
        } else if (mapml instanceof Element && mapml.hasAttribute('label')) {
          layer._title = mapml.getAttribute('label').trim();
        }
        // _mapmlLayerItem is set to the root element representing this layer
        // in the layer control, iff the layer is not 'hidden'
        layer._createLayerControlHTML();
      }
      function copyRemoteContentToShadowRoot() {
        // only run when content is loaded from network, puts features etc
        // into layer shadow root
        if (local) {
          return;
        }
        let shadowRoot = layer._layerEl.shadowRoot;
        let elements = mapml.children[0].children[1].children;
        if (elements) {
          let baseURL = mapml.children[0].children[0]
            .querySelector('map-base')
            ?.getAttribute('href');
          for (let el of elements) {
            // if not clone, the elements will be **REMOVED** from mapml file and re-attached to the layer's shadow root
            // which makes the this._content (mapml file) changed and thus affects the later generation process of this._mapmlvectors
            let node = el.cloneNode(true);
            el._DOMnode = node;
            // resolve relative url
            if (node.nodeName === 'map-link') {
              let url = node.getAttribute('href') || node.getAttribute('tref');
              // if relative
              if (
                url &&
                (url.indexOf('http://') === 0 || url.indexOf('https://') === 0)
              ) {
                let resolvedURL = baseURL + url;
                if (node.hasAttribute('href')) {
                  node.setAttribute('href', resolvedURL);
                } else {
                  node.setAttribute('tref', resolvedURL);
                }
              }
            }
            shadowRoot.appendChild(node);
          }
        }
      }
      function parseLicenseAndLegend() {
        var licenseLink = mapml.querySelector('map-link[rel=license]'),
          licenseTitle,
          licenseUrl,
          attText;
        if (licenseLink) {
          licenseTitle = licenseLink.getAttribute('title');
          licenseUrl = licenseLink.getAttribute('href');
          attText =
            '<a href="' +
            licenseUrl +
            '" title="' +
            licenseTitle +
            '">' +
            licenseTitle +
            '</a>';
        }
        L.setOptions(layer, { attribution: attText });
        var legendLink = mapml.querySelector('map-link[rel=legend]');
        if (legendLink) {
          layer._legendUrl = legendLink.getAttribute('href');
        }
        if (layer._map) {
          // if the layer is checked in the layer control, force the addition
          // of the attribution just received
          if (layer._map.hasLayer(layer)) {
            layer._map.attributionControl.addAttribution(
              layer.getAttribution()
            );
          }
        }
      }
    }
  },
  _validateExtent: function () {
    // TODO: change so that the _extent bounds are set based on inputs
    if (!this._properties || !this._map) {
      return;
    }
    var serverExtent = this._properties._mapExtents
        ? this._properties._mapExtents
        : [this._properties],
      lp;

    // loop through the map-extent elements and assign each one its crs
    for (let i = 0; i < serverExtent.length; i++) {
      if (!serverExtent[i].querySelector) {
        return;
      }
      if (
        serverExtent[i].querySelector(
          '[type=zoom][min=""], [type=zoom][max=""]'
        )
      ) {
        var zoom = serverExtent[i].querySelector('[type=zoom]');
        zoom.setAttribute('min', this._map.getMinZoom());
        zoom.setAttribute('max', this._map.getMaxZoom());
      }
      lp = serverExtent[i].hasAttribute('units')
        ? serverExtent[i].getAttribute('units')
        : null;
      if (lp && M[lp]) {
        if (this._properties._mapExtents)
          this._properties._mapExtents[i].crs = M[lp];
        else this._properties.crs = M[lp];
      } else {
        if (this._properties._mapExtents)
          this._properties._mapExtents[i].crs = M.OSMTILE;
        else this._properties.crs = M.OSMTILE;
      }
    }
  },
  // new getProjection, maybe simpler, but doesn't work...
  getProjection: function () {
    if (!this._properties) {
      return;
    }
    return this._properties.projection;
  },
  getQueryTemplates: function (pcrsClick) {
    if (this._properties && this._properties._queries) {
      var templates = [];
      // only return queries that are in bounds
      if (
        this._layerEl.checked &&
        !this._layerEl.hidden &&
        this._mapmlLayerItem
      ) {
        let layerAndExtents = this._mapmlLayerItem.querySelectorAll(
          '.mapml-layer-item-name'
        );
        for (let i = 0; i < layerAndExtents.length; i++) {
          if (
            layerAndExtents[i].extent ||
            this._properties._mapExtents.length === 1
          ) {
            // the layer won't have an .extent property, this is kind of a hack
            let extent =
              layerAndExtents[i].extent || this._properties._mapExtents[0];
            for (let j = 0; j < extent._templateVars.length; j++) {
              if (extent.checked) {
                let template = extent._templateVars[j];
                // for each template in the extent, see if it corresponds to one in the this._properties._queries array
                for (let k = 0; k < this._properties._queries.length; k++) {
                  let queryTemplate = this._properties._queries[k];
                  if (
                    template === queryTemplate &&
                    queryTemplate.extentBounds.contains(pcrsClick)
                  ) {
                    templates.push(queryTemplate);
                  }
                }
              }
            }
          }
        }
        return templates;
      }
    }
  },
  _attachSkipButtons: function (e) {
    let popup = e.popup,
      map = e.target,
      layer,
      group,
      content = popup._container.getElementsByClassName(
        'mapml-popup-content'
      )[0];

    popup._container.setAttribute('role', 'dialog');
    content.setAttribute('tabindex', '-1');
    // https://github.com/Maps4HTML/Web-Map-Custom-Element/pull/467#issuecomment-844307818
    content.setAttribute('role', 'document');
    popup._count = 0; // used for feature pagination

    if (popup._source._eventParents) {
      // check if the popup is for a feature or query
      layer =
        popup._source._eventParents[
          Object.keys(popup._source._eventParents)[0]
        ]; // get first parent of feature, there should only be one
      group = popup._source.group;
      // if the popup is for a static / templated feature, the "zoom to here" link can be attached once the popup opens
      attachZoomLink.call(popup);
    } else {
      layer = popup._source._templatedLayer;
      // if the popup is for a query, the "zoom to here" link should be re-attached every time new pagination features are displayed
      map.on('attachZoomLink', attachZoomLink, popup);
    }

    if (popup._container.querySelector('nav[class="mapml-focus-buttons"]')) {
      L.DomUtil.remove(
        popup._container.querySelector('nav[class="mapml-focus-buttons"]')
      );
      L.DomUtil.remove(popup._container.querySelector('hr'));
    }
    //add when popopen event happens instead
    let div = L.DomUtil.create('nav', 'mapml-focus-buttons');

    // creates |< button, focuses map
    let mapFocusButton = L.DomUtil.create('button', 'mapml-popup-button', div);
    mapFocusButton.type = 'button';
    mapFocusButton.title = 'Focus Map';
    mapFocusButton.innerHTML = "<span aria-hidden='true'>|&#10094;</span>";
    L.DomEvent.on(
      mapFocusButton,
      'click',
      (e) => {
        L.DomEvent.stop(e);
        map.featureIndex._sortIndex();
        map.closePopup();
        map._container.focus();
      },
      popup
    );

    // creates < button, focuses previous feature, if none exists focuses the current feature
    let previousButton = L.DomUtil.create('button', 'mapml-popup-button', div);
    previousButton.type = 'button';
    previousButton.title = 'Previous Feature';
    previousButton.innerHTML = "<span aria-hidden='true'>&#10094;</span>";
    L.DomEvent.on(previousButton, 'click', layer._previousFeature, popup);

    // static feature counter that 1/1
    let featureCount = L.DomUtil.create('p', 'mapml-feature-count', div),
      totalFeatures = this._totalFeatureCount ? this._totalFeatureCount : 1;
    featureCount.innerText = popup._count + 1 + '/' + totalFeatures;

    // creates > button, focuses next feature, if none exists focuses the current feature
    let nextButton = L.DomUtil.create('button', 'mapml-popup-button', div);
    nextButton.type = 'button';
    nextButton.title = 'Next Feature';
    nextButton.innerHTML = "<span aria-hidden='true'>&#10095;</span>";
    L.DomEvent.on(nextButton, 'click', layer._nextFeature, popup);

    // creates >| button, focuses map controls
    let controlFocusButton = L.DomUtil.create(
      'button',
      'mapml-popup-button',
      div
    );
    controlFocusButton.type = 'button';
    controlFocusButton.title = 'Focus Controls';
    controlFocusButton.innerHTML = "<span aria-hidden='true'>&#10095;|</span>";
    L.DomEvent.on(
      controlFocusButton,
      'click',
      (e) => {
        map.featureIndex._sortIndex();
        map.featureIndex.currentIndex =
          map.featureIndex.inBoundFeatures.length - 1;
        map.featureIndex.inBoundFeatures[0].path.setAttribute('tabindex', -1);
        map.featureIndex.inBoundFeatures[
          map.featureIndex.currentIndex
        ].path.setAttribute('tabindex', 0);
        L.DomEvent.stop(e);
        map.closePopup();
        map._controlContainer.querySelector('A:not([hidden])').focus();
      },
      popup
    );

    let divider = L.DomUtil.create('hr', 'mapml-popup-divider');

    popup._navigationBar = div;
    popup._content.appendChild(divider);
    popup._content.appendChild(div);

    content.focus();

    if (group && !M.options.featureIndexOverlayOption) {
      // e.target = this._map
      // Looks for keydown, more specifically tab and shift tab
      group.setAttribute('aria-expanded', 'true');
      map.on('keydown', focusFeature);
    } else {
      map.on('keydown', focusMap);
    }
    // When popup is open, what gets focused with tab needs to be done using JS as the DOM order is not in an accessibility friendly manner
    function focusFeature(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;
      if (
        (path[0].classList.contains('leaflet-popup-close-button') &&
          isTab &&
          !shiftPressed) ||
        focusEvent.originalEvent.keyCode === 27 ||
        (path[0].classList.contains('leaflet-popup-close-button') &&
          focusEvent.originalEvent.keyCode === 13)
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          L.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          map.closePopup(popup);
          group.focus();
          L.DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          L.DomEvent.stop(focusEvent);
        }, 0);
      }
    }

    function focusMap(focusEvent) {
      let path =
        focusEvent.originalEvent.path ||
        focusEvent.originalEvent.composedPath();
      let isTab = focusEvent.originalEvent.keyCode === 9,
        shiftPressed = focusEvent.originalEvent.shiftKey;

      if (
        (focusEvent.originalEvent.keyCode === 13 &&
          path[0].classList.contains('leaflet-popup-close-button')) ||
        focusEvent.originalEvent.keyCode === 27
      ) {
        L.DomEvent.stopPropagation(focusEvent);
        map.closePopup(popup);
        map._container.focus();
        if (focusEvent.originalEvent.keyCode !== 27) map._popupClosed = true;
      } else if (
        isTab &&
        path[0].classList.contains('leaflet-popup-close-button')
      ) {
        map.closePopup(popup);
      } else if (
        path[0].classList.contains('mapml-popup-content') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          //timeout needed so focus of the feature is done even after the keypressup event occurs
          L.DomEvent.stop(focusEvent);
          map._container.focus();
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          L.DomEvent.stop(focusEvent);
          map._container.focus();
        }, 0);
      }
    }

    function attachZoomLink(e) {
      // this === popup
      let content = this._content,
        featureEl = e ? e.currFeature : this._source._groupLayer._featureEl;
      if (content.querySelector('a.mapml-zoom-link')) {
        content.querySelector('a.mapml-zoom-link').remove();
      }
      if (!featureEl.querySelector('map-geometry')) return;
      featureEl.whenReady().then(() => {
        let tL = featureEl.extent.topLeft.gcrs,
          bR = featureEl.extent.bottomRight.gcrs,
          center = L.latLngBounds(
            L.latLng(tL.horizontal, tL.vertical),
            L.latLng(bR.horizontal, bR.vertical)
          ).getCenter(true);
        let zoomLink = document.createElement('a');
        zoomLink.href = `#${featureEl.getMaxZoom()},${center.lng},${
          center.lat
        }`;
        zoomLink.innerHTML = `${M.options.locale.popupZoom}`;
        zoomLink.className = 'mapml-zoom-link';
        zoomLink.onclick = zoomLink.onkeydown = function (e) {
          if (!(e instanceof MouseEvent) && e.keyCode !== 13) return;
          e.preventDefault();
          featureEl.zoomTo();
          featureEl._map.closePopup();
          featureEl._map.getContainer().focus();
        };
        // we found that the popupopen event is fired as many times as there
        // are layers on the map (<layer-> elements / MapMLLayers that is).
        // In each case the target layer is always this layer, so we can't
        // detect and conditionally add the zoomLink if the target is not this.
        // so, like Ahmad, we are taking a 'delete everyting each time'
        // approach (see _attachSkipButtons for this approach taken with
        // feature navigation buttons); obviously he dealt with this leaflet bug
        // this way some time ago, and we can't figure out how to get around it
        // apart from this slightly non-optimal method. Revisit sometime!
        let link = content.querySelector('.mapml-zoom-link');
        if (link) link.remove();
        content.insertBefore(
          zoomLink,
          content.querySelector('hr.mapml-popup-divider')
        );
      });
    }

    // if popup closes then the focusFeature handler can be removed
    map.on('popupclose', removeHandlers);
    function removeHandlers(removeEvent) {
      if (removeEvent.popup === popup) {
        map.off('keydown', focusFeature);
        map.off('keydown', focusMap);
        map.off('popupopen', attachZoomLink);
        map.off('popupclose', removeHandlers);
        if (group) group.setAttribute('aria-expanded', 'false');
      }
    }
  }
});
export var mapMLLayer = function (url, node, mapml, options) {
  if (!url && !node) return null;
  return new MapMLLayer(url, node, mapml, options);
};
