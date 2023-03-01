export class MapFeature extends HTMLElement {
    static get observedAttributes() {
      return ['zoom'];
    }
    get zoom() {
        return this.hasAttribute("zoom") ? this.getAttribute("zoom") : 0;
    }
    set zoom(val) {
        var parsedVal = parseInt(val,10);
        if (!isNaN(parsedVal) && (parsedVal >= 0 && parsedVal <= 25)) {
        this.setAttribute('zoom', parsedVal);
        }
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'zoom': {
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
    connectedCallback() {
  
    }
    disconnectedCallback() {
  
    }
  };
  window.customElements.define('map-feature', MapFeature);