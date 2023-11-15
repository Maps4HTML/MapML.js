export class MapLink extends HTMLElement {
  static get observedAttributes() {
    return [
      'type',
      'rel',
      'title',
      'href',
      'hreflang',
      'tref',
      'tms',
      'projection'
    ];
  }
  get type() {
    return this.getAttribute('type');
  }
  set type(val) {
    // improve this
    if (val === 'text/mapml' || val.startsWith('image/')) {
      this.setAttribute('type', val);
    }
  }
  get rel() {
    return this.getAttribute('rel');
  }
  set rel(val) {
    // improve this
    if (
      [
        'license',
        'alternate',
        'self',
        'style',
        'tile',
        'image',
        'features',
        'zoomin',
        'zoomout',
        'legend',
        'query',
        'stylesheet'
      ].includes(val)
    ) {
      this.setAttribute('type', val);
    }
  }
  get title() {
    return this.getAttribute('title');
  }
  set title(val) {
    if (val) {
      this.setAttribute('title', val);
    }
  }
  get href() {
    return this.getAttribute('href');
  }
  set href(val) {
    // improve this
    if (val) {
      this.setAttribute('href', val);
    }
  }
  get hreflang() {
    return this.getAttribute('hreflang');
  }
  set hreflang(val) {
    // improve this
    if (val) {
      this.setAttribute('hreflang', val);
    }
  }
  get tref() {
    return this.getAttribute('tref');
  }
  set tref(val) {
    // improve this
    if (val) {
      this.setAttribute('tref', val);
    }
  }
  get tms() {
    return this.hasAttribute('tms');
  }
  set tms(val) {
    // improve this
    if (val) {
      this.setAttribute('tms', '');
    }
  }
  get projection() {
    return this.getAttribute('projection');
  }
  set projection(val) {
    // improve this
    if (['OSMTILE', 'CBMTILE', 'WGS84', 'APSTILE'].includes(val)) {
      this.setAttribute('projection', val);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    //['type','rel','title','href','hreflang','tref','tms','projection'];
    switch (name) {
      case 'type':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'rel':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'title':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'href':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'hreflang':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'tref':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'tms':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'projection':
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
  connectedCallback() {
    
    // parse tref for variable names
    // find sibling map-input with that name, link to them via js reference
    // resolve the tref against the appropriate base URL so as to be absolute
    // do the above via call to _initTemplateVars or rename thereof
    // create the layer type appropriate to the rel value, so long as the
    // parsing has gone well
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].rel === 'tile') {
        this.setZIndex(options.extentZIndex);
        this._templates[i].layer = M.templatedTileLayer(
          templates[i],
          L.Util.extend(options, {
            errorTileUrl:
              'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            zIndex: options.extentZIndex,
            pane: this._container
          })
        );
      } else if (templates[i].rel === 'image') {
        this.setZIndex(options.extentZIndex);
        this._templates[i].layer = M.templatedImageLayer(
          templates[i],
          L.Util.extend(options, {
            zIndex: options.extentZIndex,
            pane: this._container
          })
        );
      } else if (templates[i].rel === 'features') {
        this.setZIndex(options.extentZIndex);
        this._templates[i].layer = M.templatedFeaturesLayer(
          templates[i],
          L.Util.extend(options, {
            zIndex: options.extentZIndex,
            pane: this._container
          })
        );
      } else if (templates[i].rel === 'query') {
        // add template to array of queryies to be added to map and processed
        // on click/tap events
        this.hasSetBoundsHandler = true;
        if (!this._queries) {
          this._queries = [];
        }
        let inputData = M._extractInputBounds(templates[i]);
        templates[i].extentBounds = inputData.bounds;
        templates[i].zoomBounds = inputData.zoomBounds;
        templates[i]._extentEl = this.options.extentEl;
        this._queries.push(
          L.extend(templates[i], this._setupQueryVars(templates[i]))
        );
      }
    }
    // create the type of templated leaflet layer appropriate to the rel value
    // image/map/features = templated(Image/Feature), tile=templatedTile, 
    this._tempatedTileLayer = M.templatedTile(pane: this.extentElement._leafletLayer._container)
    // add to viewer._map dependant on map-extent.checked, layer-.checked
    // what else?
  }
  disconnectedCallback() {}
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

  // Resolve the templated URL with info from the sibling map-input's
  resolve() {
    if (this.tref) {
      let obj = {};
      const inputs = this.parentElement.querySelectorAll('map-input');
      if (this.rel === 'image') {
        // image/map
        for (let i = 0; i < inputs.length; i++) {
          const inp = inputs[i];
          obj[inp.name] = inp.value;
        }
        console.log(obj); // DEBUGGING
        return L.Util.template(this.tref, obj);
      } else if (this.rel === 'tile') {
        // TODO. Need to get tile coords from moveend
        // should be done/called from the TemplatedTilelayer.js file
        return obj;
      } else if (this.rel === 'query') {
        // TODO. Need to get the click coords from click event
        // should be done/called from the templatedlayer.js file
      } else if (this.rel === 'features') {
        // TODO.
      }
    }
  }
}
