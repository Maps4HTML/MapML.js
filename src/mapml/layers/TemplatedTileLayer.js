import { BLANK_TT_TREF } from '../utils/Constants';

export var TemplatedTileLayer = L.TileLayer.extend({
    // a TemplateTileLayer is similar to a L.TileLayer except its templates are
    // defined by the <map-extent><template/></map-extent>
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
      this._handleMoveEnd();
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
      let tileGroup = document.createElement("DIV"),
          tileSize = this.getTileSize();
      L.DomUtil.addClass(tileGroup, "mapml-tile-group");
      L.DomUtil.addClass(tileGroup, "leaflet-tile");

      this._template.linkEl.dispatchEvent(new CustomEvent('tileloadstart', {
        detail:{
          x:coords.x,
          y:coords.y,
          zoom:coords.z,
          appendTile: (elem)=>{tileGroup.appendChild(elem);},
        },
      }));

      if (this._template.type.startsWith('image/')) {
        let tile = L.TileLayer.prototype.createTile.call(this, coords, function(){});
        tile.width = tileSize.x;
        tile.height = tileSize.y;
        tileGroup.appendChild(tile);
      } else if(!this._url.includes(BLANK_TT_TREF)) {
        // tiles of type="text/mapml" will have to fetch content while creating
        // the tile here, unless there can be a callback associated to the element
        // that will render the content in the alread-placed tile
        // var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        this._fetchTile(coords, tileGroup);
      }
      return tileGroup;
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
            this._createFeatures(mapml, coords, tile);
            this._mapmlTileReady(tile);
          }).catch(err => {console.log("Error Creating Tile");});
    },

    _createFeatures: function(markup, coords, tile){
      let stylesheets = markup.querySelector('map-link[rel=stylesheet],map-style');
      if (stylesheets) {
        let base = markup.querySelector('map-base') && markup.querySelector('map-base').hasAttribute('href') ?
          new URL(markup.querySelector('map-base').getAttribute('href')).href :
          markup.URL;
        M.parseStylesheetAsHTML(markup,base,tile);
      }

      let svg = L.SVG.create('svg'), g = L.SVG.create('g'), tileSize = this._map.options.crs.options.crs.tile.bounds.max.x,
          xOffset = coords.x * tileSize, yOffset = coords.y * tileSize;

      let tileFeatures = M.mapMlFeatures(markup, {
        projection: this._map.options.projection,
        static: false,
        interactive: false,
      });

      for(let groupID in tileFeatures._layers){
        for(let featureID in tileFeatures._layers[groupID]._layers){
          let layer = tileFeatures._layers[groupID]._layers[featureID];
          M.FeatureRenderer.prototype._initPath(layer, false);
          layer._project(this._map, L.point([xOffset, yOffset]), coords.z);
          M.FeatureRenderer.prototype._addPath(layer, g, false);
          M.FeatureRenderer.prototype._updateFeature(layer);
        }
      }
      svg.setAttribute('width', tileSize.toString());
      svg.setAttribute('height', tileSize.toString());
      svg.appendChild(g);
      tile.appendChild(svg);
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
            select = (inputs[i].tagName.toLowerCase() === "map-select"),
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
              if (!isNaN(Number.parseFloat(min))) {
                col.min = Number.parseFloat(min);
              }
              if (!isNaN(Number.parseFloat(max))) {
                col.max = Number.parseFloat(max);
              }
              break;
            case("row"):
              row = {
                name: name,
                min: crs.crs.tilematrix.vertical.min,
                max:  crs.crs.tilematrix.vertical.max(crs.resolutions.length-1)
              };
              if (!isNaN(Number.parseFloat(min))) {
                row.min = Number.parseFloat(min);
              }
              if (!isNaN(Number.parseFloat(max))) {
                row.max = Number.parseFloat(max);
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
        } else if (type && type.toLowerCase() === "zoom") {
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
          tileSize = this.options.crs.options.crs.tile.bounds.max.x,
          scale = L.bind(this.options.crs.scale, this.options.crs),
      tilematrix2pcrs = function (c,zoom) {
        return transformation.untransform(c.multiplyBy(tileSize),scale(zoom));
      },
      pcrs2tilematrix = function(c,zoom) {
        return transformation.transform(c, scale(zoom)).divideBy(tileSize).floor();
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
          
          template.pcrs.bounds =  M.boundsToPCRSBounds(
                      L.bounds(L.point([col.min,row.min]),
                      L.point([col.max,row.max])),
                      zoom.value, this.options.crs, M.axisToCS("column"));
          
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