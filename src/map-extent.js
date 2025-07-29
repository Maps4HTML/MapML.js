import { bounds as Lbounds, point as Lpoint } from 'leaflet';

import { Util } from './mapml/utils/Util.js';
import { mapExtentLayer } from './mapml/layers/MapExtentLayer.js';
import { createLayerControlExtentHTML } from './mapml/elementSupport/extents/createLayerControlForExtent.js';
import { calculatePosition } from './mapml/elementSupport/layers/calculatePosition.js';

/* global M */
export class HTMLExtentElement extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'label', 'opacity', 'hidden'];
  }
  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get units() {
    return this.getAttribute('units') || M.FALLBACK_PROJECTION;
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(val) {
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
  }
  get label() {
    return this.hasAttribute('label')
      ? this.getAttribute('label')
      : this.mapEl.locale.dfExtent;
  }
  set label(val) {
    if (val) {
      this.setAttribute('label', val);
    }
  }
  get opacity() {
    // use ?? since 0 is falsy, || would return rhs in that case
    return +(this._opacity ?? this.getAttribute('opacity'));
  }

  set opacity(val) {
    if (+val > 1 || +val < 0) return;
    this.setAttribute('opacity', val);
  }
  get hidden() {
    return this.hasAttribute('hidden');
  }

  set hidden(val) {
    if (val) {
      this.setAttribute('hidden', '');
    } else {
      this.removeAttribute('hidden');
    }
  }
  get extent() {
    const getExtent = (extent) => {
      return Object.assign(
        Util._convertAndFormatPCRS(
          extent._extentLayer.bounds,
          M[extent.units],
          extent.units
        ),
        { zoom: extent._extentLayer.zoomBounds }
      );
    };
    const getCalculatedExtent = (extent) => {
      extent._calculateBounds();
      return getExtent(extent);
    };

    return this._extentLayer.bounds
      ? getExtent(this)
      : getCalculatedExtent(this);
  }
  get position() {
    return calculatePosition(this);
  }

  getOuterHTML() {
    let tempElement = this.cloneNode(true);

    if (this.querySelector('map-link')) {
      let mapLinks = tempElement.querySelectorAll('map-link');

      mapLinks.forEach((mapLink) => {
        if (mapLink.hasAttribute('href')) {
          mapLink.setAttribute(
            'href',
            decodeURI(
              new URL(
                mapLink.attributes.href.value,
                this.baseURI ? this.baseURI : document.baseURI
              ).href
            )
          );
        } else if (mapLink.hasAttribute('tref')) {
          mapLink.setAttribute(
            'tref',
            decodeURI(
              new URL(
                mapLink.attributes.tref.value,
                this.baseURI ? this.baseURI : document.baseURI
              ).href
            )
          );
        }
      });
    }

    let outerLayer = tempElement.outerHTML;

    tempElement.remove();

    return outerLayer;
  }

  zoomTo() {
    let extent = this.extent;
    let map = this.getMapEl()._map,
      xmin = extent.topLeft.pcrs.horizontal,
      xmax = extent.bottomRight.pcrs.horizontal,
      ymin = extent.bottomRight.pcrs.vertical,
      ymax = extent.topLeft.pcrs.vertical,
      bounds = Lbounds(Lpoint(xmin, ymin), Lpoint(xmax, ymax)),
      center = map.options.crs.unproject(bounds.getCenter(true)),
      maxZoom = extent.zoom.maxZoom,
      minZoom = extent.zoom.minZoom;
    map.setView(center, Util.getMaxZoom(bounds, map, minZoom, maxZoom), {
      animate: false
    });
  }

  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  getLayerEl() {
    return Util.getClosest(this, 'map-layer,layer-');
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'units':
          if (oldValue !== newValue) {
            // handle side effects
          }
          break;
        case 'label':
          if (oldValue !== newValue) {
            this._layerControlHTML.querySelector(
              '.mapml-extent-item-name'
            ).innerHTML = newValue || this.getMapEl().locale.dfExtent;
          }
          break;
        case 'checked':
          this.parentLayer
            .whenReady()
            .then(() => {
              this._handleChange();
              this._calculateBounds();
              this._layerControlCheckbox.checked = newValue !== null;
            })
            .catch((error) => {
              console.log(
                'Error while waiting on parentLayer for map-extent checked callback: ' +
                  error
              );
            });
          break;
        case 'opacity':
          if (oldValue !== newValue) {
            this._opacity = newValue;
            if (this._extentLayer) this._extentLayer.changeOpacity(newValue);
          }
          break;
        case 'hidden':
          if (oldValue !== newValue) {
            this.parentLayer
              .whenReady()
              .then(() => {
                let extentsRootFieldset =
                  this.parentLayer._propertiesGroupAnatomy;
                let position = Array.from(
                  this.parentLayer.src
                    ? this.parentLayer.shadowRoot.querySelectorAll(
                        ':host > map-extent:not([hidden])'
                      )
                    : this.parentLayer.querySelectorAll(
                        ':scope > map-extent:not([hidden])'
                      )
                ).indexOf(this);
                if (newValue !== null) {
                  // remove from layer control (hide from user)
                  this._layerControlHTML.remove();
                } else {
                  // insert the extent fieldset into the layer control container in
                  // the calculated position
                  if (position === 0) {
                    extentsRootFieldset.insertAdjacentElement(
                      'afterbegin',
                      this._layerControlHTML
                    );
                  } else if (position > 0) {
                    Array.from(
                      this.parentLayer.src
                        ? this.parentLayer.shadowRoot.querySelectorAll(
                            ':host > map-extent:not([hidden])'
                          )
                        : this.parentLayer.querySelectorAll(
                            ':scope > map-extent:not([hidden])'
                          )
                    )[position - 1]._layerControlHTML.insertAdjacentElement(
                      'afterend',
                      this._layerControlHTML
                    );
                  }
                }
                this._validateLayerControlContainerHidden();
              })
              .catch(() => {
                console.log(
                  'Error while waiting on parentLayer for map-extent hidden callback'
                );
              });
          }
          break;
      }
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
    this._createLayerControlExtentHTML =
      createLayerControlExtentHTML.bind(this);
    this._changeHandler = this._handleChange.bind(this);
  }
  async connectedCallback() {
    // this.parentNode.host returns the map-layer element when parentNode is
    // the shadow root
    this.parentLayer = this.getLayerEl();
    if (
      this.hasAttribute('data-moving') ||
      this.parentLayer.hasAttribute('data-moving')
    )
      return;
    this.mapEl = this.getMapEl();
    await this.mapEl.whenProjectionDefined(this.units).catch(() => {
      throw new Error('Undefined projection:' + this.units);
    });
    // when projection is changed, the parent map-layer._layer is created (so whenReady is fulfilled) but then removed,
    // then the map-extent disconnectedCallback will be triggered by map-layer._onRemove() (clear the shadowRoot)
    // even before connectedCallback is finished
    // in this case, the microtasks triggered by the fulfillment of the removed MapLayer should be stopped as well
    // !this.isConnected <=> the disconnectedCallback has run before
    if (!this.isConnected) return;
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    this._map = this.mapEl._map;
    this.parentLayer.addEventListener('map-change', this._changeHandler);
    this.mapEl.addEventListener('map-projectionchange', this._changeHandler);
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = this.opacity || 1.0;
    this._extentLayer = mapExtentLayer({
      opacity: this.opacity,
      crs: M[this.units],
      zIndex: this.position,
      extentEl: this
    });
    // this._layerControlHTML is the fieldset for the extent in the LayerControl
    this._layerControlHTML = this._createLayerControlExtentHTML();
    this._calculateBounds();
    // instead of children using parents' whenReady which can be cyclic,
    // when this element is ready, run stuff that is only available after
    // initialization
    this._runMutationObserver(this.children);
    // make sure same thing happens when children are added
    this._bindMutationObserver();
  }
  /*
   * Set up a function to watch additions of child elements of map-extent
   * and to invoke desired side  effects of those additions via
   * _runMutationObserver
   */
  _bindMutationObserver() {
    this._observer = new MutationObserver((mutationList) => {
      for (let mutation of mutationList) {
        // the attributes changes should be handled by attributeChangedCallback()
        if (mutation.type === 'childList') {
          this._runMutationObserver(mutation.addedNodes);
        }
      }
    });
    // childList observes immediate children only (not grandchildren etc)
    this._observer.observe(this, {
      childList: true
    });
  }
  _runMutationObserver(elementsGroup) {
    const _addMetaElement = (mapMeta) => {
      this.whenReady().then(() => {
        this._calculateBounds();
        this._validateDisabled();
      });
    };
    const _addStylesheetLink = (mapLink) => {
      this.whenReady().then(() => {
        this._extentLayer.renderStyles(mapLink);
      });
    };
    const _addStyleElement = (mapStyle) => {
      this.whenReady().then(() => {
        this._extentLayer.renderStyles(mapStyle);
      });
    };
    for (let i = 0; i < elementsGroup.length; ++i) {
      let element = elementsGroup[i];
      switch (element.nodeName) {
        case 'MAP-META':
          const name =
            element.hasAttribute('name') &&
            (element.getAttribute('name').toLowerCase() === 'zoom' ||
              element.getAttribute('name').toLowerCase() === 'extent');
          if (name && element.hasAttribute('content')) {
            _addMetaElement(element);
          }
          break;
        case 'MAP-LINK':
          if (element.link && !element.link.isConnected)
            _addStylesheetLink(element);
          break;
        case 'MAP-STYLE':
          if (element.styleElement && !element.styleElement.isConnected) {
            _addStyleElement(element);
          }
          break;
        default:
          break;
      }
    }
  }
  getLayerControlHTML() {
    return this._layerControlHTML;
  }
  _projectionMatch() {
    return (
      this.units.toUpperCase() === this._map.options.projection.toUpperCase()
    );
  }
  _validateDisabled() {
    if (!this._extentLayer) return;
    let templates = this.querySelectorAll(
      'map-link[rel=image],map-link[rel=tile],map-link[rel=features],map-link[rel=query]'
    );
    const noTemplateVisible = () => {
      let totalTemplateCount = templates.length,
        disabledTemplateCount = 0;
      for (let j = 0; j < totalTemplateCount; j++) {
        if (!templates[j].isVisible()) {
          disabledTemplateCount++;
        }
      }
      return disabledTemplateCount === totalTemplateCount;
    };
    if (!this._projectionMatch() || noTemplateVisible()) {
      this.setAttribute('disabled', '');
      this.disabled = true;
    } else {
      this.removeAttribute('disabled');
      this.disabled = false;
    }
    this.toggleLayerControlDisabled();
    this._handleChange();
    return this.disabled;
  }
  getMeta(metaName) {
    let name = metaName.toLowerCase();
    if (name !== 'extent' && name !== 'zoom' && name !== 'cs') return;
    return this.parentLayer.src
      ? this.querySelector(`:scope > map-meta[name=${name}]`) ||
          this.parentLayer.shadowRoot.querySelector(
            `:host > map-meta[name=${name}]`
          )
      : this.querySelector(`:scope > map-meta[name=${name}]`) ||
          this.parentLayer.querySelector(`:scope > map-meta[name=${name}]`);
  }
  // disable/italicize layer control elements based on the map-extent.disabled property
  toggleLayerControlDisabled() {
    let input = this._layerControlCheckbox,
      label = this._layerControlLabel, // access to the label for the specific map-extent
      opacityControl = this._opacityControl,
      opacitySlider = this._opacitySlider,
      selectDetails = this._selectdetails;
    if (this.disabled) {
      // update the status of layerControl
      input.disabled = true;
      opacitySlider.disabled = true;
      label.style.fontStyle = 'italic';
      opacityControl.style.fontStyle = 'italic';
      if (selectDetails) {
        selectDetails.forEach((i) => {
          i.querySelectorAll('select').forEach((j) => {
            j.disabled = true;
            j.style.fontStyle = 'italic';
          });
          i.style.fontStyle = 'italic';
        });
      }
    } else {
      input.disabled = false;
      opacitySlider.disabled = false;
      label.style.fontStyle = 'normal';
      opacityControl.style.fontStyle = 'normal';
      if (selectDetails) {
        selectDetails.forEach((i) => {
          i.querySelectorAll('select').forEach((j) => {
            j.disabled = false;
            j.style.fontStyle = 'normal';
          });
          i.style.fontStyle = 'normal';
        });
      }
    }
  }

  _handleChange() {
    // add _extentLayer to map if map-extent is checked, otherwise remove it
    if (this.checked && !this.disabled && this.parentLayer._layer) {
      // can be added to MapLayer LayerGroup no matter map-layer is checked or not
      this._extentLayer.addTo(this.parentLayer._layer);
      this._extentLayer.setZIndex(this.position);
    } else {
      this.parentLayer._layer?.removeLayer(this._extentLayer);
    }
    // change the checkbox in the layer control to match map-extent.checked
    // doesn't trigger the event handler because it's not user-caused AFAICT
  }
  _validateLayerControlContainerHidden() {
    let extentsFieldset = this.parentLayer._propertiesGroupAnatomy;
    if (!extentsFieldset) return;
    const numberOfVisibleSublayers = (
      this.parentLayer.src
        ? this.parentLayer.shadowRoot.querySelectorAll(
            ':host > map-extent:not([hidden])'
          )
        : this.parentLayer.querySelectorAll(':scope > map-extent:not([hidden])')
    ).length;
    if (numberOfVisibleSublayers === 0) {
      extentsFieldset.setAttribute('hidden', '');
    } else {
      extentsFieldset.removeAttribute('hidden');
    }
  }
  disconnectedCallback() {
    // in case of projection change, the disconnectedcallback will be triggered by removing map-layer._layer even before
    // map-extent.connectedcallback is finished (because it will wait for the map-layer to be ready)
    // !this._extentLayer <=> this.connectedCallback has not yet been finished before disconnectedCallback is triggered
    if (
      this.hasAttribute('data-moving') ||
      this.parentLayer.hasAttribute('data-moving') ||
      !this._extentLayer
    )
      return;
    this._validateLayerControlContainerHidden();
    // remove layer control for map-extent from layer control DOM
    // TODO: for the case of projection change, the layer control for map-extent has been created while _extentLayer has not yet been ready
    this._layerControlHTML.remove();
    if (this.parentLayer._layer) {
      this.parentLayer._layer.removeLayer(this._extentLayer);
    }
    this.parentLayer.removeEventListener('map-change', this._changeHandler);
    this.mapEl.removeEventListener('map-projectionchange', this._changeHandler);
    delete this._extentLayer;
    if (this.parentLayer._layer) delete this.parentLayer._layer.bounds;
  }
  _calculateBounds() {
    delete this._extentLayer.bounds;
    delete this._extentLayer.zoomBounds;
    if (this.parentLayer._layer) delete this.parentLayer._layer.bounds;
    let zoomMax = -Infinity,
      zoomMin = Infinity,
      maxNativeZoom = -Infinity,
      minNativeZoom = Infinity,
      templates = this.querySelectorAll(
        'map-link[rel=image]:not([disabled]),map-link[rel=tile]:not([disabled]),map-link[rel=features]:not([disabled]),map-link[rel=query]:not([disabled])'
      );

    // initialize bounds from this.scope > map-meta
    let bounds = this.querySelector(':scope > map-meta[name=extent][content]')
      ? Util.getBoundsFromMeta(this) // TODO rewrite this pile of doo doo
      : undefined;

    // initialize zoom bounds from this.scope > map-meta
    let zoomBounds = this.querySelector(':scope > map-meta[name=zoom][content]')
      ? Util.getZoomBoundsFromMeta(this) // TODO rewrite this pile of doo doo
      : undefined;

    // bounds should be able to be calculated unconditionally, not depend on map-extent.checked
    for (let j = 0; j < templates.length; j++) {
      const templateZoomBounds = templates[j].getZoomBounds(),
        templateBounds = templates[j].getBounds();
      let zoomMax =
          zoomBounds && zoomBounds.hasOwnProperty('maxZoom')
            ? zoomBounds.maxZoom
            : -Infinity,
        zoomMin =
          zoomBounds && zoomBounds.hasOwnProperty('minZoom')
            ? zoomBounds.minZoom
            : Infinity,
        minNativeZoom =
          zoomBounds && zoomBounds.hasOwnProperty('minNativeZoom')
            ? zoomBounds.minNativeZoom
            : Infinity,
        maxNativeZoom =
          zoomBounds && zoomBounds.hasOwnProperty('maxNativeZoom')
            ? zoomBounds.maxNativeZoom
            : -Infinity;
      if (!zoomBounds) {
        zoomBounds = Object.assign({}, templateZoomBounds);
      } else {
        zoomMax = Math.max(zoomMax, templateZoomBounds.maxZoom);
        zoomMin = Math.min(zoomMin, templateZoomBounds.minZoom);
        maxNativeZoom = Math.max(
          maxNativeZoom,
          templateZoomBounds.maxNativeZoom
        );
        minNativeZoom = Math.min(
          minNativeZoom,
          templateZoomBounds.minNativeZoom
        );
        zoomBounds.minZoom = zoomMin;
        zoomBounds.maxZoom = zoomMax;
        zoomBounds.minNativeZoom = minNativeZoom;
        zoomBounds.maxNativeZoom = maxNativeZoom;
      }
      if (!bounds) {
        bounds = Lbounds(templateBounds.min, templateBounds.max);
      } else {
        bounds.extend(templateBounds);
      }
    }
    if (bounds) {
      this._extentLayer.bounds = bounds;
    } else {
      this._extentLayer.bounds = Lbounds(
        M[this.units].options.bounds.min,
        M[this.units].options.bounds.max
      );
    }
    if (!zoomBounds) zoomBounds = {};
    if (!zoomBounds.hasOwnProperty('minZoom')) {
      zoomBounds.minZoom = 0;
    }
    if (!zoomBounds.hasOwnProperty('maxZoom')) {
      zoomBounds.maxZoom = M[this.units].options.resolutions.length - 1;
    }
    if (
      !zoomBounds.hasOwnProperty('minNativeZoom') ||
      zoomBounds.minNativeZoom === Infinity
    ) {
      zoomBounds.minNativeZoom = zoomBounds.minZoom;
    }
    if (
      !zoomBounds.hasOwnProperty('maxNativeZoom') ||
      zoomBounds.maxNativeZoom === -Infinity
    ) {
      zoomBounds.maxNativeZoom = zoomBounds.maxZoom;
    }
    this._extentLayer.zoomBounds = zoomBounds;
  }

  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this._extentLayer) {
        resolve();
      } else {
        let extentElement = this;
        interval = setInterval(testForExtent, 300, extentElement);
        failureTimer = setTimeout(extentNotDefined, 10000);
      }
      function testForExtent(extentElement) {
        if (extentElement._extentLayer) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!extentElement.isConnected) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('map-extent was disconnected while waiting to be ready');
        }
      }
      function extentNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for extent to be ready');
      }
    });
  }

  whenLinksReady() {
    let templates = this.querySelectorAll(
      'map-link[rel=image],map-link[rel=tile],map-link[rel=features],map-link[rel=query]'
    );
    let linksReady = [];
    for (let link of [...templates]) {
      linksReady.push(link.whenReady());
    }
    return Promise.allSettled(linksReady);
  }
}
