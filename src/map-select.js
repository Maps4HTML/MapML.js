export class MapSelect extends HTMLElement {
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
    // origin of this block was in _initTemplateVars from map-extent, which was
    // originally part of MapMLLayer...
    //
    //          if (inp.tagName.toLowerCase() === 'map-select') {
    //            // use a throwaway div to parse the input from MapML into HTML
    //            var div = document.createElement('div');
    //            div.insertAdjacentHTML('afterbegin', inp.outerHTML);
    //            // parse
    //            inp.htmlselect = div.querySelector('map-select');
    //            inp.htmlselect = transcribe(inp.htmlselect);
    //
    //            // this goes into the layer control, so add a listener
    //            L.DomEvent.on(inp.htmlselect, 'change', this.redraw, this);
    //
    //            this refers to map-extent in the original
    //            if (!this._userInputs) {
    //              this._userInputs = [];
    //            }
    //            this._userInputs.push(inp.htmlselect);
    //          }
  }
  disconnectedCallback() {}
  createLayerControlForSelect() {
    // cut-pasted from createLayerControlForExtent. TODO Re-write appropriately
    var templates = this._templateVars;
    if (templates) {
      this._selectdetails = [];
      for (var i = 0; i < templates.length; i++) {
        var template = templates[i];
        for (var j = 0; j < template.values.length; j++) {
          var mapmlInput = template.values[j],
            id = '#' + mapmlInput.getAttribute('id');
          // don't add it again if it is referenced > once
          if (
            mapmlInput.tagName.toLowerCase() === 'map-select' &&
            !frag.querySelector(id)
          ) {
            // generate a <details><summary></summary><select...></details>
            var selectdetails = L.DomUtil.create(
                'details',
                'mapml-layer-item-details mapml-control-layers',
                frag
              ),
              selectsummary = L.DomUtil.create('summary'),
              selectSummaryLabel = L.DomUtil.create('label');
            selectSummaryLabel.innerText = mapmlInput.getAttribute('name');
            selectSummaryLabel.setAttribute(
              'for',
              mapmlInput.getAttribute('id')
            );
            selectsummary.appendChild(selectSummaryLabel);
            selectdetails.appendChild(selectsummary);
            selectdetails.appendChild(mapmlInput.htmlselect);
            this._selectdetails.push(selectdetails);
          }
        }
      }
    }
  }
  transcribe(element) {
    var select = document.createElement('select');
    var elementAttrNames = element.getAttributeNames();

    for (let i = 0; i < elementAttrNames.length; i++) {
      select.setAttribute(
        elementAttrNames[i],
        element.getAttribute(elementAttrNames[i])
      );
    }

    var options = element.children;

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
}
window.customElements.define('map-select', MapSelect);
