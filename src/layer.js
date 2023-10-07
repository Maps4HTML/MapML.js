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
    return this._opacity ?? this.getAttribute('opacity');
  }

  set opacity(val) {
    if (+val > 1 || +val < 0) return;
    this.setAttribute('opacity', val);
  }

  constructor() {
    // Always call super first in constructor
    super();
  }
  disconnectedCallback() {
    //    console.log('Custom map element removed from page.');
    // if the map-layer node is removed from the dom, the layer should be
    // removed from the map and the layer control

    // this is moved up here so that the layer control doesn't respond
    // to the layer being removed with the _onLayerChange execution
    // that is set up in _attached:
    if (this.hasAttribute('data-moving')) return;
    this._onRemove();
  }

  _onRemove() {
    if (this._layer) {
      this._layer.off();
    }
    // if this layer has never been connected, it will not have a _layer
    if (this._layer && this._layer._map) {
      this._layer._map.removeLayer(this._layer);
    }

    if (this._layerControl && !this.hidden) {
      this._layerControl.removeLayer(this._layer);
    }
    delete this._layer;

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    }
  }

  connectedCallback() {
    if (this.hasAttribute('data-moving')) return;
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
        'changeprojection',
        function (e) {
          e.stopPropagation();
          reject(e);
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
            if (this._layer) {
              this._onRemove();
            }
            this._layer = M.mapMLLayer(
              new URL(this.src, base).href,
              this,
              content,
              {
                mapprojection: this.parentElement.projection,
                opacity: this.opacity
              }
            );
            this._attachedToMap();
            this._validateDisabled();
            resolve();
          })
          .catch((error) => {
            console.log('Error fetching layer content' + error);
          });
      } else {
        if (this._layer) {
          this._onRemove();
        }
        this._layer = M.mapMLLayer(null, this, null, {
          mapprojection: this.parentElement.projection,
          opacity: this.opacity
        });
        this._attachedToMap();
        this._validateDisabled();
        resolve();
      }
    }).catch((e) => {
      if (e.type === 'changeprojection') {
        this.src = e.detail.href;
      } else {
        console.log(e);
        this.dispatchEvent(
          new CustomEvent('error', { detail: { target: this } })
        );
      }
    });
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
    // notify the layer that it is attached to a map (layer._map)
    this._layer.fire('attached');

    if (this.checked) {
      this._layer.addTo(this._layer._map);
    }

    // add the handler which toggles the 'checked' property based on the
    // user checking/unchecking the layer from the layer control
    // this must be done *after* the layer is actually added to the map
    this._layer.on('add remove', this._onLayerChange, this);
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

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'label':
        this.whenReady().then(() => {
          this._layer.setName(newValue);
        });
        break;
      case 'checked':
        if (this._layer) {
          if (typeof newValue === 'string') {
            this.parentElement._map.addLayer(this._layer);
          } else {
            this.parentElement._map.removeLayer(this._layer);
          }
          this.dispatchEvent(new Event('change', { bubbles: true }));
        }
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
        if (oldValue !== newValue && this._layer) {
          this._onRemove();
          if (this.isConnected) {
            this._onAdd();
          }
          // the original inline content will not be removed
          // but has NO EFFECT and works as a fallback
        }
    }
  }
  _validateDisabled() {
    setTimeout(() => {
      let layer = this._layer,
        map = layer?._map;
      if (map) {
        const mapExtents = this.querySelectorAll('map-extent');
        let disabledExtentCount = 0,
          totalExtentCount = 0,
          layerTypes = [
            '_staticTileLayer',
            '_imageLayer',
            '_mapmlvectors',
            '_templatedLayer'
          ];
        if (layer.validProjection) {
          for (let j = 0; j < layerTypes.length; j++) {
            let type = layerTypes[j];
            if (this.checked && mapExtents.length > 0) {
              if (type === '_templatedLayer') {
                for (let i = 0; i < mapExtents.length; i++) {
                  totalExtentCount++;
                  if (mapExtents[i]._validateDisabled()) disabledExtentCount++;
                }
              } else if (layer[type]) {
                // not a templated layer
                totalExtentCount++;
                if (!layer[type].isVisible) disabledExtentCount++;
              }
            }
          }
        } else {
          disabledExtentCount = 1;
          totalExtentCount = 1;
        }
        // if all extents are not visible / disabled, set layer to disabled
        if (
          disabledExtentCount === totalExtentCount &&
          disabledExtentCount !== 0
        ) {
          this.setAttribute('disabled', ''); //set a disabled attribute on the layer element
          this.disabled = true;
        } else {
          //might be better not to disable the layer controls, might want to deselect layer even when its out of bounds
          this.removeAttribute('disabled');
          this.disabled = false;
        }
        map.fire('validate');
      }
    }, 0);
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

  _onLayerChange() {
    if (this._layer._map) {
      // can't disable observers, have to set a flag telling it where
      // the 'event' comes from: either the api or a user click/tap
      // may not be necessary -> this._apiToggleChecked = false;
      this.checked = this._layer._map.hasLayer(this._layer);
    }
  }
  zoomTo() {
    if (!this.extent) return;
    let map = this.parentElement._map,
      tL = this.extent.topLeft.pcrs,
      bR = this.extent.bottomRight.pcrs,
      layerBounds = L.bounds(
        L.point(tL.horizontal, tL.vertical),
        L.point(bR.horizontal, bR.vertical)
      ),
      center = map.options.crs.unproject(layerBounds.getCenter(true));

    let maxZoom = this.extent.zoom.maxZoom,
      minZoom = this.extent.zoom.minZoom;
    map.setView(center, M.getMaxZoom(layerBounds, map, minZoom, maxZoom), {
      animate: false
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
      if (this._layer) {
        resolve();
      } else {
        let layerElement = this;
        interval = setInterval(testForLayer, 200, layerElement);
        failureTimer = setTimeout(layerNotDefined, 5000);
      }
      function testForLayer(layerElement) {
        if (layerElement._layer) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        }
      }
      function layerNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for layer to be ready');
      }
    });
  }
}
