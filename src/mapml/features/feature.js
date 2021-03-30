/**
 * M.Feature is a extension of L.Path that understands mapml feature markup
 * It converts the markup to the following structure (abstract enough to encompass all feature types) for example:
 *  this._outlinePath = HTMLElement;
 *  this._parts = [
 *    {
 *      path: HTMLElement,
 *      rings:[
 *        {points:[{x:1,y:1}, ...]},
 *        ...
 *      ],
 *      subrings:[
 *        {points:[{x:2, y:2}, ...], cls:"Span Class Name", path: HTMLElement,},
 *        ...
 *      ],
 *      cls:"className",
 *    },
 *    ...
 *  ];
 */
export var Feature = L.Path.extend({

  /**
   * Initializes the M.Feature
   * @param {HTMLElement} markup - The markup representation of the feature
   * @param {Object} options - The options of the feature
   */
  initialize: function (markup, options) {
    this.type = markup.tagName.toUpperCase();

    if(this.type === "POINT" || this.type === "MULTIPOINT") options.fillOpacity = 1;
    L.setOptions(this, options);

    this.group = this.options.group;

    this._parts = [];
    this._markup = markup;
    this.options.zoom = markup.getAttribute('zoom') || this.options.nativeZoom;

    this._convertWrappers();
    this._convertMarkup();

    if(this.options.link){
      this.on({
        click: this._handleLinkClick,
        keypress: this._handleLinkKeypress,
      }, this);
    }

    this.on('keypress', this._handleSpaceDown, this);

    if(markup.querySelector('span') || markup.querySelector('a')){
      this._generateOutlinePoints();
    }

    this.isClosed = this._isClosed();
  },

  /**
   * Removes the focus handler, and calls the leaflet L.Path.onRemove
   */
  onRemove: function () {
    if(this.options.link) {
      this.off({
        click: this._handleLinkClick,
        keypress: this._handleLinkKeypress,
      });
    }

    if(this.options.interactive) this.off('keypress', this._handleSpaceDown);

    L.Path.prototype.onRemove.call(this);
  },

  _handleLinkClick: function(e){
    L.DomEvent.stop(e);
    let layer = document.createElement('layer-');
    layer.setAttribute('src', this.options.link);
    layer.setAttribute('checked', '');
    switch (this.options.linkType) {
      case "_blank":
        this._map.options.mapEl.appendChild(layer);
        break;
      case "_parent":
        for(let l of this._map.options.mapEl.querySelectorAll("layer-"))
          if(l._layer !== this.options.featureLayer.options._leafletLayer) this._map.options.mapEl.removeChild(l);
        this._map.options.mapEl.appendChild(layer);
        this._map.options.mapEl.removeChild(this.options.featureLayer.options._leafletLayer._layerEl);
        break;
      case "_top":
        window.location.href = this.options.link;
        break;
      case "_self":
      default:
        this.options.featureLayer.options._leafletLayer._layerEl.insertAdjacentElement('beforebegin', layer);
        this._map.options.mapEl.removeChild(this.options.featureLayer.options._leafletLayer._layerEl);
    }
  },

  _handleLinkKeypress: function(e){
    if (e.originalEvent.keyCode === 13 || e.originalEvent.keyCode === 32) {
      this._handleLinkClick(e)
    }
  },

  _handleSpaceDown: function (e){
    if(e.originalEvent.keyCode === 32){
      if(this.options.link){
        this._handleLinkClick(e);
      } else {
        this._openPopup(e);
      }
    }
  },

  /**
   * Updates internal structure of the feature to the new map state, the structure can be found in this._parts
   * @param {L.Map} addedMap - The map that the feature is part of, can be left blank in the case of static features
   * @param {L.Point} tileOrigin - The tile origin for the feature, if blank then it takes the maps pixel origin in the function
   * @param {int} zoomingTo - The zoom the map is animating to, if left blank then it takes the map zoom, its provided because in templated tiles zoom is delayed
   * @private
   */
  _project: function (addedMap, tileOrigin = undefined, zoomingTo = undefined) {
    let map = addedMap || this._map, origin = tileOrigin || map.getPixelOrigin(), zoom = zoomingTo === undefined ? map.getZoom() : zoomingTo;
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

  /**
   * Converts the PCRS points to pixel points that can be used to create the SVG
   * @param {L.Point[][]} r - Is the rings of a feature, either the mainParts, subParts or outline
   * @param {L.Map} map - The map that the feature is part of
   * @param {L.Point} origin - The origin used to calculate the pixel points
   * @param {int} zoom - The current zoom level of the map
   * @returns {L.Point[][]}
   * @private
   */
  _convertRing: function (r, map, origin, zoom) {
    // TODO: Implement Ramer-Douglas-Peucer Algo for simplifying points
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

  /**
   * Updates the features
   * @private
   */
  _update: function () {
    if (!this._map) return;
    this._renderer._updateFeature(this);
  },

  /**
   * Converts the spans, a and divs around a geometry subtype into options for the feature
   * @private
   */
  _convertWrappers: function () {
    if(!this.options.wrappers || this.options.wrappers.length === 0) return;
    let classList = '';
    for(let elem of this.options.wrappers){
      if(elem.tagName.toUpperCase() !== "A" && elem.className){
        // Useful if getting other attributes off spans and divs is useful
/*        let attr = elem.attributes;
        for(let i = 0; i < attr.length; i++){
          if(attr[i].name === "class" || attributes[attr[i].name]) continue;
          attributes[attr[i].name] = attr[i].value;
        }*/
        classList +=`${elem.className} `;
      } else if(!this.options.link && elem.href) {
        this.options.link = elem.href;
        if(elem.hasAttribute("target")) this.options.linkType = elem.getAttribute("target");
      }
    }
    this.options.className = `${classList} ${this.options.className}`.trim();
  },

  /**
   * Converts this._markup to the internal structure of features
   * @private
   */
  _convertMarkup: function () {
    if (!this._markup) return;

    let attr = this._markup.attributes;
    this.featureAttributes = {};
    for(let i = 0; i < attr.length; i++){
      this.featureAttributes[attr[i].name] = attr[i].value;
    }

    let first = true;
    for (let c of this._markup.querySelectorAll('coordinates')) {              //loops through the coordinates of the child
      let ring = [], subrings = [];
      this._coordinateToArrays(c, ring, subrings, this.options.className);              //creates an array of pcrs points for the main ring and the subparts
      if (!first && this.type === "POLYGON") {
        this._parts[0].rings.push(ring[0]);
        if (subrings.length > 0)
          this._parts[0].subrings = this._parts[0].subrings.concat(subrings);
      } else if (this.type === "MULTIPOINT") {
        for (let point of ring[0].points.concat(subrings)) {
          this._parts.push({ rings: [{ points: [point] }], subrings: [], cls:`${point.cls || ""} ${this.options.className || ""}`.trim() });
        }
      } else {
        this._parts.push({ rings: ring, subrings: subrings, cls: `${this.featureAttributes.class || ""} ${this.options.className || ""}`.trim() });
      }
      first = false;
    }
  },

  /**
   * Generates the feature outline, subtracting the spans to generate those separately
   * @private
   */
  _generateOutlinePoints: function () {
    if (this.type === "MULTIPOINT" || this.type === "POINT" || this.type === "LINESTRING" || this.type === "MULTILINESTRING") return;

    this._outline = [];
    for (let coords of this._markup.querySelectorAll('coordinates')) {
      let nodes = coords.childNodes, cur = 0, tempDiv = document.createElement('div'), nodeLength = nodes.length;
      for (let n of nodes) {
        let line = [];
        if (!n.tagName) {  //no tagName means it's text content
          let c = '', ind = (((cur - 1)%nodes.length) + nodes.length) % nodes.length; // this equation turns Javascript's % to how it behaves in C for example
          if (nodes[ind].tagName) {
            let prev = nodes[ind].textContent.trim().split(/\s+/);
            c += `${prev[prev.length - 2]} ${prev[prev.length - 1]} `;
          }
          c += n.textContent;
          ind = (((cur + 1)%nodes.length) + nodes.length) % nodes.length; // this is equivalent to C/C++'s (cur + 1) % nodes.length
          if (nodes[ind].tagName) {
            let next = nodes[ind].textContent.trim().split(/\s+/);
            c += `${next[0]} ${next[1]} `;
          }
          tempDiv.innerHTML = c;
          this._coordinateToArrays(tempDiv, line, [], true, this.featureAttributes.class || this.options.className);
          this._outline.push(line);
        }
        cur++;
      }
    }
  },

  /**
   * Converts coordinates element to an object representing the parts and subParts
   * @param {HTMLElement} coords - A single coordinates element
   * @param {Object[]} main - An empty array representing the main parts
   * @param {Object[]} subParts - An empty array representing the sub parts
   * @param {boolean} isFirst - A true | false representing if the current HTML element is the parent coordinates element or not
   * @param {string} cls - The class of the coordinate/span
   * @private
   */
  _coordinateToArrays: function (coords, main, subParts, isFirst = true, cls = undefined) {
    for (let span of coords.children) {
      this._coordinateToArrays(span, main, subParts, false, span.getAttribute("class"));
    }
    let noSpan = coords.textContent.replace(/(<([^>]+)>)/ig, ''),
        pairs = noSpan.match(/(\S+\s+\S+)/gim), local = [];
    for (let p of pairs) {
      let numPair = [];
      p.split(/\s+/gim).forEach(M.parseNumber, numPair);
      let point = M.pointToPCRSPoint(L.point(numPair), this.options.zoom, this.options.projection, this.options.nativeCS);
      local.push(point);
      this._bounds = this._bounds ? this._bounds.extend(point) : L.bounds(point, point);
    }
    if (isFirst) {
      main.push({ points: local });
    } else {
      let attrMap = {}, attr = coords.attributes;
      for(let i = 0; i < attr.length; i++){
        if(attr[i].name === "class") continue;
        attrMap[attr[i].name] = attr[i].value;
      }
      subParts.unshift({ points: local, cls: cls || this.options.className, attr: attrMap});
    }
  },

  /**
   * Returns if the feature is closed or open, useful when styling
   * @returns {boolean}
   * @private
   */
  _isClosed: function () {
    switch (this.type) {
      case 'POLYGON':
      case 'MULTIPOLYGON':
      case 'POINT':
      case 'MULTIPOINT':
        return true;
      case 'LINESTRING':
      case 'MULTILINESTRING':
        return false;
      default:
        return false;
    }
  },

  /**
   * Returns the center of the entire feature
   * @returns {L.Point}
   */
  getCenter: function () {
    if (!this._bounds) return null;
    return this._map.options.crs.unproject(this._bounds.getCenter());
  },
});

/**
 *
 * @param {HTMLElement} markup - The markup of the feature
 * @param {Object} options - Options of the feature
 * @returns {M.Feature}
 */
export var feature = function (markup, options) {
  return new Feature(markup, options);
};