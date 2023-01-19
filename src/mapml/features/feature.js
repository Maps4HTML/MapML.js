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

    if(this.type === "MAP-POINT" || this.type === "MAP-MULTIPOINT") options.fillOpacity = 1;

    if(options.wrappers.length > 0)
      options = Object.assign(this._convertWrappers(options.wrappers), options);
    L.setOptions(this, options);

    this.group = this.options.group;
    this.options.interactive = this.options.link || (this.options.properties && this.options.onEachFeature);

    this._parts = [];
    this._markup = markup;
    this.options.zoom = markup.getAttribute('zoom') || this.options.nativeZoom;

    this._convertMarkup();

    if(markup.querySelector('map-span') || markup.querySelector('map-a')){
      this._generateOutlinePoints();
    }

    this.isClosed = this._isClosed();
  },

  /**
   * Attaches link handler to the sub parts' paths
   * @param {SVGElement} elem - The element to add listeners to, either path or g elements
   * @param {Object} link - The link object that contains the url, type and target data
   * @param leafletLayer
   */
  attachLinkHandler: function (elem, link, leafletLayer) {
    let dragStart, container = document.createElement('div'), p = document.createElement('p'), hovered = false;
    container.classList.add('mapml-link-preview');
    container.appendChild(p);
    elem.classList.add('map-a');
    if (link.visited) elem.classList.add("map-a-visited");
    L.DomEvent.on(elem, 'mousedown', e => dragStart = {x:e.clientX, y:e.clientY}, this);
    L.DomEvent.on(elem, "mouseup", (e) => {
      if (e.button !== 0) return; // don't trigger when button isn't left click
      let onTop = true, nextLayer = this.options._leafletLayer._layerEl.nextElementSibling;
      while(nextLayer && onTop){
        if(nextLayer.tagName && nextLayer.tagName.toUpperCase() === "LAYER-")
          onTop = !(nextLayer.checked && nextLayer._layer.queryable);
        nextLayer = nextLayer.nextElementSibling;
      }
      if(onTop && dragStart) {
        //M.handleLink gets called twice, once in the target phase on the path element, then in the bubble phase on the g element
        //Using stopPropagation leaves the mouse in the mousedown state
        if(e.eventPhase === 3) return;
        let dist = Math.sqrt(Math.pow(dragStart.x - e.clientX, 2) + Math.pow(dragStart.y - e.clientY, 2));
        if (dist <= 5){
          link.visited = true;
          elem.setAttribute("stroke", "#6c00a2");
          elem.classList.add("map-a-visited");
          M.handleLink(link, leafletLayer);
        }
      }
    }, this);
    L.DomEvent.on(elem, "keypress", (e) => {
      L.DomEvent.stop(e);
      if(e.keyCode === 13 || e.keyCode === 32) {
        link.visited = true;
        elem.setAttribute("stroke", "#6c00a2");
        elem.classList.add("map-a-visited");
        M.handleLink(link, leafletLayer);
      }
    }, this);
    L.DomEvent.on(elem, 'mouseenter keyup', (e) => {
      if(e.target !== e.currentTarget) return;
      hovered = true;
      let resolver = document.createElement('a'), mapWidth = this._map.getContainer().clientWidth;
      resolver.href = link.url;
      p.innerHTML = resolver.href;

      this._map.getContainer().appendChild(container);

      while(p.clientWidth > mapWidth/2){
        p.innerHTML = p.innerHTML.substring(0, p.innerHTML.length - 5) + "...";
      }
      setTimeout(()=>{
        if(hovered) p.innerHTML = resolver.href;
      }, 1000);
    }, this);
    L.DomEvent.on(elem, 'mouseout keydown mousedown', (e) => {
      if(e.target !== e.currentTarget || !container.parentElement) return;
      hovered = false;
      this._map.getContainer().removeChild(container);
    }, this);
    L.DomEvent.on(leafletLayer._map.getContainer(),'mouseout mouseenter click', (e) => { //adds a lot of event handlers
      if(!container.parentElement) return;
      hovered = false;
      this._map.getContainer().removeChild(container);
    }, this);
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
   * Converts the map-spans, a and divs around a geometry subtype into options for the feature
   * @param {HTMLElement[]} elems - The current zoom level of the map
   * @private
   */
  _convertWrappers: function (elems) {
    if(!elems || elems.length === 0) return;
    let classList = '', output = {};
    for(let elem of elems){
      if(elem.tagName.toUpperCase() !== "MAP-A" && elem.className){
        classList +=`${elem.className} `;
      } else if(!output.link && elem.getAttribute("href")) {
        let link = {};
        link.url = elem.getAttribute("href");
        if(elem.hasAttribute("target")) link.target = elem.getAttribute("target");
        if(elem.hasAttribute("type")) link.type = elem.getAttribute("type");
        if(elem.hasAttribute("inplace")) link.inPlace = true;
        output.link = link;
      }
    }
    output.className = `${classList} ${this.options.className}`.trim();
    return output;
  },

  /**
   * Converts this._markup to the internal structure of features
   * @private
   */
  _convertMarkup: function () {
    if (!this._markup) return;

    let attr = this._markup.attributes;
    this.featureAttributes = {};
    if(this.options.link && this._markup.parentElement.tagName.toUpperCase() === "MAP-A" && this._markup.parentElement.parentElement.tagName.toUpperCase() !== "MAP-GEOMETRY")
      this.featureAttributes.tabindex = "0";
    for(let i = 0; i < attr.length; i++){
      this.featureAttributes[attr[i].name] = attr[i].value;
    }

    let first = true;
    for (let c of this._markup.querySelectorAll('map-coordinates')) {              //loops through the coordinates of the child
      let ring = [], subRings = [];
      this._coordinateToArrays(c, ring, subRings, this.options.className);              //creates an array of pcrs points for the main ring and the subparts
      if (!first && this.type === "MAP-POLYGON") {
        this._parts[0].rings.push(ring[0]);
        if (subRings.length > 0)
          this._parts[0].subrings = this._parts[0].subrings.concat(subRings);
      } else if (this.type === "MAP-MULTIPOINT") {
        for (let point of ring[0].points.concat(subRings)) {
          this._parts.push({ rings: [{ points: [point] }], subrings: [], cls:`${point.cls || ""} ${this.options.className || ""}`.trim() });
        }
      } else {
        this._parts.push({ rings: ring, subrings: subRings, cls: `${this.featureAttributes.class || ""} ${this.options.className || ""}`.trim() });
      }
      first = false;
    }
  },

  /**
   * Generates the feature outline, subtracting the map-spans to generate those separately
   * @private
   */
  _generateOutlinePoints: function () {
    if (this.type === "MAP-MULTIPOINT" || this.type === "MAP-POINT" || this.type === "MAP-LINESTRING" || this.type === "MAP-MULTILINESTRING") return;

    this._outline = [];
    for (let coords of this._markup.querySelectorAll('map-coordinates')) {
      let nodes = coords.childNodes, cur = 0, tempDiv = document.createElement('div'), nodeLength = nodes.length;
      for(let i = 0; i < nodes.length; i++){
        if(nodes[i].textContent.trim().length === 0){
          nodes[i].remove();
        }
      }
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
   * Converts map-coordinates element to an object representing the parts and subParts
   * @param {HTMLElement} coords - A single map-coordinates element
   * @param {Object[]} main - An empty array representing the main parts
   * @param {Object[]} subParts - An empty array representing the sub parts
   * @param {boolean} isFirst - A true | false representing if the current HTML element is the parent map-coordinates element or not
   * @param {string} cls - The class of the coordinate/span
   * @param parents
   * @private
   */
  _coordinateToArrays: function (coords, main, subParts, isFirst = true, cls = undefined, parents = []) {
    for (let span of coords.children) {
      this._coordinateToArrays(span, main, subParts, false, span.getAttribute("class"), parents.concat([span]));
    }
    let noSpan = coords.textContent.replace(/(<([^>]+)>)/ig, ''),
        pairs = noSpan.match(/(\S+\s+\S+)/gim), local = [], bounds;
    for (let p of pairs) {
      let numPair = [];
      p.split(/\s+/gim).forEach(M.parseNumber, numPair);
      let point = M.pointToPCRSPoint(L.point(numPair), this.options.zoom, this.options.projection, this.options.nativeCS);
      local.push(point);
      bounds = bounds ? bounds.extend(point) : L.bounds(point, point);
    }
    if (this._bounds) {
      this._bounds.extend(bounds.min);
      this._bounds.extend(bounds.max);
    } else {
      this._bounds = bounds;
    }
    if (isFirst) {
      main.push({ points: local });
    } else {
      let attrMap = {}, attr = coords.attributes, wrapperAttr = this._convertWrappers(parents);
      if(wrapperAttr.link) attrMap.tabindex = "0";
      for(let i = 0; i < attr.length; i++){
        if(attr[i].name === "class") continue;
        attrMap[attr[i].name] = attr[i].value;
      }
      subParts.unshift({
        points: local,
        center: bounds.getCenter(),
        cls: `${cls || ""} ${wrapperAttr.className || ""}`.trim(),
        attr: attrMap,
        link: wrapperAttr.link,
        linkTarget: wrapperAttr.linkTarget,
        linkType: wrapperAttr.linkType});
    }
  },

  /**
   * Returns if the feature is closed or open, useful when styling
   * @returns {boolean}
   * @private
   */
  _isClosed: function () {
    switch (this.type) {
      case 'MAP-POLYGON':
      case 'MAP-MULTIPOLYGON':
      case 'MAP-POINT':
      case 'MAP-MULTIPOINT':
        return true;
      case 'MAP-LINESTRING':
      case 'MAP-MULTILINESTRING':
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

  getPCRSCenter: function () {
    return this._bounds.getCenter();
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