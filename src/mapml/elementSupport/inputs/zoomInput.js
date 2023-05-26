export class ZoomInput {
  constructor(name, min, max, value, step, layer) {
    this.name = name;
    this.min = min;
    this.max = max;
    this.value = value;
    this.step = step;
    this.layer = layer;
  }

  validateInput() {
    // name is required
    if (!this.name) {
      return false;
    }
    // min and max can not be present
    // fallback would be layer's meta, -> projection min, max
    // don't need value, map-meta max value, -> fallback is max zoom of projection
    // don't need step, defaults to 1
    return true;
  }

  getValue() {
    return this.layer._map.options.mapEl.zoom;
  }
}
