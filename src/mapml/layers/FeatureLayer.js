import { FALLBACK_CS, FALLBACK_PROJECTION } from '../utils/Constants';

export var MapMLFeatures = L.FeatureGroup.extend({
  /*
   * M.MapML turns any MapML feature data into a Leaflet layer. Based on L.GeoJSON.
   */
    initialize: function (mapml, options) {

      L.setOptions(this, options);
      if(this.options.static) {
        this._container = L.DomUtil.create('div', 'leaflet-layer', this.options.pane);
        // must have leaflet-pane class because of new/changed rule in leaflet.css
        // info: https://github.com/Leaflet/Leaflet/pull/4597
        L.DomUtil.addClass(this._container, 'leaflet-pane mapml-vector-container');
        L.setOptions(this.options.renderer, {pane: this._container});
        let style = L.DomUtil.create("style", "mapml-feature-style", this._container);
        style.innerHTML = `
        g[role="link"]:focus,
        g[role="link"]:hover,
        g[role="link"]:focus path,
        g[role="link"]:hover path,
        g[role="link"] path:focus,
        g[role="link"] path:hover,
        g[role="button"]:focus,
        g[role="button"]:hover,
        g[role="button"]:focus path,
        g[role="button"]:hover path,
        g[role="button"] path:focus,
        g[role="button"] path:hover,
        path[tabindex="0"]:focus {
          stroke: #0000EE!important;
          stroke: LinkText!important;
        }
        g[role="link"]:focus:not(:focus-visible),
        g[role="link"]:focus:not(:focus-visible) path,
        g[role="link"] path:focus:not(:focus-visible),
        g[role="button"]:focus:not(:focus-visible),
        g[role="button"]:focus:not(:focus-visible) path,
        g[role="button"] path:focus:not(:focus-visible),
        path[tabindex="0"]:focus:not(:focus-visible) {
          outline: 0!important;
        }`;
      }

      this._layers = {};
      if(this.options.query){
        this._mapmlFeatures = mapml;
        this.isVisible = true;
        let native = this._getNativeVariables(mapml);
        this.options.nativeZoom = native.zoom;
        this.options.nativeCS = native.cs;
      }
      if (mapml && !this.options.query) {
        let native = this._getNativeVariables(mapml);
        //needed to check if the feature is static or not, since this method is used by templated also
        if(!mapml.querySelector('map-extent') && mapml.querySelector('map-feature') && this.options.static){
          this._features = {};
          this._staticFeature = true;
          this.isVisible = true; //placeholder for when this actually gets updated in the future
          this.zoomBounds = this._getZoomBounds(mapml, native.zoom);
          this.layerBounds = this._getLayerBounds(mapml);
          L.extend(this.options, this.zoomBounds);
        }
        this.addData(mapml, native.cs, native.zoom);
        if(this._staticFeature){
          this._resetFeatures(this._clampZoom(this.options._leafletLayer._map.getZoom()));

          this.options._leafletLayer._map._addZoomLimit(this);
        }
      }
    },

    onAdd: function(map){
      L.FeatureGroup.prototype.onAdd.call(this, map);
      this.eachLayer(function (layer) {
        layer._updateInteraction();
      });
      if(this._mapmlFeatures)map.on("featurepagination", this.showPaginationFeature, this);
    },

    onRemove: function(map){
      if(this._mapmlFeatures){
        map.off("featurepagination", this.showPaginationFeature, this);
        delete this._mapmlFeatures;
        L.DomUtil.remove(this._container);
      }
      L.FeatureGroup.prototype.onRemove.call(this, map);
      this._map.featureIndex.cleanIndex();
    },

    getEvents: function(){
      if(this._staticFeature){
        return {
          'moveend':this._handleMoveEnd,
          'zoomend' : this._handleZoomEnd,
        };
      }
      return {
        'moveend':this._removeCSS
      };
    },


    showPaginationFeature: function(e){
      if(this.options.query && this._mapmlFeatures.querySelectorAll("map-feature")[e.i]){
        let feature = this._mapmlFeatures.querySelectorAll("map-feature")[e.i];
        this.clearLayers();
        this.addData(feature, this.options.nativeCS, this.options.nativeZoom);
        e.popup._navigationBar.querySelector("p").innerText = (e.i + 1) + "/" + this.options._leafletLayer._totalFeatureCount;
        e.popup._content.querySelector("iframe").setAttribute("sandbox", "allow-same-origin allow-forms");
        e.popup._content.querySelector("iframe").srcdoc = feature.querySelector("map-properties").innerHTML;
      }
    },

    _getNativeVariables: function(mapml){
      let nativeZoom = mapml.querySelector("map-meta[name=zoom]") &&
          +M.metaContentToObject(mapml.querySelector("map-meta[name=zoom]").getAttribute("content")).value || 0;
      let nativeCS = mapml.querySelector("map-meta[name=cs]") &&
          M.metaContentToObject(mapml.querySelector("map-meta[name=cs]").getAttribute("content")).content || "GCRS";
      return {zoom:nativeZoom, cs: nativeCS};
    },

    _handleMoveEnd : function(){
      let mapZoom = this._map.getZoom(),
          withinZoom = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom;   
      this.isVisible = withinZoom && this._layers && this.layerBounds && 
                        this.layerBounds.overlaps(
                          M.pixelToPCRSBounds(
                            this._map.getPixelBounds(),
                            mapZoom,this._map.options.projection));
      this._removeCSS();
    },

    _handleZoomEnd: function(e){
      let mapZoom = this._map.getZoom();
      if(mapZoom > this.zoomBounds.maxZoom || mapZoom < this.zoomBounds.minZoom){
        this.clearLayers();
        return;
      }
      let clampZoom = this._clampZoom(mapZoom);
      this._resetFeatures(clampZoom);
    },

    //sets default if any are missing, better to only replace ones that are missing
    _getLayerBounds : function(container) {
      if (!container) return null;
      let cs = FALLBACK_CS,
          projection = container.querySelector('map-meta[name=projection]') &&
                    M.metaContentToObject(
                      container.querySelector('map-meta[name=projection]').getAttribute('content'))
                      .content.toUpperCase() || FALLBACK_PROJECTION;
      try{

        let meta = container.querySelector('map-meta[name=extent]') &&
                    M.metaContentToObject(
                      container.querySelector('map-meta[name=extent]').getAttribute('content'));

        let zoom = meta.zoom || 0;
        
        let metaKeys = Object.keys(meta);
        for(let i =0;i<metaKeys.length;i++){
          if(!metaKeys[i].includes("zoom")){
            cs = M.axisToCS(metaKeys[i].split("-")[2]);
            break;
          }
        }
        let axes = M.csToAxes(cs);
        return M.boundsToPCRSBounds(
                L.bounds(L.point(+meta[`top-left-${axes[0]}`],+meta[`top-left-${axes[1]}`]),
                L.point(+meta[`bottom-right-${axes[0]}`],+meta[`bottom-right-${axes[1]}`])),
                zoom,projection,cs);
      } catch (error){
        //if error then by default set the layer to osm and bounds to the entire map view
        return M.boundsToPCRSBounds(M[projection].options.crs.tilematrix.bounds(0),0,projection, cs);
      }
    },

    _resetFeatures : function (zoom){
      this.clearLayers();
      if(this._features && this._features[zoom]){
        for(let k =0;k < this._features[zoom].length;k++){
          this.addLayer(this._features[zoom][k]);
        }
      }
    },

    _clampZoom : function(zoom){
      if(zoom > this.zoomBounds.maxZoom || zoom < this.zoomBounds.minZoom) return zoom;
      if (undefined !== this.zoomBounds.minNativeZoom && zoom < this.zoomBounds.minNativeZoom) {
        return this.zoomBounds.minNativeZoom;
      }
      if (undefined !== this.zoomBounds.maxNativeZoom && this.zoomBounds.maxNativeZoom < zoom) {
        return this.zoomBounds.maxNativeZoom;
      }

      return zoom;
    },

    _setZoomTransform: function(center, clampZoom){
      var scale = this._map.getZoomScale(this._map.getZoom(),clampZoom),
		    translate = center.multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(center, this._map.getZoom())).round();

      if (any3d) {
        L.setTransform(this._layers[clampZoom], translate, scale);
      } else {
        L.setPosition(this._layers[clampZoom], translate);
      }
    },

    _getZoomBounds: function(container, nativeZoom){
      if (!container) return null;
      let nMin = 100,nMax=0, features = container.getElementsByTagName('map-feature'),meta,projection;
      for(let i =0;i<features.length;i++){
        let lZoom = +features[i].getAttribute('zoom');
        if(!features[i].getAttribute('zoom'))lZoom = nativeZoom;
        nMax = Math.max(nMax, lZoom);
        nMin = Math.min(nMin, lZoom);
      }
      try{
        projection = M.metaContentToObject(container.querySelector('map-meta[name=projection]').getAttribute('content')).content;
        meta = M.metaContentToObject(container.querySelector('map-meta[name=zoom]').getAttribute('content'));
      } catch(error){
        return {
          minZoom:0,
          maxZoom: M[projection || FALLBACK_PROJECTION].options.resolutions.length - 1,
          minNativeZoom:nMin,
          maxNativeZoom:nMax
        };
      }
      return {
        minZoom:+meta.min ,
        maxZoom:+meta.max ,
        minNativeZoom:nMin,
        maxNativeZoom:nMax
      };
    },

    addData: function (mapml, nativeCS, nativeZoom) {
      var features = mapml.nodeType === Node.DOCUMENT_NODE || mapml.nodeName === "LAYER-" ? mapml.getElementsByTagName("map-feature") : null,
          i, len, feature;

      var linkedStylesheets = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelector("map-link[rel=stylesheet],map-style") : null;
      if (linkedStylesheets) {
        var base = mapml.querySelector('map-base') && mapml.querySelector('map-base').hasAttribute('href') ? 
            new URL(mapml.querySelector('map-base').getAttribute('href')).href : 
            mapml.URL;
        M.parseStylesheetAsHTML(mapml,base,this._container);
      }
      if (features) {
       for (i = 0, len = features.length; i < len; i++) {
        // Only add this if geometry is set and not null
        feature = features[i];
        var geometriesExist = feature.getElementsByTagName("map-geometry").length && feature.getElementsByTagName("map-coordinates").length;
        if (geometriesExist) {
         this.addData(feature, nativeCS, nativeZoom);
        }
       }
       return this; //if templated this runs
      }

      //if its a mapml with no more links this runs
      var options = this.options;

      if (options.filter && !options.filter(mapml)) { return; }
      
      if (mapml.classList.length) {
        options.className = mapml.classList.value;
      }
      let zoom = mapml.getAttribute("zoom") || nativeZoom, title = mapml.querySelector("map-featurecaption");
      title = title ? title.innerHTML : "Feature";

      if(mapml.querySelector("map-properties")) {
        options.properties = document.createElement('div');
        options.properties.classList.add("mapml-popup-content");
        options.properties.insertAdjacentHTML('afterbegin', mapml.querySelector("map-properties").innerHTML);
      }

      let layer = this.geometryToLayer(mapml, options, nativeCS, +zoom, title);
      if (layer) {
        // if the layer is being used as a query handler output, it will have
        // a color option set.  Otherwise, copy classes from the feature
        if (!layer.options.color && mapml.hasAttribute('class')) {
          layer.options.className = mapml.getAttribute('class');
        }
        layer.defaultOptions = layer.options;
        this.resetStyle(layer);

        if (options.onEachFeature) {
          layer.bindTooltip(title, { interactive:true, sticky: true, });
        }
        if(this._staticFeature){
          let featureZoom = mapml.getAttribute('zoom') || nativeZoom;
          if(featureZoom in this._features){
            this._features[featureZoom].push(layer);
          } else{
            this._features[featureZoom]=[layer];
          }
          return;
        } else {
          return this.addLayer(layer);
        }
      }
    },
        
    resetStyle: function (layer) {
      var style = this.options.style;
      if (style) {
       // reset any custom styles
       L.Util.extend(layer.options, layer.defaultOptions);
       this._setLayerStyle(layer, style);
      }
    },

    setStyle: function (style) {
      this.eachLayer(function (layer) {
        this._setLayerStyle(layer, style);
      }, this);
    },

    _setLayerStyle: function (layer, style) {
      if (typeof style === 'function') {
        style = style(layer.feature);
      }
      if (layer.setStyle) {
        layer.setStyle(style);
      }
    },
    _removeCSS: function(){
      let toDelete = this._container.querySelectorAll("link[rel=stylesheet],style");
      for(let i = 0; i < toDelete.length;i++){
        if(toDelete[i].classList.contains("mapml-feature-style")) continue;
        this._container.removeChild(toDelete[i]);
      }
    },
  geometryToLayer: function (mapml, vectorOptions, nativeCS, zoom, title) {
    let geometry = mapml.tagName.toUpperCase() === 'MAP-FEATURE' ? mapml.getElementsByTagName('map-geometry')[0] : mapml,
        cs = geometry.getAttribute("cs") || nativeCS, group = [], svgGroup = L.SVG.create('g'), copyOptions = Object.assign({}, vectorOptions);
    for(let geo of geometry.querySelectorAll('map-polygon, map-linestring, map-multilinestring, map-point, map-multipoint')){
      group.push(M.feature(geo, Object.assign(copyOptions,
        { nativeCS: cs,
          nativeZoom: zoom,
          projection: this.options.projection,
          featureID: mapml.id,
          group: svgGroup,
          wrappers: this._getGeometryParents(geo.parentElement),
          featureLayer: this,
          _leafletLayer: this.options._leafletLayer,
        })));
    }
    let groupOptions = {group:svgGroup, featureID: mapml.id, accessibleTitle: title, onEachFeature: vectorOptions.onEachFeature, properties: vectorOptions.properties, _leafletLayer: this.options._leafletLayer,},
      collections = geometry.querySelector('map-multipolygon') || geometry.querySelector('map-geometrycollection');
    if(collections) groupOptions.wrappers = this._getGeometryParents(collections.parentElement);

    return M.featureGroup(group, groupOptions);
  },

  _getGeometryParents: function(subType, elems = []){
    if(subType && subType.tagName.toUpperCase() !== "MAP-GEOMETRY"){
      if(subType.tagName.toUpperCase() === "MAP-MULTIPOLYGON" || subType.tagName.toUpperCase() === "MAP-GEOMETRYCOLLECTION")
        return this._getGeometryParents(subType.parentElement, elems);
      return this._getGeometryParents(subType.parentElement, elems.concat([subType]));
    } else {
      return elems;
    }
  },
});
export var mapMlFeatures = function (mapml, options) {
	return new MapMLFeatures(mapml, options);
};