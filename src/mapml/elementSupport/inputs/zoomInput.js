export class ZoomInput {
  constructor(name, min, max, value, step) {
    this.name = name;
    this.min = min;
    this.max = max;
    this.value = value;
    this.step = step;
  }

  validateInput() {
	// name is required
	// min and max can not be present
		// fallback would be layer's meta, -> projection min, max
	// don't need value, map-meta max value, -> fallback is max zoom of projection
	// don't need step, defaults to 1
	// checks here...
    return;
  }
}
