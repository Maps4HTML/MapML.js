export class HTMLAnchorElement extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'target', 'type', 'inplace'];
  }
  get href() {
    return this.hasAttribute('href') ? this.getAttribute('href') : '';
  }
  set href(url) {
    this.href = url;
  }
  get target() {
    return this.hasAttribute('target') ? this.getAttribute('target') : '';
  }
  set target(val) {
    this.setAttribute('target', val);
  }
  get type() {
    return this.hasAttribute('type') ? this.getAttribute('type') : '';
  }
  set type(val) {
    this.setAttribute('type', val);
  }
  get inplace() {
    return this.hasAttribute('inplace') ? this.getAttribute('inplace') : '';
  }
  set inplace(val) {
    const hasInplace = Boolean(val);
    if (hasInplace) {
      this.setAttribute('inpalce', '');
    } else {
      this.removeAttribute('inplace');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'href': {
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      }
      case 'target': {
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      }
      case 'type': {
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      }
      case 'inplace': {
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
window.customElements.define('map-a', MapA);
