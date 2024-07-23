/* global L */

export var TemplatedPMTilesLayer = L.Layer.extend({
  initialize: function (template, options) {
    /* structure of this._template:
      {
        template: decodeURI(new URL(template, this.getBase())),
        linkEl: (map-link),
        rel: (map-link@rel),
        type: (map-link@type),
        values: [map-input],
        inputsReady: Promise.allSettled(inputsReady),
        zoom: (map-input@type=zoom),
        projection: (map-extent@units),
        tms: true/false,
        step: step
      }
    */
    this._template = template;
    this._container = L.DomUtil.create(
      'div',
      'leaflet-layer mapml-pmtiles-container'
    );
    this._pmtilesOptions = {
      pane: this._container,
      maxDataZoom: template.zoom?.max ?? 15,
      url: this._mapInputNamesToProtomapsUrl(template),
      noWrap: true
    };

    let paintRules = options?.pmtilesRules?.get(this._template.template);
    if (paintRules?.rules) {
      L.extend(this._pmtilesOptions, {
        paintRules: paintRules.rules.PAINT_RULES
      });
      L.extend(this._pmtilesOptions, {
        labelRules: paintRules.rules.LABEL_RULES
      });
    } else if (paintRules?.theme?.theme) {
      L.extend(this._pmtilesOptions, { theme: paintRules.theme.theme });
    } else {
      console.warn(
        'pmtiles symbolizer rules or theme not found for map-link@tref ->  ' +
          this._template.template
      );
    }
    this.zoomBounds = options.zoomBounds;
    this.extentBounds = options.extentBounds;
    // get rid of duplicate info, it can be confusing
    delete options.zoomBounds;
    delete options.extentBounds;
    this._linkEl = options.linkEl;
    L.setOptions(this, options);
  },
  /**
   *
   * @param {type} template
   * @returns {url compatible with protomaps-leaflet {z},{x},{y}}
   */
  _mapInputNamesToProtomapsUrl: function (template) {
    // protomaps requires hard-coded URL template variables {z}, {x} and {y}
    // MapML allows you to set your own variable names, so we have to map the
    // names you use for zoom, column and row to the {z}, {x} and {y} variables,
    // and then replace the variable names used in the template with the
    // corresponding {z}, {x} and {y} strings for protomaps
    let url = template.template;
    let re = new RegExp(
      template.zoom?.name ? '{' + template.zoom.name + '}' : '{z}',
      'ig'
    );
    url = url.replace(re, '{z}');
    let rowName = template.values.find(
      (i) => i.type === 'location' && i.axis === 'row'
    )?.name;
    re = new RegExp(rowName ? '{' + rowName + '}' : '{y}', 'ig');
    url = url.replace(re, '{y}');
    let colName = template.values.find(
      (i) => i.type === 'location' && i.axis === 'column'
    )?.name;
    re = new RegExp(colName ? '{' + colName + '}' : '{x}', 'ig');
    url = url.replace(re, '{x}');
    return url;
  },
  onAdd: function (map) {
    this._map = map;
    this.options.pane.appendChild(this._container);
    this.setZIndex(this.options.zIndex);
    this._pmtilesLayer = M.protomapsL
      .leafletLayer(this._pmtilesOptions)
      .addTo(map);
  },
  onRemove: function (map) {
    this._pmtilesLayer.remove();
    L.DomUtil.remove(this._container);
  },
  isVisible: function () {
    if (this._template.projection !== 'OSMTILE') return false;
    let map = this._linkEl.getMapEl()._map;
    let mapZoom = map.getZoom();
    let mapBounds = M.pixelToPCRSBounds(
      map.getPixelBounds(),
      mapZoom,
      map.options.projection
    );
    return (
      mapZoom <= this.zoomBounds.maxZoom &&
      mapZoom >= this.zoomBounds.minZoom &&
      this.extentBounds.overlaps(mapBounds)
    );
  },
  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    if (
      this._container &&
      this.options.zIndex !== undefined &&
      this.options.zIndex !== null
    ) {
      this._container.style.zIndex = this.options.zIndex;
    }
    return this;
  }
});
export var templatedPMTilesLayer = function (template, options) {
  return new TemplatedPMTilesLayer(template, options);
};
