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

    this.setZIndex(this.options.zIndex);
    this.getPane().appendChild(this._container);
    map.on('popupopen', this._attachSkipButtons, this);
  },

  _calculateBounds: function () {
    let bounds,
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
    const mapExtents = this._layerEl.querySelectorAll('map-extent').length
      ? this._layerEl.querySelectorAll('map-extent')
      : this._layerEl.shadowRoot
      ? this._layerEl.shadowRoot.querySelectorAll('map-extent')
      : [];
    layerTypes.forEach((type) => {
      if (type === '_templatedLayer' && mapExtents.length) {
        let zoomMax = zoomBounds.maxZoom,
          zoomMin = zoomBounds.minZoom,
          maxNativeZoom = zoomBounds.maxNativeZoom,
          minNativeZoom = zoomBounds.minNativeZoom;
        for (let i = 0; i < mapExtents.length; i++) {
          if (mapExtents[i]._templatedLayer.bounds) {
            let templatedLayer = mapExtents[i]._templatedLayer;
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
      } else if (type === '_imageLayer' && this._imageLayer) {
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

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },
  getEvents: function () {
    return { zoomanim: this._onZoomAnim };
  },
  _onZoomAnim: function (e) {
    // this callback will be invoked AFTER <layer- > has been removed
    // but due to the characteristic of JavaScript, the context (this pointer) can still be used
    // the easiest way to solve this:
    if (!this._map) {
      return;
    }
    // get the min and max zooms from all extents
    const layerEl = this._layerEl,
      // prerequisite: no inline and remote mapml elements exists at the same time
      mapExtents = layerEl.shadowRoot
        ? layerEl.shadowRoot.querySelectorAll('map-extent')
        : layerEl.querySelectorAll('map-extent');
    var toZoom = e.zoom,
      zoom =
        mapExtents.length > 0
          ? mapExtents[0].querySelector('map-input[type=zoom]')
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
      for (let i = 1; i < mapExtents.length; i++) {
        zoom = mapExtents[i].querySelector('map-input[type=zoom]');
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
  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    if (this._staticTileLayer) map.removeLayer(this._staticTileLayer);
    if (this._mapmlvectors) map.removeLayer(this._mapmlvectors);
    if (this._imageLayer) map.removeLayer(this._imageLayer);
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
  addExtentToLayerControl: function (contents) {
    this._layerEl._propertiesGroupAnatomy.appendChild(contents);
    // remove hidden attribute, if it exists
    this._layerEl._propertiesGroupAnatomy.removeAttribute('hidden');
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
      layer._properties = {};
      // sets layer._properties.projection
      determineLayerProjection();
      // requires that layer._properties.projection be set
      if (selectMatchingAlternateProjection()) return;
      layer._styles = getAlternateStyles();
      parseLicenseAndLegend();
      setLayerTitle();
      setZoomInOrOutLinks();
      // crs is only set if the layer has the same projection as the map
      if (layer._properties.crs) processTiles();
      processFeatures();
      M._parseStylesheetAsHTML(mapml, base, layer._container);
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
        layer._properties.crs = M[layer._properties.projection];
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
            styleOptionInput.setAttribute(
              'name',
              // grouping radio buttons based on parent layer's style <detail>
              'styles-' + L.stamp(stylesControl)
            );
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
      }
      function copyRemoteContentToShadowRoot() {
        // only run when content is loaded from network, puts features etc
        // into layer shadow root
        if (local) {
          return;
        }
        let shadowRoot = layer._layerEl.shadowRoot;
        // get the map-meta[name=projection/cs/extent/zoom] from map-head of remote mapml, attach them to the shadowroot
        let headMeta =
          mapml.children[0].children[0].querySelectorAll('map-meta[name]');
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
  // new getProjection, maybe simpler, but doesn't work...
  getProjection: function () {
    if (!this._properties) {
      return;
    }
    return this._properties.projection;
  },
  getQueryTemplates: function (pcrsClick) {
    const mapExtents = this._layerEl.querySelectorAll('map-extent').length
      ? this._layerEl.querySelectorAll('map-extent')
      : this._layerEl.shadowRoot.querySelectorAll('map-extent');
    if (this._properties && this._properties._queries) {
      var templates = [];
      // only return queries that are in bounds
      if (
        this._layerEl.checked &&
        !this._layerEl.hidden &&
        this._layerEl._layerControlHTML
      ) {
        let layerAndExtents = this._layerEl._layerControlHTML.querySelectorAll(
          '.mapml-layer-item-name'
        );
        for (let i = 0; i < layerAndExtents.length; i++) {
          if (layerAndExtents[i].extent || mapExtents.length === 1) {
            // the layer won't have an .extent property, this is kind of a hack
            let extent = layerAndExtents[i].extent || mapExtents[0];
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
      // getting access to the first map-extent to get access to _templatedLayer to use it's (possibly) generic _previousFeature + _nextFeature methods.
      const mapExtent =
        popup._source._layerEl.querySelector('map-extent') ||
        popup._source._layerEl.shadowRoot.querySelector('map-extent');
      layer = mapExtent._templatedLayer;
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
