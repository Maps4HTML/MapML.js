import { ZoomInput } from './zoomInput.js';
import { HiddenInput } from './hiddenInput.js';
import { WidthInput } from './widthInput.js';
import { HeightInput } from './heightInput.js';
import { LocationInput } from './locationInput.js';

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
    return this.input.getValue();
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
    if (
      this.type === 'height' ||
      this.type === 'width' ||
      this.type === 'hidden'
    ) {
      return null;
    }
    if (this.getAttribute('min')) {
      return this.getAttribute('min');
    } else if (this._layer._layerEl.querySelector('map-meta[name=zoom]')) {
      // fallback map-meta on layer
      return M._metaContentToObject(
        this._layer._layerEl
          .querySelector('map-meta[name=zoom]')
          .getAttribute('content')
      ).min;
    } else {
      // fallback map min
      return this._layer._layerEl.extent.zoom.minZoom.toString();
    }
  }
  set min(val) {
    if (val) {
      this.setAttribute('min', val);
    }
  }
  get max() {
    if (
      this.type === 'height' ||
      this.type === 'width' ||
      this.type === 'hidden'
    ) {
      return null;
    }
    if (this.getAttribute('max')) {
      return this.getAttribute('max');
    } else if (this._layer._layerEl.querySelector('map-meta[name=zoom]')) {
      // fallback map-meta on layer
      return M._metaContentToObject(
        this._layer._layerEl
          .querySelector('map-meta[name=zoom]')
          .getAttribute('content')
      ).max;
    } else {
      // fallback map max
      return this._layer._layerEl.extent.zoom.maxZoom.toString();
    }
  }
  set max(val) {
    if (val) {
      this.setAttribute('max', val);
    }
  }
  get step() {
    if (this.type !== 'zoom') {
      return null;
    } else {
      return this.getAttribute('step') || '1';
    }
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
          // update associated class value on attribute change
          if (oldValue !== null) {
            this.input.name = newValue;
          }
        }
        break;
      case 'type':
        if (oldValue !== newValue) {
          // handle side effects
          // not allowed to change 'type'
        }
        break;
      case 'value':
        if (oldValue !== newValue) {
          if (oldValue !== null) {
            this.input.value = newValue;
          } else {
            this.initialValue = newValue;
          }
        }
        break;
      case 'axis':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.axis = newValue;
        }
        break;
      case 'units':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.units = newValue;
        }
        break;
      case 'position':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.position = newValue;
        }
        break;
      case 'rel':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.rel = newValue;
        }
        break;
      case 'min':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.min = newValue;
        }
        break;
      case 'max':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.max = newValue;
        }
        break;
      case 'step':
        if (oldValue !== newValue && this.input) {
          // handle side effects
          this.input.step = newValue;
        }
        break;
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {
    if (this.parentElement.nodeName === 'MAP-EXTENT') {
      this._layer = this.parentElement._layer;
    }
    switch (this.type) {
      case 'zoom':
        // input will store the input Class specific to the input type
        this.input = new ZoomInput(
          this.name,
          this.min,
          this.max,
          this.initialValue,
          this.step,
          this._layer
        );
        break;
      case 'location':
        // input will store the input Class specific to the input type
        this.input = new LocationInput(
          this.name,
          this.position,
          this.axis,
          this.units,
          this.min,
          this.max,
          this.rel,
          this._layer
        );
        break;
      case 'width':
        // input will store the input Class specific to the input type
        this.input = new WidthInput(this.name, this._layer);
        break;
      case 'height':
        // input will store the input Class specific to the input type
        this.input = new HeightInput(this.name, this._layer);
        break;
      case 'hidden':
        // input will store the input Class specific to the input type
        this.input = new HiddenInput(this.name, this.initialValue);
        break;
    }
  }
  disconnectedCallback() {}

  //https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
  checkValidity() {
    if (this.input.validateInput()) {
      return true;
    } else {
      const evt = new Event('invalid', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      this.dispatchEvent(evt);
      return false;
    }
  }

  //https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity
  reportValidity() {
    if (this.input.validateInput()) {
      return true;
    } else {
      const evt = new Event('invalid', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      this.dispatchEvent(evt);
      //if the event isn't canceled reports the problem to the user.
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-cva-reportvalidity-dev
      console.log("Input type='" + this.type + "' is not valid!");
      return false;
    }
  }
}
