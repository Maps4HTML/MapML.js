import {
  LayerGroup,
  setOptions,
  DomUtil,
  DomEvent,
  bounds,
  latLng,
  latLngBounds
} from 'leaflet';
import { Util } from '../utils/Util.js';
import { MapFeatureLayer } from './MapFeatureLayer.js';
import { MapTileLayer } from './MapTileLayer.js';
import { featureRenderer } from '../features/featureRenderer.js';
import { renderStyles } from '../elementSupport/layers/renderStyles.js';

export var MapLayer = LayerGroup.extend({
  options: {
    zIndex: 0,
    opacity: '1.0'
  },
  // initialize is executed before the layer is added to a map
  initialize: function (href, layerEl, options) {
    // in the custom element, the attribute is actually 'src'
    // the _href version is the URL received from map-layer@src
    LayerGroup.prototype.initialize.call(this, null, options);
    if (href) {
      this._href = href;
    }
    this._layerEl = layerEl;
    this._content = layerEl.src ? layerEl.shadowRoot : layerEl;
    setOptions(this, options);
    this._container = DomUtil.create('div', 'leaflet-layer');
    this.changeOpacity(this.options.opacity);
    DomUtil.addClass(this._container, 'mapml-layer');

    // hit the service to determine what its extent might be
    // OR use the extent of the content provided

    this._initialize(this._content);
  },
  getContainer: function () {
    return this._container;
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
    // if it's not available the <map-layer label="accessible-name"> attribute
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
    this.getPane().appendChild(this._container);
    LayerGroup.prototype.onAdd.call(this, map);

    this.setZIndex(this.options.zIndex);
    map.on('popupopen', this._attachSkipButtons, this);
  },

  _calculateBounds: function () {
    delete this.bounds;
    delete this.zoomBounds;
    let bnds, zoomBounds;
    let layerTypes = ['_staticTileLayer', '_mapmlvectors', '_extentLayer'];
    bnds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=extent][content]'
      )
        ? Util.getBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=extent][content]')
        ? Util.getBoundsFromMeta(this._layerEl)
        : undefined;
    zoomBounds =
      this._layerEl.src &&
      this._layerEl.shadowRoot.querySelector(
        ':host > map-meta[name=zoom][content]'
      )
        ? Util.getZoomBoundsFromMeta(this._layerEl.shadowRoot)
        : this._layerEl.querySelector(':scope > map-meta[name=zoom][content]')
        ? Util.getZoomBoundsFromMeta(this._layerEl)
        : undefined;
    const mapExtents = this._layerEl.src
      ? this._layerEl.shadowRoot.querySelectorAll('map-extent')
      : this._layerEl.querySelectorAll('map-extent');
    layerTypes.forEach((type) => {
      let zoomMax, zoomMin, minNativeZoom, maxNativeZoom;
      if (zoomBounds) {
        zoomMax = zoomBounds.maxZoom;
        zoomMin = zoomBounds.minZoom;
        maxNativeZoom = zoomBounds.maxNativeZoom
          ? zoomBounds.maxNativeZoom
          : -Infinity;
        minNativeZoom = zoomBounds.minNativeZoom
          ? zoomBounds.minNativeZoom
          : Infinity;
      }
      if (type === '_extentLayer' && mapExtents.length) {
        for (let i = 0; i < mapExtents.length; i++) {
          if (mapExtents[i]._extentLayer?.bounds) {
            let mapExtentLayer = mapExtents[i]._extentLayer;
            if (!bnds) {
              bnds = bounds(
                mapExtentLayer.bounds.min,
                mapExtentLayer.bounds.max
              );
            } else {
              bnds.extend(mapExtentLayer.bounds);
            }
            if (mapExtentLayer.zoomBounds) {
              if (!zoomBounds) {
                zoomBounds = mapExtentLayer.zoomBounds;
              } else {
                // Extend layer zoombounds
                zoomMax = Math.max(zoomMax, mapExtentLayer.zoomBounds.maxZoom);
                zoomMin = Math.min(zoomMin, mapExtentLayer.zoomBounds.minZoom);
                maxNativeZoom = Math.max(
                  maxNativeZoom,
                  mapExtentLayer.zoomBounds.maxNativeZoom
                );
                minNativeZoom = Math.min(
                  minNativeZoom,
                  mapExtentLayer.zoomBounds.minNativeZoom
                );
                zoomBounds.minZoom = zoomMin;
                zoomBounds.maxZoom = zoomMax;
                zoomBounds.minNativeZoom = minNativeZoom;
                zoomBounds.maxNativeZoom = maxNativeZoom;
              }
            }
          }
        }
      } else if (type === '_mapmlvectors') {
        // Iterate through individual MapFeatureLayer instances in the LayerGroup
        this.eachLayer(function (layer) {
          // Check if this is a MapFeatureLayer
          if (layer instanceof MapFeatureLayer && layer.layerBounds) {
            if (!bnds) {
              bnds = layer.layerBounds;
            } else {
              bnds.extend(layer.layerBounds);
            }
          }
          if (layer instanceof MapFeatureLayer && layer.zoomBounds) {
            if (!zoomBounds) {
              zoomBounds = layer.zoomBounds;
            } else {
              // Extend layer zoombounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      } else {
        // inline tiles
        this.eachLayer((layer) => {
          if (layer instanceof MapTileLayer) {
            if (layer.layerBounds) {
              if (!bnds) {
                bnds = layer.layerBounds;
              } else {
                bnds.extend(layer.layerBounds);
              }
            }

            if (layer.zoomBounds) {
              // Extend zoomBounds with layer zoomBounds
              zoomMax = Math.max(zoomMax, layer.zoomBounds.maxZoom);
              zoomMin = Math.min(zoomMin, layer.zoomBounds.minZoom);
              maxNativeZoom = Math.max(
                maxNativeZoom,
                layer.zoomBounds.maxNativeZoom
              );
              minNativeZoom = Math.min(
                minNativeZoom,
                layer.zoomBounds.minNativeZoom
              );
              zoomBounds.minZoom = zoomMin;
              zoomBounds.maxZoom = zoomMax;
              zoomBounds.minNativeZoom = minNativeZoom;
              zoomBounds.maxNativeZoom = maxNativeZoom;
            }
          }
        });
      }
    });
    if (bnds) {
      this.bounds = bnds;
    } else {
      let projectionBounds = M[this.options.projection].options.bounds;
      this.bounds = bounds(projectionBounds.min, projectionBounds.max);
    }
    // we could get here and zoomBounds might still not be defined (empty layer)
    if (!zoomBounds) zoomBounds = {};
    if (!zoomBounds.minZoom) {
      zoomBounds.minZoom = 0;
    }
    if (!zoomBounds.maxZoom) {
      zoomBounds.maxZoom =
        M[this.options.projection].options.resolutions.length - 1;
    }
    if (zoomBounds.minNativeZoom === Infinity) {
      zoomBounds.minNativeZoom = zoomBounds.minZoom;
    }
    if (zoomBounds.maxNativeZoom === -Infinity) {
      zoomBounds.maxNativeZoom = zoomBounds.maxZoom;
    }
    this.zoomBounds = zoomBounds;
  },

  onRemove: function (map) {
    LayerGroup.prototype.onRemove.call(this, map);
    DomUtil.remove(this._container);
    map.off('popupopen', this._attachSkipButtons);
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  getBase: function () {
    return new URL(
      this._content.querySelector('map-base')
        ? this._content.querySelector('map-base').getAttribute('href')
        : this._content.nodeName === 'MAP-LAYER' ||
          this._content.nodeName === 'LAYER-'
        ? this._content.baseURI
        : this._href,
      this._href
    ).href;
  },
  renderStyles,
  _initialize: function () {
    var layer = this;
    var base = layer.getBase(),
      mapml = this._content;
    parseLicenseAndLegend();
    setLayerTitle();
    // update controls if needed based on mapml-viewer controls/controlslist attribute
    if (layer._layerEl.parentElement) {
      // if layer does not have a parent Element, do not need to set Controls
      layer._layerEl.parentElement._toggleControls();
    }
    // local functions
    function setLayerTitle() {
      if (mapml.querySelector('map-title')) {
        layer._title = mapml.querySelector('map-title').textContent.trim();
        layer._titleIsReadOnly = true;
      } else if (layer._layerEl && layer._layerEl.hasAttribute('label')) {
        layer._title = layer._layerEl.getAttribute('label').trim();
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
      setOptions(layer, { attribution: attText });
      var legendLink = mapml.querySelector('map-link[rel=legend]');
      if (legendLink) {
        layer._legendUrl = legendLink.getAttribute('href');
      }
      if (layer._map) {
        // if the layer is checked in the layer control, force the addition
        // of the attribution just received
        if (layer._map.hasLayer(layer)) {
          layer._map.attributionControl.addAttribution(layer.getAttribution());
        }
      }
    }
  },
  getQueryTemplates: function (location, zoom) {
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
        const minZoom = queryLinks[i].extent.zoom.minZoom,
          maxZoom = queryLinks[i].extent.zoom.maxZoom,
          withinZoomBounds = (z) => {
            return minZoom <= z && z <= maxZoom;
          },
          bounds = queryLinks[i].getBounds();

        if (bounds.contains(location) && withinZoomBounds(zoom)) {
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
    // https://github.com/Maps4HTML/MapML.js/pull/467#issuecomment-844307818
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
      DomUtil.remove(
        popup._container.querySelector('nav[class="mapml-focus-buttons"]')
      );
      DomUtil.remove(popup._container.querySelector('hr'));
    }
    //add when popopen event happens instead
    let div = DomUtil.create('nav', 'mapml-focus-buttons');
    // creates |< button, focuses map
    let mapFocusButton = DomUtil.create('button', 'mapml-popup-button', div);
    mapFocusButton.type = 'button';
    mapFocusButton.title = map.options.mapEl.locale.kbdFocusMap;
    mapFocusButton.innerHTML = "<span aria-hidden='true'>|&#10094;</span>";
    DomEvent.on(
      mapFocusButton,
      'click',
      (e) => {
        DomEvent.stop(e);
        map.featureIndex._sortIndex();
        map.closePopup();
        map._container.focus();
      },
      popup
    );

    // creates < button, focuses previous feature, if none exists focuses the current feature
    let previousButton = DomUtil.create('button', 'mapml-popup-button', div);
    previousButton.type = 'button';
    previousButton.title = map.options.mapEl.locale.kbdPrevFeature;
    previousButton.innerHTML = "<span aria-hidden='true'>&#10094;</span>";
    DomEvent.on(previousButton, 'click', layer._previousFeature, popup);

    // static feature counter that 1/1
    let featureCount = DomUtil.create('p', 'mapml-feature-count', div),
      totalFeatures = this._totalFeatureCount ? this._totalFeatureCount : 1;
    featureCount.innerText = popup._count + 1 + '/' + totalFeatures;

    // creates > button, focuses next feature, if none exists focuses the current feature
    let nextButton = DomUtil.create('button', 'mapml-popup-button', div);
    nextButton.type = 'button';
    nextButton.title = map.options.mapEl.locale.kbdNextFeature;
    nextButton.innerHTML = "<span aria-hidden='true'>&#10095;</span>";
    DomEvent.on(nextButton, 'click', layer._nextFeature, popup);

    // creates >| button, focuses map controls
    let controlFocusButton = DomUtil.create(
      'button',
      'mapml-popup-button',
      div
    );
    controlFocusButton.type = 'button';
    controlFocusButton.title = map.options.mapEl.locale.kbdFocusControls;
    controlFocusButton.innerHTML = "<span aria-hidden='true'>&#10095;|</span>";
    DomEvent.on(
      controlFocusButton,
      'click',
      (e) => {
        map.featureIndex._sortIndex();
        map.featureIndex.currentIndex =
          map.featureIndex.inBoundFeatures.length - 1;
        map.featureIndex.inBoundFeatures[0]?.path.setAttribute('tabindex', -1);
        map.featureIndex.inBoundFeatures[
          map.featureIndex.currentIndex
        ]?.path.setAttribute('tabindex', 0);
        DomEvent.stop(e);
        map.closePopup();
        map._controlContainer.querySelector('A:not([hidden])').focus();
      },
      popup
    );

    let divider = DomUtil.create('hr', 'mapml-popup-divider');

    popup._navigationBar = div;
    popup._content.parentElement.parentElement.appendChild(divider);
    popup._content.parentElement.parentElement.appendChild(div);

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
          DomEvent.stop(focusEvent);
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
          DomEvent.stop(focusEvent);
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        setTimeout(() => {
          map.closePopup(popup);
          group.focus();
          DomEvent.stop(focusEvent);
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
        DomEvent.stopPropagation(focusEvent);
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
          DomEvent.stop(focusEvent);
          map._container.focus();
        }, 0);
      } else if (
        path[0] === popup._content.querySelector('a') &&
        isTab &&
        shiftPressed
      ) {
        map.closePopup(popup);
        setTimeout(() => {
          DomEvent.stop(focusEvent);
          map.getContainer.focus();
        }, 0);
      }
    }

    function attachZoomLink(e) {
      // this === popup
      let popupWrapper = this._wrapper,
        featureEl = e ? e.currFeature : this._source._groupLayer._featureEl;
      if (popupWrapper.querySelector('a.mapml-zoom-link')) {
        popupWrapper.querySelector('a.mapml-zoom-link').remove();
      }

      // return early if feature doesn't have map-geometry
      if (!featureEl.querySelector('map-geometry')) return;

      // calculate zoom parameters
      let tL = featureEl.extent.topLeft.gcrs,
        bR = featureEl.extent.bottomRight.gcrs,
        center = latLngBounds(
          latLng(tL.horizontal, tL.vertical),
          latLng(bR.horizontal, bR.vertical)
        ).getCenter(true);

      // construct zoom link
      let zoomLink = document.createElement('a');
      zoomLink.href = `#${featureEl.getZoomToZoom()},${center.lng},${
        center.lat
      }`;
      zoomLink.innerHTML = `${map.options.mapEl.locale.popupZoom}`;
      zoomLink.className = 'mapml-zoom-link';

      // handle zoom link interactions
      zoomLink.onclick = zoomLink.onkeydown = function (e) {
        if (!(e instanceof MouseEvent) && e.keyCode !== 13) return;
        e.preventDefault();
        featureEl.zoomTo();
        map.closePopup();
        map.getContainer().focus();
      };

      // we found that the popupopen event is fired as many times as there
      // are layers on the map (<map-layer> elements / MapLayers that is).
      // In each case the target layer is always this layer, so we can't
      // detect and conditionally add the zoomLink if the target is not this.
      // so, like Ahmad, we are taking a 'delete everyting each time'
      // approach (see _attachSkipButtons for this approach taken with
      // feature navigation buttons); obviously he dealt with this leaflet bug
      // this way some time ago, and we can't figure out how to get around it
      // apart from this slightly non-optimal method. Revisit sometime!
      let link = popupWrapper.querySelector('.mapml-zoom-link');
      if (link) link.remove();

      // attach link to popup
      popupWrapper.insertBefore(
        zoomLink,
        popupWrapper.querySelector('hr.mapml-popup-divider')
      );
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
export var mapLayer = function (url, node, options) {
  if (!url && !node) return null;
  return new MapLayer(url, node, options);
};
