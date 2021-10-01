import { FALLBACK_CS, FALLBACK_PROJECTION } from './Constants';

export var Util = {
  convertAndFormatPCRS : function(pcrsBounds, map){
    if(!pcrsBounds || !map) return {};

    let tcrsTopLeft = [], tcrsBottomRight = [],
        tileMatrixTopLeft = [], tileMatrixBottomRight = [],
        tileSize = map.options.crs.options.crs.tile.bounds.max.y;

    for(let i = 0;i<map.options.crs.options.resolutions.length;i++){
      let scale = map.options.crs.scale(i),
          minConverted = map.options.crs.transformation.transform(pcrsBounds.min,scale),
          maxConverted = map.options.crs.transformation.transform(pcrsBounds.max,scale);
          
      tcrsTopLeft.push({
        horizontal: minConverted.x,
        vertical:maxConverted.y,
      });
      tcrsBottomRight.push({
        horizontal: maxConverted.x,
        vertical: minConverted.y,
      });

      //converts the tcrs values from earlier to tilematrix
      tileMatrixTopLeft.push({
        horizontal: tcrsTopLeft[i].horizontal / tileSize,
        vertical:tcrsTopLeft[i].vertical / tileSize,
      });
      tileMatrixBottomRight.push({
        horizontal: tcrsBottomRight[i].horizontal / tileSize,
        vertical: tcrsBottomRight[i].vertical / tileSize,
      });
    }
    
    //converts the gcrs, I believe it can take any number values from -inf to +inf
    let unprojectedMin = map.options.crs.unproject(pcrsBounds.min),
        unprojectedMax = map.options.crs.unproject(pcrsBounds.max);

    let gcrs = {
      topLeft:{
        horizontal: unprojectedMin.lng,
        vertical:unprojectedMax.lat,
      },
      bottomRight:{
        horizontal: unprojectedMax.lng,
        vertical: unprojectedMin.lat,
      },
    };

    //formats known pcrs bounds to correct format
    let pcrs = {
      topLeft:{
        horizontal:pcrsBounds.min.x,
        vertical:pcrsBounds.max.y,
      },
      bottomRight:{
        horizontal:pcrsBounds.max.x,
        vertical:pcrsBounds.min.y,
      },
    };

    //formats all extent data
    return {
      topLeft:{
        tcrs:tcrsTopLeft,
        tilematrix:tileMatrixTopLeft,
        gcrs:gcrs.topLeft,
        pcrs:pcrs.topLeft,
      },
      bottomRight:{
        tcrs:tcrsBottomRight,
        tilematrix:tileMatrixBottomRight,
        gcrs:gcrs.bottomRight,
        pcrs:pcrs.bottomRight,
      },
      projection:map.options.projection
    };
  },
  extractInputBounds: function(template){
    if(!template) return undefined;

    //sets variables with their respective fallback values incase content is missing from the template
    let inputs = template.values, projection = template.projection || FALLBACK_PROJECTION, value = 0, boundsUnit = FALLBACK_CS;
    let bounds = this[projection].options.crs.tilematrix.bounds(0), nMinZoom = 0, nMaxZoom = this[projection].options.resolutions.length - 1;
    if(!template.zoomBounds){
      template.zoomBounds ={};
      template.zoomBounds.min=0;
      template.zoomBounds.max=nMaxZoom;
    }
    for(let i=0;i<inputs.length;i++){
      switch(inputs[i].getAttribute("type")){
        case "zoom":
          nMinZoom = +inputs[i].getAttribute("min");
          nMaxZoom = +(inputs[i].hasAttribute("max") ? inputs[i].getAttribute("max") : nMaxZoom);
          value = +inputs[i].getAttribute("value");
        break;
        case "location":
          if(!inputs[i].getAttribute("max") || !inputs[i].getAttribute("min")) continue;
          let max = +inputs[i].getAttribute("max"),min = +inputs[i].getAttribute("min");
          switch(inputs[i].getAttribute("axis").toLowerCase()){
            case "x":
            case "longitude":
            case "column":
            case "easting":
              boundsUnit = M.axisToCS(inputs[i].getAttribute("axis").toLowerCase());
              bounds.min.x = min;
              bounds.max.x = max;
            break;
            case "y":
            case "latitude":
            case "row":
            case "northing":
              boundsUnit = M.axisToCS(inputs[i].getAttribute("axis").toLowerCase());
              bounds.min.y = min;
              bounds.max.y = max;
            break;
            default:
            break;
          }
        break;
        default:
      }
    }
    let zoomBoundsFormatted = {
      minZoom:+template.zoomBounds.min,
      maxZoom:+template.zoomBounds.max,
      minNativeZoom:nMinZoom,
      maxNativeZoom:nMaxZoom
    };
    return {
      zoomBounds:zoomBoundsFormatted,
      bounds:this.boundsToPCRSBounds(bounds,value,projection,boundsUnit)
    };
  },

  axisToCS : function(axis){
    try{
      switch(axis.toLowerCase()){
        case "row":
        case "column":
          return "TILEMATRIX";
        case "i":
        case "j":
          return ["MAP","TILE"];
        case "x":
        case "y":
          return "TCRS";
        case "latitude":
        case "longitude":
          return "GCRS";
        case "northing":
        case "easting":
          return "PCRS";
        default:
          return FALLBACK_CS;
      }
    } catch (e) {return undefined;}
  },

  //takes a given cs and retuns the axes, first horizontal then vertical
  csToAxes: function(cs){
    try{
      switch(cs.toLowerCase()){
        case "tilematrix":
          return ["column", "row"];
        case "map":
        case "tile":
          return ["i", "j"];
        case "tcrs":
          return ["x", "y"];
        case "gcrs":
          return ["longitude", "latitude"];
        case "pcrs":
          return ["easting", "northing"];
      }
    } catch (e) {return undefined;}
  },

  axisToXY: function(axis){
    try{
      switch(axis.toLowerCase()){
        case "i":
        case "column":
        case "longitude":
        case "x":
        case "easting":
          return "x";
        case "row":
        case "j":
        case "latitude":
        case "y":
        case "northing":
          return "y";

        default:
          return undefined;
      }
    } catch (e) {return undefined;}
  },

  convertPCRSBounds: function(pcrsBounds, zoom, projection, cs){
    if(!pcrsBounds || (!zoom && zoom !== 0) || !Number.isFinite(+zoom) || !projection || !cs) return undefined;
    projection = (typeof projection === "string") ? M[projection] : projection;
    switch (cs.toUpperCase()) {
      case "PCRS":
        return pcrsBounds;
      case "TCRS":
      case "TILEMATRIX":
        let minPixel = projection.transformation.transform(pcrsBounds.min, projection.scale(+zoom)),
            maxPixel = projection.transformation.transform(pcrsBounds.max, projection.scale(+zoom));
        if (cs.toUpperCase() === "TCRS") return L.bounds(minPixel, maxPixel);
        let tileSize = projection.options.crs.tile.bounds.max.x;
        return L.bounds(L.point(minPixel.x / tileSize, minPixel.y / tileSize), L.point(maxPixel.x / tileSize,maxPixel.y / tileSize)); 
      case "GCRS":
        let minGCRS = projection.unproject(pcrsBounds.min),
            maxGCRS = projection.unproject(pcrsBounds.max);
        return L.bounds(L.point(minGCRS.lng, minGCRS.lat), L.point(maxGCRS.lng, maxGCRS.lat)); 
      default:
        return undefined;
    }
  },

  pointToPCRSPoint: function(point, zoom, projection, cs){
    if(!point || (!zoom && zoom !== 0) || !Number.isFinite(+zoom) || !cs || !projection) return undefined;
    projection = (typeof projection === "string") ? M[projection] : projection;
    let tileSize = projection.options.crs.tile.bounds.max.x;
    switch(cs.toUpperCase()){
      case "TILEMATRIX":
        return M.pixelToPCRSPoint(L.point(point.x*tileSize,point.y*tileSize),zoom,projection);
      case "PCRS":
        return point;
      case "TCRS" || "TILE":
        return M.pixelToPCRSPoint(point,zoom,projection);
      case "GCRS":
        return projection.project(L.latLng(point.y,point.x));
      default:
        return undefined;
    }
  },

  pixelToPCRSPoint: function(point, zoom, projection){
    if(!point || (!zoom && zoom !== 0) || !Number.isFinite(+zoom) || !projection) return undefined;
    projection = (typeof projection === "string") ? M[projection] : projection;
    return projection.transformation.untransform(point,projection.scale(zoom));
  },

  boundsToPCRSBounds: function(bounds, zoom, projection, cs){
    if(!bounds || !bounds.max || !bounds.min || (!zoom && zoom !== 0) || !Number.isFinite(+zoom) || !projection || !cs) return undefined;
    projection = (typeof projection === "string") ? M[projection] : projection;
    return L.bounds(M.pointToPCRSPoint(bounds.min, zoom, projection, cs), M.pointToPCRSPoint(bounds.max, zoom, projection, cs));
  },

  //L.bounds have fixed point positions, where min is always topleft, max is always bottom right, and the values are always sorted by leaflet
  //important to consider when working with pcrs where the origin is not topleft but rather bottomleft, could lead to confusion
  pixelToPCRSBounds : function(bounds, zoom, projection){
    if(!bounds || !bounds.max || !bounds.min || (!zoom && zoom !== 0) || !Number.isFinite(+zoom) || !projection) return undefined;
    projection = (typeof projection === "string") ? M[projection] : projection;
    return L.bounds(M.pixelToPCRSPoint(bounds.min, zoom, projection), M.pixelToPCRSPoint(bounds.max, zoom, projection));
  },
  //meta content is the content attribute of meta
  // input "max=5,min=4" => [[max,5][min,5]]
  metaContentToObject: function(input){
    if(!input || input instanceof Object)return {};
    let content = input.split(/\s+/).join("");
    let contentArray = {};
    let stringSplit = content.split(',');

    for(let i=0;i<stringSplit.length;i++){
      let prop = stringSplit[i].split("=");
      if(prop.length === 2) contentArray[prop[0]]=prop[1];
    }
    if(contentArray !== "" && stringSplit[0].split("=").length ===1)contentArray.content = stringSplit[0];
    return contentArray;
  },
  coordsToArray: function(containerPoints) {
    // returns an array of arrays of coordinate pairs coordsToArray("1,2,3,4") -> [[1,2],[3,4]]
    for (var i=1, pairs = [], coords = containerPoints.split(",");i<coords.length;i+=2) {
      pairs.push([parseInt(coords[i-1]),parseInt(coords[i])]);
    }
    return pairs;
  },
  parseStylesheetAsHTML: function(mapml, base, container) {
      if (!(container instanceof Element) || !mapml || !mapml.querySelector('map-link[rel=stylesheet],map-style')) return;

      if(base instanceof Element) {
        base = base.getAttribute('href')?base.getAttribute('href'):document.URL;
      } else if (!base || base==="" || base instanceof Object) {
        return;
      }

      var ss = [];
      var stylesheets = mapml.querySelectorAll('map-link[rel=stylesheet],map-style');
      for (var i=0;i<stylesheets.length;i++) {
        if (stylesheets[i].nodeName.toUpperCase() === "MAP-LINK" ) {
          var href = stylesheets[i].hasAttribute('href') ? new URL(stylesheets[i].getAttribute('href'),base).href: null;
          if (href) {
            if (!container.querySelector("link[href='"+href+"']")) {
              var linkElm = document.createElement("link");
              linkElm.setAttribute("href", href);
              linkElm.setAttribute("rel", "stylesheet");
              ss.push(linkElm);
            }
          }  
        } else { // <map-style>
            var styleElm = document.createElement('style');
            styleElm.textContent = stylesheets[i].textContent;
            ss.push(styleElm);
        }
      }
      // insert <link> or <style> elements after the begining  of the container
      // element, in document order as copied from original mapml document
      // note the code below assumes hrefs have been resolved and elements
      // re-parsed from xml and serialized as html elements ready for insertion
      for (var s=ss.length-1;s >= 0;s--) {
        container.insertAdjacentElement('afterbegin',ss[s]);
      }
  },

  splitCoordinate: function(element, index, array) {
    var a = [];
    element.split(/\s+/gim).forEach(M.parseNumber,a);
    this.push(a);
  },

  parseNumber : function(element, index, array){
    this.push(parseFloat(element));
  },

  handleLink: function (link, leafletLayer) {
    let zoomTo, justPan = false, layer, map = leafletLayer._map, opacity;
    if(link.type === "text/html" && link.target !== "_blank"){  // all other target values other than blank behave as _top
      link.target = "_top";
    } else if (link.type !== "text/html" && link.url.includes("#")){
      let hash = link.url.split("#"), loc = hash[1].split(",");
      zoomTo = {z: loc[0] || 0, lng: loc[1] || 0, lat: loc[2] || 0};
      justPan = !hash[0]; // if the first half of the array is an empty string then the link is just for panning
      if(["/", ".","#"].includes(link.url[0])) link.target = "_self";
    }
    if(!justPan) {
      let newLayer = false;
      layer = document.createElement('layer-');
      layer.setAttribute('src', link.url);
      layer.setAttribute('checked', '');
      switch (link.target) {
        case "_blank":
          if (link.type === "text/html") {
            window.open(link.url);
          } else {
            map.options.mapEl.appendChild(layer);
            newLayer = true;
          }
          break;
        case "_parent":
          for (let l of map.options.mapEl.querySelectorAll("layer-"))
            if (l._layer !== leafletLayer) map.options.mapEl.removeChild(l);
          map.options.mapEl.appendChild(layer);
          map.options.mapEl.removeChild(leafletLayer._layerEl);
          newLayer = true;
          break;
        case "_top":
          window.location.href = link.url;
          break;
        default:
          opacity = leafletLayer._layerEl.opacity;
          leafletLayer._layerEl.insertAdjacentElement('beforebegin', layer);
          map.options.mapEl.removeChild(leafletLayer._layerEl);
          newLayer = true;
      }
      if(!link.inPlace && newLayer) L.DomEvent.on(layer,'extentload', function focusOnLoad(e) {
        if(newLayer && ["_parent", "_self"].includes(link.target) && layer.parentElement.querySelectorAll("layer-").length === 1)
          layer.parentElement.projection = layer._layer.getProjection();
        if(layer.extent){
          if(zoomTo) layer.parentElement.zoomTo(+zoomTo.lat, +zoomTo.lng, +zoomTo.z);
          else layer.focus();
          L.DomEvent.off(layer, 'extentload', focusOnLoad);
        }

        if(opacity) layer.opacity = opacity;
        map.getContainer().focus();
      });
    } else if (zoomTo && !link.inPlace && justPan){
      leafletLayer._map.options.mapEl.zoomTo(+zoomTo.lat, +zoomTo.lng, +zoomTo.z);
      if(opacity) layer.opacity = opacity;
      map.getContainer().focus();
    }
  },

  gcrsToTileMatrix: function (mapEl) {
    let point = mapEl._map.project(mapEl._map.getCenter());
    let tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.y;
    let column = Math.trunc(point.x / tileSize);
    let row = Math.trunc(point.y / tileSize);
    return [column, row];
  }
};