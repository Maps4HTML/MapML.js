export var Feature = L.Path.extend({
  initialize: function (markup, options) {
    L.setOptions(this, options);

    this.type = markup.tagName.toUpperCase();
    this._parts = [];
    this._markup = markup;

    this.convertMarkup();
    this.isClosed = this.isClosed();
  },

  _project: function () {
    for (let p of this._parts) {
      p.pixelRings = this._convertRing(p.rings);
      for (let subP of p.subrings) {
        subP.pixelSubrings = this._convertRing([subP]);
      }
    }
  },

  _convertRing: function (r) {
    let scale = this._map.options.crs.scale(this._map.getZoom()), map = this._map, parts = [];
    for (let sub of r) {
      let interm = [];
      for (let p of sub.points) {
        let conv = map.options.crs.transformation.transform(p, scale);
        interm.push(L.point(conv.x, conv.y)._subtract(map.getPixelOrigin()));
      }
      parts.push(interm);
    }
    return parts;
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updateFeature(this, this.options.isClosed);
  },

  convertMarkup: function () {
    if (!this._markup) return;

    this.options.zoom = this._markup.getAttribute('zoom') || this.options.nativeZoom;
    this.options.cs = this.options.nativeCS;

    let first = true;
    for (let c of this._markup.querySelectorAll('coordinates')) {              //loops through the coordinates of the child
      let ring = [], subrings = [];
      this.coordinateToArrays(c, ring, subrings, this.options.className);                    //creates an array of pcrs points for the main ring and the subparts
      if (!first && this.type === "POLYGON") {
        this._parts[0].rings.push(ring[0]);
        if (subrings.length > 0)
          this._parts[0].subrings.push(subrings);
      } else if (this.type === "MULTIPOINT") {
        for (let point of ring[0].points.concat(subrings)) {
          this._parts.push({ rings: [{ points: [point] }], subrings: [], cls: point.cls || this.options.className });
        }
      } else {
        this._parts.push({ rings: ring, subrings: subrings, cls: this.options.className });
      }
      first = false;
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
      main.push({ points: local });
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