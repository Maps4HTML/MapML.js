import {
  bounds,
  point,
  extend,
  DomEvent,
  stamp,
  Util as LeafletUtil
} from 'leaflet';

import { Util } from './mapml/utils/Util.js';
import { templatedImageLayer } from './mapml/layers/TemplatedImageLayer.js';
import { templatedTileLayer } from './mapml/layers/TemplatedTileLayer.js';
import { templatedFeaturesOrTilesLayer } from './mapml/layers/TemplatedFeaturesOrTilesLayer.js';
import { templatedPMTilesLayer } from './mapml/layers/TemplatedPMTilesLayer.js';
/* global M */

export class HTMLLinkElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'type',
      'rel',
      //      'title',
      'media',
      'href',
      'hreflang',
      'tref',
      'tms',
      'projection',
      'disabled'
    ];
  }
  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get type() {
    return this.getAttribute('type') || 'image/*';
  }
  set type(val) {
    // improve this
    if (
      val === 'text/mapml' ||
      val.startsWith('image/' || val === 'application/pmtiles')
    ) {
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
    if (this.hasAttribute('href')) {
      return new URL(this.getAttribute('href'), this.getBase()).href;
    } else if (this.hasAttribute('tref')) {
      return this.resolve();
    }
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
    if (!this.hasAttribute('tref')) {
      return M.BLANK_TT_TREF;
    }
    return this.getAttribute('tref');
  }
  set tref(val) {
    // improve this
    if (val) {
      this.setAttribute('tref', val);
    }
  }
  get media() {
    return this.getAttribute('media');
  }
  set media(val) {
    this.setAttribute('media', val);
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
  get extent() {
    // calculate the bounds of content, return it.
    // _templateVars existence happens for both templated layers and query links
    return this._templateVars
      ? Object.assign(
          Util._convertAndFormatPCRS(
            this.getBounds(),
            M[this.parentExtent.units],
            this.parentExtent.units
          ),
          { zoom: this.getZoomBounds() }
        )
      : null;
  }
  zoomTo() {
    let extent = this.extent;
    if (!extent) return;
    let map = this.getMapEl()._map,
      xmin = extent.topLeft.pcrs.horizontal,
      xmax = extent.bottomRight.pcrs.horizontal,
      ymin = extent.bottomRight.pcrs.vertical,
      ymax = extent.topLeft.pcrs.vertical,
      newBounds = bounds(point(xmin, ymin), point(xmax, ymax)),
      center = map.options.crs.unproject(newBounds.getCenter(true)),
      maxZoom = extent.zoom.maxZoom,
      minZoom = extent.zoom.minZoom;
    map.setView(center, Util.getMaxZoom(newBounds, map, minZoom, maxZoom), {
      animate: false
    });
  }
  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  getLayerEl() {
    return Util.getClosest(this, 'map-layer,layer-');
  }
  get disabled() {
    return this.hasAttribute('disabled');
  }
  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    //['type','rel','href','hreflang','tref','tms','projection'];
    // fold to lowercase
    if (this.#hasConnected /* jshint ignore:line */) {
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
        case 'media':
          if (oldValue !== newValue) {
            this._registerMediaQuery(newValue);
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
        case 'disabled':
          if (typeof newValue === 'string') {
            this._disableLink();
          } else {
            this._enableLink();
          }
          break;
      }
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  async connectedCallback() {
    this.#hasConnected = true; /* jshint ignore:line */
    if (
      this.getLayerEl().hasAttribute('data-moving') ||
      (this.parentExtent && this.parentExtent.hasAttribute('data-moving'))
    )
      return;
    switch (this.rel.toLowerCase()) {
      // for some cases, require a dependency check
      case 'tile':
      case 'image':
      case 'features':
      case 'query':
        // because we skip the attributeChangedCallback for initialization,
        // respect the disabled attribute which can be set by the author prior
        // to initialization
        if (!this.disabled) {
          this._initTemplateVars();
          await this._createTemplatedLink();
        }
        break;
      case 'style':
      case 'self':
      case 'style self':
      case 'self style':
        this._createSelfOrStyleLink();
        break;
      case 'zoomin':
      case 'zoomout':
        //        this._createZoominOrZoomoutLink();
        break;
      case 'legend':
        //this._createLegendLink();
        break;
      case 'stylesheet':
        if (!this.disabled) {
          this._createStylesheetLink();
        }
        break;
      case 'alternate':
        this._createAlternateLink(); // add media attribute
        break;
      case 'license':
        // this._createLicenseLink();
        break;
    }
    // the media attribute uses / overrides the disabled attribute to enable or
    // disable the link, so at this point the #hasConnected must be true so
    // that the disabled attributeChangedCallback can have its desired side effect
    await this._registerMediaQuery(this.media);
    // create the type of templated leaflet layer appropriate to the rel value
    // image/map/features = templated(Image/Feature), tile=templatedTile,
    // this._tempatedTileLayer = Util.templatedTile(pane: this.extentElement._leafletLayer._container)
    // add to viewer._map dependant on map-extent.checked, map-layer.checked
    // what else?
  }
  disconnectedCallback() {
    switch (this.rel.toLowerCase()) {
      case 'stylesheet':
        if (this._stylesheetHost) {
          this.link.remove();
        }
        break;
      default:
        break;
    }
  }
  _disableLink() {
    switch (this.rel.toLowerCase()) {
      case 'tile':
      case 'image':
      case 'features':
        // tile, image, features
        if (
          this._templatedLayer &&
          this.parentExtent?._extentLayer?.hasLayer(this._templatedLayer)
        ) {
          this.parentExtent._extentLayer.removeLayer(this._templatedLayer);
          delete this._templatedLayer;
          this.shadowRoot.innerHTML = '';
          this.getLayerEl()._validateDisabled();
        }
        break;
      case 'query':
        delete this._templateVars;
        if (this.shadowRoot) {
          this.shadowRoot.innerHTML = '';
        }
        this.getLayerEl()._validateDisabled();
        break;
      case 'stylesheet':
        delete this._pmtilesRules;
        delete this._stylesheetHost;
        if (this.link) {
          this.link.remove();
          delete this.link;
        }
        break;
    }
  }
  async _enableLink() {
    switch (this.rel.toLowerCase()) {
      case 'tile':
      case 'image':
      case 'features':
      case 'query':
        this._initTemplateVars();
        await this._createTemplatedLink();
        this.getLayerEl()._validateDisabled();
        break;
      case 'stylesheet':
        this._createStylesheetLink();
        break;
    }
  }
  async _registerMediaQuery(mq) {
    if (!this._changeHandler) {
      // Define and bind the change handler once
      this._changeHandler = () => {
        this.disabled = !this._mql.matches;
      };
    }

    if (mq) {
      let map = this.getMapEl();
      if (!map) return;
      // have to wait until map has an extent i.e. is ready, because the
      // matchMedia function below relies on it for map related queries
      await map.whenReady();

      // Remove listener from the old media query (if it exists)
      if (this._mql) {
        this._mql.removeEventListener('change', this._changeHandler);
      }

      // Set up the new media query and listener
      this._mql = map.matchMedia(mq);
      this._changeHandler(); // Initial evaluation
      this._mql.addEventListener('change', this._changeHandler);
    } else if (this._mql) {
      // Clean up the existing listener
      this._mql.removeEventListener('change', this._changeHandler);
      delete this._mql;
      // unlike map-layer.disabled, map-link.disabled is an observed attribute
      this.disabled = false;
    }
  }
  _createAlternateLink(mapml) {
    if (this.href && this.projection) this._alternate = true;
  }
  _createStylesheetLink() {
    // MIME type application/pmtiles+stylesheet is an invention of the requirement to get
    // closer to loading style rules as CSS does, via link / (map-link)
    // we could probably do something similar with map-style i.e. treat the
    // content of map-style as though it was a stylesheet tbd caveat CSP
    if (this.type === 'application/pmtiles+stylesheet') {
      const pmtilesStyles = new URL(this.href, this.getBase()).href;
      import(pmtilesStyles)
        .then((module) => module.pmtilesRulesReady)
        .then((initializedRules) => {
          this._pmtilesRules = initializedRules;
        })
        .catch((reason) => {
          console.error(
            'Error importing pmtiles symbolizer rules or theme: \n' + reason
          );
        });
    } else {
      // a CSS stylesheet
      // if the parent element is a map-link, the stylesheet is a link that should
      //  be loaded as part of a templated layer processing i.e. on moveend
      //  and the generated <link> that implements this <map-link> should be located
      //  in the parent <map-link>._templatedLayer.container root node if
      //  the _templatedLayer is an instance of TemplatedTileLayer or
      //  TemplatedFeaturesOrTilesLayer
      //
      // if the parent node (or the host of the shadow root parent node) is map-layer, the link should be created in the _layer
      // container
      this._stylesheetHost =
        this.getRootNode() instanceof ShadowRoot
          ? this.getRootNode().host
          : this.parentElement;
      if (this._stylesheetHost === undefined) return;

      this.link = document.createElement('link');
      this.link.mapLink = this;
      this.link.setAttribute('href', new URL(this.href, this.getBase()).href);
      copyAttributes(this, this.link);

      if (this._stylesheetHost._layer) {
        this._stylesheetHost._layer.renderStyles(this);
      } else if (this._stylesheetHost._templatedLayer) {
        this._stylesheetHost._templatedLayer.renderStyles(this);
      } else if (this._stylesheetHost._extentLayer) {
        this._stylesheetHost._extentLayer.renderStyles(this);
      }
    }

    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach((attribute) => {
        if (attribute.nodeName !== 'href' && attribute.nodeName !== 'media')
          target.setAttribute(attribute.nodeName, attribute.nodeValue);
      });
    }
  }

  async _createTemplatedLink() {
    // conditions check
    // the tms and type attributes are optional, may need to be checked in future
    this.parentExtent =
      this.parentNode.nodeName.toUpperCase() === 'MAP-EXTENT'
        ? this.parentNode
        : this.parentNode.host;
    if (this.disabled || !this.tref || !this.parentExtent) return;
    try {
      await this.parentExtent.whenReady();
      await this._templateVars.inputsReady;
    } catch (error) {
      console.log('Error while creating templated link: ' + error);
      return;
    }
    this.mapEl = this.getMapEl();
    // create the layer type appropriate to the rel value
    this.zIndex = Array.from(
      this.parentExtent.querySelectorAll(
        'map-link[rel=image],map-link[rel=tile],map-link[rel=features]'
      )
    ).indexOf(this);
    if (
      (this.rel === 'tile' && this.type === 'application/pmtiles') ||
      this.type === 'application/vnd.mapbox-vector-tile'
    ) {
      let s =
        'map-link[rel="stylesheet"][type="application/pmtiles+stylesheet"]:not([disabled])';
      let pmtilesStylesheetLink = this.getLayerEl().src
        ? this.closest('map-extent')?.querySelector(s) ??
          this.getRootNode().querySelector(':host > ' + s)
        : Util.getClosest(
            this,
            'map-extent:has(' +
              s +
              '),map-layer:has(' +
              s +
              '),layer-:has(' +
              s +
              ')'
          )?.querySelector(s);
      if (pmtilesStylesheetLink) {
        await pmtilesStylesheetLink.whenReady();
        let options = {
          zoomBounds: this.getZoomBounds(),
          extentBounds: this.getBounds(),
          crs: M[this.parentExtent.units],
          zIndex: this.zIndex,
          pane: this.parentExtent._extentLayer.getContainer(),
          linkEl: this,
          pmtilesRules: pmtilesStylesheetLink?._pmtilesRules
        };
        this._templatedLayer = templatedPMTilesLayer(
          this._templateVars,
          options
        ).addTo(this.parentExtent._extentLayer);
      } else {
        console.warn('Stylesheet not found for ' + this._templateVars.template);
      }
    } else if (this.rel === 'tile') {
      this._templatedLayer = templatedTileLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        crs: M[this.parentExtent.units],
        errorTileUrl:
          'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer(),
        linkEl: this
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'image') {
      this._templatedLayer = templatedImageLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer(),
        linkEl: this
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'features') {
      // map-feature retrieved by link will be stored in shadowRoot owned by link
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      // Use the FeaturesTilesLayerGroup to handle both map-feature and map-tile elements
      this._templatedLayer = templatedFeaturesOrTilesLayer(this._templateVars, {
        zoomBounds: this.getZoomBounds(),
        extentBounds: this.getBounds(),
        zIndex: this.zIndex,
        pane: this.parentExtent._extentLayer.getContainer(),
        linkEl: this,
        projection: this.mapEl._map.options.projection
      }).addTo(this.parentExtent._extentLayer);
    } else if (this.rel === 'query') {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      extend(this._templateVars, this._setupQueryVars(this._templateVars));
      extend(this._templateVars, { extentBounds: this.getBounds() });
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
  _initTemplateVars() {
    // set up the URL template and associated inputs (which yield variable values when processed)
    var varNamesRe = new RegExp('(?:{)(.*?)(?:})', 'g'),
      zoomInput = this.parentElement.querySelector('map-input[type="zoom" i]'),
      includesZoom = false,
      linkedZoomInput;

    var template = this.tref;
    if (template === M.BLANK_TT_TREF) {
      for (let i of this.parentElement.querySelectorAll('map-input')) {
        template += `{${i.getAttribute('name')}}`;
      }
    }
    this.zoomInput = zoomInput;

    var v,
      vcount = template.match(varNamesRe) || [],
      inputs = [],
      inputsReady = [];
    while ((v = varNamesRe.exec(template)) !== null) {
      let varName = v[1],
        inp = this.parentElement.querySelector(
          'map-input[name=' + varName + '],map-select[name=' + varName + ']'
        );
      if (inp) {
        // this "associates" the input to this  map-link
        inputs.push(inp);
        inputsReady.push(inp.whenReady());

        // I think this means that regardless of whether the tref includes
        // a reference to the zoom input, it gets associated to the link
        // and used (to specify the native zoom bounds??) for the templated(Tile|Image|Features)Layer
        if (
          inp.hasAttribute('type') &&
          inp.getAttribute('type').toLowerCase() === 'zoom'
        ) {
          linkedZoomInput = inp;
          includesZoom = true;
        }
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
        inputsReady: Promise.allSettled(inputsReady),
        zoom: linkedZoomInput,
        projection: this.parentElement.units,
        tms: this.tms,
        step: step
      };
    }
  }
  getZoomBounds() {
    return this._getZoomBounds(this._templateVars.zoom);
  }
  /**
   * TODO: review getBounds for sanity, also getFallbackBounds, perhaps integrate
   * there is no other kind of bounds but native....
   *  each rectangle must be established and valid and converted to PCRS coordinates...
    // "native" bounds = input type=location min max || map-extent/map-meta name=extent min,max || map-layer/map-meta name=extent min,max || layer projection min/max
 */
  getBounds() {
    let template = this._templateVars;
    let inputs = template.values,
      projection = this.parentElement.units,
      boundsUnit = {};
    boundsUnit.name = M.FALLBACK_CS;
    let bnds = M[projection].options.crs.tilematrix.bounds(0),
      locInputs = false,
      numberOfAxes = 0,
      horizontalAxis = false,
      verticalAxis = false;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].getAttribute('type') === 'location') {
        if (!inputs[i].getAttribute('max') || !inputs[i].getAttribute('min'))
          continue;
        let max = +inputs[i].getAttribute('max'),
          min = +inputs[i].getAttribute('min');
        switch (inputs[i].getAttribute('axis').toLowerCase()) {
          case 'x':
          case 'longitude':
          case 'column':
          case 'easting':
            boundsUnit.name = Util.axisToCS(
              inputs[i].getAttribute('axis').toLowerCase()
            );
            bnds.min.x = min;
            bnds.max.x = max;
            boundsUnit.horizontalAxis = inputs[i]
              .getAttribute('axis')
              .toLowerCase();
            break;
          case 'y':
          case 'latitude':
          case 'row':
          case 'northing':
            boundsUnit.name = Util.axisToCS(
              inputs[i].getAttribute('axis').toLowerCase()
            );
            bnds.min.y = min;
            bnds.max.y = max;
            boundsUnit.verticalAxis = inputs[i]
              .getAttribute('axis')
              .toLowerCase();
            break;
          default:
            break;
        }
      }
    }
    if (
      boundsUnit.horizontalAxis &&
      boundsUnit.verticalAxis &&
      ((boundsUnit.horizontalAxis === 'x' && boundsUnit.verticalAxis === 'y') ||
        (boundsUnit.horizontalAxis === 'longitude' &&
          boundsUnit.verticalAxis === 'latitude') ||
        (boundsUnit.horizontalAxis === 'column' &&
          boundsUnit.verticalAxis === 'row') ||
        (boundsUnit.horizontalAxis === 'easting' &&
          boundsUnit.verticalAxis === 'northing'))
    ) {
      locInputs = true;
    }
    if (locInputs) {
      let zoomValue = this._templateVars.zoom?.hasAttribute('value')
        ? +this._templateVars.zoom.getAttribute('value')
        : 0;
      bnds = Util.boundsToPCRSBounds(
        bnds,
        zoomValue,
        projection,
        boundsUnit.name
      );
    } else if (!locInputs) {
      bnds = this.getFallbackBounds(projection);
    }
    return bnds;
  }
  getFallbackBounds(projection) {
    let bnds;

    let zoom = 0;
    let metaExtent = this.parentElement.getMeta('extent');
    if (metaExtent) {
      let content = Util._metaContentToObject(
          metaExtent.getAttribute('content')
        ),
        cs;

      zoom = content.zoom || zoom;

      let metaKeys = Object.keys(content);
      for (let i = 0; i < metaKeys.length; i++) {
        if (!metaKeys[i].includes('zoom')) {
          cs = Util.axisToCS(metaKeys[i].split('-')[2]);
          break;
        }
      }
      let axes = Util.csToAxes(cs);
      bnds = Util.boundsToPCRSBounds(
        bounds(
          point(
            +content[`top-left-${axes[0]}`],
            +content[`top-left-${axes[1]}`]
          ),
          point(
            +content[`bottom-right-${axes[0]}`],
            +content[`bottom-right-${axes[1]}`]
          )
        ),
        zoom,
        projection,
        cs
      );
    } else {
      let crs = M[projection];
      bnds = crs.options.crs.pcrs.bounds;
    }
    return bnds;
  }
  getBase() {
    let layer = this.getRootNode().host;
    //
    let relativeURL =
      this.getRootNode().querySelector('map-base') &&
      this.getRootNode() instanceof ShadowRoot
        ? this.getRootNode().querySelector('map-base').getAttribute('href')
        : /* local content? */ !(this.getRootNode() instanceof ShadowRoot)
        ? /* use the baseURI algorithm which takes into account any <base> */
          this.getRootNode().querySelector('map-base')?.getAttribute('href') ||
          this.baseURI
        : /* else use the resolved <map-layer src="..."> value */ new URL(
            layer.src,
            layer.baseURI
          ).href;

    // when remote content, use layer.src as base else use baseURI of map-link
    let baseURL =
      this.getRootNode() instanceof ShadowRoot
        ? new URL(layer.src, layer.baseURI).href
        : this.baseURI;
    return new URL(relativeURL, baseURL).href;
  }
  /**
   * Return BOTH min/max(Display)Zoom AND min/maxNativeZoom which
   * are options that can be passed to GridLayer...
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
      ? +Util._metaContentToObject(meta.getAttribute('content'))?.min
      : null;
    zoomBounds.minZoom =
      metaMin || (zoomInput ? +zoomInput.getAttribute('min') : 0);
    zoomBounds.minNativeZoom = zoomInput
      ? +zoomInput.getAttribute('min')
      : zoomBounds.minZoom;
    let metaMax = meta
      ? +Util._metaContentToObject(meta.getAttribute('content'))?.max
      : null;
    zoomBounds.maxZoom =
      metaMax ||
      (zoomInput
        ? +zoomInput.getAttribute('max')
        : M[this.parentElement.units].options.resolutions.length - 1);
    zoomBounds.maxNativeZoom = zoomInput
      ? +zoomInput.getAttribute('max')
      : zoomBounds.maxZoom;

    return zoomBounds;
  }
  isVisible() {
    if (this.disabled) return false;
    let isVisible = false,
      map = this.getMapEl(),
      mapZoom = map.zoom,
      extent = map.extent,
      xmin = extent.topLeft.pcrs.horizontal,
      xmax = extent.bottomRight.pcrs.horizontal,
      ymin = extent.bottomRight.pcrs.vertical,
      ymax = extent.topLeft.pcrs.vertical,
      mapBounds = bounds(point(xmin, ymin), point(xmax, ymax));

    if (this._templatedLayer) {
      isVisible = this._templatedLayer.isVisible();
    } else if (this.rel === 'query') {
      const minZoom = this.extent.zoom.minZoom,
        maxZoom = this.extent.zoom.maxZoom,
        withinZoomBounds = (z) => {
          return minZoom <= z && z <= maxZoom;
        };

      if (this.getBounds().overlaps(mapBounds) && withinZoomBounds(mapZoom)) {
        isVisible = true;
      }
    }
    return isVisible;
  }
  _createSelfOrStyleLink() {
    let layerEl = this.getLayerEl();
    const changeStyle = function (e) {
      DomEvent.stop(e);
      layerEl.dispatchEvent(
        new CustomEvent('changestyle', {
          detail: {
            src: e.target.getAttribute('data-href')
          }
        })
      );
    };

    let styleOption = document.createElement('div'),
      styleOptionInput = styleOption.appendChild(
        document.createElement('input')
      );
    styleOptionInput.setAttribute('type', 'radio');
    styleOptionInput.setAttribute('id', 'rad-' + stamp(styleOptionInput));
    styleOptionInput.setAttribute(
      'name',
      // grouping radio buttons based on parent layer's style <detail>
      'styles-' + stamp(styleOption)
    );
    styleOptionInput.setAttribute('value', this.getAttribute('title'));
    styleOptionInput.setAttribute(
      'data-href',
      new URL(this.href, this.getBase()).href
    );
    var styleOptionLabel = styleOption.appendChild(
      document.createElement('label')
    );
    styleOptionLabel.setAttribute('for', 'rad-' + stamp(styleOptionInput));
    styleOptionLabel.innerText = this.title;
    if (this.rel === 'style self' || this.rel === 'self style') {
      styleOptionInput.checked = true;
    }
    this._styleOption = styleOption;
    styleOptionInput.addEventListener('click', changeStyle.bind(this));
  }
  getLayerControlOption() {
    return this._styleOption;
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
        return LeafletUtil.template(this.tref, obj);
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
      let interval, failureTimer, ready;
      switch (this.rel.toLowerCase()) {
        // for some cases, require a dependency check
        case 'tile':
        case 'image':
        case 'features':
          ready = '_templatedLayer';
          if (this.disabled) resolve();
          break;
        case 'style':
        case 'self':
        case 'style self':
        case 'self style':
          ready = '_styleOption';
          break;
        case 'query':
          ready = 'shadowRoot';
          if (this.disabled) resolve();
          break;
        case 'alternate':
          ready = '_alternate';
          break;
        case 'stylesheet':
          if (this.type === 'application/pmtiles+stylesheet') {
            ready = '_pmtilesRules';
          } else {
            ready = '_stylesheetHost';
          }
          break;
        case 'zoomin':
        case 'zoomout':
        case 'legend':
        case 'license':
          resolve();
          break;
        default:
          resolve();
          break;
      }
      if (this[ready]) {
        resolve();
      }
      interval = setInterval(testForLinkReady, 300, this);
      failureTimer = setTimeout(linkNotDefined, 1000);
      function testForLinkReady(linkElement) {
        if (linkElement[ready]) {
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
