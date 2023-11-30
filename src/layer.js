import './leaflet.js'; // a lightly modified version of Leaflet for use as browser module
import './mapml.js'; // modified URI to make the function a property of window scope (possibly a bad thing to do).

export class MapLayer extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'label', 'checked', 'hidden', 'opacity'];
  }
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
          M._convertAndFormatPCRS(
            this._layer.bounds,
            M[this.getProjection()],
            this.getProjection()
          ),
          { zoom: this._layer.zoomBounds }
        )
      : null;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'label':
        this.whenReady()
          .then(() => {
            this._layer.setName(newValue);
          })
          .catch((e) => {
            console.log(e);
          });
        break;
      case 'checked':
        this.whenReady()
          .then(() => {
            if (typeof newValue === 'string') {
              this.parentElement._map.addLayer(this._layer);
            } else {
              this.parentElement._map.removeLayer(this._layer);
            }
            this._layerControlCheckbox.checked = this.checked;
            this.dispatchEvent(new CustomEvent('map-change'));
          })
          .catch((e) => {
            console.log(e);
          });
        break;
      case 'hidden':
        var map = this.parentElement && this.parentElement._map;
        if (map && this.parentElement.controls) {
          if (typeof newValue === 'string') {
            if (this._layer) {
              this.parentElement._layerControl.removeLayer(this._layer);
            }
          } else {
            this._layerControl = this.parentElement._layerControl;
            this._layerControl.addOrUpdateOverlay(this._layer, this.label);
            this._validateDisabled();
          }
        }
        break;
      case 'opacity':
        if (oldValue !== newValue && this._layer) {
          this._opacity = newValue;
          this._layer.changeOpacity(newValue);
        }
        break;
      case 'src':
        if (oldValue && oldValue !== newValue) {
          if (this.isConnected) {
            this.removeAttribute('disabled');
            let map = this.parentElement;
            let placeholder = document.createElement('span');
            this.insertAdjacentElement('beforebegin', placeholder);
            map.removeChild(this);
            placeholder.replaceWith(this);
          }
        }
    }
  }

  constructor() {
    // Always call super first in constructor
    super();
  }
  disconnectedCallback() {
    // if the map-layer node is removed from the dom, the layer should be
    // removed from the map and the layer control
    if (this.hasAttribute('data-moving')) return;
    this._onRemove();
  }

  _onRemove() {
    let l = this._layer,
      lc = this._layerControl;
    delete this._layer;
    delete this._layerControl;
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    }

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
    delete this._fetchError;
  }

  connectedCallback() {
    if (this.hasAttribute('data-moving')) return;
    this._createLayerControlHTML = M._createLayerControlHTML.bind(this);
    // this._opacity is used to record the current opacity value (with or without updates),
    // the initial value of this._opacity should be set as opacity attribute value, if exists, or the default value 1.0
    this._opacity = this.opacity || 1.0;
    const doConnected = this._onAdd.bind(this);
    this.parentElement
      .whenReady()
      .then(() => {
        doConnected();
      })
      .catch(() => {
        throw new Error('Map never became ready');
      });
  }

  _onAdd() {
    if (this.getAttribute('src') && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    new Promise((resolve, reject) => {
      this.addEventListener(
        'changestyle',
        function (e) {
          e.stopPropagation();
          this.src = e.detail.src;
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
              throw new Error('Parser error');
            }
            let alternate = this.selectMatchingAlternateProjection(
              content.querySelector('mapml-')
            );
            if (alternate) {
              throw new Error('changeprojection', {
                cause: { href: alternate }
              });
            }
            this.copyRemoteContentToShadowRoot(content.querySelector('mapml-'));
          })
          .then(() => {
            let elements = this.shadowRoot.querySelectorAll('*');
            let elementsReady = [];
            for (let i = 0; i < elements.length; i++) {
              if (elements[i].whenReady)
                elementsReady.push(elements[i].whenReady());
            }
            return Promise.allSettled(elementsReady);
          })
          .then(() => {
            this._layer = M.mapMLLayer(
              new URL(this.src, base).href,
              this,
              this.shadowRoot,
              {
                projection: this.getProjection(),
                opacity: this.opacity
              }
            );
            this._createLayerControlHTML();
            this._attachedToMap();
            this._validateDisabled();
            resolve();
          })
          .catch((error) => {
            this._fetchError = true;
            console.log('Error fetching layer content: ' + error);
            reject(error);
          });
      } else {
        let elements = this.querySelectorAll('*');
        let elementsReady = [];
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].whenReady)
            elementsReady.push(elements[i].whenReady());
        }
        Promise.allSettled(elementsReady).then(() => {
          if (this._layer) {
            this._onRemove();
          }
          this._layer = M.mapMLLayer(null, this, null, {
            projection: this.getProjection(),
            opacity: this.opacity
          });
          this._createLayerControlHTML();
          this._attachedToMap();
          this._validateDisabled();
          resolve();
        });
      }
    }).catch((e) => {
      if (e.message === 'changeprojection') {
        console.log('Changing layer src to: ' + e.cause.href);
        this.src = e.cause.href;
      } else {
        console.log(e);
        this.dispatchEvent(
          new CustomEvent('error', { detail: { target: this } })
        );
      }
    });
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
        : /* else use the resolved <layer- src="..."> value */ new URL(
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

  selectMatchingAlternateProjection(mapml) {
    let selectedAlternate =
      this.getProjection(mapml) !== this.parentElement.projection &&
      mapml.querySelector(
        'map-link[rel=alternate][projection=' +
          this.parentElement.projection +
          '][href]'
      );

    if (selectedAlternate) {
      let url = new URL(selectedAlternate.getAttribute('href'), this.getBase())
        .href;
      return url;
    }
    return false;
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
  getProjection(content) {
    let mapml = content || this;
    let projection = this.parentElement.projection;
    mapml = mapml.shadowRoot ? mapml.shadowRoot : mapml;
    if (mapml.querySelector('map-meta[name=projection][content]')) {
      projection =
        M._metaContentToObject(
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
  _attachedToMap() {
    // set i to the position of this layer element in the set of layers
    var i = 0,
      position = 1;
    for (var nodes = this.parentNode.children; i < nodes.length; i++) {
      if (this.parentNode.children[i].nodeName === 'LAYER-') {
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

    // if controls option is enabled, insert the layer into the overlays array
    if (this.parentNode._layerControl && !this.hidden) {
      this._layerControl = this.parentNode._layerControl;
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
    // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
    // to MapML extent as metadata
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
    this.dispatchEvent(
      new CustomEvent('loadedmetadata', { detail: { target: this } })
    );
  }

  _validateDisabled() {
    // setTimeout is necessary to make the validateDisabled happen later than the moveend operations etc.,
    // to ensure that the validated result is correct
    setTimeout(() => {
      let layer = this._layer,
        map = layer?._map;
      if (map) {
        // prerequisite: no inline and remote mapml elements exists at the same time
        const mapExtents = this.shadowRoot
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

  // disable/italicize layer control elements based on the layer-.disabled property
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
    let content = this.shadowRoot ? this.shadowRoot : this;
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
    this.whenElemsReady().then(() => {
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
      map.setView(center, M.getMaxZoom(layerBounds, map, minZoom, maxZoom), {
        animate: false
      });
    });
  }
  mapml2geojson(options = {}) {
    return M.mapml2geojson(this, options);
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
    let target = this.shadowRoot || this;
    for (let elem of [
      ...target.querySelectorAll('map-extent'),
      ...target.querySelectorAll('map-feature')
    ]) {
      elemsReady.push(elem.whenReady());
    }
    return Promise.allSettled(elemsReady);
  }
}
