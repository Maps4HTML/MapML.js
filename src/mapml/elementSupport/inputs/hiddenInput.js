export class HiddenInput {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  validateInput() {
    // name is required
    // value is required
    if (!this.name || !this.value) {
      return false;
    }
    return true;
  }

  getValue() {
    return this.value;
  }
}
