import { SVG, DomUtil, stamp } from 'leaflet';

import { Util } from '../utils/Util.js';
/**
 * Returns a new Feature Renderer
 * @param {Object} options - Options for the renderer
 * @returns {*}
 */
export var FeatureRenderer = SVG.extend({
  /**
   * Override method of same name from SVG, use the this._container property
   * to set up the role="none presentation" on featureGroupu container,
   * per this recommendation:
   * https://github.com/Maps4HTML/MapMjs/pull/471#issuecomment-845192246
   * @private overrides ancestor method so that we have a _container to work with
   */
  _initContainer: function () {
    // call the method we're overriding, per https://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
    // note you have to pass 'this' as the first arg
    SVG.prototype._initContainer.call(this);
    // knowing that the previous method call creates the this._container, we
    // access it and set the role="none presetation" which suppresses the
    // announcement of "Graphic" on each feature focus.
    this._container.setAttribute('role', 'none presentation');
  },

  /**
   * Creates all the appropriate path elements for a M.Path
   * @param {M.Path} layer - The M.Path that needs paths generated
   * @param {boolean} stampLayer - Whether or not a layer should be stamped and stored in the renderer layers
   * @private
   */
  _initPath: function (layer, stampLayer = true) {
    if (layer._outline) {
      let outlinePath = SVG.create('path');
      if (layer.options.className)
        DomUtil.addClass(
          outlinePath,
          layer.featureAttributes.class || layer.options.className
        );
      DomUtil.addClass(outlinePath, 'mapml-feature-outline');
      outlinePath.style.fill = 'none';
      layer.outlinePath = outlinePath;
    }

    //creates the main parts and sub parts paths
    for (let p of layer._parts) {
      if (p.rings) {
        this._createPath(
          p,
          layer.options.className,
          layer.featureAttributes['aria-label'],
          layer.options.interactive,
          layer.featureAttributes
        );
        if (layer.outlinePath) p.path.style.stroke = 'none';
      }
      if (p.subrings) {
        for (let r of p.subrings) {
          this._createPath(
            r,
            layer.options.className,
            r.attr['aria-label'],
            r.link !== undefined,
            r.attr
          );
        }
      }
      this._updateStyle(layer);
    }
    if (stampLayer) {
      let s = stamp(layer);
      this._layers[s] = layer;
    }
  },

  /**
   * Creates paths for either mainParts, subParts or outline of a feature
   * @param {Object} ring - The ring the current path is being generated for
   * @param {string} title - The accessible aria-label of a path
   * @param {string} cls - The class of the path
   * @param {boolean} interactive - The boolean representing whether a feature is interactive or not
   * @param {Object} attr - Attributes map
   * @private
   */
  _createPath: function (
    ring,
    cls,
    title,
    interactive = false,
    attr = undefined
  ) {
    let p = SVG.create('path');
    ring.path = p;
    if (!attr) {
      if (title) p.setAttribute('aria-label', title);
    } else {
      for (let [name, value] of Object.entries(attr)) {
        if (name === 'id' || name === 'tabindex') continue;
        p.setAttribute(name, value);
      }
    }
    if (ring.cls || cls) {
      DomUtil.addClass(p, ring.cls || cls);
    }
    if (interactive) {
      DomUtil.addClass(p, 'leaflet-interactive');
    }
  },

  /**
   * Adds all the paths needed for a feature
   * @param {M.Path} layer - The feature that needs it's paths added
   * @param {HTMLElement} container - The location the paths need to be added to
   * @param {boolean} interactive - Whether a feature is interactive or not
   * @private
   */
  _addPath: function (layer, container = undefined, interactive = true) {
    if (!this._rootGroup && !container) {
      this._initContainer();
    }
    let c = container || this._rootGroup,
      outlineAdded = false;
    if (interactive) {
      layer.addInteractiveTarget(layer.group);
    }
    for (let p of layer._parts) {
      if (p.path) layer.group.appendChild(p.path);
      if (interactive) {
        if (layer.options.link)
          layer.attachLinkHandler(
            p.path,
            layer.options.link,
            layer.options._leafletLayer
          );
        layer.addInteractiveTarget(p.path);
      }

      if (!outlineAdded && layer.pixelOutline) {
        layer.group.appendChild(layer.outlinePath);
        outlineAdded = true;
      }

      for (let subP of p.subrings) {
        if (subP.path) {
          if (subP.link) {
            layer.attachLinkHandler(
              subP.path,
              subP.link,
              layer.options._leafletLayer
            );
            layer.addInteractiveTarget(subP.path);
          }
          layer.group.appendChild(subP.path);
        }
      }
    }
    c.appendChild(layer.group);
  },

  /**
   * Removes all the paths related to a feature
   * @param {M.Path} layer - The feature who's paths need to be removed
   * @private
   */
  _removePath: function (layer) {
    for (let p of layer._parts) {
      if (p.path) {
        layer.removeInteractiveTarget(p.path);
        DomUtil.remove(p.path);
      }
      for (let subP of p.subrings) {
        if (subP.path) DomUtil.remove(subP.path);
      }
    }
    if (layer.outlinePath) DomUtil.remove(layer.outlinePath);
    layer.removeInteractiveTarget(layer.group);
    DomUtil.remove(layer.group);
    delete this._layers[stamp(layer)];
  },

  /**
   * Updates the d attribute of all paths of a feature
   * @param {M.Path} layer - The Feature that needs updating
   * @private
   */
  _updateFeature: function (layer) {
    if (layer.pixelOutline)
      this._setPath(
        layer.outlinePath,
        this.geometryToPath(layer.pixelOutline, false)
      );
    for (let p of layer._parts) {
      this._setPath(p.path, this.geometryToPath(p.pixelRings, layer.isClosed));
      for (let subP of p.subrings) {
        this._setPath(
          subP.path,
          this.geometryToPath(subP.pixelSubrings, false)
        );
      }
    }
  },

  /**
   * Generates the marker d attribute for a given point
   * @param {Point} p - The point of the marker
   * @returns {string}
   * @private
   */
  _pointToMarker: function (p) {
    return `M${p.x} ${p.y} L${p.x - 12.5} ${p.y - 30} C${p.x - 12.5} ${
      p.y - 50
    }, ${p.x + 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 30} L${p.x} ${p.y}z`;
  },

  /**
   * Updates the styles of all paths of a feature
   * @param {M.Path} layer - The feature that needs styles updated
   * @private
   */
  _updateStyle: function (layer) {
    this._updatePathStyle(layer.outlinePath, layer, false, true);
    for (let p of layer._parts) {
      if (p.path) {
        this._updatePathStyle(p.path, layer, true);
      }
      for (let subP of p.subrings) {
        if (subP.path) this._updatePathStyle(subP.path, layer);
      }
    }
  },

  /**
   * Updates the style of a single path
   * @param {HTMLElement} path - The path that needs updating
   * @param {M.Path} layer - The feature layer
   * @param {boolean} isMain - Whether it's the main parts or not
   * @param {boolean} isOutline - Whether a path is an outline or not
   * @private
   */
  _updatePathStyle: function (path, layer, isMain = false, isOutline = false) {
    if (!path || !layer) {
      return;
    }
    let options = layer.options,
      isClosed = layer.isClosed;
    if (
      (options.stroke && (!isClosed || isOutline)) ||
      (isMain && !layer.outlinePath)
    ) {
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

      if (options.link) {
        path.setAttribute(
          'stroke',
          options.link.visited ? '#6c00a2' : '#0000EE'
        );
        path.setAttribute('stroke-opacity', '1');
        path.setAttribute('stroke-width', '1px');
        path.setAttribute('stroke-dasharray', 'none');
      }
    } else {
      path.setAttribute('stroke', 'none');
    }

    if (isClosed && !isOutline) {
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
   * @param {Point[]} rings - The points making up a given part of a feature
   * @param {boolean} closed - Whether a feature is closed or not
   * @returns {string}
   */
  geometryToPath: function (rings, closed) {
    let str = '',
      i,
      j,
      len,
      len2,
      points,
      p;

    for (i = 0, len = rings.length; i < len; i++) {
      points = rings[i];
      if (points.length === 1) {
        return this._pointToMarker(points[0]);
      }
      for (j = 0, len2 = points.length; j < len2; j++) {
        p = points[j];
        str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
      }
      str += closed ? 'z' : '';
    }
    return str || 'M0 0';
  }
});

/**
 * Returns new FeatureRenderer
 * @param {Object} options - Options for the renderer
 * @returns {FeatureRenderer}
 */
export var featureRenderer = function (options) {
  return new FeatureRenderer(options);
};
