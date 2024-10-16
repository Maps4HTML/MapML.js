import { Util } from './mapml/utils/Util';
import { MapMLLayer, mapMLLayer } from './mapml/layers/MapMLLayer';
import { createLayerControlHTML } from './mapml/elementSupport/layers/createLayerControlForLayer';

export class HTMLMapLayerElement extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'label', 'checked', 'hidden', 'opacity'];
  }
  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get src() {
    return this.hasAttribute('src') ? this.getAttribute('src') : '';
  }

  set src(val) {
    if (val) {
      this.setAttribute('src', val);
    }
  }
  get label() {
    if (this._layer) return this._layer.getName();
    else return this.hasAttribute('label') ? this.getAttribute('label') : '';
  }
  set label(val) {
    if (val) {
      this.setAttribute('label', val);
    }
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

  get opacity() {
    // use ?? since 0 is falsy, || would return rhs in that case
    return +(this._opacity ?? this.getAttribute('opacity'));
  }

  set opacity(val) {
    if (+val > 1 || +val < 0) return;
    this.setAttribute('opacity', val);
  }

  get extent() {
    // calculate the bounds of all content, return it.
    if (this._layer && !this._layer.bounds) {
      this._layer._calculateBounds();
    }
    return this._layer
      ? Object.assign(
          Util._convertAndFormatPCRS(
            this._layer.bounds,
            M[this.getProjection()],
            this.getProjection()
          ),
          { zoom: this._layer.zoomBounds }
        )
      : null;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'label':
          this._layer.setName(newValue);
          break;
        case 'checked':
          if (typeof newValue === 'string') {
            this.parentElement._map.addLayer(this._layer);
          } else {
            this.parentElement._map.removeLayer(this._layer);
          }
          this._layerControlCheckbox.checked = this.checked;
          this.dispatchEvent(new CustomEvent('map-change'));
          break;
        case 'hidden':
          if (typeof newValue === 'string') {
            this._layerControl.removeLayer(this._layer);
          } else {
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
            this._validateDisabled();
          }
          break;
        case 'opacity':
          if (oldValue !== newValue && this._layer) {
            this._opacity = newValue;
            this._layer.changeOpacity(newValue);
          }
          break;
        case 'src':
          if (oldValue !== newValue) {
            this._onRemove();
            if (this.isConnected) {
              this._onAdd();
            }
          }
      }
    }
  }

  constructor() {
    // Always call super first in constructor
    super();
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = this.opacity || 1.0;
    this._renderingMapContent = M.options.contentPreference;
    this.attachShadow({ mode: 'open' });
  }
  disconnectedCallback() {
    // if the map-layer node is removed from the dom, the layer should be
    // removed from the map and the layer control
    if (this.hasAttribute('data-moving')) return;
    this._onRemove();
  }

  _onRemove() {
    if (this._observer) {
      this._observer.disconnect();
    }
    let l = this._layer,
      lc = this._layerControl,
      lchtml = this._layerControlHTML;
    // remove properties of layer involved in whenReady() logic
    delete this._layer;
    delete this._layerControl;
    delete this._layerControlHTML;
    delete this._fetchError;
    this.shadowRoot.innerHTML = '';
    if (this.src) this.innerHTML = '';

    if (l) {
      l.off();
    }
    // if this layer has never been connected, it will not have a _layer
    if (l && l._map) {
      l._map.removeLayer(l);
    }

    if (lc && !this.hidden) {
      lc.removeLayer(l);
    }
  }

  connectedCallback() {
    if (this.hasAttribute('data-moving')) return;
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    this._createLayerControlHTML = createLayerControlHTML.bind(this);
    const doConnected = this._onAdd.bind(this);
    const doRemove = this._onRemove.bind(this);
    this.parentElement
      .whenReady()
      .then(() => {
        doRemove();
        doConnected();
      })
      .catch((error) => {
        throw new Error('Map never became ready: ' + error);
      });
  }

  _onAdd() {
    new Promise((resolve, reject) => {
      this.addEventListener(
        'changestyle',
        function (e) {
          e.stopPropagation();
          // if user changes the style in layer control
          if (e.detail) {
            this._renderingMapContent = e.detail._renderingMapContent;
            this.src = e.detail.src;
          }
        },
        { once: true }
      );
      this.addEventListener(
        'zoomchangesrc',
        function (e) {
          e.stopPropagation();
          this.src = e.detail.href;
        },
        { once: true }
      );
      let base = this.baseURI ? this.baseURI : document.baseURI;
      const headers = new Headers();
      headers.append('Accept', 'text/mapml');
      if (this.src) {
        fetch(this.src, { headers: headers })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
          })
          .then((mapml) => {
            let content = new DOMParser().parseFromString(mapml, 'text/xml');
            if (
              content.querySelector('parsererror') ||
              !content.querySelector('mapml-')
            ) {
              // cut short whenReady with the _fetchError property
              this._fetchError = true;
              console.log('Error fetching layer content:\n\n' + mapml + '\n');
              throw new Error('Parser error');
            }
            return content;
          })
          .then((content) => {
            this.copyRemoteContentToShadowRoot(content.querySelector('mapml-'));
            let elements = this.shadowRoot.querySelectorAll('*');
            let elementsReady = [];
            for (let i = 0; i < elements.length; i++) {
              if (elements[i].whenReady)
                elementsReady.push(elements[i].whenReady());
            }
            return Promise.allSettled(elementsReady);
          })
          .then(() => {
            // may throw:
            this.selectAlternateOrChangeProjection();
            this.checkForPreferredContent();
          })
          .then(() => {
            this._layer = mapMLLayer(new URL(this.src, base).href, this, {
              projection: this.getProjection(),
              opacity: this.opacity
            });
            this._createLayerControlHTML();
            this._attachedToMap();
            // initializing map-features that previously exist
            this._runMutationObserver(this.shadowRoot.children);
            this._bindMutationObserver();
            this._validateDisabled();
            // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
            // to MapML extent as metadata
            // Should always be fired at the end of initialization process
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
            // https://maps4html.org/web-map-doc/docs/api/layer-api#events
            this.dispatchEvent(
              new CustomEvent('loadedmetadata', { detail: { target: this } })
            );
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        let elements = this.querySelectorAll('*');
        let elementsReady = [];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].whenReady)
            elementsReady.push(elements[i].whenReady());
        }
        Promise.allSettled(elementsReady)
          .then(() => {
            // may throw:
            this.selectAlternateOrChangeProjection();
            this.checkForPreferredContent();
          })
          .then(() => {
            this._layer = mapMLLayer(null, this, {
              projection: this.getProjection(),
              opacity: this.opacity
            });
            this._createLayerControlHTML();
            this._attachedToMap();
            // initializing map-features that previously exist
            this._runMutationObserver(this.children);
            this._bindMutationObserver();
            this._validateDisabled();
            // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
            // to MapML extent as metadata
            // Should always be fired at the end of initialization process
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
            // https://maps4html.org/web-map-doc/docs/api/layer-api#events
            this.dispatchEvent(
              new CustomEvent('loadedmetadata', { detail: { target: this } })
            );
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    }).catch((e) => {
      if (e.message === 'changeprojection') {
        if (e.cause.href) {
          console.log('Changing layer src to: ' + e.cause.href);
          this.src = e.cause.href;
        } else if (e.cause.mapprojection) {
          console.log(
            'Changing map projection to match layer: ' + e.cause.mapprojection
          );
          this.parentElement.projection = e.cause.mapprojection;
        }
      } else if (e.message === 'findmatchingpreferredcontent') {
        if (e.cause.href) {
          console.log(
            'Changing layer to matching preferred content at: ' + e.cause.href
          );
          this.src = e.cause.href;
        }
      } else if (e.message === 'Failed to fetch') {
        // cut short whenReady with the _fetchError property
        this._fetchError = true;
      } else {
        console.log(e);
        this.dispatchEvent(
          new CustomEvent('error', { detail: { target: this } })
        );
      }
    });
  }

  selectAlternateOrChangeProjection() {
    let mapml = this.src ? this.shadowRoot : this;
    let selectedAlternate =
      this.getProjection() !== this.parentElement.projection &&
      mapml.querySelector(
        'map-link[rel=alternate][projection=' +
          this.parentElement.projection +
          '][href]'
      );

    if (selectedAlternate) {
      let url = new URL(
        selectedAlternate.getAttribute('href'),
        selectedAlternate.getBase()
      ).href;
      throw new Error('changeprojection', {
        cause: { href: url }
      });
    }
    let contentProjection = this.getProjection();
    if (
      contentProjection !== this.parentElement.projection &&
      this.parentElement.layers.length === 1
    ) {
      throw new Error('changeprojection', {
        cause: { mapprojection: contentProjection }
      });
    }
  }

  checkForPreferredContent() {
    let mapml = this.src ? this.shadowRoot : this;
    let availablePreferMapContents = mapml.querySelector(
      `map-link[rel="style"][media="prefers-map-content=${this._renderingMapContent}"][href]`
    );
    if (availablePreferMapContents) {
      // resolve href
      let url = new URL(
        availablePreferMapContents.getAttribute('href'),
        availablePreferMapContents.getBase()
      ).href;
      throw new Error('findmatchingpreferredcontent', {
        cause: { href: url }
      });
    }
  }

  copyRemoteContentToShadowRoot(mapml) {
    let shadowRoot = this.shadowRoot;
    // get the map-meta[name=projection/cs/extent/zoom] from map-head of remote mapml, attach them to the shadowroot
    let frag = document.createDocumentFragment();
    let elements = mapml.querySelectorAll('map-head > *, map-body > *');
    for (let i = 0; i < elements.length; i++) {
      frag.appendChild(elements[i]);
    }
    shadowRoot.appendChild(frag);
  }
  /**
   * For "local" content, getProjection will use content of "this"
   * For "remote" content, you need to pass the shadowRoot to search through
   */
  getProjection() {
    let mapml = this.src ? this.shadowRoot : this;
    let projection = this.parentElement.projection;
    if (mapml.querySelector('map-meta[name=projection][content]')) {
      projection =
        Util._metaContentToObject(
          mapml
            .querySelector('map-meta[name=projection]')
            .getAttribute('content')
        ).content || projection;
    } else if (mapml.querySelector('map-extent[units]')) {
      const getProjectionFrom = (extents) => {
        let extentProj = extents[0].attributes.units.value;
        let isMatch = true;
        for (let i = 0; i < extents.length; i++) {
          if (extentProj !== extents[i].attributes.units.value) {
            isMatch = false;
          }
        }
        return isMatch ? extentProj : null;
      };
      projection =
        getProjectionFrom(
          Array.from(mapml.querySelectorAll('map-extent[units]'))
        ) || projection;
    } else {
      console.log(
        `A projection was not assigned to the '${mapml.label}' Layer. Please specify a projection for that layer using a map-meta element. See more here - https://maps4html.org/web-map-doc/docs/elements/meta/`
      );
    }
    return projection;
  }
  /*
   * Runs the effects of the mutation observer, which is to add map-features' and
   * map-extents' leaflet layer implementations to the appropriate container in
   * the map-layer._layer: either as a sub-layer directly in the L.LayerGroup
   * (MapMLLayer._layer) or as a sub-layer in the MapMLLayer._mapmlvectors
   * L.FeatureGroup
   */
  _runMutationObserver(elementsGroup) {
    const _addFeatureToMapMLVectors = (feature) => {
      this.whenReady().then(() => {
        // the layer extent must change as features are added, this.extent
        // property only recalculates the bounds and zoomBounds when .bounds
        // doesn't exist, so delete it to ensure that the extent is reset
        delete this._layer.bounds;
        feature.addFeature(this._layer._mapmlvectors);
      });
    };
    const _addStylesheetLink = (mapLink) => {
      this.whenReady().then(() => {
        this._layer.appendStyleLink(mapLink);
      });
    };
    const _addStyleElement = (mapStyle) => {
      this.whenReady().then(() => {
        this._layer.appendStyleElement(mapStyle);
      });
    };
    const _addExtentElement = (mapExtent) => {
      this.whenReady().then(() => {
        // see comment regarding features / extent. Same thing applies to
        // map-extent
        delete this._layer.bounds;
        this._validateDisabled();
      });
    };
    // is this really necessary?  Do we believe that remote mapml documents will
    // be interactive i.e. script access to their DOM?
    let root = this.src ? this.shadowRoot : this,
      pseudo = root instanceof ShadowRoot ? ':host' : ':scope';
    const _addMetaElement = (mapMeta) => {
      this.whenReady().then(() => {
        this._layer._calculateBounds();
        this._validateDisabled();
      });
    };
    for (let i = 0; i < elementsGroup.length; ++i) {
      let element = elementsGroup[i];
      switch (element.nodeName) {
        case 'MAP-FEATURE':
          _addFeatureToMapMLVectors(element);
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
        case 'MAP-EXTENT':
          _addExtentElement(element);
          break;
        case 'MAP-META':
          // to consider: should we only honour the first child map-meta of a
          // given name value? i.e. run _addMetaElement only for
          // this.querySelector('map-meta[name=zoom]')
          // tbd will this do it: element === this.querySelector(`[name=${element.getAttribute('name')}]`)
          // a no, it will need to take into account src/shadowDom
          const name =
            element.hasAttribute('name') &&
            (element.getAttribute('name').toLowerCase() === 'zoom' ||
              element.getAttribute('name').toLowerCase() === 'extent');
          if (
            name &&
            element ===
              root.querySelector(
                `${pseudo} > [name=${element.getAttribute('name')}]`
              ) &&
            element.hasAttribute('content')
          ) {
            _addMetaElement(element);
          }
          break;
        default:
          break;
      }
    }
  }
  /*
   * Set up a function to watch additions of child elements of map-layer or
   * map-layer.shadowRoot and to invoke desired side  effects of those additions
   * via _runMutationObserver
   */
  _bindMutationObserver() {
    // mutation observer
    this._observer = new MutationObserver((mutationList) => {
      for (let mutation of mutationList) {
        // the attributes changes should be handled by attributeChangedCallback()
        if (mutation.type === 'childList') {
          this._runMutationObserver(mutation.addedNodes);
        }
      }
    });
    this._observer.observe(this.src ? this.shadowRoot : this, {
      childList: true
    });
  }
  _attachedToMap() {
    // set i to the position of this layer element in the set of layers
    var i = 0,
      position = 1;
    for (var nodes = this.parentNode.children; i < nodes.length; i++) {
      if (this.parentNode.children[i].nodeName === 'MAP-LAYER') {
        if (this.parentNode.children[i] === this) {
          position = i + 1;
        } else if (this.parentNode.children[i]._layer) {
          this.parentNode.children[i]._layer.setZIndex(i + 1);
        }
      }
    }
    var proj = this.parentNode.projection
      ? this.parentNode.projection
      : 'OSMTILE';
    L.setOptions(this._layer, {
      zIndex: position,
      mapprojection: proj,
      opacity: window.getComputedStyle(this).opacity
    });
    // make sure the Leaflet layer has a reference to the map
    this._layer._map = this.parentNode._map;

    if (this.checked) {
      this._layer.addTo(this._layer._map);
    }

    this._layer.on('add remove', this._validateDisabled, this);
    // toggle the this.disabled attribute depending on whether the layer
    // is: same prj as map, within view/zoom of map
    this._layer._map.on('moveend layeradd', this._validateDisabled, this);

    if (this.parentNode._layerControl)
      this._layerControl = this.parentNode._layerControl;
    // if controls option is enabled, insert the layer into the overlays array
    if (this.parentNode._layerControl && !this.hidden) {
      this._layerControl.addOrUpdateOverlay(this._layer, this.label);
    }

    // the mapml document associated to this layer can in theory contain many
    // link[@rel=legend] elements with different @type or other attributes;
    // currently only support a single link, don't care about type, lang etc.
    // TODO: add support for full LayerLegend object, and > one link.
    if (this._layer._legendUrl) {
      this.legendLinks = [
        {
          type: 'application/octet-stream',
          href: this._layer._legendUrl,
          rel: 'legend',
          lang: null,
          hreflang: null,
          sizes: null
        }
      ];
    }
  }

  _validateDisabled() {
    // setTimeout is necessary to make the validateDisabled happen later than the moveend operations etc.,
    // to ensure that the validated result is correct
    setTimeout(() => {
      let layer = this._layer,
        map = layer?._map;
      if (map) {
        this._validateLayerZoom({ zoom: map.getZoom() });
        // prerequisite: no inline and remote mapml elements exists at the same time
        const mapExtents = this.src
          ? this.shadowRoot.querySelectorAll('map-extent')
          : this.querySelectorAll('map-extent');
        let extentLinksReady = [];
        for (let i = 0; i < mapExtents.length; i++) {
          extentLinksReady.push(mapExtents[i].whenLinksReady());
        }
        Promise.allSettled(extentLinksReady)
          .then(() => {
            let disabledExtentCount = 0,
              totalExtentCount = 0,
              layerTypes = [
                '_staticTileLayer',
                '_mapmlvectors',
                '_extentLayer'
              ];
            for (let j = 0; j < layerTypes.length; j++) {
              let type = layerTypes[j];
              if (this.checked) {
                if (type === '_extentLayer' && mapExtents.length > 0) {
                  for (let i = 0; i < mapExtents.length; i++) {
                    totalExtentCount++;
                    if (mapExtents[i]._validateDisabled())
                      disabledExtentCount++;
                  }
                } else if (layer[type]) {
                  // not a templated layer
                  totalExtentCount++;
                  if (!layer[type].isVisible()) disabledExtentCount++;
                }
              }
            }
            // if all extents are not visible / disabled, set layer to disabled
            if (
              disabledExtentCount === totalExtentCount &&
              disabledExtentCount !== 0
            ) {
              this.setAttribute('disabled', '');
              this.disabled = true;
            } else {
              this.removeAttribute('disabled');
              this.disabled = false;
            }
            this.toggleLayerControlDisabled();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }, 0);
  }
  _validateLayerZoom(e) {
    // get the min and max zooms from all extents
    let toZoom = e.zoom;
    let min = this.extent.zoom.minZoom;
    let max = this.extent.zoom.maxZoom;
    let inLink = this.src
        ? this.shadowRoot.querySelector('map-link[rel=zoomin]')
        : this.querySelector('map-link[rel=zoomin]'),
      outLink = this.src
        ? this.shadowRoot.querySelector('map-link[rel=zoomout]')
        : this.querySelector('map-link[rel=zoomout]');
    let targetURL;
    if (!(min <= toZoom && toZoom <= max)) {
      if (inLink && toZoom > max) {
        targetURL = inLink.href;
      } else if (outLink && toZoom < min) {
        targetURL = outLink.href;
      }
      if (targetURL) {
        this.dispatchEvent(
          new CustomEvent('zoomchangesrc', {
            detail: {
              href: targetURL
            }
          })
        );
      }
    }
  }
  // disable/italicize layer control elements based on the map-layer.disabled property
  toggleLayerControlDisabled() {
    let input = this._layerControlCheckbox,
      label = this._layerControlLabel,
      opacityControl = this._opacityControl,
      opacitySlider = this._opacitySlider,
      styleControl = this._styles;
    if (this.disabled) {
      input.disabled = true;
      opacitySlider.disabled = true;
      label.style.fontStyle = 'italic';
      opacityControl.style.fontStyle = 'italic';
      if (styleControl) {
        styleControl.style.fontStyle = 'italic';
        styleControl.querySelectorAll('input').forEach((i) => {
          i.disabled = true;
        });
      }
    } else {
      input.disabled = false;
      opacitySlider.disabled = false;
      label.style.fontStyle = 'normal';
      opacityControl.style.fontStyle = 'normal';
      if (styleControl) {
        styleControl.style.fontStyle = 'normal';
        styleControl.querySelectorAll('input').forEach((i) => {
          i.disabled = false;
        });
      }
    }
  }
  queryable() {
    let content = this.src ? this.shadowRoot : this;
    return (
      content.querySelector('map-extent[checked] > map-link[rel=query]') &&
      this.checked &&
      this._layer &&
      !this.hidden
    );
  }
  getAlternateStyles(styleLinks) {
    if (styleLinks.length > 1) {
      var stylesControl = document.createElement('details'),
        stylesControlSummary = document.createElement('summary');
      stylesControlSummary.innerText = 'Style';
      stylesControl.appendChild(stylesControlSummary);

      for (var j = 0; j < styleLinks.length; j++) {
        stylesControl.appendChild(styleLinks[j].getLayerControlOption());
        L.DomUtil.addClass(
          stylesControl,
          'mapml-layer-item-style mapml-control-layers'
        );
      }
      return stylesControl;
    }
  }
  getOuterHTML() {
    let tempElement = this.cloneNode(true);

    if (this.hasAttribute('src')) {
      let newSrc = this._layer.getHref();
      tempElement.setAttribute('src', newSrc);
    }
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
    this.whenReady().then(() => {
      let map = this.parentElement._map,
        extent = this.extent,
        tL = extent.topLeft.pcrs,
        bR = extent.bottomRight.pcrs,
        layerBounds = L.bounds(
          L.point(tL.horizontal, tL.vertical),
          L.point(bR.horizontal, bR.vertical)
        ),
        center = map.options.crs.unproject(layerBounds.getCenter(true));

      let maxZoom = extent.zoom.maxZoom,
        minZoom = extent.zoom.minZoom;
      map.setView(center, Util.getMaxZoom(layerBounds, map, minZoom, maxZoom), {
        animate: false
      });
    });
  }
  mapml2geojson(options = {}) {
    return Util.mapml2geojson(this, options);
  }
  pasteFeature(feature) {
    switch (typeof feature) {
      case 'string':
        feature.trim();
        if (
          feature.slice(0, 12) === '<map-feature' &&
          feature.slice(-14) === '</map-feature>'
        ) {
          this.insertAdjacentHTML('beforeend', feature);
        }
        break;
      case 'object':
        if (feature.nodeName.toUpperCase() === 'MAP-FEATURE') {
          this.appendChild(feature);
        }
    }
  }
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (
        this._layer &&
        this._layerControlHTML &&
        (!this.src || this.shadowRoot?.childNodes.length)
      ) {
        resolve();
      } else {
        let layerElement = this;
        interval = setInterval(testForLayer, 200, layerElement);
        failureTimer = setTimeout(layerNotDefined, 5000);
      }
      function testForLayer(layerElement) {
        if (
          layerElement._layer &&
          layerElement._layerControlHTML &&
          (!layerElement.src || layerElement.shadowRoot?.childNodes.length)
        ) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (layerElement._fetchError) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('Error fetching layer content');
        }
      }
      function layerNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for layer to be ready');
      }
    });
  }
  // check if all child elements are ready
  whenElemsReady() {
    let elemsReady = [];
    let target = this.src ? this.shadowRoot : this;
    for (let elem of [
      ...target.querySelectorAll('map-extent'),
      ...target.querySelectorAll('map-feature')
    ]) {
      elemsReady.push(elem.whenReady());
    }
    return Promise.allSettled(elemsReady);
  }
}
