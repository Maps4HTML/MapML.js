export var FeatureRenderer = L.SVG.extend({
  _initPath: function (layer) {

    let outlinePath = L.SVG.create('path');
    L.DomUtil.addClass(outlinePath, layer.options.className);
    L.DomUtil.addClass(outlinePath, 'mapml-feature-outline');
    outlinePath.style.fill = 'none';
    layer.outlinePath = outlinePath;

    for (let p of layer._parts) {

      if (p.rings) {
        this._createPath(p, layer.accessibleTitle, layer.options.className, true);
      }

      if (p.subrings) {
        for (let r of p.subrings) {
          this._createPath(r, layer.accessibleTitle, layer.options.className, false);
        }
      }

      this._updateStyle(layer);
      this._layers[L.stamp(layer)] = layer;
    }
  },

  _createPath: function (obj, title = "Feature", cls, interactive = false) {
    let p = L.SVG.create('path');
    obj.path = p;
    p.setAttribute('aria-label', title);
    if (obj.cls || cls) {
      L.DomUtil.addClass(p, obj.cls || cls);
    }
    if (interactive) {
      L.DomUtil.addClass(p, 'leaflet-interactive');
      p.setAttribute("tabindex", "0");
    }
  },

  _addPath: function (layer) {
    if (!this._rootGroup) { this._initContainer(); }
    for (let p of layer._parts) {
      if (p.path) {
        this._rootGroup.appendChild(p.path);
        layer.addInteractiveTarget(p.path);
      }
      for (let subP of p.subrings) {
        if (subP.path)
          this._rootGroup.appendChild(subP.path);
      }
    }
    if (layer.pixelOutline) this._rootGroup.appendChild(layer.outlinePath);
  },

  _removePath: function (layer) {
    if (layer.pixelOutline) this.remove(layer.outlinePath);
    for (let p of layer._parts) {
      if (p.path) {
        this.remove(p.path);
        layer.removeInteractiveTarget(p.path);
      }
      for (let subP of p.subrings) {
        if (subP.path)
          this.remove(subP.path);
      }
      delete this._layers[L.stamp(layer)];
    }
  },

  _updateFeature: function (layer) {
    if (layer.pixelOutline) this._setPath(layer.outlinePath, this.geometryToPaths(layer.pixelOutline, true));
    for (let p of layer._parts) {
      this._setPath(p.path, this.geometryToPaths(p.pixelRings, layer.isClosed));
      for (let subP of p.subrings) {
        this._setPath(subP.path, this.geometryToPaths(subP.pixelSubrings, false));
      }
    }
  },

  geometryToMarker: function (p) {
    return `M${p.x} ${p.y} L${p.x - 12.5} ${p.y - 30} C${p.x - 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 50}, ${p.x + 12.5} ${p.y - 30} L${p.x} ${p.y}z`
  },

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

    if (!options.fill) {
      path.setAttribute('fill', options.fillColor || options.color);
      path.setAttribute('fill-opacity', options.fillOpacity);
      path.setAttribute('fill-rule', options.fillRule || 'evenodd');
    } else {
      path.setAttribute('fill', options.color);
    }
  },

  _setPath: function (path, def) {
    path.setAttribute('d', def);
  },

  geometryToPaths: function (rings, closed) {
    var str = '',
      i, j, len, len2, points, p;

    for (i = 0, len = rings.length; i < len; i++) {
      points = rings[i];

      if (points.length === 1) {
        return this.geometryToMarker(points[0]);
      }
      for (j = 0, len2 = points.length; j < len2; j++) {   //[0] -> unneeded nesting?
        p = points[j];
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