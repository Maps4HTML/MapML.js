export var FeatureIndex = L.Handler.extend({
  initialize: function (map) {
    L.Handler.prototype.initialize.call(this, map);
    this.inBoundFeatures = [];
    this.outBoundFeatures = [];
    this.currentIndex = 0;
    this._mapPCRSBounds = M.pixelToPCRSBounds(
      map.getPixelBounds(),
      map.getZoom(),
      map.options.projection);
  },

  addHooks: function () {
    this._map.on("mapfocused", this._updateMapBounds, this);
    this._map.on('mapfocused', this._sortIndex, this);
  },

  removeHooks: function () {
    this._map.off("mapfocused", this._updateMapBounds);
    this._map.off('mapfocused', this._sortIndex);
  },

  addToIndex: function (layer, lc, path) {
    let mc = this._mapPCRSBounds.getCenter();
    let dist = Math.sqrt(Math.pow(lc.x - mc.x, 2) + Math.pow(lc.y - mc.y, 2));
    let index = this._mapPCRSBounds.contains(lc) ? this.inBoundFeatures : this.outBoundFeatures;

    let elem = {path: path, layer: layer, center: lc, dist: dist};
    path.setAttribute("tabindex", -1);

    index.push(elem);
    for (let i = index.length - 1; i > 0 && index[i].dist < index[i-1].dist; i--) {
      let tmp = index[i];
      index[i] = index[i-1];
      index[i-1] = tmp;
    }

    if (this._mapPCRSBounds.contains(lc))
      this.inBoundFeatures = index;
    else
      this.outBoundFeatures = index;
  },

  cleanIndex: function() {
    this.currentIndex = 0;
    this.inBoundFeatures = this.inBoundFeatures.filter((elem) => {
      let inbound = this._mapPCRSBounds.contains(elem.center);
      elem.path.setAttribute("tabindex", -1);
      if (elem.layer._map && !inbound) {
        this.outBoundFeatures.push(elem);
      }
      return elem.layer._map && inbound;
    });
    this.outBoundFeatures = this.outBoundFeatures.filter((elem) => {
      let inbound = this._mapPCRSBounds.contains(elem.center);
      elem.path.setAttribute("tabindex", -1);
      if (elem.layer._map && inbound) {
        this.inBoundFeatures.push(elem);
      }
      return elem.layer._map && !inbound;
    });
  },

  _sortIndex: function() {
    this.cleanIndex();
    if(this.inBoundFeatures.length === 0) return;

    let mc = this._mapPCRSBounds.getCenter();

    this.inBoundFeatures.sort(function(a, b) {
      let ac = a.center;
      let bc = b.center;
      a.dist = Math.sqrt(Math.pow(ac.x - mc.x, 2) + Math.pow(ac.y - mc.y, 2));
      b.dist = Math.sqrt(Math.pow(bc.x - mc.x, 2) + Math.pow(bc.y - mc.y, 2));
      return a.dist - b.dist;
    });

    this.inBoundFeatures[0].path.setAttribute("tabindex", 0);
  },

  _updateMapBounds: function (e) {
    this._mapPCRSBounds = M.pixelToPCRSBounds(
      this._map.getPixelBounds(),
      this._map.getZoom(),
      this._map.options.projection);
  },
});

