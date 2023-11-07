/* global M */
export class MapExtent extends HTMLElement {
  static get observedAttributes() {
    return ['units', 'checked', 'label', 'opacity', 'hidden'];
  }
  get units() {
    return this.getAttribute('units');
  }
  set units(val) {
    // built in support for OSMTILE, CBMTILE, WGS84 and APSTILE
    if (['OSMTILE', 'CBMTILE', 'WGS84', 'APSTILE'].includes(val)) {
      this.setAttribute('units', val);
    }
    // else need to check with the mapml-viewer element if the custom projection is defined
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
              if (this._templatedLayer)
                this._templatedLayer.changeOpacity(newValue);
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
    this._templateVars = this._initTemplateVars(
      // read map-meta[name=extent] from shadowroot or layer-
      // querySelector / querySelectorAll on layer- cannot get elements inside its shadowroot
      this.parentLayer.shadowRoot
        ? this.parentLayer.shadowRoot.querySelector(
            'map-extent > map-meta[name=extent]'
          ) ||
            this.parentLayer.shadowRoot.querySelector('map-meta[name=extent]')
        : this.parentLayer.querySelector(
            'map-extent > map-meta[name=extent]'
          ) || this.parentLayer.querySelector('map-meta[name=extent]'),
      this.units,
      this._layer._content,
      this._layer.getBase(),
      this.units === this._layer.options.mapprojection
    );
    this._changeHandler = this._handleChange.bind(this);
    this.parentLayer.addEventListener('map-change', this._changeHandler);
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = +(this.getAttribute('opacity') || 1.0);
    this._templatedLayer = M.templatedLayer(this._templateVars, {
      pane: this._layer._container,
      opacity: this.opacity,
      _leafletLayer: this._layer,
      crs: this._layer._properties.crs,
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
    if (this._templatedLayer._queries) {
      if (!this._layer._properties._queries)
        this._layer._properties._queries = [];
      this._layer._properties._queries =
        this._layer._properties._queries.concat(this._templatedLayer._queries);
    }
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
    if (!this._templatedLayer) return;
    const noTemplateVisible = () => {
      let totalTemplateCount = this._templatedLayer._templates.length,
        disabledTemplateCount = 0;
      for (let j = 0; j < this._templatedLayer._templates.length; j++) {
        if (this._templatedLayer._templates[j].rel === 'query') {
          continue;
        }
        if (!this._templatedLayer._templates[j].layer.isVisible) {
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

  _initTemplateVars(metaExtent, projection, mapml, base, projectionMatch) {
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
    var templateVars = [];
    // set up the URL template and associated inputs (which yield variable values when processed)
    var tlist = this.querySelectorAll(
        'map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]'
      ),
      varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g'),
      zoomInput = this.querySelector('map-input[type="zoom" i]'),
      includesZoom = false,
      boundsFallback = {};

    boundsFallback.zoom = 0;
    if (metaExtent) {
      let content = M._metaContentToObject(metaExtent.getAttribute('content')),
        cs;

      boundsFallback.zoom = content.zoom || boundsFallback.zoom;

      let metaKeys = Object.keys(content);
      for (let i = 0; i < metaKeys.length; i++) {
        if (!metaKeys[i].includes('zoom')) {
          cs = M.axisToCS(metaKeys[i].split('-')[2]);
          break;
        }
      }
      let axes = M.csToAxes(cs);
      boundsFallback.bounds = M.boundsToPCRSBounds(
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
        boundsFallback.zoom,
        projection,
        cs
      );
    } else {
      // for custom projections, M[projection] may not be loaded, so uses M['OSMTILE'] as backup, this code will need to get rerun once projection is changed and M[projection] is available
      // TODO: This is a temporary fix, _initTemplateVars (or processinitialextent) should not be called when projection of the layer and map do not match, this should be called/reinitialized once the layer projection matches with the map projection
      let fallbackProjection = M[projection] || M.OSMTILE;
      boundsFallback.bounds = fallbackProjection.options.crs.pcrs.bounds;
    }

    for (var i = 0; i < tlist.length; i++) {
      var t = tlist[i],
        template = t.getAttribute('tref');
      t.zoomInput = zoomInput;
      if (!template) {
        template = M.BLANK_TT_TREF;
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
            mapml.querySelector('map-meta[name=zoom]').getAttribute('content')
          )
        : undefined;
      while ((v = varNamesRe.exec(template)) !== null) {
        var varName = v[1],
          inp = this.querySelector(
            'map-input[name=' + varName + '],map-select[name=' + varName + ']'
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
              zoomInput.setAttribute('value', boundsFallback.zoom);
            }
            let axis = inp.getAttribute('axis'),
              axisBounds = M.convertPCRSBounds(
                boundsFallback.bounds,
                boundsFallback.zoom,
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
            L.DomEvent.on(inp.htmlselect, 'change', this.redraw, this);

            if (!this._userInputs) {
              this._userInputs = [];
            }
            this._userInputs.push(inp.htmlselect);
          }
          // TODO: if this is an input@type=location
          // get the TCRS min,max attribute values at the identified zoom level
          // save this information as properties of the mapExtent,
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
        template === M.BLANK_TT_TREF
      ) {
        if (trel === 'query') {
          this._layer.queryable = true;
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
          boundsFallbackPCRS: { bounds: boundsFallback.bounds },
          projectionMatch: projectionMatch,
          projection: this.units || M.FALLBACK_PROJECTION,
          tms: tms,
          step: step
        });
      }
    }
    return templateVars;
  }
  redraw() {
    this._templatedLayer.redraw();
  }

  _handleChange() {
    // if the parent layer- is checked, add _templatedLayer to map if map-extent is checked, otherwise remove it
    if (this.checked && this.parentLayer.checked && !this.disabled) {
      this._templatedLayer.addTo(this._layer._map);
      this._templatedLayer.setZIndex(
        Array.from(this.parentLayer.querySelectorAll('map-extent')).indexOf(
          this
        )
      );
    } else {
      this._map.removeLayer(this._templatedLayer);
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
    // !this._templatedLayer <=> this.connectedCallback has not yet been finished before disconnectedCallback is triggered
    if (
      this.hasAttribute('data-moving') ||
      this.parentLayer.hasAttribute('data-moving') ||
      !this._templatedLayer
    )
      return;
    this._validateLayerControlContainerHidden();
    // remove layer control for map-extent from layer control DOM
    this._layerControlHTML.remove();
    this._map.removeLayer(this._templatedLayer);
    this.parentLayer.removeEventListener('map-change', this._changeHandler);
    delete this._templatedLayer;
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
    this._templatedLayer.bounds = bounds;
    this._templatedLayer.zoomBounds = {
      minZoom: zoomMin,
      maxZoom: zoomMax,
      maxNativeZoom,
      minNativeZoom
    };
  }

  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this._templatedLayer) {
        resolve();
      } else {
        let extentElement = this;
        interval = setInterval(testForExtent, 300, extentElement);
        failureTimer = setTimeout(extentNotDefined, 10000);
      }
      function testForExtent(extentElement) {
        if (extentElement._templatedLayer) {
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
