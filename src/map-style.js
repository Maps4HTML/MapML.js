export class MapStyle extends HTMLElement {
  static get observedAttributes() {
    return;
  }

  attributeChangedCallback(name, oldValue, newValue) {}
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {
    // if the parent element is a map-link, the stylesheet should
    //  be created as part of a templated layer processing i.e. on moveend / when connected
    //  and the generated <style> that implements this <map-style> should be located
    //  in the parent <map-link>._templatedLayer.container root node if
    //  the _templatedLayer is an instance of M.TemplatedTileLayer or M.TemplatedFeaturesLayer
    //
    // if the parent node (or the host of the shadow root parent node) is layer-, the link should be created in the _layer
    // container
    this._stylesheetHost =
      this.getRootNode() instanceof ShadowRoot
        ? this.getRootNode().host
        : this.parentElement;
    if (this._stylesheetHost === undefined) return;

    this.styleElement = document.createElement('style');
    this.styleElement.mapStyle = this;
    this.styleElement.textContent = this.textContent;
    copyAttributes(this, this.styleElement);
    if (this._stylesheetHost._layer) {
      this._stylesheetHost._layer.appendStyleElement(this);
    } else if (this._stylesheetHost._templatedLayer) {
      this._stylesheetHost._templatedLayer.appendStyleElement(this);
    } else if (this._stylesheetHost._extentLayer) {
      this._stylesheetHost._extentLayer.appendStyleElement(this);
    }

    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach((attribute) => {
        target.setAttribute(attribute.nodeName, attribute.nodeValue);
      });
    }
  }
  disconnectedCallback() {
    if (this._stylesheetHost) {
      this.styleElement.remove();
    }
  }
}
