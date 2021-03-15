export var Feature = L.Path.extend({
  initialize: function (markup, options) {
    this.type = markup.tagName.toUpperCase();

    L.setOptions(this, options);
    this._parts = [];
    this._markup = markup;
    this.options.zoom = markup.getAttribute('zoom') || this.options.nativeZoom;
    this.options.cs = this.options.nativeCS;

    this.generateOutlinePoints();
    this.convertMarkup();

    this.isClosed = this.isClosed();
  },

  _project: function (m, tileOrigin = undefined, z = undefined) {
    let map = m || this._map, origin = tileOrigin || map.getPixelOrigin(), zoom = z === undefined ? map.getZoom() : z;
    for (let p of this._parts) {
      p.pixelRings = this._convertRing(p.rings, map, origin, zoom);
      for (let subP of p.subrings) {
        subP.pixelSubrings = this._convertRing([subP], map, origin, zoom);
      }
    }
    if (!this._outline) return;
    this.pixelOutline = [];
    for (let o of this._outline) {
      this.pixelOutline = this.pixelOutline.concat(this._convertRing(o, map, origin, zoom));
    }
  },

  _convertRing: function (r, map, origin, zoom) {
    // TODO: Implement Ramer-Douglas-Peucer Algo for simplifying points
    // TODO: Round points to a given tolerance
    let scale = map.options.crs.scale(zoom), parts = [];
    for (let sub of r) {
      let interm = [];
      for (let p of sub.points) {
        let conv = map.options.crs.transformation.transform(p, scale);
        interm.push(L.point(conv.x, conv.y)._subtract(origin).round());
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

    let first = true;
    for (let c of this._markup.querySelectorAll('coordinates')) {              //loops through the coordinates of the child
      let ring = [], subrings = [];
      this.coordinateToArrays(c, ring, subrings, this.options.className);                    //creates an array of pcrs points for the main ring and the subparts
      if (!first && this.type === "POLYGON") {
        this._parts[0].rings.push(ring[0]);
        if (subrings.length > 0)
          this._parts[0].subrings = this._parts[0].subrings.concat(subrings);
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

  generateOutlinePoints: function () {
    if (this.type === "MULTIPOINT" || this.type === "POINT" || this.type === "LINESTRING" || this.type === "MULTILINESTRING") return;

    this._outline = [];
    for (let coords of this._markup.querySelectorAll('coordinates')) {
      let nodes = coords.childNodes, cur = 0, tempDiv = document.createElement('div'), nodeLength = nodes.length;
      for (let n of nodes) {
        let line = [];
        if (!n.tagName) {  //no tagname means it's text content
          let c = '';
          if (cur - 1 > 0 && nodes[cur - 1].tagName) {
            let prev = nodes[cur - 1].textContent.split(' ');
            c += `${prev[prev.length - 2]} ${prev[prev.length - 1]} `;
          }
          c += n.textContent;
          if (cur + 1 < nodeLength && nodes[cur + 1].tagName) {
            let next = nodes[cur + 1].textContent.split(' ');
            c += `${next[0]} ${next[1]} `;
          }
          tempDiv.innerHTML = c;
          this.coordinateToArrays(tempDiv, line, [], true, this.options.className);
          this._outline.push(line);
        }
        cur++;
      }
    }

    /*
        let lines = [];
        for (let coords of this._markup.querySelectorAll('coordinates')) {
          let content = coords.innerHTML.split(/(<.*><\/.*>)/ig);
          for (let c of content) {
            if (c === '') continue;
            let tempDiv = document.createElement('div'), line = [];
            if (c[0] === "<") {
              let p = c.replace(/(<([^>]+)>)/ig, '').split(' ');
              tempDiv.innerHTML = `${p[0]} ${p[1]} ${p[p.length - 2]} ${p[p.length - 1]}`
            } else {
              tempDiv.innerHTML = c;
            }
            this.coordinateToArrays(tempDiv, line, [], true, this.options.className);
            lines.push(line);
          }
        }
        this._outline = lines;
    
         
        let cur = 0;
        for (let coords of this._markup.querySelectorAll('coordinates')) {
          let ring = [], subring = [], tempDiv = document.createElement('div');
          tempDiv.textContent = coords.textContent.replace(/(<.*>.*<\/.*>)/ig, '')
          this.coordinateToArrays(tempDiv, ring, subring, true, this.options.className);
          if (this.type === "POLYGON") {
            if (!this._parts[0].outline) this._parts[0].outline = [];
            this._parts[0].outline.push(ring);
          } else {
            this._parts[cur].outline = ring;
          }
          cur++;
        } */
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
      subparts.unshift({ points: local, cls: cls || this.options.className });
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