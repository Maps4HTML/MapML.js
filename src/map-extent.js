export class MapExtent extends HTMLElement {
  static get observedAttributes() {
    return ['units', 'checked', 'label', 'opacity'];
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
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'opacity':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  async connectedCallback() {
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
    // this code comes from MapMLLayer._initialize.processExtents
    this._templateVars = this._initTemplateVars(
      // mapml is the layer- element OR the mapml- document root
      this.parentLayer.querySelector('map-meta[name=extent]'),
      this.units,
      this._layer._content,
      this._layer.getBase(),
      this.units === this._layer.options.mapprojection
    );
    this._layerControlHTML = createLayerControlExtentHTML(this);        
  }
  function _initTemplateVars(
    metaExtent,
    projection,
    mapml,
    base,
    projectionMatch
  ) {
    var templateVars = [];
    // set up the URL template and associated inputs (which yield variable values when processed)
    var tlist = this.querySelectorAll(
        'map-link[rel=tile],map-link[rel=image],map-link[rel=features],map-link[rel=query]'
      ),
      varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g'),
      zoomInput = this.querySelector('map-input[type="zoom" i]'),
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
          inp = this.querySelector(
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
            L.DomEvent.on(inp.htmlselect, 'change', this._layer.redraw, this._layer);
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
          extentPCRSFallback: { bounds: extentFallback.bounds },
          projectionMatch: projectionMatch,
          projection:
            this.getAttribute('units') || FALLBACK_PROJECTION,
          tms: tms,
          step: step
        });
      }
    }
    return templateVars;
  }
  function createLayerControlExtentHTML() {
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
        this.removed = true;
        this.checked = false;
        if (this._layerEl.checked) this._changeExtent(e, this);
        this._layerControlHTML.parentNode.removeChild(
          this._layerControlHTML
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
    let opacityValue = this.hasAttribute('opacity')
      ? this.getAttribute('opacity')
      : '1.0';
    this._templateVars.opacity = opacityValue;
    opacity.setAttribute('value', opacityValue);
    opacity.value = opacityValue;
    L.DomEvent.on(opacity, 'change', this._changeExtentOpacity, this);

    var extentItemNameSpan = L.DomUtil.create(
      'span',
      'mapml-layer-item-name',
      extentLabel
    );
    input.defaultChecked = this ? true : false;
    this.checked = input.defaultChecked;
    input.type = 'checkbox';
    extentItemNameSpan.innerHTML = this.getAttribute('label');
    L.DomEvent.on(input, 'change', (e) => {
      this._changeExtent(e, this);
    });
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
  disconnectedCallback() {}
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this._layer) {
        resolve();
      } else {
        let extentElement = this;
        interval = setInterval(testForExtent, 300, extentElement);
        failureTimer = setTimeout(extentNotDefined, 10000);
      }
      function testForExtent(extentElement) {
        if (extentElement._layer) {
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
