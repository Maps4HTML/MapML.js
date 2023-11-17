/* global M */
export class MapExtent extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'label', 'opacity', 'hidden'];
  }
  get units() {
    // this should fallback to something??
    return this.getAttribute('units');
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
    this.whenReady()
      .then(() => {
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
            this._handleChange();
            this._calculateBounds();
            this._layerControlCheckbox.checked = newValue !== null;
            break;
          case 'opacity':
            if (oldValue !== newValue) {
              this._opacity = newValue;
              if (this._extentLayer) this._extentLayer.changeOpacity(newValue);
            }
            break;
          case 'hidden':
            if (oldValue !== newValue) {
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
            }
            break;
        }
      })
      .catch((reason) => {
        console.log(
          reason,
          `\nin mapExtent.attributeChangeCallback when changing attribute ${name}`
        );
      });
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  async connectedCallback() {
    // this.parentNode.host returns the layer- element when parentNode is
    // the shadow root
    this._createLayerControlExtentHTML =
      M._createLayerControlExtentHTML.bind(this);
    this.parentLayer =
      this.parentNode.nodeName.toUpperCase() === 'LAYER-'
        ? this.parentNode
        : this.parentNode.host;
    if (
      this.hasAttribute('data-moving') ||
      this.parentLayer.hasAttribute('data-moving')
    )
      return;
    if (
      this.querySelector('map-link[rel=query], map-link[rel=features]') &&
      !this.shadowRoot
    ) {
      this.attachShadow({ mode: 'open' });
    }
    await this.parentLayer.whenReady();
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
    this._layer = this.parentLayer._layer;
    this._map = this._layer._map;
    // reset the layer extent
    delete this.parentLayer.bounds;
    this._changeHandler = this._handleChange.bind(this);
    this.parentLayer.addEventListener('map-change', this._changeHandler);
    this.mapEl.addEventListener('map-projectionchange', this._changeHandler);
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = this.opacity || 1.0;
    this._extentLayer = M.templatedLayer({
      pane: this._layer._container,
      opacity: this.opacity,
      _leafletLayer: this._layer,
      crs: M[this.units],
      extentZIndex: Array.from(
        this.parentLayer.querySelectorAll('map-extent')
      ).indexOf(this),
      // when a <map-extent> migrates from a remote mapml file and attaches to the shadow of <layer- >
      // this._properties._mapExtents[i] refers to the <map-extent> in remote mapml
      extentEl: this._DOMnode || this
    });
    // this._layerControlHTML is the fieldset for the extent in the LayerControl
    this._layerControlHTML = this._createLayerControlExtentHTML();
    if (!this.hidden)
      this._layer.addExtentToLayerControl(this._layerControlHTML);
    this._validateLayerControlContainerHidden();
    this._calculateBounds();
  }
  getLayerControlHTML() {
    return this._layerControlHTML;
  }
  _projectionMatch() {
    return (
      this.units.toUpperCase() ===
      this._layer.options.mapprojection.toUpperCase()
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
        if (!templates[j]._templatedLayer.isVisible) {
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
    return this.disabled;
  }
  getMeta(metaName) {
    let name = metaName.toLowerCase();
    if (name !== 'extent' && name !== 'zoom') return;
    return this.parentLayer.shadowRoot
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
      this._extentLayer.addTo(this._layer._map);
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
    let nodeToSearch = this.parentLayer.shadowRoot || this.parentLayer;
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
      minNativeZoom = 0;
    // bounds should be able to be calculated unconditionally, not depend on map-extent.checked
    for (let j = 0; j < this._templateVars.length; j++) {
      let inputData = M._extractInputBounds(this._templateVars[j]);
      this._templateVars[j].tempExtentBounds = inputData.bounds;
      this._templateVars[j].extentZoomBounds = inputData.zoomBounds;
      if (!bounds) {
        bounds = this._templateVars[j].tempExtentBounds;
        zoomMax = this._templateVars[j].extentZoomBounds.maxZoom;
        zoomMin = this._templateVars[j].extentZoomBounds.minZoom;
        maxNativeZoom = this._templateVars[j].extentZoomBounds.maxNativeZoom;
        minNativeZoom = this._templateVars[j].extentZoomBounds.minNativeZoom;
      } else {
        bounds.extend(this._templateVars[j].tempExtentBounds.min);
        bounds.extend(this._templateVars[j].tempExtentBounds.max);
        zoomMax = Math.max(
          zoomMax,
          this._templateVars[j].extentZoomBounds.maxZoom
        );
        zoomMin = Math.min(
          zoomMin,
          this._templateVars[j].extentZoomBounds.minZoom
        );
        maxNativeZoom = Math.max(
          maxNativeZoom,
          this._templateVars[j].extentZoomBounds.maxNativeZoom
        );
        minNativeZoom = Math.min(
          minNativeZoom,
          this._templateVars[j].extentZoomBounds.minNativeZoom
        );
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
}
