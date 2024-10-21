import { Util } from './mapml/utils/Util.js';
import { ZoomInput } from './mapml/elementSupport/inputs/zoomInput.js';
import { HiddenInput } from './mapml/elementSupport/inputs/hiddenInput.js';
import { WidthInput } from './mapml/elementSupport/inputs/widthInput.js';
import { HeightInput } from './mapml/elementSupport/inputs/heightInput.js';
import { LocationInput } from './mapml/elementSupport/inputs/locationInput.js';

/* global M */
export class HTMLInputElement extends HTMLElement {
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
  // sets default values for min,max on zoom and location input
  // this stuff should be handled by the default getters on map-input type=location or map-input type=zoom
  //          if (
  //            inp.hasAttribute('type') &&
  //            inp.getAttribute('type') === 'location' &&
  //            (!inp.hasAttribute('min') || !inp.hasAttribute('max')) &&
  //            inp.hasAttribute('axis') &&
  //            !['i', 'j'].includes(inp.getAttribute('axis').toLowerCase())
  //          ) {
  //            if (
  //              zoomInput &&
  //              template.includes(`{${zoomInput.getAttribute('name')}}`)
  //            ) {
  //              zoomInput.setAttribute('value', boundsFallback.zoom);
  //            }
  //            let axis = inp.getAttribute('axis'),
  //              axisBounds = Util.convertPCRSBounds(
  //                boundsFallback.bounds,
  //                boundsFallback.zoom,
  //                projection,
  //                Util.axisToCS(axis)
  //              );
  //            inp.setAttribute('min', axisBounds.min[Util.axisToXY(axis)]);
  //            inp.setAttribute('max', axisBounds.max[Util.axisToXY(axis)]);
  //          }

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
    switch (this.type) {
      case 'zoom':
        if (this.hasAttribute('min')) {
          return this.getAttribute('min');
          // min attribute can apply to: type=location, type=zoom
          // for zoom, it should fall back via upward document search: 1) this element,
          // 2) map-meta within the parent extent, 3) map-meta within the parent layer,
          // or finally 4) the map projection crs min/min
          // for location, it should fall back by searching upwards: same as for zoom
        } else if (this.parentElement.querySelector('map-meta[name=zoom]')) {
          // fallback map-meta on layer
          return Util._metaContentToObject(
            this.parentElement
              .querySelector('map-meta[name=zoom]')
              .getAttribute('content')
          ).min;
        } else {
          // fallback map min
          return this.getLayerEl().extent?.zoom.minZoom.toString();
        }
        break;
      case 'location':
      default:
        break;
    }
  }
  set min(val) {
    if (val) {
      this.setAttribute('min', val);
    }
  }
  get max() {
    switch (this.type) {
      case 'zoom':
        if (this.hasAttribute('max')) {
          return this.getAttribute('max');
          // max attribute can apply to: type=location, type=zoom
          // for zoom, it should fall back via upward document search: 1) this element,
          // 2) map-meta within the parent extent, 3) map-meta within the parent layer,
          // or finally 4) the map projection crs min/max
          // for location, it should fall back by searching upwards: same as for zoom
        } else if (this.parentElement.querySelector('map-meta[name=zoom]')) {
          // fallback map-meta on layer
          return Util._metaContentToObject(
            this.parentElement
              .querySelector('map-meta[name=zoom]')
              .getAttribute('content')
          ).max;
        } else {
          // fallback map max
          return this.getLayerEl().extent?.zoom.maxZoom.toString();
        }
        break;
      case 'location':
      default:
        break;
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
  getMapEl() {
    return Util.getClosest(this, 'mapml-viewer,map[is=web-map]');
  }
  getLayerEl() {
    return Util.getClosest(this, 'map-layer,layer-');
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.whenReady()
      .then(() => {
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
      })
      .catch((reason) => {
        console.log(
          reason,
          `\nin mapInput.attributeChangeCallback when changing attribute ${name}`
        );
      });
  }
  constructor() {
    // Always call super first in constructor
    super();
  }
  connectedCallback() {
    this.parentElement
      .whenReady()
      .then(() => {
        if (this.parentElement.nodeName === 'MAP-EXTENT') {
          this._layer = this.parentElement._layer;
        }
        switch (this.type) {
          case 'zoom':
            // input will store the input Class specific to the input type
            this.initialValue = +this.getAttribute('value');
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
      })
      .catch((reason) => {
        console.log(reason, '\nin mapInput.connectedCallback');
      });
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
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this.input) {
        resolve();
      } else {
        let inputElement = this;
        interval = setInterval(testForInput, 300, inputElement);
        failureTimer = setTimeout(inputNotDefined, 10000);
      }
      function testForInput(inputElement) {
        if (inputElement.input) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!inputElement.isConnected) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('map-input was disconnected while waiting to be ready');
        }
      }
      function inputNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for input to be ready');
      }
    });
  }
}
