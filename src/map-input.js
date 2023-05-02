import { MapLink } from './map-link.js';

export class MapInput extends HTMLElement {
  static get observedAttributes() {
    return [
      'name',
      'type',
      'value',
      'axis',
      'units',
      'position',
      'rel',
      'min',
      'max',
      'step'
    ];
  }

  get name() {
    return this.getAttribute('name');
  }
  set name(val) {
    if (val) {
      this.setAttribute('name', val);
    }
  }
  get type() {
    return this.getAttribute('type');
  }
  set type(val) {
    if (['location'].includes(val)) {
      this.setAttribute('type', val);
    }
  }
  get value() {
    return this.getAttribute('value');
  }
  set value(val) {
    if (val) {
      this.setAttribute('value', val);
    }
  }
  get axis() {
    return this.getAttribute('axis');
  }
  set axis(val) {
    if (val) {
      this.setAttribute('axis', val);
    }
  }
  get units() {
    return this.getAttribute('units');
  }
  set units(val) {
    if (val) {
      this.setAttribute('units', val);
    }
  }
  get position() {
    return this.getAttribute('position');
  }
  set position(val) {
    if (val) {
      this.setAttribute('position', val);
    }
  }
  get rel() {
    return this.getAttribute('rel');
  }
  set rel(val) {
    if (val) {
      this.setAttribute('rel', val);
    }
  }
  get min() {
    return this.getAttribute('min');
  }
  set min(val) {
    if (val) {
      this.setAttribute('min', val);
    }
  }
  get max() {
    return this.getAttribute('max');
  }
  set max(val) {
    if (val) {
      this.setAttribute('max', val);
    }
  }
  get step() {
    return this.getAttribute('step');
  }
  set step(val) {
    if (val) {
      this.setAttribute('step', val);
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'name':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'type':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'value':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'axis':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'units':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'position':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'rel':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'min':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'max':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'step':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {}
  disconnectedCallback() {}
}
window.customElements.define('map-input', MapInput);
