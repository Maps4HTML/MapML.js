export class HTMLSpanElement extends HTMLElement {
  static get observedAttributes() {
    return;
  }

  attributeChangedCallback(name, oldValue, newValue) {}
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {}
  disconnectedCallback() {}
}
window.customElements.define('map-span', MapSpan);
