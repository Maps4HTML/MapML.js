export class MapLink extends HTMLElement {
  static get observedAttributes() {
    return [
      'type',
      'rel',
      'title',
      'href',
      'hreflang',
      'tref',
      'tms',
      'projection'
    ];
  }
  get type() {
    return this.getAttribute('type');
  }
  set type(val) {
    // improve this
    if (val === 'text/mapml' || val.startsWith('image/')) {
      this.setAttribute('type', val);
    }
  }
  get rel() {
    return this.getAttribute('rel');
  }
  set rel(val) {
    // improve this
    if (
      [
        'license',
        'alternate',
        'self',
        'style',
        'tile',
        'image',
        'features',
        'zoomin',
        'zoomout',
        'legend',
        'query',
        'stylesheet'
      ].includes(val)
    ) {
      this.setAttribute('type', val);
    }
  }
  get title() {
    return this.getAttribute('title');
  }
  set title(val) {
    if (val) {
      this.setAttribute('title', val);
    }
  }
  get href() {
    return this.getAttribute('href');
  }
  set href(val) {
    // improve this
    if (val) {
      this.setAttribute('href', val);
    }
  }
  get hreflang() {
    return this.getAttribute('hreflang');
  }
  set hreflang(val) {
    // improve this
    if (val) {
      this.setAttribute('hreflang', val);
    }
  }
  get tref() {
    return this.getAttribute('tref');
  }
  set tref(val) {
    // improve this
    if (val) {
      this.setAttribute('tref', val);
    }
  }
  get tms() {
    return this.hasAttribute('tms');
  }
  set tms(val) {
    // improve this
    if (val) {
      this.setAttribute('tms', '');
    }
  }
  get projection() {
    return this.getAttribute('projection');
  }
  set projection(val) {
    // improve this
    if (['OSMTILE', 'CBMTILE', 'WGS84', 'APSTILE'].includes(val)) {
      this.setAttribute('projection', val);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    //['type','rel','title','href','hreflang','tref','tms','projection'];
    switch (name) {
      case 'type':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'rel':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'title':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'href':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'hreflang':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'tref':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'tms':
        if (oldValue !== newValue) {
          // handle side effects
        }
        break;
      case 'projection':
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
window.customElements.define('map-link', MapLink);
