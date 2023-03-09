export default class DOMTokenList {
    /* jshint ignore:start */
	#mapEl; // create mapEl as a private property
	#valueSet;
    /* jshint ignore:end */
	constructor (initialValue, mapEl) {
		// create donor/host div to extract DomTokenList from
		const hostingElement = document.createElement('div');
		this.controlsList = hostingElement.classList;
		
		// to check if value is being set, protects from infinite recursion
		// from attributeChangedCallback of mapml-viewer and web-map
		this.#valueSet = false;// jshint ignore:line
		this.controlsList.value = initialValue ?? '';
		this.#mapEl = mapEl;// jshint ignore:line
	}
	
	get valueSet () {
		return this.#valueSet;// jshint ignore:line
	}

	get length () {
		return this.controlsList.length;
	}

	get value () {
		return this.controlsList.value;
	}
	set value (val) {
		if (val) {
			this.controlsList.value = val.toLowerCase();
        	/* jshint ignore:start */
			this.#valueSet = true;
			this.#mapEl.setAttribute("controlslist", this.controlsList.value);
			this.#valueSet = false;
        	/* jshint ignore:end */
		}
	}

	item (index) {
		return this.controlsList.item(index);
	}

	contains(token) {
		return this.controlsList.contains(token);
	}

	// Modified default behavior
	add (token) {
		this.controlsList.add(token);
		this.#mapEl.setAttribute("controlslist", this.controlsList.value);// jshint ignore:line
	}

	// Modified default behavior
	remove (token) {
		this.controlsList.remove(token);
		this.#mapEl.setAttribute("controlslist", this.controlsList.value);// jshint ignore:line
	}

	// Modified default behavior
	replace (oldToken, newToken) {
		this.controlsList.replace(oldToken, newToken);
		this.#mapEl.setAttribute("controlslist", this.controlsList.value);// jshint ignore:line
	}

	// Modified default behavior
	supports (token) {
		let supported = ["nolayer", "nofullscreen", "noreload", "nozoom"];
		if (supported.includes(token)) {
			return true;
		} else {
			return false;
		}
	}

	// Modified default behavior
	//https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
	toggle (token, force) {
		this.controlsList.toggle(token, force);
		this.#mapEl.setAttribute("controlslist", this.controlsList.value);// jshint ignore:line
	}

	entries () {
		return this.controlsList.entries();
	}

	//https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/forEach
	forEach (callback, thisArg) {
		this.controlsList.forEach(callback, thisArg);
	}

	//https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/keys
	keys () {
		return this.controlsList.keys();
	}

	//https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/values
	values () {
		return this.controlsList.values();
	}
}