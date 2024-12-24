import { Util } from './mapml/utils/Util.js';
export class HTMLStyleElement extends HTMLElement {
  static get observedAttributes() {
    return ['media'];
  }
  /* jshint ignore:start */
  #hasConnected;
  /* jshint ignore:end */
  get media() {
    return this.getAttribute('media');
  }
  set media(val) {
    this.setAttribute('media', val);
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    if (this.#hasConnected /* jshint ignore:line */) {
      switch (name) {
        case 'media':
          if (oldValue !== newValue) {
            await this._registerMediaQuery(newValue);
          }
          break;
      }
    }
  }
  async _registerMediaQuery(mq) {
    if (!this._changeHandler) {
      // Define and bind the change handler once
      this._changeHandler = () => {
        this._disconnect();
        if (this._mql.matches) {
          this._connect();
        }
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
      this._disconnect();
      this._connect();
    }
  }
  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  _connect() {
    this.styleElement = document.createElement('style');
    this.styleElement.mapStyle = this;
    this.styleElement.textContent = this.textContent;
    copyAttributes(this, this.styleElement);
    if (this._stylesheetHost._layer) {
      this._stylesheetHost._layer.renderStyles(this);
    } else if (this._stylesheetHost._templatedLayer) {
      this._stylesheetHost._templatedLayer.renderStyles(this);
    } else if (this._stylesheetHost._extentLayer) {
      this._stylesheetHost._extentLayer.renderStyles(this);
    }

    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach((attribute) => {
        if (
          attribute.nodeName !== 'media' &&
          attribute.nodeName !== 'data-testid'
        ) {
          target.setAttribute(attribute.nodeName, attribute.nodeValue);
        }
      });
    }

    // use observer to monitor the changes in mapStyle textContent
    this._observer = new MutationObserver(() => {
      this.styleElement.textContent = this.textContent;
    });
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  _disconnect() {
    if (this._observer) {
      this._observer.disconnect();
    }
    if (this._stylesheetHost) {
      if (this.styleElement) {
        this.styleElement.remove();
        delete this.styleElement;
      }
    }
  }
  async connectedCallback() {
    /* jshint ignore:start */
    this.#hasConnected = true;
    /* jshint ignore:end */
    // if the parent element is a map-link, the stylesheet should
    //  be created as part of a templated layer processing i.e. on moveend / when connected
    //  and the generated <style> that implements this <map-style> should be located
    //  in the parent <map-link>._templatedLayer.container root node if
    //  the _templatedLayer is an instance of TemplatedTileLayer or TemplatedFeaturesLayer
    //
    // if the parent node (or the host of the shadow root parent node) is map-layer, the link should be created in the _layer
    // container
    this._stylesheetHost =
      this.getRootNode() instanceof ShadowRoot
        ? this.getRootNode().host
        : this.parentElement;
    if (this._stylesheetHost === undefined) return;

    if (this.media) {
      await this._registerMediaQuery(this.media);
    } else {
      this._connect();
    }
  }
  disconnectedCallback() {
    this._disconnect();
  }
}
