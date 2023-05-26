export class LocationInput {
  constructor(name, position, axis, units, min, max, rel, layer) {
    this.name = name;
    this.position = position;
    this.axis = axis;
    this.units = units; // cs
    this.min = min;
    this.max = max;
    this.rel = rel;
    this.layer = layer;
  }

  validateInput() {
    // name is required
    // axis is required
    // cs/units is required
    if (!this.name || !this.axis || !this.units) {
      return false;
    }
    // check if axis match the cs
    let axisCS = M.axisToCS(this.axis);
    if (
      (typeof axisCS === 'string' && axisCS !== this.units) ||
      (typeof axisCS === 'object' &&
        (axisCS[0] !== this.units || axisCS[1] !== this.units))
    ) {
      return false;
    }
    // position is not required, will default to top-left
    // min max fallbacks, map-meta -> projection
    // rel not required, default is image/extent
    return true;
  }

  _TCRSToPCRS(coords, zoom) {
    // TCRS pixel point to Projected CRS point (in meters, presumably)
    var map = this.layer._map,
      crs = map.options.crs,
      loc = crs.transformation.untransform(coords, crs.scale(zoom));
    return loc;
  }

  getValue(zoom = undefined, bounds = undefined) {
    // units = cs
    //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
    if (zoom === undefined) zoom = this.layer._map.getZoom();
    if (bounds === undefined) bounds = this.layer._map.getPixelBounds();

    if (this.units === 'pcrs' || this.units === 'gcrs') {
      switch (this.axis) {
        case 'longitude':
        case 'easting':
          if (this.position) {
            if (this.position.match(/.*?-left/i)) {
              return this._TCRSToPCRS(bounds.min, zoom).x;
            } else if (this.position.match(/.*?-right/i)) {
              return this._TCRSToPCRS(bounds.max, zoom).x;
            }
          } else {
            // position is not required, will default to top-left
          }
          break;
        case 'latitude':
        case 'northing':
          if (this.position) {
            if (this.position.match(/top-.*?/i)) {
              return this._TCRSToPCRS(bounds.min, zoom).y;
            } else if (this.position.match(/bottom-.*?/i)) {
              return this._TCRSToPCRS(bounds.max, zoom).y;
            }
          } else {
            // position is not required, will default to top-left
          }
          break;
      }
    } else if (
      this.units === 'tilematrix' ||
      this.units === 'tcrs' ||
      this.units === 'tile' ||
      this.units === 'map'
    ) {
      // TODO: What happens here...
    }
    return;
  }
}
