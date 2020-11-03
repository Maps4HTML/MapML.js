import { TILE_SIZE } from '../utils/Constants';

export var TemplatedTileLayer = L.TileLayer.extend({
    // a TemplateTileLayer is similar to a L.TileLayer except its templates are
    // defined by the <extent><template/></extent>
    // content found in the MapML document.  As such, the client map does not
    // 'revisit' the server for more MapML content, it simply fills the map extent
    // with tiles for which it generates requests on demand (as the user pans/zooms/resizes
    // the map)
    initialize: function(template, options) {
      // _setUpTileTemplateVars needs options.crs, not available unless we set
      // options first...
      let inputData = M.extractInputBounds(template);
      this.zoomBounds = inputData.zoomBounds;
      this.layerBounds=inputData.bounds;
      this.isVisible = true;
      L.extend(options, this.zoomBounds);
      options.tms = template.tms;
      L.setOptions(this, options);
      this._setUpTileTemplateVars(template);

      if (template.tile.subdomains) {
        L.setOptions(this, L.extend(this.options, {subdomains: template.tile.subdomains}));
      }
      this._template = template;
      this._initContainer();
      // call the parent constructor with the template tref value, per the 
      // Leaflet tutorial: http://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
      L.TileLayer.prototype.initialize.call(this, template.template, L.extend(options, {pane: this._container}));
    },
    onAdd : function(){
      this._map._addZoomLimit(this);
      L.TileLayer.prototype.onAdd.call(this,this._map);
      this._map.fire('moveend',true);
    },

    getEvents: function(){
      let events = L.TileLayer.prototype.getEvents.call(this,this._map);
      this._parentOnMoveEnd = events.moveend;
      events.moveend = this._handleMoveEnd;
      return events;
    },

    _initContainer: function () {
      if (this._container) { return; }

      this._container = L.DomUtil.create('div', 'leaflet-layer', this.options.pane);
      L.DomUtil.addClass(this._container,'mapml-templated-tile-container');
      this._updateZIndex();

      if (this.options.opacity < 1) {
        this._updateOpacity();
      }
    },
    _handleMoveEnd : function(e){
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.options.maxZoom && mapZoom >= this.options.minZoom && 
                        this.layerBounds.overlaps(mapBounds);
      if(!(this.isVisible))return;
      this._parentOnMoveEnd();
    },
    createTile: function (coords) {
      if (this._template.type.startsWith('image/')) {
        return L.TileLayer.prototype.createTile.call(this, coords, function(){});
      } else {
        // tiles of type="text/mapml" will have to fetch content while creating
        // the tile here, unless there can be a callback associated to the element
        // that will render the content in the alread-placed tile
        // var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        var tile = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tile.setAttribute("width", `${TILE_SIZE}`);
        tile.setAttribute("height", `${TILE_SIZE}`);
//        tile.style.outline="1px solid red";
        L.DomUtil.addClass(tile, "leaflet-tile");
        this._fetchTile(coords, tile);
        return tile;
      }
    },
    _mapmlTileReady: function(tile) {
        L.DomUtil.addClass(tile,'leaflet-tile-loaded');
    },
    // instead of being child of a pane, the TemplatedTileLayers are 'owned' by the group,
    // and so are DOM children of the group, not the pane element (the MapMLLayer is
    // a child of the overlay pane and always has a set of sub-layers)
    getPane: function() {
      return this.options.pane;
    },
    _drawTile: function(mapml, coords, tile) {
        var stylesheets = mapml.querySelector('link[rel=stylesheet],style');
        if (stylesheets) {
          var base = mapml.querySelector('base') && mapml.querySelector('base').hasAttribute('href') ? 
              new URL(mapml.querySelector('base').getAttribute('href')).href : 
              mapml.URL;
        M.parseStylesheetAsHTML(mapml,base,tile);
        }
        var features = mapml.querySelectorAll('feature');
        for (var i=0; i< features.length; i++) {
          this._draw(features[i], coords, tile);
        }
        this._mapmlTileReady(tile);
    },
  	 _draw: function (feature, tileCoords, tile) {
      var geometry = feature.tagName.toUpperCase() === 'FEATURE' ? feature.getElementsByTagName('geometry')[0] : feature,
          pt, coordinates, member, members, crs = this.options.crs;
  
        feature.classList.add("_"+ feature.id.substring(feature.id.indexOf(".")+1));
        feature.classList.forEach(val => geometry.classList.add(val));
      
      // if (feature.id !== "fclass.71" || (tileCoords.z !== 2 && tileCoords.x !== 1 && tileCoords.y !== 1)) return;
        
      // because we are creating SVG shapes as proxies for <feature> geometries,
      // we have to establish a convention for where the author can set up classes
      // that are to be copied onto the proxy elements.  Going with <coordinates>
      // at this time.  In the case of multiple <coordinates> per geometry, we
      // will look for class attribute on the first <coordinates> element.
      // var cl; // classList -> DOMTokenList https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
      switch (geometry.firstElementChild.tagName.toUpperCase()) {
        case 'POINT':
          coordinates = [];
          geometry.getElementsByTagName('coordinates')[0].textContent.split(/\s+/gim).forEach(M.parseNumber,coordinates);
          pt = this.coordsToPoint(coordinates, tileCoords);
          renderPoint(pt, geometry);
          break;
        case 'MULTIPOINT':
          coordinates = [];
          // TODO the definition of multipoint geometry was modified in testbed 15
          // to align with geojson a bit better.  
          // this modification requires one <coordinates> element with 1 or more
          // text string coordinate pairs, per the model for <coordinates> in a
          // linestring (but with different semantics). As such, in order to separately
          // select and style a coordinate, the user has to wrap it in a <span class="...>
          // The code below does not  support that yet.  the renderPoint code
          // will have to use treewalker (as the polygon code does), and copy the
          // classes from the geometry element to each child svg element
          // created i.e. onto the circle or path(s) that are created.
          geometry.getElementsByTagName('coordinates')[0].textContent.match(/(\S+ \S+)/gim).forEach(M.splitCoordinate, coordinates);
          members = this.coordsToPoints(coordinates, 0, tileCoords);
          for(member=0;member<members.length;member++) {
            // propagate the classes from the feature to each geometry
            const g = geometry;
            feature.classList.forEach(val => g.getElementsByTagName('coordinates')[0].classList.add(val));
            renderPoint(members[member], g.getElementsByTagName('coordinates')[0]);
          }
          break;
        case 'LINESTRING':
          coordinates = [];
          geometry.getElementsByTagName('coordinates')[0].textContent.match(/(\S+ \S+)/gim).forEach(M.splitCoordinate, coordinates);
          renderLinestring(this.coordsToPoints(coordinates, 0, tileCoords), geometry);
          break;
        case 'MULTILINESTRING':
          members = geometry.getElementsByTagName('coordinates');
          for (member=0;member<members.length;member++) {
            coordinates = [];
          // propagate the classes from the feature to each geometry
            const m = members[member];
            feature.classList.forEach(val => m.classList.add(val));
            m.textContent.match(/(\S+ \S+)/gim).forEach(M.splitCoordinate, coordinates);
            renderLinestring(this.coordsToPoints(coordinates, 0, tileCoords), geometry);
          }
          break;
        case 'POLYGON':
          renderPolygon(this.coordsToPoints(coordinatesToArray(geometry.getElementsByTagName('coordinates')), 1, tileCoords), geometry);
          break;
        case 'MULTIPOLYGON':
          members = geometry.getElementsByTagName('polygon');
          for (member=0;member<members.length;member++) {
            // propagate the classes from the feature to each geometry
            const m = members[member];
            feature.classList.forEach(val => m.classList.add(val));
            renderPolygon(
              this.coordsToPoints(coordinatesToArray(
              m.getElementsByTagName('coordinates')), 1 ,tileCoords), m
            );
          }
          break;
        case 'GEOMETRYCOLLECTION':
          console.log('GEOMETRYCOLLECTION Not implemented yet');
          break;
        default:
          console.log('Invalid geometry');
          break;
      }

      function renderPolygon(p, f) {
        var poly = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
            path = "";
        for(var ring=0;ring<p.length;ring++) {
          path = path + "M " + Math.round(p[ring][0].x) + "," + Math.round(p[ring][0].y) + " ";
          for (var pt=1;pt<p[ring].length;pt++) {
            path = path + Math.round(p[ring][pt].x) + "," + Math.round(p[ring][pt].y) + " ";
          }
        }
        poly.setAttribute("d", path);

        // copy the classes from the feature to its proxy svg path
        f.classList.forEach(val => poly.classList.add(val));
        poly.style.display = "none";
        tile.appendChild(poly);
        // if the outline of the polygon is to be drawn, need to see if it
        // is composed of differently styled segments, and if so, create
        // individual segments with appropriate classes (copied from the
        // input <span class="">nnn nnnn...nnnN nnnN</span> segments.
        if (window.getComputedStyle(poly).stroke !== "none") {
          if (f.querySelector('coordinates span')) {
            // recursively parse the coordinates element (c) for path segments
            // and create them as individual path elements with corresponding 
            // class list values copied from the input <span> or parent 
            // <coordinates>
            // stroke the polygon's outline as is...
             poly.style.stroke = "none";
             var coordinates = f.querySelectorAll('coordinates');
            _renderOutline(coordinates, f.classList);
          }
        }
        poly.style.display = ""; // fill it
      }
      /* jshint ignore:start */
      function _renderOutline(c, classList) {
        for (var i=0;i<c.length;i++) {
          const nf = NodeFilter;
          _coordinatesToPaths(
              document.createTreeWalker(c[i],
                nf.SHOW_ELEMENT+nf.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) return nf.FILTER_ACCEPT;
                    var re = /(\S+ \S+)/gim;
                    if (node.nodeType === Node.TEXT_NODE && re.test(node.data)) 
                      return nf.FILTER_ACCEPT;
                    return nf.FILTER_REJECT;
                  }
                }), classList);
        }
      }
      /* jshint ignore:end */
      function _coordinatesToPaths(tw,cl) {
        var coordinatesAsArrays = [];
        var n,i;
        
        // make an array of each coordinates text node, regardless of parentage,
        // so that we can easily redistribute the beginning and ending 
        // coordinate pairs as required (see below).
        for (n=tw.currentNode;n;n=tw.nextNode()) {
          const node = n;
          if (node.nodeType === Node.TEXT_NODE ) {
            coordinatesAsArrays.push(coordinatesToArray([node])[0]);
          } else {
            // copy the class list from the feature to this boundary segment
            cl.forEach(val => node.classList.add(val));
          }
        }
        // reset
        tw.currentNode = tw.root;
        for (n=tw.currentNode,i=0;n;n=tw.nextNode()) {
          var cn=tw.currentNode;
          if (n.nodeType === Node.TEXT_NODE ) {
            
            // logic to modify the coordinate array for this node, based on 
            // preceding/following and parentNode 
            // these methods modify the state of the treewalker, so we need
            // to keep track of the node and reset so our loop will work
            var parentNode = tw.parentNode();
            tw.currentNode = cn;
            var nextNode = tw.nextNode();
            tw.currentNode = cn;
            var previousSibling = tw.previousSibling();
            tw.currentNode = cn;
            
            
            if (parentNode && parentNode.nodeName === 'coordinates') {
              if (previousSibling && previousSibling.nodeName === 'span') {
                // copy the last element of the previous coordinates array into 
                // the current coordinates array at the beginning of the current
                // coordinates array
                var last = coordinatesAsArrays[i-1].length - 1;
                coordinatesAsArrays[i].unshift(coordinatesAsArrays[i-1][last]);
              }
              // copy the first element of the next coordinates array into the
              // current coordinates array at the last position of the current
              // coordinates array
              if (nextNode && nextNode.nodeName === 'span') {
                coordinatesAsArrays[i].push(coordinatesAsArrays[i+1][0]);
              }
            }
//            var rawpoints = coordsToPointsDBG(coordinatesAsArrays[i], tileCoords);
//            var wgs84line = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
//                wgs84path = "M ";
//            for(var c=0;c<rawpoints.length;c++) {
//              wgs84path +=  rawpoints[c].x + " " + rawpoints[c].y + " ";
//            }
//            wgs84line.setAttribute("d", wgs84path);
//            parentNode.classList.forEach(val => wgs84line.classList.add(val));
//            wgs84line.classList.add('span');
//            wgs84line.style.stroke = "none";
//            wgs84line.style.fill = "none";
//            tile.appendChild(wgs84line);
            // should be preceding sibling of its drawn match:

            var points = coordsToPoints(coordinatesAsArrays[i], tileCoords);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var path = "M ";
            for(var c=0;c<points.length;c++) {
              path += Math.round(points[c].x) + "," + Math.round(points[c].y) + " ";
            }            
            line.setAttribute("d", path);
            parentNode.classList.forEach(val => line.classList.add(val));
            line.classList.add('span');
            tile.appendChild(line);
            i++;
          }
        }
      }
      function renderLinestring(l, f) {
        if (f.querySelector('coordinates span')) {
          // recursively parse the coordinates element (c) for path segments
          // and create them as individual path elements with corresponding 
          // class list value
//        _renderOutline(f.querySelectorAll('coordinates'), f.classList);
        } else { // create a single path element, draw it
          var line = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
              path = "";
           path =  path + "M " + Math.round(l[0].x) + "," + Math.round(l[0].y) + " ";
          for(var c=1;c<l.length;c++) {
            path =  path + Math.round(l[c].x) + "," + Math.round(l[c].y) + " ";
          }
          line.setAttribute("d", path);

          f.classList.forEach(val => line.classList.add(val));
          // because polygons and linestrings are rendered as paths, need to
          // add a class to differentiate.  This is kind of a stop-gap measure
          // until I figure out a model for how all this should work...
          line.classList.add('linestring');
          tile.appendChild(line);
        }
      }
      function renderPoint(p, f) {
        var point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute("cx", Math.round(p.x));
        point.setAttribute("cy", Math.round(p.y));
        point.setAttribute("r", "5");
        f.classList.forEach(val => point.classList.add(val));
        tile.appendChild(point);
      }
      function coordinatesToArray(coordinates) {
        var a = new Array(coordinates.length);
        for (var i=0;i<a.length;i++) {
          a[i]=[];
          (coordinates[i] || coordinates).textContent.match(/(\S+\s+\S+)/gim).forEach(M.splitCoordinate, a[i]);
        }
        return a;
      }
      function coordsToPoints(coords, tileCoords) {
        var point, i, len, points = [];
        for (i = 0, len = coords.length; i < len; i++) {
         point = coordsToPoint(coords[i], tileCoords);
         points.push(point);
        }
        return points;
      }
      function coordsToPointsDBG(coords, tileCoords) {
        var point, i, points = [];
        for (i = 0; i < coords.length; i++) {
         point = L.point(coords[i][0],coords[i][1]);
         points.push(point);
        }
        return points;
      }
      // coords is a location in x,y coordinate order, parsed from the <coordinates> element
      function coordsToPoint(coords, tileCoords) {
        // pcrs2tile is hard-coded, for now
        return pcrs2tile(L.point(coords[0],coords[1]), tileCoords);
      }
      function pcrs2tile(coords,tile) {
        // look up the scale factor from the layer's crs for the tile.z
        // transform to tcrs at tile.z
        // subtract the tcrs origin from tile.x,tile.y
        var tcrsCoords = crs.transformation.transform(coords,crs.scale(tile.z)),
            tilePoint = L.point(tcrsCoords.x - (tile.x*TILE_SIZE), tcrsCoords.y - (tile.y*TILE_SIZE));

        return tilePoint;
      }
    },
    coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
     return new L.LatLng(coords[1], coords[0], coords[2]);
    },
    pcrs2tile: function (coords,tile) {
      var crs = this.options.crs;
      // look up the scale factor from the layer's crs for the tile.z
      // transform to tcrs at tile.z
      // subtract the tcrs origin from tile.x,tile.y
      var tcrsCoords = crs.transformation.transform(coords,crs.scale(tile.z)),
          tilePoint = L.point(tcrsCoords.x - (tile.x*TILE_SIZE), tcrsCoords.y - (tile.y*TILE_SIZE));

      return tilePoint;
    },
// coords is a location in x,y coordinate order, parsed from the <coordinates> element
    coordsToPoint: function (coords, tileCoords) {
      // pcrs2tile is hard-coded, for now
      return this.pcrs2tile(L.point(coords[0],coords[1]), tileCoords);
    },
    coordsToPoints: function (coords, levelsDeep, tileCoords) {
      var point, i, len, points = [];
      for (i = 0, len = coords.length; i < len; i++) {
       point = levelsDeep ?
               this.coordsToPoints(coords[i], levelsDeep - 1, tileCoords) :
               this.coordsToPoint(coords[i], tileCoords);
       points.push(point);
      }
      return points;
    },
    coordsToPointsDBG: function (coords, levelsDeep, tileCoords) {
      var point, i, len, points = [];
      for (i = 0, len = coords.length; i < len; i++) {
        point = levelsDeep ?
               this.coordsToPointsDBG(coords[i], levelsDeep - 1, tileCoords) :
                      point = L.point(coords[i][0],coords[i][1]);
        points.push(point);
      }
      return points;
    },
    _fetchTile:  function (coords, tile) {
       fetch(this.getTileUrl(coords),{redirect: 'follow'}).then(
          function(response) {
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(response);
            } else {
              console.log('Looks like there was a problem. Status Code: ' + response.status);
              return Promise.reject(response);
            }
          }).then(function(response) {
            return response.text();
          }).then(text => {
            var parser = new DOMParser();
                return parser.parseFromString(text, "application/xml");
          }).then(mapml => {
            this._drawTile(mapml, coords, tile);
          }).catch(function(err) {});
    },
    getTileUrl: function (coords) {
        if (coords.z >= this._template.tilematrix.bounds.length || 
                !this._template.tilematrix.bounds[coords.z].contains(coords)) {
          return '';
        }
        var obj = {};
        obj[this._template.tilematrix.col.name] = coords.x;
        obj[this._template.tilematrix.row.name] = coords.y;
        obj[this._template.zoom.name] = this._getZoomForUrl();
        obj[this._template.pcrs.easting.left] = this._tileMatrixToPCRSPosition(coords, 'top-left').x;
        obj[this._template.pcrs.easting.right] = this._tileMatrixToPCRSPosition(coords, 'top-right').x;
        obj[this._template.pcrs.northing.top] = this._tileMatrixToPCRSPosition(coords, 'top-left').y;
        obj[this._template.pcrs.northing.bottom] = this._tileMatrixToPCRSPosition(coords, 'bottom-left').y;
        obj[this._template.tile.server] = this._getSubdomain(coords);
        for (var v in this._template.tile) {
            if (["row","col","zoom","left","right","top","bottom"].indexOf(v) < 0) {
                obj[v] = this._template.tile[v];
            }
        }
        if (this._map && !this._map.options.crs.infinite) {
          let invertedY = this._globalTileRange.max.y - coords.y;
          if (this.options.tms) {
            obj[this._template.tilematrix.row.name] = invertedY;
          }
          //obj[`-${this._template.tilematrix.row.name}`] = invertedY; //leaflet has this but I dont see a use in storing row and -row as it doesnt follow that pattern
        }
        obj.r = this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '';
        return L.Util.template(this._url, obj);
    },
    _tileMatrixToPCRSPosition: function (coords, pos) {
// this is a tile:
// 
//   top-left         top-center           top-right
//      +------------------+------------------+
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      + center-left    center               + center-right
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      +------------------+------------------+
//   bottom-left     bottom-center      bottom-right

  var map = this._map,
      crs = map.options.crs,
      tileSize = this.getTileSize(),

      nwPoint = coords.scaleBy(tileSize),
      sePoint = nwPoint.add(tileSize),
      centrePoint = nwPoint.add(Math.floor(tileSize / 2)),

      nw = crs.transformation.untransform(nwPoint,crs.scale(coords.z)),
      se = crs.transformation.untransform(sePoint,crs.scale(coords.z)),
      cen = crs.transformation.untransform(centrePoint, crs.scale(coords.z)),
      result = null;

      switch (pos) {
        case('top-left'):
          result = nw;
          break;
        case('bottom-left'):
          result = new L.Point(nw.x,se.y);
          break;
        case('center-left'):
          result = new L.Point(nw.x,cen.y);
          break;
        case('top-right'):
          result = new L.Point(se.x,nw.y);
          break;
        case('bottom-right'):
          result = se;
          break;
        case('center-right'):
          result = new L.Point(se.x,cen.y);
          break;
        case('top-center'):
          result = new L.Point(cen.x,nw.y);
          break;
        case('bottom-center'):
          result = new L.Point(cen.x,se.y);
          break;
        case('center'):
          result = cen;
          break;
      }
      return result;
    },
    _setUpTileTemplateVars: function(template) {
      // process the inputs associated to template and create an object named
      // tile with member properties as follows:
      // {row: 'rowvarname', 
      //  col: 'colvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'}
      template.tile = {};
      var inputs = template.values,
          crs = this.options.crs.options,
          zoom, east, north, row, col;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            shard = (type === "hidden" && inputs[i].hasAttribute("shard")),
            select = (inputs[i].tagName.toLowerCase() === "select"),
            value = inputs[i].getAttribute("value"),
            min = inputs[i].getAttribute("min"),
            max = inputs[i].getAttribute("max");
        if (type === "location" && units === "tilematrix") {
          switch (axis) {
            case("column"):
              col = {
                name: name,
                min: crs.crs.tilematrix.horizontal.min,
                max: crs.crs.tilematrix.horizontal.max(crs.resolutions.length-1)
              };
              if (!isNaN(Number.parseInt(min,10))) {
                col.min = Number.parseInt(min,10);
              }
              if (!isNaN(Number.parseInt(max,10))) {
                col.max = Number.parseInt(max,10);
              }
              break;
            case("row"):
              row = {
                name: name,
                min: crs.crs.tilematrix.vertical.min,
                max:  crs.crs.tilematrix.vertical.max(crs.resolutions.length-1)
              };
              if (!isNaN(Number.parseInt(min,10))) {
                row.min = Number.parseInt(min,10);
              }
              if (!isNaN(Number.parseInt(max,10))) {
                row.max = Number.parseInt(max,10);
              }
              break;
            case('longitude'):
            case("easting"):
              if (!east) {
                east = {
                  min: crs.crs.pcrs.horizontal.min,
                  max: crs.crs.pcrs.horizontal.max
                };
              }
              if (!isNaN(Number.parseFloat(min))) {
                east.min = Number.parseFloat(min);
              }
              if (!isNaN(Number.parseFloat(max))) {
                east.max = Number.parseFloat(max);
              }
              if (position) {
                if (position.match(/.*?-left/i)) {
                  east.left = name;
                } else if (position.match(/.*?-right/i)) {
                  east.right = name;
                }
              }
              break;
            case('latitude'):
            case("northing"):
              if (!north) {
                north = {
                  min: crs.crs.pcrs.vertical.min,
                  max: crs.crs.pcrs.vertical.max
                };
              }
              if (!isNaN(Number.parseFloat(min))) {
                north.min = Number.parseFloat(min);
              }
              if (!isNaN(Number.parseFloat(max))) {
                north.max = Number.parseFloat(max);
              }
              if (position) {
                if (position.match(/top-.*?/i)) {
                  north.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  north.bottom = name;
                }
              } 
              break;
            default:
              // unsuportted axis value
          }
        } else if (type.toLowerCase() === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17">
           zoom = {
             name: name,
             min: 0, 
             max: crs.resolutions.length,
             value: crs.resolutions.length 
           };
           if (!isNaN(Number.parseInt(value,10)) && 
                   Number.parseInt(value,10) >= zoom.min && 
                   Number.parseInt(value,10) <= zoom.max) {
             zoom.value = Number.parseInt(value,10);
           } else {
             zoom.value = zoom.max;
           }
           if (!isNaN(Number.parseInt(min,10)) && 
                   Number.parseInt(min,10) >= zoom.min && 
                   Number.parseInt(min,10) <= zoom.max) {
             zoom.min = Number.parseInt(min,10);
           }
           if (!isNaN(Number.parseInt(max,10)) && 
                   Number.parseInt(max,10) >= zoom.min && 
                   Number.parseInt(max,10) <= zoom.max) {
             zoom.max = Number.parseInt(max,10);
           }
           template.zoom = zoom;
        } else if (shard) {
          template.tile.server = name;
          template.tile.subdomains = inputs[i].servers.slice();
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          template.tile[name] = function() {
              return parsedselect.value;
          };
        } else {
           // needs to be a const otherwise it gets overwritten
          /*jshint -W104 */
          const input = inputs[i];
          template.tile[name] = function () {
              return input.getAttribute("value");
          };
        }
      }
      var transformation = this.options.crs.transformation, 
          scale = L.bind(this.options.crs.scale, this.options.crs),
      tilematrix2pcrs = function (c,zoom) {
        return transformation.untransform(c.multiplyBy(TILE_SIZE),scale(zoom));
      },
      pcrs2tilematrix = function(c,zoom) {
        return transformation.transform(c, scale(zoom)).divideBy(TILE_SIZE).floor();
      };
      if (east && north) {
        
        template.pcrs = {};
        template.pcrs.bounds = L.bounds([east.min,north.min],[east.max,north.max]);
        template.pcrs.easting = east;
        template.pcrs.northing = north;
        
      } else if ( col && row && !isNaN(zoom.value)) {
          
          // convert the tile bounds at this zoom to a pcrs bounds, then 
          // go through the zoom min/max and create a tile-based bounds
          // at each zoom that applies to the col/row values that constrain what tiles
          // will be requested so that we don't generate too many 404s
          if (!template.pcrs) {
            template.pcrs = {};
            template.pcrs.easting = '';
            template.pcrs.northing = '';
          }
          
          template.pcrs.bounds = L.bounds(
            tilematrix2pcrs(L.point([col.min,row.min]),zoom.value),
            tilematrix2pcrs(L.point([col.max,row.max]),zoom.value)
          );
          
          template.tilematrix = {};
          template.tilematrix.col = col;
          template.tilematrix.row = row;

      } else {
        console.log('Unable to determine bounds for tile template: ' + template.template);
      }
      
      if (!template.tilematrix) {
        template.tilematrix = {};
        template.tilematrix.col = {};
        template.tilematrix.row = {};
      }
      template.tilematrix.bounds = [];
      var pcrsBounds = template.pcrs.bounds;
      // the template should _always_ have a zoom, because we force it to
      // by first processing the extent to determine the zoom and if none, adding
      // one and second by copying that zoom into the set of template variable inputs
      // even if it is not referenced by one of the template's variable references
      var zmin = template.zoom?template.zoom.min:0,
          zmax = template.zoom?template.zoom.max:crs.resolutions.length;
      for (var z=0; z <= zmax; z++) {
        template.tilematrix.bounds[z] = (z >= zmin ?
            L.bounds(pcrs2tilematrix(pcrsBounds.min,z),
              pcrs2tilematrix(pcrsBounds.max,z)) :
                      L.bounds(L.point([-1,-1]),L.point([-1,-1])));
      }
    }
});
export var templatedTileLayer = function(template, options) {
  return new TemplatedTileLayer(template, options);
};