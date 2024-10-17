export class HTMLMetaElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'content'];
  }
  get name() {
    return this.getAttribute('name');
  }
  set name(val) {
    if (['projection', 'extent', 'cs', 'zoom'].includes(val)) {
      this.setAttribute('name', val);
    }
  }
  get content() {
    return this.getAttribute('content');
  }
  set content(val) {
    // improve this
    if (
      this.name === 'cs' &&
      !['tcrs', 'tilematrix', 'pcrs', 'gcrs', 'map', 'tile'].includes(val)
    ) {
      return;
    }
    this.setAttribute('content', val);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'name': {
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      }
      case 'content': {
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
window.customElements.define('map-meta', MapMeta);
