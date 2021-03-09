export var Feature = L.Path.extend({
  initialize: function (markup, options) {
    L.setOptions(this, options);
    this._markup = markup;
    this.convertMarkup();
    this.isClosed = this.isClosed();
  },

  _project: function () {
    this._parts = [];
    for (let coord of this._coords) {
      this._parts.push({ rings: this._convertRing(coord.rings), subrings: this._convertRing(coord.rings) });
    }
  },

  _convertRing: function (r) {
    let scale = this._map.options.crs.scale(this._map.getZoom()), map = this._map, interm = [];
    for (let sub of r) {
      interm.subrings.push([]);
      for (let p of sub) {
        let conv = map.options.crs.transformation.transform(p.point, scale);
        interm.subrings[count].push({ point: L.point(conv.x, conv.y)._subtract(map.getPixelOrigin()), cls: p.class });
      }
    }
    return interm;
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updateFeature(this, this.options.isClosed);
  },

  convertMarkup: function () {
    if (!this._markup) return;

    this.options.zoom = this._markup.getAttribute('zoom') || this.options.nativeZoom;
    this.options.cs = this.options.nativeCS;
    this._coords = [];
    this.type = this._markup.tagName.toUpperCase();

    for (let c of this._markup.querySelectorAll('coordinates')) {              //loops through the coordinates of the child
      let ring = [], subrings = [];
      this.coordinateToArrays(c, ring, subrings, this.options.className);                    //creates an array of pcrs points for the main ring and the subparts
      this._coords.push({ rings: ring, subrings: subrings });
    }
  },

  coordinateToArrays: function (coords, main, subparts, first = true, cls = null) {
    let local = [];
    for (let span of coords.children) {
      this.coordinateToArrays(span, main, subparts, false, span.getAttribute("class"));
    }
    coords.textContent = coords.textContent.replace(/(<([^>]+)>)/ig, '');
    let pairs = coords.textContent.match(/(\S+\s+\S+)/gim);
    for (let p of pairs) {
      let numPair = [];
      p.split(/\s+/gim).forEach(M.parseNumber, numPair);
      let point = M.pointToPCRSPoint(L.point(numPair), this.options.zoom, this.options.projection, this.options.cs)
      local.push(point);
      this._bounds = this._bounds ? this._bounds.extend(point) : L.bounds(point, point);
    }
    if (first) {
      main.push({ points: local, cls: cls || this.options.className });
    } else {
      subparts.push({ points: local, cls: cls || this.options.className });
    }
  },

  isClosed: function () {
    let type = this._markup.tagName;
    switch (type.toUpperCase()) {
      case 'POLYGON':
      case 'MULTIPOLYGON':
        return true;
      case 'LINESTRING':
      case 'POINT':
      case 'MULTILINESTRING':
        return false;
      default:
        return false;
    }
  },

  getCenter: function () {
    if (!this._bounds) return;
    return this._map.options.crs.unproject(this._bounds.getCenter());
  },
});

export var feature = function (markup, options) {
  return new Feature(markup, options);
};