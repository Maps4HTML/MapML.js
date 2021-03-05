export var Feature = L.Path.extend({
  initialize: function (markup, options) {
    L.setOptions(this, options);
    this._markup = markup;
    this.convertMarkup();
    this.isClosed = this.isClosed();
  },

  _project: function () {
    let scale = this._map.options.crs.scale(this._map.getZoom()),
      map = this._map;

    this._mainParts = [];             //interactive, if interactive option is true and has fill if closed
    this._subParts = [];              //not interactive, only lines

    for (let rings of this._geometry) {   //loops through the geometry children
      let geo = [];

      for (let r of rings) {              //loops through the coordinates of the child
        let coords = [];

        for (let type in r) {
          let interm = [];                //loops through r.ring then r.subring of the coordinates, max 2 loops 
          for (let p of r[type]) {
            for (let c of p) {            //loops through the pcrs coords themselves

              let point = map.options.crs.transformation.transform(c.point, scale);
              if (this.type === "MULTIPOINT") {
                coords.push({ point: L.point(point.x, point.y)._subtract(map.getPixelOrigin()), cls: p.class });
              } else {
                interm.push({ point: L.point(point.x, point.y)._subtract(map.getPixelOrigin()), cls: p.class });
              }
            }
          }
          if (this.type !== "MULTIPOINT") {
            if (type === "ring") {
              coords.push(interm);
            } else {
              this._subParts.push(interm);
            }

          }
        }
        geo.push(coords);
      }
      this._mainParts.push(geo);
    }
    console.log("HERE");
  },

  _update: function () {
    if (!this._map) return;
    this._renderer._updateFeature(this, this.options.isClosed);
  },

  convertMarkup: function () {
    if (!this._markup) return;

    this.options.zoom = this._markup.getAttribute('zoom') || this.options.nativeZoom;
    this.options.cs = this._markup.querySelector('geometry').getAttribute("cs") || this.options.nativeCS;

    this._geometry = []
    for (let g of this._markup.querySelector('geometry').children) {  //loops through geometry elements children
      this.type = g.tagName.toUpperCase();
      let rings = [];
      for (let c of g.querySelectorAll('coordinates')) {              //loops through the coordinates of the child
        let ring = [], subring = [];
        this.coordinateToArrays(c, ring, subring);                    //creates an array of pcrs points for the main ring and the subparts
        rings.push({ ring: ring, subring: subring });
      }
      this._geometry.push(rings);
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

      local.push({ point: M.pointToPCRSPoint(L.point(numPair), this.options.zoom, this.options.projection, this.options.cs), class: cls });
    }
    if (first) {
      main.push(local);
    } else {
      subparts.push(local);
    }
  },

  isClosed: function () {
    let type = this._markup.querySelector('geometry').firstElementChild.tagName;
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
});

export var feature = function (markup, options) {
  return new Feature(markup, options);
};