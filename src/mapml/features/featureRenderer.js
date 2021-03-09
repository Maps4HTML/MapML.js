export var FeatureRenderer = L.SVG.extend({
  _initPath: function (layer) {
    for (let p of layer._coords) {

      if (p.rings) {
        this._createRingPaths(p.rings, layer.accessibleTitle, true);
      }

      if (p.subrings) {
        this._createRingPaths(p.subrings, layer.accessibleTitle, false);
      }

      this._updateStyle(layer);
      this._layers[L.stamp(layer)] = layer;
    }
  },

  _createRingPaths: function (r, title = "Feature", interactive = false) {
    for (let part of r) {
      let p = L.SVG.create('path');
      part.path = p;
      p.setAttribute('aria-label', title);
      if (part.cls || layer.options.className) {
        L.DomUtil.addClass(p, part.cls || layer.options.className);
      }
      if (interactive) {
        L.DomUtil.addClass(p, 'leaflet-interactive');
      }
    }
  },

  _addPath: function (layer) {
    if (!this._rootGroup) { this._initContainer(); }
    for (let path of layer._paths) {
      this._rootGroup.appendChild(path);
      layer.addInteractiveTarget(path);
    }
  },

  _removePath: function (layer) {
    for (let path of layer._paths) {
      this.remove(path);
      layer.removeInteractiveTarget(path);
      delete this._layers[L.stamp(layer)];
    }
  },

  _iteratePaths: function (r, f) {
    for ()
      for (let part of r) {
        f(part);
      }
  },

  _updateFeature: function (layer) {
    let i = 0;
    for (let geo of layer._parts) {
      if (layer.type === "POINT" || layer.type === "MULTIPOINT") {
        this._setPath(layer._paths[i], this.geometryToMarker(geo[0][0][0].point));
      } else {
        this._setPath(layer._paths[i], this.geometryToPaths(geo, layer.isClosed));
      }
      i++;
    }
  },

  geometryToMarker: function (p) {
    return `M${p.x} ${p.y} L${p.x - 12.5} ${p.y - 30} C${p.x - 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 30} L${p.x} ${p.y}z`
  },

  _updateStyle: function (layer) {
    for (let path of layer._paths) {
      let options = layer.options;

      if (!path) { return; }

      if (options.stroke) {
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

      if (!options.fill) {
        path.setAttribute('fill', options.fillColor || options.color);
        path.setAttribute('fill-opacity', options.fillOpacity);
        path.setAttribute('fill-rule', options.fillRule || 'evenodd');
      } else {
        path.setAttribute('fill', options.color);
      }
    }
  },

  _setPath: function (path, def) {
    path.setAttribute('d', def);
  },

  geometryToPaths: function (geo, closed) {
    var str = '',
      i, j, len, len2, points, p;

    for (i = 0, len = geo.length; i < len; i++) {
      points = geo[i];

      for (j = 0, len2 = points[0].length; j < len2; j++) {   //[0] -> unneeded nesting?
        p = points[0][j].point;
        str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
      }

      // closes the ring for polygons; "x" is VML syntax
      str += closed ? (true ? 'z' : 'x') : '';
    }

    // SVG complains about empty path strings
    return str || 'M0 0';

  },
});

export var featureRenderer = function (options) {
  return new FeatureRenderer(options);
};