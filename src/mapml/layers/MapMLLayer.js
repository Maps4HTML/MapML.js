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
  changeOpacity: function (opacity) {
    this._container.style.opacity = opacity;
    this._layerEl._opacity = opacity;
    if (this._layerEl._opacitySlider)
      this._layerEl._opacitySlider.value = opacity;
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
      this._layerEl._layerControlHTML.querySelector(
        '.mapml-layer-item-name'
      ).innerHTML = newName;
    }
  },
  getName() {
    return this._title;
  },

  onAdd: function (map) {
    this._map = map;
    if (this._mapmlvectors) map.addLayer(this._mapmlvectors);

    //only add the layer if there are tiles to be rendered
    if (this._staticTileLayer) {
      map.addLayer(this._staticTileLayer);
    }

    this.setZIndex(this.options.zIndex);
    this.getPane().appendChild(this._container);
    map.on('popupopen', this._attachSkipButtons, this);
    this._validateLayerZoom({ zoom: map.getZoom() });
  },

  _calculateBounds: function () {
    let bounds,
      zoomBounds = {
        minZoom: 0,
        maxZoom: 0,
        maxNativeZoom: 0,
        minNativeZoom: 0
      };
    let layerTypes = ['_staticTileLayer', '_mapmlvectors', '_extentLayer'];
    const mapExtents = this._layerEl.querySelectorAll('map-extent').length
      ? this._layerEl.querySelectorAll('map-extent')
      : this._layerEl.shadowRoot
      ? this._layerEl.shadowRoot.querySelectorAll('map-extent')
      : [];
    layerTypes.forEach((type) => {
      if (type === '_extentLayer' && mapExtents.length) {
        let zoomMax = zoomBounds.maxZoom,
          zoomMin = zoomBounds.minZoom,
          maxNativeZoom = zoomBounds.maxNativeZoom,
          minNativeZoom = zoomBounds.minNativeZoom;
        for (let i = 0; i < mapExtents.length; i++) {
          if (mapExtents[i]._extentLayer.bounds) {
            let templatedLayer = mapExtents[i]._extentLayer;
            if (!bounds) {
              bounds = templatedLayer.bounds;
              zoomBounds = templatedLayer.zoomBounds;
            } else {
              bounds.extend(templatedLayer.bounds.min);
              bounds.extend(templatedLayer.bounds.max);
              zoomMax = Math.max(zoomMax, templatedLayer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, templatedLayer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                templatedLayer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                templatedLayer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        }
      } else if (type === '_staticTileLayer' && this._staticTileLayer) {
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
        this._mapmlvectors &&
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
    });
    if (bounds) {
      //assigns the formatted extent object to .extent and spreads the zoom ranges to .extent also
      this.bounds = bounds;
      this.zoomBounds = zoomBounds;
    }
  },

  getEvents: function () {
    return { zoomanim: this._validateLayerZoom };
  },
  _validateLayerZoom: function (e) {
    // get the min and max zooms from all extents
    const layerEl = this._layerEl;
    let toZoom = e.zoom;
    let min = layerEl.extent.zoom.minZoom;
    let max = layerEl.extent.zoom.maxZoom;
    let inLink = layerEl.shadowRoot
        ? layerEl.shadowRoot.querySelector('map-link[rel=zoomin]')
        : layerEl.querySelector('map-link[rel=zoomin]'),
      outLink = layerEl.shadowRoot
        ? layerEl.shadowRoot.querySelector('map-link[rel=zoomout]')
        : layerEl.querySelector('map-link[rel=zoomout]');
    let targetURL;
    if (!(min <= toZoom && toZoom <= max)) {
      if (inLink && toZoom > max) {
        targetURL = inLink.href;
      } else if (outLink && toZoom < min) {
        targetURL = outLink.href;
      }
      if (targetURL) {
        this._layerEl.dispatchEvent(
          new CustomEvent('zoomchangesrc', {
            detail: {
              href: targetURL
            }
          })
        );
      }
    }
  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    if (this._staticTileLayer) map.removeLayer(this._staticTileLayer);
    if (this._mapmlvectors) map.removeLayer(this._mapmlvectors);
    map.off('popupopen', this._attachSkipButtons);
  },
  getAttribution: function () {
    return this.options.attribution;
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
      var base = layer.getBase();
      parseLicenseAndLegend();
      setLayerTitle();
      // crs is only set if the layer has the same projection as the map
      if (M[layer.options.projection]) processTiles();
      processFeatures();
      M._parseStylesheetAsHTML(mapml, base, layer._container);
      // update controls if needed based on mapml-viewer controls/controlslist attribute
      if (layer._layerEl.parentElement) {
        // if layer does not have a parent Element, do not need to set Controls
        layer._layerEl.parentElement._toggleControls();
      }
      // local functions
      // determine if, where there's no match of the current layer's projection
      // and that of the map, if there is a linked alternate text/mapml
      // resource that matches the map's projection
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
          projection: layer.options.projection,
          // by NOT passing options.extent, we are asking the FeatureLayer
          // to dynamically update its .layerBounds property as features are
          // added or removed from it
          native: native,
          // each owned child layer gets a reference to the root layer
          _leafletLayer: layer,
          static: true,
          mapEl: layer._layerEl.parentElement,
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
            projection: layer.options.projection,
            className: 'mapml-static-tile-layer',
            tileContainer: layer._mapmlTileContainer,
            maxZoomBound:
              M[layer.options.projection].crs.options.resolutions.length - 1,
            tileSize: M[layer.options.projection].options.crs.tile.bounds.max.x
          });
        }
      }
      function setLayerTitle() {
        if (mapml.querySelector('map-title')) {
          layer._title = mapml.querySelector('map-title').textContent.trim();
          layer._titleIsReadOnly = true;
        } else if (mapml instanceof Element && mapml.hasAttribute('label')) {
          layer._title = mapml.getAttribute('label').trim();
        }
      }
      function copyRemoteContentToShadowRoot() {
        // only run when content is loaded from network, puts features etc
        // into layer shadow root
        if (local) {
          return;
        }
        let shadowRoot = layer._layerEl.shadowRoot;
        // get the map-meta[name=projection/cs/extent/zoom] from map-head of remote mapml, attach them to the shadowroot
        let headMeta = mapml.children[0].children[0].querySelectorAll('*');
        // get the elements inside map-body of remote mapml
        let bodyElements = mapml.children[0].children[1].children;
        let elements = [...headMeta, ...bodyElements];
        if (elements) {
          let baseURL = mapml.children[0].children[0]
            .querySelector('map-base')
            ?.getAttribute('href');
          for (let el of elements) {
            // if not clone, the elements will be **REMOVED** from mapml file and re-attached to the layer's shadow root
            // which makes the this._content (mapml file) changed and thus affects the later generation process of this._mapmlvectors
            let node = el.cloneNode(true);
            el._DOMnode = node;
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
  getQueryTemplates: function (pcrsClick) {
    const queryLinks = this._layerEl.querySelectorAll(
      'map-extent[checked] map-link[rel=query]'
    ).length
      ? this._layerEl.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        ).length
      ? this._layerEl.shadowRoot.querySelectorAll(
          'map-extent[checked] map-link[rel=query]'
        )
      : null;
    if (queryLinks) {
      var templates = [];
      for (let i = 0; i < queryLinks.length; i++) {
        if (queryLinks[i]._templateVars.extentBounds.contains(pcrsClick)) {
          templates.push(queryLinks[i]._templateVars);
        }
      }
      return templates;
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
      // getting access to the first map-extent to get access to _extentLayer to use it's (possibly) generic _previousFeature + _nextFeature methods.
      const mapExtent =
        popup._source._layerEl.querySelector('map-extent') ||
        popup._source._layerEl.shadowRoot.querySelector('map-extent');
      layer = mapExtent._extentLayer;
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
