export class HTMLGeometryElement extends HTMLElement {
  static get observedAttributes() {
    return ['cs'];
  }
  get cs() {
    return this.getAttribute('cs');
  }
  set cs(val) {
    if (['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)) {
      this.setAttribute('cs', val);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'cs': {
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      }
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {}
  disconnectedCallback() {}
}
window.customElements.define('map-geometry', MapGeometry);
