/* global M */
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
  //              axisBounds = M.convertPCRSBounds(
  //                boundsFallback.bounds,
  //                boundsFallback.zoom,
  //                projection,
  //                M.axisToCS(axis)
  //              );
  //            inp.setAttribute('min', axisBounds.min[M.axisToXY(axis)]);
  //            inp.setAttribute('max', axisBounds.max[M.axisToXY(axis)]);
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
    } else if (this.getLayerEl().querySelector('map-meta[name=zoom]')) {
      // fallback map-meta on layer
      return M._metaContentToObject(
        this.getLayerEl()
          .querySelector('map-meta[name=zoom]')
          .getAttribute('content')
      ).max;
    } else {
      // fallback map max
      return this.getLayerEl().extent.zoom.maxZoom.toString();
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
  getLayerEl() {
    return this.getRootNode() instanceof ShadowRoot
      ? this.getRootNode().host
      : this.closest('layer-');
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
            this.input = new M.ZoomInput(
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
            this.input = new M.LocationInput(
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
            this.input = new M.WidthInput(this.name, this._layer);
            break;
          case 'height':
            // input will store the input Class specific to the input type
            this.input = new M.HeightInput(this.name, this._layer);
            break;
          case 'hidden':
            // input will store the input Class specific to the input type
            this.input = new M.HiddenInput(this.name, this.initialValue);
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
