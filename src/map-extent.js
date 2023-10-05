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
    return this.hasAttribute('label') ? this.getAttribute('label') : '';
  }
  set label(val) {
    if (val) {
      this.setAttribute('label', val);
    }
  }
  get opacity() {
    return this._opacity;
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
    switch (name) {
      case 'units':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'label':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'checked':
        this.whenReady().then(() => {
          this._changeExtent();
        });
        break;
      case 'opacity':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'hidden':
        if (oldValue !== newValue) {
          this.whenReady().then(() => {
            let extentsRootFieldset =
              this._layer.getLayerControlExtentContainer();
            let position = Array.from(
              this.parentLayer.querySelectorAll('map-extent:not([hidden])')
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
                this.parentLayer
                  .querySelectorAll('map-extent:not([hidden])')
                  [position - 1]._layerControlHTML.insertAdjacentElement(
                    'afterend',
                    this._layerControlHTML
                  );
              }
            }
            this._validateLayerControlContainerHidden();
          });
        }
        break;
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  async connectedCallback() {
    if (this.hasAttribute('data-moving')) return;
    if (
      this.querySelector('map-link[rel=query], map-link[rel=features]') &&
      !this.shadowRoot
    ) {
      this.attachShadow({ mode: 'open' });
    }
    this.parentLayer =
      this.parentNode.nodeName.toUpperCase() === 'LAYER-'
        ? this.parentNode
        : this.parentNode.host;
    await this.parentLayer.whenReady();
    this._layer = this.parentLayer._layer;
    let viewer = this.closest('mapml-viewer') || this.closest('map');
    this._map = viewer._map;
    // this code comes from MapMLLayer._initialize.processExtents
    this._templateVars = this._initTemplateVars(
      // mapml is the layer- element OR the mapml- document root
      this.parentLayer.querySelector('map-meta[name=extent]'),
      this.units,
      this._layer._content,
      this._layer.getBase(),
      this.units === this._layer.options.mapprojection
    );
    // this._layerControlHTML is the fieldset for the extent in the LayerControl
    this._layerControlHTML = this.createLayerControlExtentHTML(this);
    if (!this.hidden)
      this._layer.addExtentToLayerControl(this._layerControlHTML);
    this._validateLayerControlContainerHidden();
    this._templatedLayer = M.templatedLayer(this._templateVars, {
      pane: this._layer._container,
      opacity: this._templateVars.opacity,
      _leafletLayer: this._layer,
      crs: this._layer._properties.crs,
      extentZIndex: Array.from(
        this.parentLayer.querySelectorAll('map-extent')
      ).indexOf(this),
      // when a <map-extent> migrates from a remote mapml file and attaches to the shadow of <layer- >
      // this._properties._mapExtents[i] refers to the <map-extent> in remote mapml
      extentEl: this._DOMnode || this
    });
    if (this._templatedLayer._queries) {
      if (!this._layer._properties._queries)
        this._layer._properties._queries = [];
      this._layer._properties._queries =
        this._layer._properties._queries.concat(this._templatedLayer._queries);
    }
    if (this.hasAttribute('opacity')) {
      this._templatedLayer.changeOpacity(this.getAttribute('opacity'));
    }
  }
  getLayerControlHTML() {
    return this._layerControlHTML;
  }
  _validateDisabled() {
    if (!this._templatedLayer) return;
    let totalTemplateCount = this._templatedLayer._templates.length,
      disabledTemplateCount = 0;

    for (let j = 0; j < this._templatedLayer._templates.length; j++) {
      if (!this._templatedLayer._templates[j].layer.isVisible) {
        disabledTemplateCount++;
      }
    }
    if (totalTemplateCount === disabledTemplateCount) {
      this.setAttribute('disabled', '');
      this.disabled = true;
    } else {
      this.removeAttribute('disabled');
      this.disabled = false;
    }
    return this.disabled;
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
            L.DomEvent.on(
              inp.htmlselect,
              'change',
              this._layer.redraw,
              this._layer
            );
            if (!this._layer._userInputs) {
              this._layer._userInputs = [];
            }
            this._layer._userInputs.push(inp.htmlselect);
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
        template === BLANK_TT_TREF
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
          projection: this.units || FALLBACK_PROJECTION,
          tms: tms,
          step: step
        });
      }
    }
    return templateVars;
  }
  createLayerControlExtentHTML() {
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
      extentOpacitySummary = L.DomUtil.create('summary', '', opacityControl),
      mapEl = this.parentLayer.parentNode,
      layerEl = this.parentLayer,
      opacity = L.DomUtil.create('input', '', opacityControl);
    extentSettings.hidden = true;
    extent.setAttribute('aria-grabbed', 'false');
    if (!this.hasAttribute('label')) {
      // if a label attribute is not present, set it to hidden in layer control
      extent.setAttribute('hidden', '');
      this.hidden = true;
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
    removeExtentButton.innerHTML = "<span aria-hidden='true'>&#10005;</span>";
    removeExtentButton.classList.add('mapml-button');
    removeExtentButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.remove();
    });

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
    let opacityValue = this.hasAttribute('opacity')
      ? this.getAttribute('opacity')
      : '1.0';
    this._templateVars.opacity = opacityValue;
    opacity.setAttribute('value', opacityValue);
    opacity.value = opacityValue;
    opacity.addEventListener('change', this._changeOpacity);

    var extentItemNameSpan = L.DomUtil.create(
      'span',
      'mapml-layer-item-name',
      extentLabel
    );
    input.defaultChecked = this ? true : false;
    this.checked = input.defaultChecked;
    input.type = 'checkbox';
    extentItemNameSpan.innerHTML = this.getAttribute('label');
    const changeCheck = function () {
      this.checked = !this.checked;
    };
    // save for later access by API
    this._layerControlCheckbox = input;
    input.addEventListener('change', changeCheck.bind(this));
    extentItemNameSpan.id =
      'mapml-extent-item-name-{' + L.stamp(extentItemNameSpan) + '}';
    extent.setAttribute('aria-labelledby', extentItemNameSpan.id);
    extentItemNameSpan.extent = this;

    extent.ontouchstart = extent.onmousedown = (downEvent) => {
      if (
        (downEvent.target.parentElement.tagName.toLowerCase() === 'label' &&
          downEvent.target.tagName.toLowerCase() !== 'input') ||
        downEvent.target.tagName.toLowerCase() === 'label'
      ) {
        downEvent.stopPropagation();
        downEvent =
          downEvent instanceof TouchEvent ? downEvent.touches[0] : downEvent;

        let control = extent,
          controls = extent.parentNode,
          moving = false,
          yPos = downEvent.clientY;

        document.body.ontouchmove = document.body.onmousemove = (moveEvent) => {
          moveEvent.preventDefault();
          moveEvent =
            moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent;

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
            extentEl._templatedLayer.setZIndex(zIndex);
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
  _changeExtent() {
    if (this.checked) {
      if (this.parentLayer.checked) {
        this._templatedLayer.addTo(this._layer._map);
        this._templatedLayer.setZIndex(
          Array.from(this.parentLayer.querySelectorAll('map-extent')).indexOf(
            this
          )
        );
      }
    } else {
      if (this.parentLayer.checked) this._map.removeLayer(this._templatedLayer);
    }
    // change the checkbox in the layer control to match map-extent.checked
    // doesn't trigger the event handler because it's not user-caused AFAICT
    this._layerControlCheckbox = this.checked;
    this._layer._setLayerElExtent();
  }
  _validateLayerControlContainerHidden() {
    let extentsFieldset = this._layer.getLayerControlExtentContainer();
    if (
      this.parentLayer.querySelectorAll('map-extent:not([hidden])').length === 0
    ) {
      extentsFieldset.setAttribute('hidden', '');
    } else {
      extentsFieldset.removeAttribute('hidden');
    }
  }
  disconnectedCallback() {
    if (this.hasAttribute('data-moving')) return;
    this._validateLayerControlContainerHidden();
    // remove layer control for map-extent from layer control DOM
    this._layerControlHTML.remove();

    this._map.removeLayer(this._templatedLayer);
    delete this._templatedLayer;
    this._layer._setLayerElExtent();
  }
  _changeOpacity(e) {
    if (e && e.target && e.target.value >= 0 && e.target.value <= 1.0) {
      this._templatedLayer.changeOpacity(e.target.value);
      this._templateVars.opacity = e.target.value;
    }
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
