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
    let bounds = this[projection].options.crs.tilematrix.bounds(0), 
        defaultMinZoom = 0, defaultMaxZoom = this[projection].options.resolutions.length - 1,
        nativeMinZoom = defaultMinZoom, nativeMaxZoom = defaultMaxZoom;
    let locInputs = false, numberOfAxes = 0;
    for(let i=0;i<inputs.length;i++){
      switch(inputs[i].getAttribute("type")){
        case "zoom":
          nativeMinZoom = +(inputs[i].hasAttribute("min") && !isNaN(+inputs[i].getAttribute("min")) ? inputs[i].getAttribute("min") : defaultMinZoom);
          nativeMaxZoom = +(inputs[i].hasAttribute("max") && !isNaN(+inputs[i].getAttribute("max")) ? inputs[i].getAttribute("max") : defaultMaxZoom);
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
              numberOfAxes++;
            break;
            case "y":
            case "latitude":
            case "row":
            case "northing":
              boundsUnit = M.axisToCS(inputs[i].getAttribute("axis").toLowerCase());
              bounds.min.y = min;
              bounds.max.y = max;
              numberOfAxes++;
            break;
            default:
            break;
          }
        break;
        default:
      }
    }
    if (numberOfAxes >= 2) {
      locInputs = true;
    }
    // min/maxZoom are copied from <meta name=zoom content="min=n,max=m>, are *display* range for content
    // min/maxNativeZoom are received from <input type=zoom min=... max=...>, describe *server* content availability
    let zoomBounds = {
      minZoom: template.zoomBounds?.min && !isNaN(+template.zoomBounds.min) ? +template.zoomBounds.min : defaultMinZoom,
      maxZoom: template.zoomBounds?.max && !isNaN(+template.zoomBounds.max) ? +template.zoomBounds.max : defaultMaxZoom,
      minNativeZoom: nativeMinZoom,
      maxNativeZoom: nativeMaxZoom
    };
    if(!locInputs && template.extentPCRSFallback && template.extentPCRSFallback.bounds) {
      bounds = template.extentPCRSFallback.bounds;
    } else if (locInputs) {
      bounds = this.boundsToPCRSBounds(bounds,value,projection,boundsUnit);
    } else {
      bounds = this[projection].options.crs.pcrs.bounds;
    }
    return {
      zoomBounds: zoomBounds,
      bounds: bounds
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
    }
  },

  gcrsToTileMatrix: function (mapEl) {
    let point = mapEl._map.project(mapEl._map.getCenter());
    let tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.y;
    let column = Math.trunc(point.x / tileSize);
    let row = Math.trunc(point.y / tileSize);
    return [column, row];
  },

  // Takes GeoJSON Properties to return an HTML table, helper function
  //    for geojson2mapml
  // properties2Table: geojson -> HTML Table
  properties2Table: function (json) {
    let table = document.createElement('table');

    // Creating a Table Header
    let thead = table.createTHead();
    let row = thead.insertRow();
    let th1 = document.createElement("th");
    let th2 = document.createElement("th");
    th1.appendChild(document.createTextNode("Property name"));
    th2.appendChild(document.createTextNode("Property value"));
    th1.setAttribute("role", "columnheader");
    th2.setAttribute("role", "columnheader");
    th1.setAttribute("scope", "col");
    th2.setAttribute("scope", "col");
    row.appendChild(th1);
    row.appendChild(th2);

    // Creating table body and populating it from the JSON
    let tbody = table.createTBody();
    for (let key in json) {
        if (json.hasOwnProperty(key)) {
            let row = tbody.insertRow();
            let th = document.createElement("th");
            let td = document.createElement("td");
            th.appendChild(document.createTextNode(key));
            td.appendChild(document.createTextNode(json[key]));
            th.setAttribute("scope", "row");
            td.setAttribute("itemprop", key);
            row.appendChild(th);
            row.appendChild(td);
        }
    }
    return table;
  },

  // Takes a GeoJSON geojson and an options Object which returns a <layer-> Element
  // The options object can contain the following:
  //      label            - String, contains the layer name, if included overrides the default label mapping
  //      projection       - String, contains the projection of the layer (OSMTILE, WGS84, CBMTILE, APSTILE), defaults to   OSMTILE
  //      caption          - Function | String, function accepts one argument being the feature object which produces the   featurecaption string OR a string that is the name of the property that will be mapped to featurecaption
  //      properties       - Function | String | HTMLElement, a function which maps the geojson feature to an HTMLElement   or a string that will be parsed as an HTMLElement or an HTMLElement
  //      geometryFunction - Function, A function you supply that can add classes, hyperlinks and spans to the created  <map-geometry> element, default would be the plain map-geometry element
  // geojson2mapml: geojson Object <layer-> -> <layer->
  geojson2mapml: function (json, options = {}, layer = null) {
    let defaults = {
        label: null,
        projection: "OSMTILE",
        caption: null,
        properties: null,
        geometryFunction: null
    };
    // assign default values for undefined options
    options = Object.assign({}, defaults, options);

    // If string json is received
    if (typeof json === "string") {
        json = JSON.parse(json);
    }
    let geometryType = ["POINT", "LINESTRING", "POLYGON", "MULTIPOINT", "MULTILINESTRING", "MULTIPOLYGON", "GEOMETRYCOLLECTION"];
    let jsonType = json.type.toUpperCase();
    let out = "";

    // HTML parser
    let parser = new DOMParser();

    // initializing layer
    if (layer === null) {
        // creating an empty mapml layer
        let xmlStringLayer = "<layer- label='' checked><map-meta name='projection' content='" + options.projection + "'></map-meta><map-meta name='cs' content='gcrs'></map-meta></layer->";
        layer = parser.parseFromString(xmlStringLayer, "text/html");
        //console.log(layer)
        if (options.label !== null) {
            layer.querySelector("layer-").setAttribute("label", options.label);
        } else if (json.name) {
            layer.querySelector("layer-").setAttribute("label", json.name);
        } else if (json.title) {
            layer.querySelector("layer-").setAttribute("label", json.title);
        } else{
            layer.querySelector("layer-").setAttribute("label", "Layer");
        }
    }
    let point = "<map-point></map-point>";
    point = parser.parseFromString(point, "text/html");

    let multiPoint = "<map-multipoint><map-coordinates></map-coordinates></map-multipoint>";
    multiPoint = parser.parseFromString(multiPoint, "text/html");

    let linestring = "<map-linestring><map-coordinates></map-coordinates></map-linestring>";
    linestring = parser.parseFromString(linestring, "text/html");

    let multilinestring = "<map-multilinestring></map-multilinestring>";
    multilinestring = parser.parseFromString(multilinestring, "text/html");

    let polygon = "<map-polygon></map-polygon>";
    polygon = parser.parseFromString(polygon, "text/html");

    let multiPolygon = "<map-multipolygon></map-multipolygon>";
    multiPolygon = parser.parseFromString(multiPolygon, "text/html");

    let geometrycollection = "<map-geometrycollection></map-geometrycollection>";
    geometrycollection = parser.parseFromString(geometrycollection, "text/html");

    let feature = "<map-feature><map-featurecaption></map-featurecaption><map-geometry></map-geometry><map-properties></map-properties></map-feature>";
    feature = parser.parseFromString(feature, "text/html");

    // Template to add coordinates to Geometries
    let coords = "<map-coordinates></map-coordinates>";
    coords = parser.parseFromString(coords, "text/html");
    
    //console.log(layer);
    if (jsonType === "FEATURECOLLECTION") {
        
        // Setting bbox if it exists
        if (json.bbox) {
            layer.querySelector("layer-").insertAdjacentHTML("afterbegin", "<map-meta name='extent' content='top-left-longitude=" + json.bbox[0] + ", top-left-latitude=" + json.bbox[1] + ", bottom-right-longitude=" + json.bbox[2] + ",bottom-right-latitude=" + json.bbox[3] + "'></map-meta>");
        }

        let features = json.features;
        //console.log("Features length - " + features.length);
        for (let l=0;l<features.length;l++) {
            M.geojson2mapml(features[l], options, layer);
        }
    } else if (jsonType === "FEATURE") {

        let clone_feature = feature.cloneNode(true);
        let curr_feature = clone_feature.querySelector('map-feature');
        
        // Setting bbox if it exists
        if (json.bbox) {
            layer.querySelector("layer-").insertAdjacentHTML("afterbegin", "<map-meta name='extent' content='top-left-longitude=" + json.bbox[0] + ", top-left-latitude=" + json.bbox[1] + ", bottom-right-longitude=" + json.bbox[2] + ",bottom-right-latitude=" + json.bbox[3] + "'></map-meta>");
        }

        // Setting featurecaption
        let featureCaption = layer.querySelector("layer-").getAttribute('label');
        if (typeof options.caption === "function") {
            featureCaption = options.caption(json);
        } else if (typeof options.caption === "string") {
            featureCaption = json.properties[options.caption];
            // if property does not exist
            if (featureCaption === undefined) {
                featureCaption = options.caption;
            }
        } else if (json.id) { // when no caption option available try setting id as featurecaption
          featureCaption = json.id;
        } 
        curr_feature.querySelector("map-featurecaption").innerHTML = featureCaption;

        // Setting Properties
        let p;
        // if properties function is passed
        if (typeof options.properties === "function") {
            p = options.properties(json);
            // if function output is not an element, ignore the properties.
            if (!(p instanceof Element)) {
                p = false;
                console.error("options.properties function returns a string instead of an HTMLElement.");
            }
        } else if (typeof options.properties === "string") { // if properties string is passed
            curr_feature.querySelector('map-properties').insertAdjacentHTML("beforeend", options.properties);
            p = false;
        } else if (options.properties instanceof HTMLElement) { // if an HTMLElement is passed - NOT TESTED
            p = options.properties;
        } else { // If no properties function, string or HTMLElement is passed
            p = M.properties2Table(json.properties);
        }
        
        if (p) {
            curr_feature.querySelector('map-properties').appendChild(p);
        }

        // Setting map-geometry
        let g = M.geojson2mapml(json.geometry, options, layer);
        if (typeof options.geometryFunction === "function") {
            curr_feature.querySelector('map-geometry').appendChild(options.geometryFunction(g, json));
        } else {
            curr_feature.querySelector('map-geometry').appendChild(g);
        }
        
        // Appending feature to layer
        layer.querySelector('layer-').appendChild(curr_feature);
        
    } else if (geometryType.includes(jsonType)) {
        //console.log("Geometry Type - " + jsonType);
        switch(jsonType){
            case "POINT":
                out = json.coordinates[0] + " " + json.coordinates[1];
                
                // Create Point element
                let clone_point = point.cloneNode(true);
                clone_point = clone_point.querySelector('map-point');

                // Create map-coords to add to the polygon
                let clone_coords = coords.cloneNode(true);
                clone_coords = clone_coords.querySelector("map-coordinates");

                clone_coords.innerHTML = out;

                clone_point.appendChild(clone_coords);
                //console.log(clone_point);
                return clone_point;

            case "LINESTRING":
                let clone_linestring = linestring.cloneNode(true);
                let linestring_coordindates = clone_linestring.querySelector("map-coordinates");
                
                out = "";

                for (let x=0;x<json.coordinates.length;x++) {
                    out = out + json.coordinates[x][0] + " " + json.coordinates[x][1] + " ";
                }

                linestring_coordindates.innerHTML = out;
                //console.log(clone_linestring.querySelector('map-linestring'));
                return (clone_linestring.querySelector('map-linestring'));

            case "POLYGON":
                let clone_polygon = polygon.cloneNode(true);
                clone_polygon = clone_polygon.querySelector("map-polygon");
                
                // Going over each coordinates
                for (let y=0;y<json.coordinates.length;y++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");

                    // Going over coordinates for the polygon
                    for (let x=0;x<json.coordinates[y].length;x++) {
                        out = out + json.coordinates[y][x][0] + " " + json.coordinates[y][x][1] + " ";
                    }

                    // Create map-coordinates element and append it to clone_polygon
                    clone_coords.innerHTML = out;

                    clone_polygon.appendChild(clone_coords);
                }
                //console.log(clone_polygon);
                return clone_polygon;

            case "MULTIPOINT":
                out = "";
                // Create multipoint element
                let clone_multipoint = multiPoint.cloneNode(true);
                clone_multipoint = clone_multipoint.querySelector('map-multipoint');

                for (let i=0;i<json.coordinates.length;i++) {
                    out = out + json.coordinates[i][0] + " " + json.coordinates[i][1] + " ";
                }
                clone_multipoint.querySelector('map-coordinates').innerHTML = out;
                return clone_multipoint;

            case "MULTILINESTRING":
                let clone_multilinestring = multilinestring.cloneNode(true);
                clone_multilinestring = clone_multilinestring.querySelector("map-multilinestring");

                for(let i=0;i<json.coordinates.length;i++) {
                    let out = "";
                    let clone_coords = coords.cloneNode(true);
                    clone_coords = clone_coords.querySelector("map-coordinates");
                    for(let y=0;y<json.coordinates[i].length;y++) {
                        out = out + json.coordinates[i][y][0] + " " + json.coordinates[i][y][1] + " ";
                    }
                    clone_coords.innerHTML = out;
                    clone_multilinestring.appendChild(clone_coords);
                }
                return clone_multilinestring;

            case "MULTIPOLYGON":
                let m = multiPolygon.cloneNode(true);
                m = m.querySelector('map-multiPolygon');

                // Going over each Polygon
                for (let i=0;i<json.coordinates.length;i++) {
                    let clone_polygon = polygon.cloneNode(true);
                    clone_polygon = clone_polygon.querySelector("map-polygon");
                    
                    // Going over each coordinates
                    for (let y=0;y<json.coordinates[i].length;y++) {
                        let out = "";
                        let clone_coords = coords.cloneNode(true);
                        clone_coords = clone_coords.querySelector("map-coordinates");

                        // Going over coordinates for the polygon
                        for (let x=0;x<json.coordinates[i][y].length;x++) {
                            out = out + json.coordinates[i][y][x][0] + " " + json.coordinates[i][y][x][1] + " ";
                        }

                        // Create map-coordinates element and append it to clone_polygon
                        clone_coords.innerHTML = out;

                        clone_polygon.appendChild(clone_coords);
                    }
                    m.appendChild(clone_polygon);
                }
                return m;
            case "GEOMETRYCOLLECTION": // ---------------------------------------------------------------------------
                let g = geometrycollection.cloneNode(true);
                g = g.querySelector('map-geometrycollection');
                //console.log(json.geometries);
                for (let i=0;i<json.geometries.length;i++) {
                    let fg = M.geojson2mapml(json.geometries[i], options, layer);
                    g.appendChild(fg);
                }
                return g;
        }
    }
    return layer.querySelector('layer-');
  },

  // Takes an array of length n to return an array of arrays with length 2, helper function
  //    for mapml2geojson
  // breakArray: arr(float) -> arr(arr(float, float))
  breakArray: function (arr) {
    let size = 2; 
    let arrayOfArrays = [];
    // removing anything other than numbers, ., - (used to remove <map-span> tags)
    arr = arr.filter(x => !(/[^\d.-]/g.test(x))).filter(x => x);
    for (let i=0; i<arr.length; i+=size) {
        arrayOfArrays.push((arr.slice(i,i+size)).map(Number));
    }
    return arrayOfArrays;
  },

  // Takes an HTML Table to return geojson properties, helper function
  //    for mapml2geojson
  // table2properties: HTML Table -> geojson
  table2properties: function (table) {
    // removing thead, if it exists
    let head = table.querySelector("thead");
    if (head !== null) {
        table.querySelector("thead").remove();
    }
    let json = {};
    table.querySelectorAll('tr').forEach((tr) => {
        let tableData = tr.querySelectorAll('th, td');
        json[tableData[0].innerHTML] = tableData[1].innerHTML;
    });
    return json;
  },

  // Converts a geometry element to geojson, helper function
  //    for mapml2geojson
  // geometry2geojson: (child of <map-geometry>), Proj4, Proj4, Bool -> geojson
  geometry2geojson: function (el, source, dest, transform) {
    let elem = el.nodeName;
    let j = {};
    let coord;

    switch(elem.toUpperCase()) {
        case "MAP-POINT":
            j.type = "Point";
            if (transform) {
                let pointConv = proj4.transform(source, dest, ((el.querySelector('map-coordinates').innerHTML.split(/ [<>\ ]/g)).map(Number)) );
                j.coordinates = [pointConv.x, pointConv.y];
            } else {
                j.coordinates = (el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g)).map(Number);
            }
            break;
        case "MAP-LINESTRING":
            j.type = "LineString";
            coord = el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g);
            coord = M.breakArray(coord);
            if (transform) {
                coord = M.pcrsToGcrs(coord, source, dest);
            }
            j.coordinates = coord;
            break;
        case "MAP-POLYGON":
            j.type = "Polygon";
            j.coordinates = [];
            let x = 0;
            el.querySelectorAll('map-coordinates').forEach((coord) => {
                coord = coord.innerHTML.split(/[<>\ ]/g);
                coord = M.breakArray(coord);
                if (transform) {
                    coord = M.pcrsToGcrs(coord, source, dest);
                }
                j.coordinates[x] = coord;
                x++;
            });
            break;
        case "MAP-MULTIPOINT":
            j.type = "MultiPoint";
            coord = M.breakArray(el.querySelector('map-coordinates').innerHTML.split(/[<>\ ]/g));
            if (transform) {
                coord = M.pcrsToGcrs(coord, source, dest);
            }
            j.coordinates = coord;
            break;
        case "MAP-MULTILINESTRING":
            j.type = "MultiLineString";
            j.coordinates = [];
            let i = 0;
            el.querySelectorAll('map-coordinates').forEach((coord) => {
                coord = coord.innerHTML.split(/[<>\ ]/g);
                coord = M.breakArray(coord);
                if (transform) {
                    coord = M.pcrsToGcrs(coord, source, dest);
                }
                j.coordinates[i] = coord;
                i++;
            });
            break;
        case "MAP-MULTIPOLYGON":
            j.type = "MultiPolygon";
            j.coordinates = [];
            let p = 0;
            el.querySelectorAll('map-polygon').forEach((poly) => {
                let y = 0;
                j.coordinates.push([]);
                poly.querySelectorAll('map-coordinates').forEach((coord) => {
                    coord = coord.innerHTML.split(/[<>\ ]/g);
                    coord = M.breakArray(coord);
                    if (transform) {
                        coord = M.pcrsToGcrs(coord, source, dest);
                    }
                    j.coordinates[p].push([]);
                    j.coordinates[p][y] = coord;
                    y++;
                });
                p++;
            });
            break;
    }
    return j;
  },

  // pcrsToGcrs: arrof([x,y]) Proj4, Proj4 -> arrof[x,y]
  pcrsToGcrs: function (arr, source, dest) {
    let newArr = [];
    for (let i=0; i<arr.length; i++) {
        let conv = proj4.transform(source, dest, arr[i]);
        conv = [conv.x, conv.y];
        newArr.push(conv);
    }
    return newArr;
  },

  // Takes an <layer-> element and returns a geojson feature collection object 
  // The options object can contain the following:
  //      propertyFunction   - function(<map-properties>), A function that maps the features' <map-properties> element to   a GeoJSON "properties" member.
  //      transform          - Bool, Transform coordinates to gcrs values, defaults to True
  // mapml2geojson: <layer-> Object -> GeoJSON
  mapml2geojson: function (element, options = {}) {
      let defaults = {
          propertyFunction: null,
          transform: true
      };
      // assign default values for undefined options
      options = Object.assign({}, defaults, options);

      let json = {};
      json.type = "FeatureCollection";
      json.title = element.getAttribute('label');
      json.features = [];

      // Transforming Coordinates to gcrs if transformation = true and coordinate is not (EPSG:3857 or EPSG:4326)
      let source = null;
      let dest = null;
      if (options.transform) {
          source = new proj4.Proj(element.parentElement._map.options.crs.code);
          dest = new proj4.Proj('EPSG:4326');
          if (element.parentElement._map.options.crs.code === "EPSG:3857" || element.parentElement._map.options.crs.code  === "EPSG:4326") {
              options.transform = false;
          }   
      }

      // Setting all meta settings, if any
      let metas = element.querySelectorAll("map-meta");
      metas.forEach((meta) => {
          let name = meta.getAttribute('name');
          if (name === "extent") {
              let content = meta.getAttribute('content');
              let arr = content.split(",");
              let ex = {};
              for (let i=0; i<arr.length; i++) {
                  let s = arr[i].split("=");
                  s[0] = s[0].trim(); // removing whitespace
                  s[1] = parseFloat(s[1]);
                  ex[s[0]] = s[1];
              }
              json.bbox = [ex['top-left-longitude'], ex['top-left-latitude'], ex['bottom-right-longitude'], ex  ['bottom-right-latitude']];
          }
      });

      // Iterating over each feature
      let features = element.querySelectorAll("map-feature");
      let num = 0;

      // Going over each feature in the layer
      features.forEach((feature) => {
          //console.log(feature);

          json.features[num] = {"type": "Feature"};
          json.features[num].geometry = {};
          json.features[num].properties = {};

          // setting properties when function presented
          if (typeof options.propertyFunction === "function") {
              let properties = options.propertyFunction(feature.querySelector("map-properties"));
              json.features[num].properties = properties;
          } else if (feature.querySelector("map-properties").querySelector('table') !== null) { 
              // setting properties when table presented
              let properties = M.table2properties(feature.querySelector("map-properties").querySelector('table'));
              json.features[num].properties = properties;
          } else {
              // when no table present, strip any possible html tags to only get text
              json.features[num].properties = {prop0: (feature.querySelector("map-properties").innerHTML).replace( /(<([^>]+)>)/ig, '')};
          }

          let geom = feature.querySelector("map-geometry");
          let elem = geom.children[0].nodeName;

          // Adding Geometry
          if (elem.toUpperCase() !== "MAP-GEOMETRYCOLLECTION"){
              json.features[num].geometry = M.geometry2geojson(geom.children[0], source, dest, options.transform);
          } else {
              json.features[num].geometry.type = "GeometryCollection";
              json.features[num].geometry.geometries = [];

              let geoms = geom.querySelector('map-geometrycollection').children;
              Array.from(geoms).forEach((g) => {
                  g = M.geometry2geojson(g, source, dest, options.transform);
                  json.features[num].geometry.geometries.push(g);
              });
          }
          //going to next feature
          num++;
      });

      return json;
  }
};