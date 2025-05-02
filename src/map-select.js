import { DomUtil } from 'leaflet';

export class HTMLSelectElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'id'];
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
    this._extentEl = this.parentElement;
    // TODO make the layer redraw after map-select change event
    // origin of this block was in _initTemplateVars from map-extent, which was
    // originally part of MapLayer...
    //
    // use a throwaway div to parse the input from MapML into HTML
    this._createLayerControlForSelect();
  }
  disconnectedCallback() {}
  _createLayerControlForSelect() {
    // cut-pasted from createLayerControlForExtent. TODO Re-write appropriately
    // don't add it again if it is referenced > once
    // generate a <details><summary></summary><select...></details>
    this.htmlselect = this.transcribe();
    var selectdetails = DomUtil.create(
        'details',
        'mapml-layer-item-details mapml-control-layers'
      ),
      selectsummary = DomUtil.create('summary'),
      selectSummaryLabel = DomUtil.create('label');
    selectSummaryLabel.innerText = this.getAttribute('name');
    selectSummaryLabel.setAttribute('for', this.getAttribute('id'));
    selectsummary.appendChild(selectSummaryLabel);
    selectdetails.appendChild(selectsummary);
    selectdetails.appendChild(this.htmlselect);
    this.selectdetails = selectdetails;
    // this goes into the layer control, so add a listener to trigger map
    // or layer redraw with newly selected value
    const drawLayers = function () {
      this.parentElement._extentLayer.redraw();
    }.bind(this);
    this.htmlselect.addEventListener('change', drawLayers);
  }
  transcribe() {
    var select = document.createElement('select');
    var elementAttrNames = this.getAttributeNames();

    for (let i = 0; i < elementAttrNames.length; i++) {
      select.setAttribute(
        elementAttrNames[i],
        this.getAttribute(elementAttrNames[i])
      );
    }

    var options = this.children;

    for (let i = 0; i < options.length; i++) {
      var option = document.createElement('option');
      var optionAttrNames = options[i].getAttributeNames();

      for (let j = 0; j < optionAttrNames.length; j++) {
        option.setAttribute(
          optionAttrNames[j],
          options[i].getAttribute(optionAttrNames[j])
        );
      }

      option.innerHTML = options[i].innerHTML;
      select.appendChild(option);
    }
    return select;
  }
  whenReady() {
    return new Promise((resolve, reject) => {
      let interval, failureTimer;
      if (this.selectdetails) {
        resolve();
      } else {
        let selectElement = this;
        interval = setInterval(testForSelect, 300, selectElement);
        failureTimer = setTimeout(selectNotDefined, 10000);
      }
      function testForSelect(selectElement) {
        if (selectElement.selectdetails) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          resolve();
        } else if (!selectElement.isConnected) {
          clearInterval(interval);
          clearTimeout(failureTimer);
          reject('map-select was disconnected while waiting to be ready');
        }
      }
      function selectNotDefined() {
        clearInterval(interval);
        clearTimeout(failureTimer);
        reject('Timeout reached waiting for map-select to be ready');
      }
    });
  }
}
