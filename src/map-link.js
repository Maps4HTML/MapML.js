/* global M */

export class MapLink extends HTMLElement {
  static get observedAttributes() {
    return [
      'type',
      'rel',
      //      'title',
      'href',
      'hreflang',
      'tref',
      'tms',
      'projection'
    ];
  }
  get type() {
    return this.getAttribute('type') || 'image/*';
  }
  set type(val) {
    // improve this
    if (val === 'text/mapml' || val.startsWith('image/')) {
      this.setAttribute('type', val);
    }
  }
  get rel() {
    // rel value has no default value
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#:~:text=The%20rel%20attribute%20has%20no%20default%20value.
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
  //  get title() {
  //    return this.getAttribute('title');
  //  }
  //  set title(val) {
  //    if (val) {
  //      this.setAttribute('title', val);
  //    }
  //  }
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
    // maybe no longer necessary, set up a default value for tref
    //      if (!template) {
    //        template = M.BLANK_TT_TREF;
    //        let blankInputs = mapml.querySelectorAll('map-input');
    //        for (let i of blankInputs) {
    //          template += `{${i.getAttribute('name')}}`;
    //        }
    //      }
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
    //['type','rel','href','hreflang','tref','tms','projection'];
    // fold to lowercase
    switch (name) {
      case 'type':
        // rel = tile, features, etc. TBD when it is used
        //        ttype = !t.hasAttribute('type')
        //          ? 'image/*'
        //          : t.getAttribute('type').toLowerCase(),

        if (oldValue !== newValue) {
          // default value image/*
          // handle side effects
        }
        break;
      case 'rel':
        // mandatory attribute, no default value
        if (oldValue !== newValue) {
          // handle side effects
          if (newValue === 'query') {
            this.parentExtent.parentLayer._layer.queryable = true;
          }
        }
        break;
      //      case 'title':
      //        if (oldValue !== newValue) {
      //          // handle side effects
      //        }
      //        break;
      case 'href':
        // rel = license, legend, stylesheet, self, style, self style, style self, zoomin, zoomout
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'hreflang':
        // rel = *all*
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang
        // idea is that we can have multiple map-links with different hreflang, and map-extent chooses a map-link that matches with user's lang. Not a priority. - create an use-case issue?
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'tref':
        // rel = tile, image, features, query
        if (oldValue !== newValue) {
          // create or reset the _templateVars property
          this._initTemplateVars();
        }
        break;
      case 'tms':
        // rel = tile
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'projection':
        // rel = alternate
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
    switch (this.rel.toLowerCase()) {
      // for some cases, require a dependency check
      case 'tile':
      case 'image':
      case 'features':
      case 'query':
        this._createTemplatedLink();
        break;
      case 'style':
      case 'self':
      case 'style self':
      case 'self style':
        this._createSelfOrStyleLink();
        break;
      case 'zoomin':
      case 'zoomout':
        this._createZoominOrZoomoutLink();
        break;
      case 'legend':
        this._createLegendLink();
        break;
      case 'stylesheet':
        this._createStylesheetLink();
        break;
      case 'alternate':
        this._createAlternateLink(); // add media attribute
        break;
      case 'license':
        this._createLicenseLink();
        break;
    }
    // create the type of templated leaflet layer appropriate to the rel value
    // image/map/features = templated(Image/Feature), tile=templatedTile,
    // this._tempatedTileLayer = M.templatedTile(pane: this.extentElement._leafletLayer._container)
    // add to viewer._map dependant on map-extent.checked, layer-.checked
    // what else?
  }

  async _createTemplatedLink() {
    // conditions check
    // the tms and type attributes are optional, may need to be checked in future
    this.parentExtent =
      this.parentNode.nodeName.toUpperCase() === 'MAP-EXTENT'
        ? this.parentNode
        : this.parentNode.host;
    if (!this.tref || !this.parentExtent) return;
    await this.parentExtent.whenReady();
    this.mapEl = this.parentExtent.mapEl;
    // create the layer type appropriate to the rel value
    this.zIndex = Array.from(
      this.parentExtent.querySelectorAll(
        'map-link[rel=image],map-link[rel=tile],map-link[rel=features]'
      )
    ).indexOf(this);
    if (this.rel === 'tile') {
      this._templatedLayer = M.templatedTileLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        crs: M[this.parentExtent.units],
        errorTileUrl:
          'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer()
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'image') {
      this._templatedLayer = M.templatedImageLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer()
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'features') {
      this._templatedLayer = M.templatedFeaturesLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer()
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'query') {
      // add template to array of queryies to be added to map and processed
      // on click/tap events
      this.hasSetBoundsHandler = true;
      if (!this._queries) {
        this._queries = [];
      }
      let inputData = M._extractInputBounds(this);
      this.extentBounds = inputData.bounds;
      this.zoomBounds = inputData.zoomBounds;
      if (!this.parentExtent._layer._properties._queries)
        this.parentExtent._layer._properties._queries = [];
      this.parentExtent._layer._properties._queries.push(
        // need to refactor the _setupQueryVars args / migrate it to map-link?
        L.extend(this._templateVars, this._setupQueryVars(this._templateVars))
      );
    }
  }
  _setupQueryVars(template) {
    // process the inputs associated to template and create an object named
    // query with member properties as follows:
    // {width: 'widthvarname',
    //  height: 'heightvarname',
    //  left: 'leftvarname',
    //  right: 'rightvarname',
    //  top: 'topvarname',
    //  bottom: 'bottomvarname'
    //  i: 'ivarname'
    //  j: 'jvarname'}
    //  x: 'xvarname' x being the tcrs x axis
    //  y: 'yvarname' y being the tcrs y axis
    //  z: 'zvarname' zoom
    //  title: link title

    var queryVarNames = { query: {} },
      inputs = template.values;

    for (var i = 0; i < template.values.length; i++) {
      var type = inputs[i].getAttribute('type'),
        units = inputs[i].getAttribute('units'),
        axis = inputs[i].getAttribute('axis'),
        name = inputs[i].getAttribute('name'),
        position = inputs[i].getAttribute('position'),
        rel = inputs[i].getAttribute('rel'),
        select = inputs[i].tagName.toLowerCase() === 'map-select';
      if (type === 'width') {
        queryVarNames.query.width = name;
      } else if (type === 'height') {
        queryVarNames.query.height = name;
      } else if (type === 'location') {
        switch (axis) {
          case 'x':
          case 'y':
          case 'column':
          case 'row':
            queryVarNames.query[axis] = name;
            break;
          case 'longitude':
          case 'easting':
            if (position) {
              if (position.match(/.*?-left/i)) {
                if (rel === 'pixel') {
                  queryVarNames.query.pixelleft = name;
                } else if (rel === 'tile') {
                  queryVarNames.query.tileleft = name;
                } else {
                  queryVarNames.query.mapleft = name;
                }
              } else if (position.match(/.*?-right/i)) {
                if (rel === 'pixel') {
                  queryVarNames.query.pixelright = name;
                } else if (rel === 'tile') {
                  queryVarNames.query.tileright = name;
                } else {
                  queryVarNames.query.mapright = name;
                }
              }
            } else {
              queryVarNames.query[axis] = name;
            }
            break;
          case 'latitude':
          case 'northing':
            if (position) {
              if (position.match(/top-.*?/i)) {
                if (rel === 'pixel') {
                  queryVarNames.query.pixeltop = name;
                } else if (rel === 'tile') {
                  queryVarNames.query.tiletop = name;
                } else {
                  queryVarNames.query.maptop = name;
                }
              } else if (position.match(/bottom-.*?/i)) {
                if (rel === 'pixel') {
                  queryVarNames.query.pixelbottom = name;
                } else if (rel === 'tile') {
                  queryVarNames.query.tilebottom = name;
                } else {
                  queryVarNames.query.mapbottom = name;
                }
              }
            } else {
              queryVarNames.query[axis] = name;
            }
            break;
          case 'i':
            if (units === 'tile') {
              queryVarNames.query.tilei = name;
            } else {
              queryVarNames.query.mapi = name;
            }
            break;
          case 'j':
            if (units === 'tile') {
              queryVarNames.query.tilej = name;
            } else {
              queryVarNames.query.mapj = name;
            }
            break;
          default:
          // unsuportted axis value
        }
      } else if (type === 'zoom') {
        //<input name="..." type="zoom" value="0" min="0" max="17">
        queryVarNames.query.zoom = name;
      } else if (select) {
        /*jshint -W104 */
        const parsedselect = inputs[i].htmlselect;
        queryVarNames.query[name] = function () {
          return parsedselect.value;
        };
      } else {
        /*jshint -W104 */
        const input = inputs[i];
        queryVarNames.query[name] = function () {
          return input.getAttribute('value');
        };
      }
    }
    return queryVarNames;
  }
  disconnectedCallback() {}
  // there's a new function in map-extent.getMeta('extent'|'zoom') which was created
  // to be used to pass its return value in here as metaExtent...
  _initTemplateVars() {
    // set up the URL template and associated inputs (which yield variable values when processed)
    var varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g'),
      zoomInput = this.parentElement.querySelector('map-input[type="zoom" i]'),
      includesZoom = false,
      linkedZoomInput;

    var template = this.tref;
    this.zoomInput = zoomInput;

    var v,
      vcount = template.match(varNamesRe),
      inputs = [];
    while ((v = varNamesRe.exec(template)) !== null) {
      let varName = v[1],
        inp = this.parentElement.querySelector(
          'map-input[name=' + varName + '],map-select[name=' + varName + ']'
        );
      if (inp) {
        // this "associates" the input to this  map-link
        inputs.push(inp);

        // I think this means that regardless of whether the tref includes
        // a reference to the zoom input, it gets associated to the link
        // and used (to specify the native zoom bounds??) for the templated(Tile|Image|Features)Layer
        if (
          inp.hasAttribute('type') &&
          inp.getAttribute('type').toLowerCase() === 'zoom'
        ) {
          linkedZoomInput = inp;
        }
        includesZoom =
          includesZoom ||
          (inp.hasAttribute('type') &&
            inp.getAttribute('type').toLowerCase() === 'zoom');
        // moved a block to map-select to transcribe the map-select into an
        // actual html select for inclusion in the layer control.

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
      }
    }
    if (template && vcount.length === inputs.length) {
      if (!includesZoom && zoomInput) {
        inputs.push(zoomInput);
        linkedZoomInput = zoomInput;
      }
      let step = zoomInput ? zoomInput.getAttribute('step') : 1;
      if (!step || step === '0' || isNaN(step)) step = 1;
      // template has a matching input for every variable reference {varref}
      this._templateVars = {
        template: decodeURI(new URL(template, this.getBase())),
        linkEl: this,
        rel: this.rel,
        type: this.type,
        values: inputs,
        zoomBounds: this._getZoomBounds(linkedZoomInput),
        boundsFallbackPCRS: this.getFallbackBounds(),
        // TODO: make map-extent.units fall back automatically
        projection: this.parentElement.units || M.FALLBACK_PROJECTION,
        tms: this.tms,
        step: step
      };
    }
  }
  getZoomBounds() {
    return this._templateVars.zoomBounds;
  }
  /**
   * TODO: review getBounds for sanity, also getFallbackBounds, perhaps integrate
   */
  getBounds() {
    let template = this._templateVars;
    let inputs = template.values,
      projection = template.projection || M.FALLBACK_PROJECTION,
      value = 0,
      boundsUnit = M.FALLBACK_CS;
    let bounds = M[template.projection].options.crs.tilematrix.bounds(0),
      defaultMinZoom = 0,
      defaultMaxZoom = M[template.projection].options.resolutions.length - 1,
      nativeMinZoom = defaultMinZoom,
      nativeMaxZoom = defaultMaxZoom;
    let locInputs = false,
      numberOfAxes = 0;
    for (let i = 0; i < inputs.length; i++) {
      switch (inputs[i].getAttribute('type')) {
        case 'zoom':
          nativeMinZoom = +(inputs[i].hasAttribute('min') &&
          !isNaN(+inputs[i].getAttribute('min'))
            ? inputs[i].getAttribute('min')
            : defaultMinZoom);
          nativeMaxZoom = +(inputs[i].hasAttribute('max') &&
          !isNaN(+inputs[i].getAttribute('max'))
            ? inputs[i].getAttribute('max')
            : defaultMaxZoom);
          value = +inputs[i].getAttribute('value');
          break;
        case 'location':
          if (!inputs[i].getAttribute('max') || !inputs[i].getAttribute('min'))
            continue;
          let max = +inputs[i].getAttribute('max'),
            min = +inputs[i].getAttribute('min');
          switch (inputs[i].getAttribute('axis').toLowerCase()) {
            case 'x':
            case 'longitude':
            case 'column':
            case 'easting':
              boundsUnit = M.axisToCS(
                inputs[i].getAttribute('axis').toLowerCase()
              );
              bounds.min.x = min;
              bounds.max.x = max;
              numberOfAxes++;
              break;
            case 'y':
            case 'latitude':
            case 'row':
            case 'northing':
              boundsUnit = M.axisToCS(
                inputs[i].getAttribute('axis').toLowerCase()
              );
              bounds.min.y = min;
              bounds.max.y = max;
              numberOfAxes++;
              break;
            default:
              break;
          }
          break;
        default:
      }
    }
    if (numberOfAxes >= 2) {
      locInputs = true;
    }
    if (!locInputs && template.boundsFallbackPCRS) {
      bounds = template.boundsFallbackPCRS;
    } else if (locInputs) {
      bounds = M.boundsToPCRSBounds(bounds, value, projection, boundsUnit);
    } else {
      bounds = M[template.projection].options.crs.pcrs.bounds;
    }
    return bounds;
  }
  getBase() {
    let layer = this.getRootNode().host;
    return new URL(
      this.getRootNode().querySelector('map-base') &&
      this.getRootNode() instanceof ShadowRoot
        ? this.getRootNode().querySelector('map-base').getAttribute('href')
        : /* local content? */ !(this.getRootNode() instanceof ShadowRoot)
        ? /* use the baseURI algorithm which takes into account any <base> */
          this.getRootNode().querySelector('map-base')?.getAttribute('href') ||
          this.baseURI
        : /* else use the resolved <layer- src="..."> value */ new URL(
            layer.src,
            layer.baseURI
          ).href
    ).href;
  }
  getFallbackBounds() {
    let bounds;

    let zoom = 0;
    let metaExtent = this.parentElement.getMeta('extent');
    if (metaExtent) {
      let content = M._metaContentToObject(metaExtent.getAttribute('content')),
        cs;

      zoom = content.zoom || zoom;

      let metaKeys = Object.keys(content);
      for (let i = 0; i < metaKeys.length; i++) {
        if (!metaKeys[i].includes('zoom')) {
          cs = M.axisToCS(metaKeys[i].split('-')[2]);
          break;
        }
      }
      let axes = M.csToAxes(cs);
      bounds = M.boundsToPCRSBounds(
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
        zoom,
        projection,
        cs
      );
    } else {
      // TODO review.  Should this.parentElement.units automatically fall back
      // i.e. to OSMTILE if not specified?  Probably, but it does not currently.
      let fallbackProjection =
        M[this.parentElement.units || M.FALLBACK_PROJECTION];
      bounds = fallbackProjection.options.crs.pcrs.bounds;
    }
    return bounds;
  }
  /**
   * Return BOTH min/max(Display)Zoom AND min/maxNativeZoom which
   * are options that can be passed to L.GridLayer...
   * https://leafletjs.com/reference.html#gridlayer-minzoom
   *
   * @param {Object} zoomInput - is an element reference to a map-input[type=zoom]
   * @returns {Object} - returns {minZoom: n,maxZoom: n,minNativeZoom: n,maxNativeZoom: n}
   */
  _getZoomBounds(zoomInput) {
    // native variables should ONLY come from map-input min/max attributes
    // BUT they should fall back to map-meta or projection values for min/max (display) zoom
    // display zoom variables should be EQUAL to native unless specified differently
    // via map-meta name=zoom
    // in particular minNativeZoom being > minZoom can be problematic because
    // you fetch tiles at larger scales (i.e. many many small tiles) and render
    // them at smaller scale (i.e. little postage stamps), which can freez your
    // browser and bury a tile cache in requests, getting you banned/blocked
    //
    // minZoom = map-meta name=zoom min || input type=zoom min || projection minZoom
    // minNativeZoom = input type=zoom min || minZoom
    // maxZoom = map-meta name=zoom max || input type=zoom max || projection maxZoom
    // maxNativeZoom = input type=zoom max || maxZoom

    let zoomBounds = {};
    // search document from here up, using closest source of zoom bounds info
    let meta = this.parentElement.getMeta('zoom');
    let metaMin = meta
      ? +M._metaContentToObject(meta.getAttribute('content'))?.min
      : null;
    zoomBounds.minZoom =
      metaMin || (zoomInput ? +zoomInput.getAttribute('min') : 0);
    zoomBounds.minNativeZoom = zoomInput
      ? +zoomInput.getAttribute('min')
      : zoomBounds.minZoom;
    let metaMax = meta
      ? +M._metaContentToObject(meta.getAttribute('content'))?.max
      : null;
    zoomBounds.maxZoom =
      metaMax ||
      (zoomInput
        ? +zoomInput.getAttribute('max')
        : M[this.parentElement.units || M.FALLBACK_PROJECTION].options
            .resolutions.length - 1);
    zoomBounds.maxNativeZoom = zoomInput
      ? +zoomInput.getAttribute('max')
      : zoomBounds.maxZoom;

    return zoomBounds;
  }
  _validateDisabled() {
    return this._templatedLayer.isVisible;
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
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      switch (this.rel.toLowerCase()) {
        // for some cases, require a dependency check
        case 'tile':
        case 'image':
        case 'features':
          if (this._templatedLayer) {
            resolve();
          }
          interval = setInterval(testForContentLink, 300, this);
          failureTimer = setTimeout(linkNotDefined, 10000);
          break;
        case 'query':
        case 'style':
        case 'self':
        case 'style self':
        case 'self style':
        case 'zoomin':
        case 'zoomout':
        case 'legend':
        case 'stylesheet':
        case 'alternate':
        case 'license':
          resolve();
          break;
      }
      function testForContentLink(linkElement) {
        if (linkElement._linkLayer) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!linkElement.isConnected) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('map-link was disconnected while waiting to be ready');
        }
      }
      function linkNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for link to be ready');
      }
    });
  }
}
