/* global M */
export class MapExtent extends HTMLElement {
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
      : M.options.locale.dfExtent;
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
              '.mapml-layer-item-name'
            ).innerHTML = newValue || M.options.locale.dfExtent;
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
                  this.parentNode.querySelectorAll('map-extent:not([hidden])')
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
                    this.parentNode
                      .querySelectorAll('map-extent:not([hidden])')
                      [position - 1]._layerControlHTML.insertAdjacentElement(
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
      M._createLayerControlExtentHTML.bind(this);
    this._changeHandler = this._handleChange.bind(this);
  }
  async connectedCallback() {
    // this.parentNode.host returns the layer- element when parentNode is
    // the shadow root
    this.parentLayer =
      this.parentNode.nodeName.toUpperCase() === 'LAYER-'
        ? this.parentNode
        : this.parentNode.host;
    if (
      this.hasAttribute('data-moving') ||
      this.parentLayer.hasAttribute('data-moving')
    )
      return;
    this.mapEl = this.parentLayer.closest('mapml-viewer,map[is=web-map]');
    await this.mapEl.whenProjectionDefined(this.units).catch(() => {
      throw new Error('Undefined projection:' + this.units);
    });
    // when projection is changed, the parent layer-._layer is created (so whenReady is fulfilled) but then removed,
    // then the map-extent disconnectedCallback will be triggered by layer-._onRemove() (clear the shadowRoot)
    // even before connectedCallback is finished
    // in this case, the microtasks triggered by the fulfillment of the removed MapMLLayer should be stopped as well
    // !this.isConnected <=> the disconnectedCallback has run before
    if (!this.isConnected) return;
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    this._map = this.mapEl._map;
    // reset the layer extent
    delete this.parentLayer.bounds;
    this.parentLayer.addEventListener('map-change', this._changeHandler);
    this.mapEl.addEventListener('map-projectionchange', this._changeHandler);
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = this.opacity || 1.0;
    this._extentLayer = M.templatedLayer({
      opacity: this.opacity,
      crs: M[this.units],
      extentZIndex: Array.from(
        this.parentLayer.querySelectorAll('map-extent')
      ).indexOf(this),
      extentEl: this
    });
    // this._layerControlHTML is the fieldset for the extent in the LayerControl
    this._layerControlHTML = this._createLayerControlExtentHTML();
    this._calculateBounds();
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
        if (templates[j].rel === 'query') {
          continue;
        }
        if (!templates[j]._validateDisabled()) {
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
    if (name !== 'extent' && name !== 'zoom') return;
    return this.parentLayer.src
      ? this.querySelector(`map-meta[name=${name}]`) ||
          this.parentLayer.shadowRoot.querySelector(`map-meta[name=${name}]`)
      : this.querySelector(`map-meta[name=${name}]`) ||
          this.parentLayer.querySelector(`map-meta[name=${name}]`);
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
    // if the parent layer- is checked, add _extentLayer to map if map-extent is checked, otherwise remove it
    if (this.checked && this.parentLayer.checked && !this.disabled) {
      this._extentLayer.addTo(this._map);
      this._extentLayer.setZIndex(
        Array.from(this.parentLayer.querySelectorAll('map-extent')).indexOf(
          this
        )
      );
    } else {
      this._map.removeLayer(this._extentLayer);
    }
    // change the checkbox in the layer control to match map-extent.checked
    // doesn't trigger the event handler because it's not user-caused AFAICT
  }
  _validateLayerControlContainerHidden() {
    let extentsFieldset = this.parentLayer._propertiesGroupAnatomy;
    let nodeToSearch = this.parentLayer.src
      ? this.parentLayer.shadowRoot
      : this.parentLayer;
    if (!extentsFieldset) return;
    if (
      nodeToSearch.querySelectorAll('map-extent:not([hidden])').length === 0
    ) {
      extentsFieldset.setAttribute('hidden', '');
    } else {
      extentsFieldset.removeAttribute('hidden');
    }
  }
  disconnectedCallback() {
    // in case of projection change, the disconnectedcallback will be triggered by removing layer-._layer even before
    // map-extent.connectedcallback is finished (because it will wait for the layer- to be ready)
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
    this._map.removeLayer(this._extentLayer);
    this.parentLayer.removeEventListener('map-change', this._changeHandler);
    this.mapEl.removeEventListener('map-projectionchange', this._changeHandler);
    delete this._extentLayer;
    delete this.parentLayer.bounds;
  }
  _calculateBounds() {
    let bounds = null,
      zoomMax = 0,
      zoomMin = 0,
      maxNativeZoom = 0,
      minNativeZoom = 0,
      templates = this.querySelectorAll(
        'map-link[rel=image],map-link[rel=tile],map-link[rel=features],map-link[rel=query]'
      );

    // bounds should be able to be calculated unconditionally, not depend on map-extent.checked
    for (let j = 0; j < templates.length; j++) {
      let zoomBounds = templates[j].getZoomBounds();
      if (!bounds) {
        bounds = templates[j].getBounds();
        zoomMax = zoomBounds.maxZoom;
        zoomMin = zoomBounds.minZoom;
        maxNativeZoom = zoomBounds.maxNativeZoom;
        minNativeZoom = zoomBounds.minNativeZoom;
      } else {
        bounds.extend(templates[j].getBounds().min);
        bounds.extend(templates[j].getBounds().max);
        zoomMax = Math.max(zoomMax, zoomBounds.maxZoom);
        zoomMin = Math.min(zoomMin, zoomBounds.minZoom);
        maxNativeZoom = Math.max(maxNativeZoom, zoomBounds.maxNativeZoom);
        minNativeZoom = Math.min(minNativeZoom, zoomBounds.minNativeZoom);
      }
    }
    // cannot be named as layerBounds if we decide to keep the debugoverlay logic
    this._extentLayer.bounds = bounds;
    this._extentLayer.zoomBounds = {
      minZoom: zoomMin,
      maxZoom: zoomMax,
      maxNativeZoom,
      minNativeZoom
    };
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
