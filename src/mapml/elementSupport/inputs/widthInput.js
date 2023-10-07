export class WidthInput {
  constructor(name, layer) {
    this.name = name;
    this.layer = layer;
  }

  validateInput() {
    // name is required
    if (!this.name) {
      return false;
    }
    return true;
  }

  getValue() {
    return this.layer._map.getSize().x;
  }
}
