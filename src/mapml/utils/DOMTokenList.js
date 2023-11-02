export class DOMTokenList {
  /* jshint ignore:start */
  #element; // create element as a private property
  #valueSet; // needed to prevent infinite recursive calls to CE setAttribute
  #attribute; // the name of the attribute that will be a DOMTokenList
  #domain; // the domain of token values supported by this attribute
  /* jshint ignore:end */
  constructor(initialValue, element, attribute, domain) {
    // create donor/host div to extract DomTokenList from
    const hostingElement = document.createElement('div');
    this.domtokenlist = hostingElement.classList;

    // to check if value is being set, protects from infinite recursion
    // from attributeChangedCallback of mapml-viewer and web-map
    this.#valueSet = false; // jshint ignore:line
    this.domtokenlist.value = initialValue ?? '';
    this.#element = element; // jshint ignore:line
    this.#attribute = attribute; // jshint ignore:line
    this.#domain = domain; // jshint ignore:line
  }

  get valueSet() {
    return this.#valueSet; // jshint ignore:line
  }

  get length() {
    return this.domtokenlist.length;
  }

  get value() {
    return this.domtokenlist.value;
  }
  set value(val) {
    if (val === null) {
      // when attribute is being removed
      this.domtokenlist.value = '';
    } else {
      this.domtokenlist.value = val.toLowerCase();
      /* jshint ignore:start */
      this.#valueSet = true;
      this.#element.setAttribute(this.#attribute, this.domtokenlist.value);
      this.#valueSet = false;
      /* jshint ignore:end */
    }
  }

  item(index) {
    return this.domtokenlist.item(index);
  }

  contains(token) {
    return this.domtokenlist.contains(token);
  }

  // Modified default behavior
  add(token) {
    this.domtokenlist.add(token);
    this.#element.setAttribute(this.#attribute, this.domtokenlist.value); // jshint ignore:line
  }

  // Modified default behavior
  remove(token) {
    this.domtokenlist.remove(token);
    this.#element.setAttribute(this.#attribute, this.domtokenlist.value); // jshint ignore:line
  }

  // Modified default behavior
  replace(oldToken, newToken) {
    this.domtokenlist.replace(oldToken, newToken);
    this.#element.setAttribute(this.#attribute, this.domtokenlist.value); // jshint ignore:line
  }

  // Modified default behavior
  supports(token) {
    /* jshint ignore:start */
    if (this.#domain.includes(token)) {
      return true;
    } else {
      return false;
    }
    /* jshint ignore:end */
  }

  // Modified default behavior
  //https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
  toggle(token, force) {
    this.domtokenlist.toggle(token, force);
    this.#element.setAttribute(this.#attribute, this.domtokenlist.value); // jshint ignore:line
  }

  entries() {
    return this.domtokenlist.entries();
  }

  //https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/forEach
  forEach(callback, thisArg) {
    this.domtokenlist.forEach(callback, thisArg);
  }

  //https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/keys
  keys() {
    return this.domtokenlist.keys();
  }

  //https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/values
  values() {
    return this.domtokenlist.values();
  }
}
