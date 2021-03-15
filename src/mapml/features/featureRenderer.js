export var FeatureRenderer = L.SVG.extend({
  _initPath: function (layer, stamp = true) {

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
      if(stamp) this._layers[L.stamp(layer)] = layer;
    }
  },

  _updateTransform: function (center, zoom) {
    if(!this.options.tileSize){
      L.Renderer.prototype._updateTransform.call(this, [center, zoom]);
    }
    return;
    var scale = this._map.getZoomScale(zoom, this._zoom),
        position = L.DomUtil.getPosition(this._container),
        viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
        currentCenterPoint = this._map.project(this._center, zoom),
        destCenterPoint = this._map.project(center, zoom),
        centerOffset = destCenterPoint.subtract(currentCenterPoint),

        topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

    if (L.Browser.any3d) {
      L.DomUtil.setTransform(this._container, topLeftOffset, scale);
    } else {
      L.DomUtil.setPosition(this._container, topLeftOffset);
    }
  },

  _update: function () {
    if(!this.options.tileSize) {
      L.SVG.prototype._update.call(this);
      return;
    }
    this._container.setAttribute('width', this.options.tileSize);
    this._container.setAttribute('height', this.options.tileSize);
    this._container.setAttribute('viewBox', [-50,-50, 600, 600].join(' '));
    this.fire('update');
    return;
    if (this._map._animatingZoom && this._bounds) { return; }

    L.Renderer.prototype._update.call(this);

    let b = this._bounds,
        size = b.getSize(),
        container = this._container;

    // set size of svg-container if changed
    if (!this._svgSize || !this._svgSize.equals(size)) {
      this._svgSize = size;
      container.setAttribute('width', this.options.tileSize);
      container.setAttribute('height', this.options.tileSize);
    }
    container.setAttribute('viewBox', [-50,-50, 600, 600].join(' '));
    this.fire('update');
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

  _addPath: function (layer, container = undefined, interactive = true) {
    if (!this._rootGroup && !container) { this._initContainer(); }
    let c = container || this._rootGroup;
    if (layer.pixelOutline) c.appendChild(layer.outlinePath);
    for (let p of layer._parts) {
      if (p.path) {
        c.appendChild(p.path);
        if(interactive) layer.addInteractiveTarget(p.path);
      }

      for (let subP of p.subrings) {
        if (subP.path)
          c.appendChild(subP.path);
      }
    }
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
    if (layer.pixelOutline) this._setPath(layer.outlinePath, this.geometryToPaths(layer.pixelOutline, false));
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
    let str = '',
      i, j, len, len2, points, p;

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