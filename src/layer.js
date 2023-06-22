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
    return this.hasAttribute('label') ? this.getAttribute('label') : '';
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
    return this._layer._container.style.opacity || this._layer.options.opacity;
  }

  set opacity(val) {
    if (+val > 1 || +val < 0) return;
    this._layer.changeOpacity(val);
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
    this._removeEvents();
    if (this._layer._map) {
      this._layer._map.removeLayer(this._layer);
    }

    if (this._layerControl && !this.hidden) {
      this._layerControl.removeLayer(this._layer);
    }

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    }
  }

  connectedCallback() {
    if (this.hasAttribute('data-moving')) return;
    this._onAdd();
  }

  _onAdd() {
    if (this.getAttribute('src') && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    //creates listener that waits for createmap event, this allows for delayed builds of maps
    //this allows a safeguard for the case where loading a custom TCRS takes longer than loading mapml-viewer.js/web-map.js
    this.parentNode.addEventListener(
      'createmap',
      () => {
        this._ready();
        // if the map has been attached, set this layer up wrt Leaflet map
        if (this.parentNode._map) {
          this._attachedToMap();
        }
        if (this._layerControl && !this.hidden) {
          this._layerControl.addOrUpdateOverlay(this._layer, this.label);
        }
      },
      { once: true }
    ); //listener stops listening after event occurs once
    //if map is already created then dispatch createmap event, allowing layer to be built
    if (this.parentNode._map)
      this.parentNode.dispatchEvent(new CustomEvent('createmap'));
  }

  adoptedCallback() {
    //    console.log('Custom map element moved to new page.');
  }
  _changeLayerNameIfAllowed(newValue) {
    if (this?._layer?._title && !this._layer._titleIsReadOnly) {
      this._layer._title = newValue;
      this._layer._mapmlLayerItem.querySelector(
        '.mapml-layer-item-name'
      ).innerHTML = newValue;
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'label':
        if (oldValue !== newValue) {
          this._changeLayerNameIfAllowed(newValue);
          this.dispatchEvent(
            new CustomEvent('labelchanged', { detail: { target: this } })
          );
        }
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
          this.opacity = newValue;
        }
        break;
      case 'src':
        if (oldValue !== newValue && this._layer) {
          this._reload();
          // the original inline content will not be removed
          // but has NO EFFECT and works as a fallback
        }
    }
  }
  // re-load the layer element when the src attribute is changed
  _reload() {
    let oldOpacity = this.opacity;
    // go through the same sequence as if the layer had been removed from
    // the DOM and re-attached with a new URL source.
    this._onRemove();
    if (this.isConnected) {
      this._onAdd();
    }
    this.opacity = oldOpacity;
  }
  _onLayerExtentLoad(e) {
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
    if (this._layer._title) {
      this.label = this._layer._title;
    }
    // make sure local content layer has the chance to set its extent properly
    // which is important for the layer control and the disabled property
    if (this._layer._map) {
      this._layer.fire('attached', this._layer);
    }
    // TODO ensure the controls in this._layerControl contain 'live' controls
    // which control the layer, not potentially the previous style / src
    if (this._layerControl) {
      this._layerControl.addOrUpdateOverlay(this._layer, this.label);
    }
    if (!this._layer.error) {
      // re-use 'loadedmetadata' event from HTMLMediaElement inteface, applied
      // to MapML extent as metadata
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event
      this.dispatchEvent(
        new CustomEvent('loadedmetadata', { detail: { target: this } })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent('error', { detail: { target: this } })
      );
    }
  }
  _validateDisabled() {
    setTimeout(() => {
      let layer = this._layer,
        map = layer?._map;
      if (map) {
        let count = 0,
          total = 0,
          layerTypes = [
            '_staticTileLayer',
            '_imageLayer',
            '_mapmlvectors',
            '_templatedLayer'
          ];
        if (layer.validProjection) {
          for (let j = 0; j < layerTypes.length; j++) {
            let type = layerTypes[j];
            if (this.checked && layer[type]) {
              if (type === '_templatedLayer') {
                for (let i = 0; i < layer._extent._mapExtents.length; i++) {
                  for (
                    let j = 0;
                    j <
                    layer._extent._mapExtents[i].templatedLayer._templates
                      .length;
                    j++
                  ) {
                    if (
                      layer._extent._mapExtents[i].templatedLayer._templates[j]
                        .rel === 'query'
                    )
                      continue;
                    total++;
                    layer._extent._mapExtents[i].removeAttribute('disabled');
                    layer._extent._mapExtents[i].disabled = false;
                    if (
                      !layer._extent._mapExtents[i].templatedLayer._templates[j]
                        .layer.isVisible
                    ) {
                      count++;
                      layer._extent._mapExtents[i].setAttribute('disabled', '');
                      layer._extent._mapExtents[i].disabled = true;
                    }
                  }
                }
              } else {
                total++;
                if (!layer[type].isVisible) count++;
              }
            }
          }
        } else {
          count = 1;
          total = 1;
        }

        if (count === total && count !== 0) {
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
  _ready() {
    // the layer might not be attached to a map
    // so we need a way for non-src based layers to establish what their
    // zoom range, extent and projection are.  meta elements in content to
    // allow the author to provide this explicitly are one way, they will
    // be parsed from the second parameter here
    // IE 11 did not have a value for this.baseURI for some reason
    var base = this.baseURI ? this.baseURI : document.baseURI;
    let opacity_value = this.hasAttribute('opacity')
      ? this.getAttribute('opacity')
      : '1.0';
    this._layer = M.mapMLLayer(
      this.src ? new URL(this.src, base).href : null,
      this,
      {
        mapprojection: this.parentElement._map.options.projection,
        opacity: opacity_value
      }
    );
    this._layer.on('extentload', this._onLayerExtentLoad, this);
    this._setUpEvents();
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
    this._layer.on('add remove extentload', this._validateDisabled, this);

    // if controls option is enabled, insert the layer into the overlays array
    if (this.parentNode._layerControl && !this.hidden) {
      this._layerControl = this.parentNode._layerControl;
      this._layerControl.addOrUpdateOverlay(this._layer, this.label);
    }
    // toggle the this.disabled attribute depending on whether the layer
    // is: same prj as map, within view/zoom of map
    this._layer._map.on('moveend', this._validateDisabled, this);
    this._layer._map.on('checkdisabled', this._validateDisabled, this);
    // this is necessary to get the layer control to compare the layer
    // extents with the map extent & zoom, but it needs to be rethought TODO
    // for one thing, layers which are checked by the author before
    // adding to the map are displayed despite that they are not visible
    // See issue #26
    //        this._layer._map.fire('moveend');
  }
  _removeEvents() {
    if (this._layer) {
      this._layer.off();
    }
  }
  _setUpEvents() {
    this._layer.on(
      'loadstart',
      function () {
        this.dispatchEvent(
          new CustomEvent('loadstart', { detail: { target: this } })
        );
      },
      this
    );
    this._layer.on(
      'changestyle',
      function (e) {
        this.src = e.src;
        this.dispatchEvent(
          new CustomEvent('changestyle', { detail: { target: this } })
        );
      },
      this
    );
    this._layer.on(
      'changeprojection',
      function (e) {
        this.src = e.href;
        this.dispatchEvent(
          new CustomEvent('changeprojection', { detail: { target: this } })
        );
      },
      this
    );
  }
  zoomTo() {
    if (!this.extent) return;
    let map = this._layer._map,
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
}
