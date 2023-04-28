export class MapSelect extends HTMLElement {
  static get observedAttributes() {
    return ['name','id'];
  }
  get name() {
    return this.getAttribute('name');
  }
  set name(val) {
    this.setAttribute('name', val);
  }
  get id() {
    return this.getAttribute('id');
  }
  set id(val) {
    this.setAttribute('id', val);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'name':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'id':
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
  connectedCallback() {
    
  }
  disconnectedCallback() {
    
  }
}
window.customElements.define('map-select', MapSelect);
