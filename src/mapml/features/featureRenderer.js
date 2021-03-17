/**
 * Returns a new Feature Renderer
 * @param {Object} options - Options for the renderer
 * @returns {*}
 */
export var FeatureRenderer = L.SVG.extend({

  /**
   * Creates all the appropriate path elements for a M.Feature
   * @param {M.Feature} layer - The M.Feature that needs paths generated
   * @param {boolean} stampLayer - Whether or not a layer should be stamped and stored in the renderer layers
   * @private
   */
  _initPath: function (layer, stampLayer = true) {

    let outlinePath = L.SVG.create('path');
    if(layer.options.className) L.DomUtil.addClass(outlinePath, layer.options.className);
    if(layer.options.featureID) layer.group.setAttribute("data-fid", layer.options.featureID);
    layer.group.setAttribute('aria-label', layer.accessibleTitle || "Feature");
    L.DomUtil.addClass(outlinePath, 'mapml-feature-outline');
    outlinePath.style.fill = 'none';
    layer.outlinePath = outlinePath;

    //creates the main parts and sub parts paths
    for (let p of layer._parts) {
      if (p.rings) this._createPath(p, layer.options.className, layer.options.featureID, layer.accessibleTitle, true);
      if (p.subrings) {
        for (let r of p.subrings) {
          this._createPath(r, layer.options.className, layer.options.featureID, layer.accessibleTitle, false);
        }
      }
      this._updateStyle(layer);
    }
    if(stampLayer){
      let stamp = L.stamp(layer);
      this._layers[stamp] = layer;
      layer.group.setAttribute('tabindex', '0');
      L.DomUtil.addClass(layer.group, "leaflet-interactive");
    }
  },

  /**
   * Creates paths for either mainParts, subParts or outline of a feature
   * @param {Object} ring - The ring the current path is being generated for
   * @param {string} title - The accessible aria-label of a path
   * @param {string} cls - The class of the path
   * @param {string} id - The fid of a path
   * @param {boolean} interactive - The boolean representing whether a feature is interactive or not
   * @private
   */
  _createPath: function (ring, cls, id, title = "Feature", interactive = false) {
    let p = L.SVG.create('path');
    ring.path = p;
    if(id) p.setAttribute('data-fid', id);
    p.setAttribute('aria-label', title);
    if (ring.cls || cls) {
      L.DomUtil.addClass(p, ring.cls || cls);
    }
    if (interactive) {
      L.DomUtil.addClass(p, 'leaflet-interactive');
    }
  },

  /**
   * Adds all the paths needed for a feature
   * @param {M.Feature} layer - The feature that needs it's paths added
   * @param {HTMLElement} container - The location the paths need to be added to
   * @param {boolean} interactive - Whether a feature is interactive or not
   * @private
   */
  _addPath: function (layer, container = undefined, interactive = true) {
    if (!this._rootGroup && !container) { this._initContainer(); }
    let c = container || this._rootGroup;
    if (layer.pixelOutline) layer.group.appendChild(layer.outlinePath);
    if(interactive) layer.addInteractiveTarget(layer.group);
    for (let p of layer._parts) {
      if (p.path) {
        layer.group.appendChild(p.path);
      }

      for (let subP of p.subrings) {
        if (subP.path)
          layer.group.appendChild(subP.path);
      }
    }
    c.appendChild(layer.group);
  },

  /**
   * Removes all the paths related to a feature
   * @param {M.Feature} layer - The feature who's paths need to be removed
   * @private
   */
  _removePath: function (layer) {
    for (let p of layer._parts) {
      if (p.path) {
        layer.removeInteractiveTarget(p.path);
        L.DomUtil.remove(p.path);
      }
      for (let subP of p.subrings) {
        if (subP.path)
          L.DomUtil.remove(subP.path);
      }
    }
    if(layer.outlinePath) L.DomUtil.remove(layer.outlinePath);
    layer.removeInteractiveTarget(layer.group);
    L.DomUtil.remove(layer.group);
    delete this._layers[L.stamp(layer)];
  },

  /**
   * Updates the d attribute of all paths of a feature
   * @param {M.Feature} layer - The Feature that needs updating
   * @private
   */
  _updateFeature: function (layer) {
    if (layer.pixelOutline) this._setPath(layer.outlinePath, this.geometryToPaths(layer.pixelOutline, false));
    for (let p of layer._parts) {
      this._setPath(p.path, this.geometryToPaths(p.pixelRings, layer.isClosed));
      for (let subP of p.subrings) {
        this._setPath(subP.path, this.geometryToPaths(subP.pixelSubrings, false));
      }
    }
  },

  /**
   * Generates the marker d attribute for a given point
   * @param {L.Point} p - The point of the marker
   * @returns {string}
   */
  geometryToMarker: function (p) {
    return `M${p.x} ${p.y} L${p.x - 12.5} ${p.y - 30} C${p.x - 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 30} L${p.x} ${p.y}z`;
  },

  /**
   * Updates the styles of all paths of a feature
   * @param {M.Feature} layer - The feature that needs styles updated
   * @private
   */
  _updateStyle: function (layer) {
    this._updatePathStyle(layer.outlinePath, layer.options, layer.isClosed, true);
    for (let p of layer._parts) {
      if (p.path) {
        this._updatePathStyle(p.path, layer.options, layer.isClosed);
      }
      for (let subP of p.subrings) {
        if (subP.path)
          this._updatePathStyle(subP.path, layer.options, false);
      }
    }
  },

  /**
   * Updates the style of a single path
   * @param {HTMLElement} path - The path that needs updating
   * @param {Object} options - The options of a feature
   * @param {boolean} isClosed - Whether a feature is closed or not
   * @param {boolean} isOutline - Whether a path is an outline or not
   * @private
   */
  _updatePathStyle: function (path, options, isClosed, isOutline = false) {
    if (!path) { return; }

    if (options.stroke && (!isClosed || isOutline)) {
      path.setAttribute('stroke', options.color);
      path.setAttribute('stroke-opacity', options.opacity);
      path.setAttribute('stroke-width', options.weight);
      path.setAttribute('stroke-linecap', options.lineCap);
      path.setAttribute('stroke-linejoin', options.lineJoin);

      if (options.dashArray) {
        path.setAttribute('stroke-dasharray', options.dashArray);
      } else {
        path.removeAttribute('stroke-dasharray');
      }

      if (options.dashOffset) {
        path.setAttribute('stroke-dashoffset', options.dashOffset);
      } else {
        path.removeAttribute('stroke-dashoffset');
      }
    } else {
      path.setAttribute('stroke', 'none');
    }

    if(isClosed) {
      if (!options.fill) {
        path.setAttribute('fill', options.fillColor || options.color);
        path.setAttribute('fill-opacity', options.fillOpacity);
        path.setAttribute('fill-rule', options.fillRule || 'evenodd');
      } else {
        path.setAttribute('fill', options.color);
      }
    } else {
      path.setAttribute('fill', 'none');
    }
  },

  /**
   * Sets the d attribute of a path
   * @param {HTMLElement} path - The path that is being updated
   * @param {string} def - The new d attribute of the path
   * @private
   */
  _setPath: function (path, def) {
    path.setAttribute('d', def);
  },

  /**
   * Generates the d string of a feature part
   * @param {L.Point[]} rings - The points making up a given part of a feature
   * @param {boolean} closed - Whether a feature is closed or not
   * @returns {string}
   */
  geometryToPaths: function (rings, closed) {
    let str = '', i, j, len, len2, points, p;

    for (i = 0, len = rings.length; i < len; i++) {
      points = rings[i];
      if (points.length === 1) {
        return this.geometryToMarker(points[0]);
      }
      for (j = 0, len2 = points.length; j < len2; j++) {
        p = points[j];
        str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
      }
      str += closed ? 'z' : '';
    }
    return str || 'M0 0';
  },
});

export var featureRenderer = function (options) {
  return new FeatureRenderer(options);
};