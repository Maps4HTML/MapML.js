/* 
 * Copyright 2015-2016 Canada Centre for Mapping and Earth Observation, 
 * Earth Sciences Sector, Natural Resources Canada.
 * 
 * License
 * 
 * By obtaining and/or copying this work, you (the licensee) agree that you have 
 * read, understood, and will comply with the following terms and conditions.
 * 
 * Permission to copy, modify, and distribute this work, with or without 
 * modification, for any purpose and without fee or royalty is hereby granted, 
 * provided that you include the following on ALL copies of the work or portions 
 * thereof, including modifications:
 * 
 * The full text of this NOTICE in a location viewable to users of the 
 * redistributed or derivative work.
 * 
 * Any pre-existing intellectual property disclaimers, notices, or terms and 
 * conditions. If none exist, the W3C Software and Document Short Notice should 
 * be included.
 * 
 * Notice of any changes or modifications, through a copyright statement on the 
 * new code or document such as "This software or document includes material 
 * copied from or derived from [title and URI of the W3C document]. 
 * Copyright © [YEAR] W3C® (MIT, ERCIM, Keio, Beihang)."
 * 
 * Disclaimers
 * 
 * THIS WORK IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS 
 * OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF 
 * MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE 
 * SOFTWARE OR DOCUMENT WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, 
 * TRADEMARKS OR OTHER RIGHTS.
 * COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR 
 * CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENT.
 * 
 * The name and trademarks of copyright holders may NOT be used in advertising or 
 * publicity pertaining to the work without specific, written prior permission. 
 * Title to copyright in this work will at all times remain with copyright holders.
 */
;/* 
 * Copyright 2015-2016 Canada Centre for Mapping and Earth Observation, 
 * Earth Sciences Sector, Natural Resources Canada.
 * 
 * License
 * 
 * By obtaining and/or copying this work, you (the licensee) agree that you have 
 * read, understood, and will comply with the following terms and conditions.
 * 
 * Permission to copy, modify, and distribute this work, with or without 
 * modification, for any purpose and without fee or royalty is hereby granted, 
 * provided that you include the following on ALL copies of the work or portions 
 * thereof, including modifications:
 * 
 * The full text of this NOTICE in a location viewable to users of the 
 * redistributed or derivative work.
 * 
 * Any pre-existing intellectual property disclaimers, notices, or terms and 
 * conditions. If none exist, the W3C Software and Document Short Notice should 
 * be included.
 * 
 * Notice of any changes or modifications, through a copyright statement on the 
 * new code or document such as "This software or document includes material 
 * copied from or derived from [title and URI of the W3C document]. 
 * Copyright © [YEAR] W3C® (MIT, ERCIM, Keio, Beihang)."
 * 
 * Disclaimers
 * 
 * THIS WORK IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS 
 * OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF 
 * MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE 
 * SOFTWARE OR DOCUMENT WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, 
 * TRADEMARKS OR OTHER RIGHTS.
 * COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR 
 * CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENT.
 * 
 * The name and trademarks of copyright holders may NOT be used in advertising or 
 * publicity pertaining to the work without specific, written prior permission. 
 * Title to copyright in this work will at all times remain with copyright holders.
 */
/* global L, Node */
(function (window, document, undefined) {
  
var M = {};
window.M = M;

(function () {
    M.mime = "text/mapml";
    M.CBMTILE = new L.Proj.CRS('EPSG:3978',
  '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
  {
    origin: [-34655800, 39310000],
    bounds: L.bounds([[-7786476.885838887,-5153821.09213678],[7148753.233541353,7928343.534071138]]),
    resolutions: [
      38364.660062653464, 
      22489.62831258996, 
      13229.193125052918, 
      7937.5158750317505, 
      4630.2175937685215, 
      2645.8386250105837,
      1587.5031750063501,
      926.0435187537042, 
      529.1677250021168, 
      317.50063500127004, 
      185.20870375074085, 
      111.12522225044451, 
      66.1459656252646, 
      38.36466006265346, 
      22.48962831258996,
      13.229193125052918,
      7.9375158750317505, 
      4.6302175937685215,
      2.6458386250105836,
      1.5875031750063502,
      0.92604351875370428,
      0.52916772500211673,
      0.31750063500127002,
      0.18520870375074083,
      0.11112522225044451,
      0.066145965625264591
    ]
  });
    M.APSTILE = new L.Proj.CRS('EPSG:5936',
  '+proj=stere +lat_0=90 +lat_ts=50 +lon_0=-150 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs',
  {
    origin: [-2.8567784109255E7, 3.2567784109255E7],
    bounds: L.bounds([[-28567784.109254867,-28567784.109254755],[32567784.109255023,32567784.10925506]]),
    resolutions: [
      238810.813354,
      119405.406677,
      59702.7033384999,
      29851.3516692501,
      14925.675834625,
      7462.83791731252,
      3731.41895865639,
      1865.70947932806,
      932.854739664032,
      466.427369832148,
      233.213684916074,
      116.606842458037,
      58.3034212288862,
      29.1517106145754,
      14.5758553072877,
      7.28792765351156,
      3.64396382688807,
      1.82198191331174,
      0.910990956788164,
      0.45549547826179
    ]
  });
    M.OSMTILE = L.CRS.EPSG3857;
    L.setOptions(M.OSMTILE,
      { 
        origin: [M.OSMTILE.projection.bounds.min.x, M.OSMTILE.projection.bounds.max.y],
        bounds: M.OSMTILE.projection.bounds,
        axes: {
          tcrs: {
            x: {
              name: "x",
              min: 0, 
              max: function (zoom) {
                return M.OSMTILE.getProjectedBounds(zoom).max.x;
              }
            },
            y: {
              name: "y",
              min:0, 
              max: function (zoom) {
                return M.OSMTILE.getProjectedBounds(zoom).max.y;
              }
            },
            z: {
              name: "z", // zoom
              min: 0,
              get max() {
                return M.OSMTILE.options.resolutions.length;
              }
            }
          },
          pcrs: {
            easting: {
              name: "easting",
              get min () { 
                return M.OSMTILE.options.bounds.min.x;
              },
              get max() {
                return M.OSMTILE.options.bounds.max.x;
              }}, 
            northing: {
              name: "northing", 
              get min () { 
                return M.OSMTILE.options.bounds.min.y; 
              },
              get max() { 
                return M.OSMTILE.options.bounds.max.y; 
              }}
          }, 
          gcrs: {
            longitude: {
              name: "longitude",
              get min() {
                // TODO should unproject bounds to be DRY
                return M.OSMTILE.unproject(M.OSMTILE.projection.bounds.min).lng;
              },
              get max() {
                // TODO sTODO should unproject bounds to be DRY
                return M.OSMTILE.unproject(M.OSMTILE.projection.bounds.max).lng;
              }
            }, 
            latitude: {
              name: "latitude",
              get min() {
                // TODO TODO should unproject bounds to be DRY
                return M.OSMTILE.unproject(M.OSMTILE.projection.bounds.min).lat;
              },
              get max() {
                // TODO TODO should unproject bounds to be DRY
                return M.OSMTILE.unproject(M.OSMTILE.projection.bounds.max).lat;
              }
            }
          },
          map: {
            i: {
              name: "i"
            },
            j: {
              name: "j"
            }
          },
          tilematrix: {
            column: {
              name: "column",
              min: 0, // for other tcrs might not be 0 e.g. CBMTILE
              max: function (zoom) {
                return M.OSMTILE.getProjectedBounds(zoom).max.x / 256;
              }
            },
            row: {
              name: "row",
              min: 0,
              max: function (zoom) {
                return M.OSMTILE.getProjectedBounds(zoom).max.y / 256;
              }
            }
          }
        },
        resolutions: [
          156543.0339,
          78271.51695,
          39135.758475,
          19567.8792375,
          9783.93961875,
          4891.969809375,
          2445.9849046875,
          1222.9924523438,
          611.49622617188,
          305.74811308594,
          152.87405654297,
          76.437028271484,
          38.218514135742,
          19.109257067871,
          9.5546285339355,
          4.7773142669678,
          2.3886571334839,
          1.1943285667419,
          0.59716428337097,
          0.29858214168549,
          0.14929107084274,
          0.074645535421371,
          0.03732276771068573,
          0.018661383855342865,
          0.009330691927671432495
        ]
      });
}());
M.getBounds = function (extent) {
      // TODO re-think the whole use of service bounds for disabling layers.
      // bounds for the extent are used to 'disable' the layer in the layer control
      // when the map extent does not intersect the calculated or default bounds 
      // assigned to the layer or the map zoom does not fall in the zoom range
      // of the service
      var units = (extent.hasAttribute("units") && extent.getAttribute("units") !== "") ? extent.getAttribute("units").toUpperCase() : "OSMTILE",
          crs = M[units],
          // need to decide what to do when zoom doesn't exist/ is empty
          zoom = extent.querySelector("input[type=zoom]") ? extent.querySelector("input[type=zoom]").getAttribute("value"): null;
      if (!zoom) { console.log("No zoom found"); return; }
      if (crs === undefined) { console.log("No matching TCRS found for: "+units); return; }
      return crs.options.bounds;
      
      // for each pair of input[@type=location][@units][@axis is one of orthogonal-axes-corresponding-to-@units-cs] 
      // x,easting,longitude,column
      // y,northing,latitude,row

//      var minXselector = 'input[type=location i][axis=x i][min],input[type=location i][axis=easting i][min],input[type=location i][axis=longitude i][min],input[type=location i][axis=column i][min]',
//          minYselector = 'input[type=location i][axis=y i][min],input[type=location i][axis=northing i][min],input[type=location i][axis=latitude i][min],input[type=location i][axis=row i][min]',
//          maxXselector = 'input[type=location i][axis=x i][max],input[type=location i][axis=easting i][max],input[type=location i][axis=longitude i][max],input[type=location i][axis=column i][max]',
//          maxYselector = 'input[type=location i][axis=y i][max],input[type=location i][axis=northing i][max],input[type=location i][axis=latitude i][max],input[type=location i][axis=row i][max]';
//
//
//
//      var inputs = extent.querySelectorAll('minXselector');
//      if (inputs) {
//        for (var i=0;i<inputs.length;i++) {
//          var axis = inputs[i].getAttribute("axis").toLowerCase(), yinputs;
//          switch (axis) {
//            case 'x':
//              yinputs = extent.querySelectorAll('input[type=location i][axis=y i][min]');
//              // use the minimum y value from yinputs@min >= crs.options.axes.tcrs.y.min as y value
//              // use inputs[i]@min > crs.options.axes.tcrs.x.min ? inputs[i]@min : crs.options.axes.tcrs.x.min as x value
//              // create a  L.point from the x,y above
//              break;
//            case 'easting':
//              yinputs = extent.querySelectorAll('input[type=location i][axis=northing i][min]');
//              // use the minimum y value from yinputs@min >= crs.options.axes.pcrs.northing.min as y value
//              // use inputs[i]@min > crs.options.axes.pcrs.easting.min ? inputs[i]@min : crs.options.axes.pcrs.easting.min as x value
//              // create a point from the easting, northing above
//              // transform the pcrs to a tcrs point at the current zoom
//              break;
//            case 'longitude':
//              yinputs = extent.querySelectorAll('input[type=location i][axis=latitude i][min]');
//              // use the minimum y value from yinputs@min >= crs.options.axes.gcrs.latitude.min as y value
//              // use inputs[i]@min > crs.options.axes.gcrs.longitude.min ? inputs[i]@min : crs.options.axes.gcrs.longitude.min as x value
//              // create a point from the lat, long above
//              // project to a pcrs point, if there is a pcrs (i.e. not a WGS84 extent)
//              // 
//            case 'column':
//            default:
//          }
//        }
//      }
//      return L.bounds([[0,0],[0,0]]);
};
M.Util = {
  coordsToArray: function(containerPoints) {
    // returns an array of arrays of coordinate pairs coordsToArray("1,2,3,4") -> [[1,2],[3,4]]
    for (var i=1, pairs = [], coords = containerPoints.split(",");i<coords.length;i+=2) {
      pairs.push([parseInt(coords[i-1]),parseInt(coords[i])]);
    }
    return pairs;
  }
};
M.coordsToArray = M.Util.coordsToArray;
M.MapMLLayer = L.Layer.extend({
    // zIndex has to be set, for the case where the layer is added to the
    // map before the layercontrol is used to control it (where autoZindex is used)
    // e.g. in the raw MapML-Leaflet-Client index.html page.
    options: {
        maxNext: 10,
        zIndex: 0,
        maxZoom: 25
    },
    // initialize is executed before the layer is added to a map
    initialize: function (href, content, options) {
        // in the custom element, the attribute is actually 'src'
        // the _href version is the URL received from layer-@src
        if (href) {
            this._href = href;
        }
        var mapml = content.querySelector('image,feature,tile,extent') ? true : false;
        if (mapml) {
            this._content = content;
        }
        this._container = L.DomUtil.create('div', 'leaflet-layer');
        L.DomUtil.addClass(this._container,'mapml-layer');
        this._imageContainer = L.DomUtil.create('div', 'leaflet-layer', this._container);
        L.DomUtil.addClass(this._imageContainer,'mapml-image-container');
        
        // this layer 'owns' a mapmlTileLayer, which is a subclass of L.GridLayer
        // it 'passes' what tiles to load via the content of this._mapmlTileContainer
        this._mapmlTileContainer = L.DomUtil.create('div', 'mapml-tile-container', this._container);
        // hit the service to determine what its extent might be
        // OR use the extent of the content provided
        this._initCount = 0;
        this._initExtent(mapml ? content : null);
        
        // a default extent can't be correctly set without the map to provide
        // its bounds , projection, zoom range etc, so if that stuff's not
        // established by metadata in the content, we should use map properties
        // to set the extent, but the map won't be available until the <layer>
        // element is attached to the <map> element, wait for that to happen.
        this.on('attached', this._validateExtent, this );
        L.setOptions(this, options);
    },
    setZIndex: function (zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();

        return this;
    },
    _updateZIndex: function () {
        if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    _changeOpacity: function(e) {
      if (e && e.target && e.target.value >=0 && e.target.value <= 1.0) {
        this.changeOpacity(e.target.value);
      }
    },
    changeOpacity: function(opacity) {
        this._container.style.opacity = opacity;
    },
    _detectImagePath: function (container) {
      // this relies on the CSS style leaflet-default-icon-path containing a 
      // relative url() that leads to a valid icon file.  Since that depends on
      // how all of this stuff is deployed (i.e. custom element or as leaflet-plugin)
      // also, because we're using 'shady DOM' api, the container must be 
      // a shady dom container, because the custom element tags it with added
      // style-scope ... and related classes.
     var el = L.DomUtil.create('div',  'leaflet-default-icon-path', container);
     var path = L.DomUtil.getStyle(el, 'background-image') ||
                L.DomUtil.getStyle(el, 'backgroundImage');	// IE8

     Polymer.dom(container).removeChild(el);

     if (path === null || path.indexOf('url') !== 0) {
      path = '';
     } else {
      path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
     }

     return path;
    },
    onAdd: function (map) {
        this._map = map;
        if (!this._mapmlvectors) {
          this._mapmlvectors = M.mapMlFeatures(this._content, {
              // pass the vector layer a renderer of its own, otherwise leaflet
              // puts everything into the overlayPane
              renderer: L.svg(),
              // pass the vector layer the container for the parent into which
              // it will append its own container for rendering into
              pane: this._container,
              opacity: this.options.opacity,
              imagePath: this._detectImagePath(this._map.getContainer()),
              onEachFeature: function(properties, geometry) {
                // need to parse as HTML to preserve semantics and styles
                var c = document.createElement('div');
                c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                geometry.bindPopup(c, {autoPan:false});
              }
            });
        }
        map.addLayer(this._mapmlvectors);
        
        if (!this._imageLayer) {
            this._imageLayer = L.layerGroup();
        }
        map.addLayer(this._imageLayer);
        // the layer._imageContainer property contains an element in which
        // content will be maintained
        
        if (!this._tileLayer) {
          this._tileLayer = M.mapMLTileLayer(this.href?this.href:this._href, {pane: this._container});
        }
        this._tileLayer._mapmlTileContainer = this._mapmlTileContainer;
        map.addLayer(this._tileLayer);       
        this._tileLayer._container.appendChild(this._mapmlTileContainer);
        // if the extent has been initialized and received, update the map,
        /* TODO establish the minZoom, maxZoom for the _tileLayer based on
         * info received from mapml server. */
        if (this._extent) {
            if (this._templateVars) {
              this._templatedLayer = M.templatedLayer(this._templateVars, {pane: this._container,imagePath: this._detectImagePath(this._map.getContainer())}).addTo(map);
            }
        } else {
            this.once('extentload', function() {
                if (this._templateVars) {
                  this._templatedLayer = M.templatedLayer(this._templateVars, {pane: this._container,imagePath: this._detectImagePath(this._map.getContainer())}).addTo(map);
                }
              }, this);
            // if we get to this point and there is no this._extent, it means
            // we're waiting for the server to return one -> get content when
            // that is available.
            this.once('extentload', this._onMoveEnd, this);
        }
        this.setZIndex(this.options.zIndex);
        Polymer.dom(this.getPane()).appendChild(this._container);
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    getEvents: function () {
        return {
            moveend: this._onMoveEnd,
            zoomanim: this._onZoomAnim
        };
    },
    redraw: function() {
      // for now, only redraw templated layers.
        if (this._templatedLayer) {
          this._templatedLayer.redraw();
        }
    },
    _onZoomAnim: function(e) {
      var toZoom = e.zoom,
          zoom = this._extent.querySelector("input[type=zoom]"),
          min = zoom && zoom.hasAttribute("min") ? parseInt(zoom.getAttribute("min")) : this._map.getMinZoom(),
          max =  zoom && zoom.hasAttribute("max") ? parseInt(zoom.getAttribute("max")) : this._map.getMaxZoom(),
          canZoom = (toZoom < min && this._extent.zoomout) || (toZoom > max && this._extent.zoomin);
      if (!this._extent.hasAttribute('action') && !(min <= toZoom && toZoom <= max)){
        if (this._extent.zoomin && toZoom > max) {
          // this._href is the 'original' url from which this layer came
          // since we are following a zoom link we will be getting a new
          // layer almost, resetting child content as appropriate
          this._href = this._extent.zoomin;
          // this.href is the "public" property. When a dynamic layer is
          // accessed, this value changes with every new extent received
          this.href = this._extent.zoomin;
        } else if (this._extent.zoomout && toZoom < min) {
          this._href = this._extent.zoomout;
          this.href = this._extent.zoomout;
        }
      }
      if (this._templatedLayer && canZoom ) {
        // get the new extent
        this._initExtent();
      }
    },
    onRemove: function (map) {
        L.DomUtil.remove(this._container);      
        map.removeLayer(this._mapmlvectors);
        map.removeLayer(this._tileLayer);
        map.removeLayer(this._imageLayer);
        if (this._templatedLayer) {
            map.removeLayer(this._templatedLayer);
        }
    },
    getZoomBounds: function () {
        var ext = this._extent;
        var zoom = ext ? ext.querySelector('[type=zoom]') : undefined,
            min = zoom && zoom.hasAttribute('min') ? zoom.getAttribute('min') : this._map.getMinZoom(),
            max = zoom && zoom.hasAttribute('max') ? zoom.getAttribute('max') : this._map.getMaxZoom();
        var bounds = {};
        bounds.min = Math.min(min,max);
        bounds.max = Math.max(min,max);
        return bounds;
    },
    _transformDeprectatedInput: function (i) {
      var type = i.getAttribute("type").toLowerCase();
      if (type === "xmin" || type === "ymin" || type === "xmax" || type === "ymax") {
        i.setAttribute("type", "location");
        i.setAttribute("units","tcrs");
        switch (type) {
          case "xmin":
            i.setAttribute("axis","x");
            i.setAttribute("position","top-left");
            break;
          case "ymin":
            i.setAttribute("axis","y");
            i.setAttribute("position","top-left");
            break;
          case "xmax":
            i.setAttribute("axis","x");
            i.setAttribute("position","bottom-right");
            break;
          case "ymax":
            i.setAttribute("axis","y");
            i.setAttribute("position","bottom-right");
            break;
        }
      } 
    },
    _setUpInputVars: function(inputs) {
      // process the inputs and create an object named "extent"
      // with member properties as follows:
      // {width: {name: 'widthvarname'}, // value supplied by map if necessary
      //  height: {name: 'heightvarname'}, // value supplied by map if necessary
      //  left: {name: 'leftvarname', axis: 'leftaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  right: {name: 'rightvarname', axis: 'rightaxisname'}, // axis name (coordinate system of) drives the value supplied by the map
      //  top: {name: 'topvarname', axis: 'topaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  bottom: {name: 'bottomvarname', axis: 'bottomaxisname'} // axis name drives (coordinate system of) the value supplied by the map
      //  zoom: {name: 'zoomvarname'}
      //  hidden: [{name: name, value: value}]}

      var extentVarNames = {extent:{}};
      extentVarNames.extent.hidden = [];
      for (var i=0;i<inputs.length;i++) {
        // this can be removed when the spec removes the deprecated inputs...
        this._transformDeprectatedInput(inputs[i]);
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            value = inputs[i].getAttribute("value");
        if (type === "width") {
              extentVarNames.extent.width = {name: name};
        } else if ( type === "height") {
              extentVarNames.extent.height = {name: name};
        } else if (type === "zoom") {
              extentVarNames.extent.zoom = {name: name};
        } else if (type === "location" && (units === "pcrs" || units ==="gcrs" || units === "tcrs")) {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting"/>
          switch (axis) {
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  extentVarNames.extent.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  extentVarNames.extent.bottom = { name: name, axis: axis};
                }
              }
              break;
            case ('x'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('y'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  extentVarNames.extent.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  extentVarNames.extent.bottom = { name: name, axis: axis};
                }
              }
              break;
            case ('longitude'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('latitude'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  extentVarNames.extent.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  extentVarNames.extent.bottom = { name: name, axis: axis};
                }
              }
              break;
          }
          // projection is deprecated, make it hidden
        } else if (type === "hidden" || type === "projection") {
            extentVarNames.extent.hidden.push({name: name, value: value});
        }
      }
      return extentVarNames;
    },
    // retrieve the (projected, scaled) layer extent for the current map zoom level
    getLayerExtentBounds: function(map) {
        
        if (!this._extent) return;
        var zoom = map.getZoom(), projection = map.options.projection,
            ep = this._extent.getAttribute("units"),
            projecting = (projection !== ep),
            p;
        
        var xmin,ymin,xmax,ymax,v1,v2,extentZoomValue;
        
        // todo: create an array of min values, converted to tcrs units
        // take the Math.min of all of them.
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('min');
        xmin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('max');
        xmax = Math.max(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('min');
        ymin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('max');
        ymax = Math.max(v1,v2);
        // WGS84 can be converted to Tiled CRS units
        if (projecting) {
            //project and scale to M[projection] from WGS84
            p = M[projection];
            var corners = [
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom),
              p.latLngToPoint(L.latLng([ymax,xmax]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmax]),zoom)
            ];
            return L.bounds(corners);
        } else {
            // if the zoom level of the extent does not match that of the map
            extentZoomValue = parseInt(this._extent.querySelector('[type=zoom]').getAttribute('value'));
            if (extentZoomValue !== zoom) {
                // convert the extent bounds to corresponding bounds at the current map zoom
                p = M[projection];
                return L.bounds(
                    p.latLngToPoint(p.pointToLatLng(L.point(xmin,ymin),extentZoomValue),zoom),
                    p.latLngToPoint(p.pointToLatLng(L.point(xmax,ymax),extentZoomValue),zoom));
            } else {
                // the extent's zoom value === map.getZoom(), return the bounds
                return L.bounds(L.point(xmin,ymin), L.point(xmax,ymax));
            }
        }
    },
    getAttribution: function () {
        return this.options.attribution;
    },
    getLayerUserControlsHTML: function () {
      var label = document.createElement('label'),
        input = document.createElement('input'),
        name = document.createElement('span'),
        details = document.createElement('details'),
        summary = document.createElement('summary'),
        opacity = document.createElement('input'),
        opacityControl = document.createElement('details'),
        opacityControlSummary = document.createElement('summary');

        input.defaultChecked = this._map ? true: false;
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        name.draggable = true;

        if (this._legendUrl) {
          var legendLink = document.createElement('a');
          legendLink.text = ' ' + this._title;
          legendLink.href = this._legendUrl;
          legendLink.target = '_blank';
          name.appendChild(legendLink);
        } else {
          name.innerHTML = ' ' + this._title;
        }
        
        opacityControlSummary.innerText = 'opacity';
        opacityControl.appendChild(opacityControlSummary);
        opacityControl.appendChild(opacity);
        L.DomUtil.addClass(details, 'mapml-control-layers');
        L.DomUtil.addClass(opacityControl,'mapml-control-layers');
        opacity.setAttribute('type','range');
        opacity.setAttribute('min', '0');
        opacity.setAttribute('max','1.0');
        opacity.setAttribute('value', '1.0');
        opacity.setAttribute('step','0.1');

        L.DomEvent.on(opacity,'change', this._changeOpacity, this);
        L.DomEvent.on(name,'dragstart', function(event) {
            // will have to figure out how to drag and drop a whole element
            // with its contents in the case where the <layer->content</layer-> 
            // has no src but does have inline content.  
            // Should be do-able, I think.
            if (this._href) {
              event.dataTransfer.setData("text/uri-list",this._href);
              // Why use a second .setData("text/plain"...) ? This is very important:
              // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#link
              event.dataTransfer.setData("text/plain", this._href); 
            }
          }, this);

        Polymer.dom(details).appendChild(summary);
        Polymer.dom(label).appendChild(details);
        Polymer.dom(summary).appendChild(input);
        Polymer.dom(summary).appendChild(name);
        Polymer.dom(details).appendChild(opacityControl);

        if (this._styles) {
          Polymer.dom(details).appendChild(this._styles);
        }
        if (this._userInputs) {
          var frag = document.createDocumentFragment();
          var templates = this._templateVars;
          if (templates) {
            for (var i=0;i<templates.length;i++) {
              var template = templates[i];
              for (var j=0;j<template.values.length;j++) {
                var mapmlInput = template.values[j],
                    id = '#'+mapmlInput.getAttribute('id');
                // don't add it again if it is referenced > once
                if (mapmlInput.tagName.toLowerCase() === 'select' && !frag.querySelector(id)) {
                  // generate a <details><summary></summary><input...></details>
                  var selectdetails = document.createElement('details'),
                      selectsummary = document.createElement('summary');
                      selectsummary.innerText = mapmlInput.getAttribute('name');
                      L.DomUtil.addClass(selectdetails, 'mapml-control-layers');
                      selectdetails.appendChild(selectsummary);
                      selectdetails.appendChild(mapmlInput.htmlselect);
                  frag.appendChild(selectdetails);
                }
              }
            }
          }
          Polymer.dom(details).appendChild(frag);
        }
        return label;
    },
    _initExtent: function(content) {
        if (!this._href && !content) {return;}
        var layer = this;
        // the this._href (comes from layer@src) should take precedence over 
        // content of the <layer> element, but if no this._href / src is provided
        // but there *is* child content of the <layer> element (which is copied/
        // referred to by this._content), we should use that content.
        if (this._href) {
            var xhr = new XMLHttpRequest();
//            xhr.withCredentials = true;
            _get(this._href, _processInitialExtent);
        } else if (content) {
            // may not set this._extent if it can't be done from the content
            // (eg a single point) and there's no map to provide a default yet
            _processInitialExtent(content);
        }
        function _get(url, fCallback  ) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              layer.error = true;
              layer.fire('extentload', layer, true);
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        }
        function _processInitialExtent(content) {
            var mapml = this.responseXML || content;
            if (this.readyState === this.DONE && mapml) {
                var serverExtent = mapml.querySelector('extent'),
                    projectionMatch = serverExtent && serverExtent.hasAttribute('units') && 
                    serverExtent.getAttribute('units').toUpperCase() === layer.options.projection,
                    selectedAlternate = !projectionMatch && mapml.querySelector('head link[rel=alternate][projection='+layer.options.projection+']'),
                    base = (new URI(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : null || this.responseURL)).resolve(new URI(this.responseURL));
                
                if (!serverExtent) {
                    serverExtent = layer._synthesizeExtent(mapml);
                    // the mapml resource does not have a (complete) extent form, save
                    // its content if any so we don't have to revisit the server, ever.
                    if (mapml.querySelector('feature,image,tile')) {
                        layer._content = mapml;
                    }
                } else if (!projectionMatch && selectedAlternate && selectedAlternate.hasAttribute('href')) {
                     
                    layer.fire('changeprojection', {href:  new URI(selectedAlternate.getAttribute('href')).resolve(base).toString()}, false);
                    return;
                } else if (!serverExtent.hasAttribute("action") && 
                        serverExtent.querySelector('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]') &&
                        serverExtent.hasAttribute("units")) {
                  layer._templateVars = [];
                  // set up the URL template and associated inputs (which yield variable values when processed)
                  var tlist = serverExtent.querySelectorAll('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]'),
                      varNamesRe = (new RegExp('(?:\{)(.*?)(?:\})','g'));
                  for (var i=0;i< tlist.length;i++) {
                    var t = tlist[i],
                        template = t.getAttribute('tref'), v,
                        title = t.hasAttribute('title') ? t.getAttribute('title') : 'Query this layer',
                        vcount=template.match(varNamesRe),
                        ttype = (!t.hasAttribute('rel') || t.getAttribute('rel').toLowerCase() === 'tile') ? 'tile' : t.getAttribute('rel').toLowerCase(),
                        inputs = [];
                    while ((v = varNamesRe.exec(template)) !== null) {
                      var varName = v[1],
                      inp = serverExtent.querySelector('input[name='+varName+'],select[name='+varName+']');
                      if (inp) {
                        inputs.push(inp);
                        if (inp.hasAttribute('shard')) {
                          var id = inp.getAttribute('list');
                          inp.servers = [];
                          var servers = serverExtent.querySelectorAll('datalist#'+id + ' > option');
                          if (servers.length === 0 && inp.hasAttribute('value')) {
                            servers = inp.getAttribute('value').split('');
                          }
                          for (var s=0;s < servers.length;s++) {
                            if (servers[s].getAttribute) {
                              inp.servers.push(servers[s].getAttribute('value'));
                            } else {
                              inp.servers.push(servers[s]);
                            }
                          }
                        } else if (inp.tagName.toLowerCase() === 'select') {
                          // use a throwaway div to parse the input from MapML into HTML
                          var div =document.createElement("div");
                          div.insertAdjacentHTML("afterbegin",inp.outerHTML);
                          // parse
                          inp.htmlselect = div.querySelector("select");
                          // this goes into the layer control, so add a listener
                          L.DomEvent.on(inp.htmlselect, 'change', layer.redraw, layer);
                          if (!layer._userInputs) {
                            layer._userInputs = [];
                          }
                          layer._userInputs.push(inp.htmlselect);
                        }
                        // TODO: if this is an input@type=location 
                        // get the TCRS min,max attribute values at the identified zoom level 
                        // save this information as properties of the serverExtent,
                        // perhaps as a bounds object so that it can be easily used
                        // later by the layer control to determine when to enable
                        // disable the layer for drawing.
                      } else {
                        console.log('input with name='+varName+' not found for template variable of same name');
                        // no match found, template won't be used
                        break;
                      }
                    }
                    if (template && vcount.length === inputs.length) {
                      // template has a matching input for every variable reference {varref}
                      layer._templateVars.push({template:template, title:title, type: ttype, values: inputs});
                    }
                  }
                }
                layer._parseLicenseAndLegend(mapml, layer);
                layer._extent = serverExtent;
                
                
                var zoomin = mapml.querySelector('link[rel=zoomin]'),
                    zoomout = mapml.querySelector('link[rel=zoomout]');
                delete layer._extent.zoomin;
                delete layer._extent.zoomout;
                if (zoomin) {
                    layer._extent.zoomin = new URI(zoomin.getAttribute('href')).resolve(base).toString();
                }
                if (zoomout) {
                    layer._extent.zoomout = new URI(zoomout.getAttribute('href')).resolve(base).toString();
                }
                if (layer._templatedLayer) {
                  layer._templatedLayer.reset(layer._templateVars);
                }
                var styleLinks = mapml.querySelectorAll('link[rel=style],link[rel="self style"],link[rel="style self"]');
                if (styleLinks.length > 1) {
                  var stylesControl = document.createElement('details'),
                  stylesControlSummary = document.createElement('summary');
                  stylesControlSummary.innerText = 'style';
                  stylesControl.appendChild(stylesControlSummary);
                  var changeStyle = function (e) {
                      layer.fire('changestyle', {src: e.target.getAttribute("data-href")}, false);
                  };

                  for (var j=0;j<styleLinks.length;j++) {
                    var styleOption = document.createElement('span'),
                    styleOptionInput = styleOption.appendChild(document.createElement('input'));
                    styleOptionInput.setAttribute("type", "radio");
                    styleOptionInput.setAttribute("id", "rad"+j);
                    styleOptionInput.setAttribute("name", "styles");
                    styleOptionInput.setAttribute("value", styleLinks[j].getAttribute('title'));
                    styleOptionInput.setAttribute("data-href", new URI(styleLinks[j].getAttribute('href')).resolve(base).toString());
                    var styleOptionLabel = styleOption.appendChild(document.createElement('label'));
                    styleOptionLabel.setAttribute("for", "rad"+j);
                    styleOptionLabel.innerText = styleLinks[j].getAttribute('title');
                    if (styleLinks[j].getAttribute("rel") === "style self" || styleLinks[j].getAttribute("rel") === "self style") {
                      styleOptionInput.checked = true;
                    }
                    stylesControl.appendChild(styleOption);
                    L.DomUtil.addClass(stylesControl,'mapml-control-layers');
                    L.DomEvent.on(styleOptionInput,'click', changeStyle, layer);
                  }
                  layer._styles = stylesControl;
                }
                
                if (mapml.querySelector('title')) {
                  layer._title = mapml.querySelector('title').textContent.trim();
                } else if (mapml.hasAttribute('label')) {
                  layer._title = mapml.getAttribute('label').trim();
                }
                if (layer._map) {
                    layer._validateExtent();
                    // if the layer is checked in the layer control, force the addition
                    // of the attribution just received
                    if (layer._map.hasLayer(layer)) {
                        layer._map.attributionControl.addAttribution(layer.getAttribution());
                    }
                    //layer._map.fire('moveend', layer);
                }
            } else {
                layer.error = true;
            }
            layer.fire('extentload', layer, false);
        }
    },
    _getMapML: function(url) {
        var layer = this;
        if (url) {
            var requestCounter = 0;
            var xhr = new XMLHttpRequest();
//            xhr.withCredentials = true;
            // add a listener to terminate pulling the feed 
            this._map.once('movestart', function() {
              xhr.abort();
            });
            _pull(url, _processMapMLFeedResponse);
        } else if (this._content) {
            _processMapMLFeedResponse(this._content);
        }
        function _pull(url, fCallback) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              console.error(this.statusText); 
              layer.error = true;
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime+";projection="+layer.options.projection+";zoom="+layer.zoom);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        }
        function _processMapMLFeedResponse(content) {
            var mapml = this.responseXML || content,
                i;
            if (mapml) {
              if (requestCounter === 0) {
                var serverExtent = mapml.querySelector('extent');
                if (!serverExtent) {
                    serverExtent = layer._synthesizeExtent(mapml);
                } else if (!serverExtent.hasAttribute("action") && 
                        serverExtent.querySelector('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]') &&
                        serverExtent.hasAttribute("units")) {
                  layer._templateVars = [];
                  // set up the URL template and associated inputs (which yield variable values when processed)
                  var tlist = serverExtent.querySelectorAll('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]'),
                      varNamesRe = (new RegExp('(?:\{)(.*?)(?:\})','g'));
                  for (i=0;i< tlist.length;i++) {
                    var t = tlist[i],
                        template = t.getAttribute('tref'), v,
                        vcount=template.match(varNamesRe),
                        ttype = (!t.hasAttribute('rel') || t.getAttribute('rel').toLowerCase() === 'tile') ? 'tile' : t.getAttribute('rel').toLowerCase(),
                        inputs = [];
                    while ((v = varNamesRe.exec(template)) !== null) {
                      var varName = v[1],
                      inp = serverExtent.querySelector('input[name='+varName+']');
                      if (inp) {
                        inputs.push(inp);
                      } else {
                        console.log('input with name='+varName+' not found for template variable of same name');
                        // no match found, template won't be used
                        break;
                      }
                    }
                    if (template && vcount.length === inputs.length) {
                      // template has a matching input for every variable reference {varref}
                      layer._templateVars.push({template:template, type: ttype, values: inputs});
                    }
                  }
                }
                layer._extent = serverExtent;
                layer._parseLicenseAndLegend(mapml, layer);
                var zoomin = mapml.querySelector('link[rel=zoomin]'),
                    zoomout = mapml.querySelector('link[rel=zoomout]'),
                    base = (new URI(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : null || this.responseURL)).resolve(new URI(this.responseURL));
                delete layer._extent.zoomin;
                delete layer._extent.zoomout;
                if (zoomin) {
                    layer._extent.zoomin = new URI(zoomin.getAttribute('href')).resolve(base).toString();
                }
                if (zoomout) {
                    layer._extent.zoomout = new URI(zoomout.getAttribute('href')).resolve(base).toString();
                }
                
              }
              if (mapml.querySelector('feature')) {
                  layer._mapmlvectors.addData(mapml);
              }
              if (mapml.querySelector('tile')) {
                  var tiles = document.createElement("tiles"),
                    zoom = mapml.querySelector('meta[name=zoom][content]') || mapml.querySelector('input[type=zoom][value]');
                  tiles.setAttribute("zoom", zoom.getAttribute('content') || zoom.getAttribute('value'));
                  var newTiles = mapml.getElementsByTagName('tile');
                  for (i=0;i<newTiles.length;i++) {
                      Polymer.dom(tiles).appendChild(document.importNode(newTiles[i], true));
                  }
                  layer._mapmlTileContainer.appendChild(tiles);
              }
              if (mapml.querySelector('image')) {
                  var images = mapml.getElementsByTagName('image'),
                      imageOverlays = [],
                      // need a reference to the _imageLayer container element to pass to children
                      // so they can append the img element they create to it.
                      container = layer._imageContainer;
                  for (i=0;i<images.length;i++) {
                      var image = images[i],
                          src = image.getAttribute('src'),
                          map = layer._map,
                          // TODO when the image location is returned by the MapML
                          // document image element, use that location instead
                          // of map.getPixelBounds().min.  Also, read and use the
                          // angle of the image from the mapml//image element
                          // Currently, map.getPixelBounds() usage assumes that
                          // the returned image fills the extent of the mapml document
                          location = map.getPixelBounds().min.subtract(map.getPixelOrigin()),
                          size = map.getSize();
                          imageOverlays[i] = M.imageOverlay(src,location,size,/* angle */0,container);
                  }
                  var layersToRemove = layer._imageLayer.getLayers(),
                      last = imageOverlays.length-1,
                      removeLayers = function () {
                      for (var ic = 0;ic < layersToRemove.length;ic++) {
                        layer._imageLayer.removeLayer(layersToRemove[ic]);
                      }
                  };
                  for (i=0;i < imageOverlays.length;i++) {
                    layer._imageLayer.addLayer(imageOverlays[i]);
                    if (i === last) {
                      imageOverlays[i].on('load', removeLayers);
                    }
                  }
              }
              var next = _parseLink('next',mapml);
              if (next && requestCounter < layer.options.maxNext) {
                  requestCounter++;
                  _pull(next, _processMapMLFeedResponse);
              } else {
                  if (layer._mapmlTileContainer.getElementsByTagName('tile').length > 0) {
                    layer._tileLayer._onMapMLProcessed();
                  }
                  layer.fire('extentload', layer, true);
              }
            }
        }
        function _parseLink(rel, xml) {
            // depends on js-uri http://code.google.com/p/js-uri/ 
            // would be greate to depend on the URL standard and not a library
            var baseEl = xml.querySelector('base'), 
                base =  baseEl ? baseEl.getAttribute('href'):null,
                baseUri = new URI(base||xml.baseURI),
                link = xml.querySelector('link[rel='+rel+']'),
                relLink = link?new URI(link.getAttribute('href')).resolve(baseUri):null;
            return relLink;
        }
    },
    _createExtent: function () {
    
        var extent = document.createElement('extent'),
            xminInput = document.createElement('input'),
            yminInput = document.createElement('input'),
            xmaxInput = document.createElement('input'),
            ymaxInput = document.createElement('input'),
            zoom = document.createElement('input'),
            projection = document.createElement('input');
    
        zoom.setAttribute('type','zoom');
        zoom.setAttribute('min','0');
        zoom.setAttribute('max','0');
        
        xminInput.setAttribute('type','xmin');
        xminInput.setAttribute('min','');
        xminInput.setAttribute('max','');
        
        yminInput.setAttribute('type','ymin');
        yminInput.setAttribute('min','');
        yminInput.setAttribute('max','');
        
        xmaxInput.setAttribute('type','xmax');
        xmaxInput.setAttribute('min','');
        xmaxInput.setAttribute('max','');

        ymaxInput.setAttribute('type','ymax');
        ymaxInput.setAttribute('min','');
        ymaxInput.setAttribute('max','');
        
        projection.setAttribute('type','projection');
        projection.setAttribute('value','WGS84');
        
        extent.setAttribute('action','synthetic');
        Polymer.dom(extent).appendChild(xminInput);
        Polymer.dom(extent).appendChild(yminInput);
        Polymer.dom(extent).appendChild(xmaxInput);
        Polymer.dom(extent).appendChild(ymaxInput);
        Polymer.dom(extent).appendChild(zoom);
        Polymer.dom(extent).appendChild(projection);

        return extent;
    },
    _validateExtent: function () {
      // TODO: change so that the _extent bounds are set based on inputs
        var serverExtent = this._extent;
        if (!serverExtent || !serverExtent.querySelector || !this._map) {
            return;
        }
        if (serverExtent.querySelector('[type=xmin][min=""], [type=xmin][max=""], [type=xmax][min=""], [type=xmax][max=""], [type=ymin][min=""], [type=ymin][max=""]')) {
            var xmin = serverExtent.querySelector('[type=xmin]'),
                ymin = serverExtent.querySelector('[type=ymin]'),
                xmax = serverExtent.querySelector('[type=xmax]'),
                ymax = serverExtent.querySelector('[type=ymax]'),
                proj = serverExtent.querySelector('[type=projection][value]'),
                bounds, projection;
            if (proj) {
                projection = proj.getAttribute('value');
                if (projection && projection === 'WGS84') {
                    bounds = this._map.getBounds();
                    xmin.setAttribute('min',bounds.getWest());
                    xmin.setAttribute('max',bounds.getEast());
                    ymin.setAttribute('min',bounds.getSouth());
                    ymin.setAttribute('max',bounds.getNorth());
                    xmax.setAttribute('min',bounds.getWest());
                    xmax.setAttribute('max',bounds.getEast());
                    ymax.setAttribute('min',bounds.getSouth());
                    ymax.setAttribute('max',bounds.getNorth());
                } else if (projection) {
                    // needs testing.  Also, this will likely be
                    // messing with a server-generated extent.
                    bounds = this._map.getPixelBounds();
                    xmin.setAttribute('min',bounds.getBottomLeft().x);
                    xmin.setAttribute('max',bounds.getTopRight().x);
                    ymin.setAttribute('min',bounds.getTopRight().y);
                    ymin.setAttribute('max',bounds.getBottomLeft().y);
                    xmax.setAttribute('min',bounds.getBottomLeft().x);
                    xmax.setAttribute('max',bounds.getTopRight().x);
                    ymax.setAttribute('min',bounds.getTopRight().y);
                    ymax.setAttribute('max',bounds.getBottomLeft().y);
                }
            } else {
                this.error = true;
            }

        }
        if (serverExtent.querySelector('[type=zoom][min=""], [type=zoom][max=""]')) {
            var zoom = serverExtent.querySelector('[type=zoom]');
            zoom.setAttribute('min',this._map.getMinZoom());
            zoom.setAttribute('max',this._map.getMaxZoom());
        }
    },
    _getMapMLExtent: function (bounds, zooms, proj) {
        
        var extent = this._createExtent(),
            zoom = extent.querySelector('input[type=zoom]'),
            xminInput = extent.querySelector('input[type=xmin]'),
            yminInput = extent.querySelector('input[type=ymin]'),
            xmaxInput = extent.querySelector('input[type=xmax]'),
            ymaxInput = extent.querySelector('input[type=ymax]'),
            projection = extent.querySelector('input[type=projection]'),
            zmin = zooms[0] !== undefined && zooms[1] !== undefined ? Math.min(zooms[0],zooms[1]) : '',
            zmax = zooms[0] !== undefined && zooms[1] !== undefined ? Math.max(zooms[0],zooms[1]) : '',
            xmin = bounds ? bounds._southWest ? bounds.getWest() : bounds.getBottomLeft().x : '',
            ymin = bounds ? bounds._southWest ? bounds.getSouth() : bounds.getTopRight().y : '',
            xmax = bounds ? bounds._southWest ? bounds.getEast() : bounds.getTopRight().x : '',
            ymax = bounds ? bounds._southWest ? bounds.getNorth() : bounds.getBottomLeft().y : '';
    
        zoom.setAttribute('min', typeof(zmin) === 'number' && isNaN(zmin)? '' : zmin);
        zoom.setAttribute('max', typeof(zmax) === 'number' && isNaN(zmax)? '' : zmax);
        
        xminInput.setAttribute('min',xmin);
        xminInput.setAttribute('max',xmax);
        
        yminInput.setAttribute('min',ymin);
        yminInput.setAttribute('max',ymax);
        
        xmaxInput.setAttribute('min',xmin);
        xmaxInput.setAttribute('max',xmax);

        ymaxInput.setAttribute('min',ymin);
        ymaxInput.setAttribute('max',ymax);
        
        projection.setAttribute('value',bounds && bounds._southWest && !proj ? 'WGS84' : proj);

        return extent;
    },
    _synthesizeExtent: function (mapml) {
        var metaZoom = mapml.querySelectorAll('meta[name=zoom]')[0],
            metaExtent = mapml.querySelector('meta[name=extent]'),
            metaProjection = mapml.querySelector('meta[name=projection]'),
            proj = metaProjection ? metaProjection.getAttribute('content'): 'WGS84',
            i,expressions,bounds,zmin,zmax,xmin,ymin,xmax,ymax,expr,lhs,rhs;
        if (metaZoom) {
            expressions = metaZoom.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'min') {
                zmin = parseInt(rhs);
              }
              if (lhs === 'max') {
                zmax = parseInt(rhs);
              }
            }
        }  
        if (metaExtent) {
            expressions = metaExtent.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'xmin') {
                xmin = parseFloat(rhs);
              }
              if (lhs === 'xmax') {
                xmax = parseFloat(rhs);
              }
              if (lhs === 'ymin') {
                ymin = parseFloat(rhs);
              }
              if (lhs === 'ymax') {
                ymax = parseFloat(rhs);
              }
            }
        }
        if (xmin && ymin && xmax && ymax && proj === 'WGS84') {
            var sw = L.latLng(ymin,xmin), ne = L.latLng(ymax,xmax);
            bounds = L.latLngBounds(sw,ne);
        } else if (xmin && ymin && xmax && ymax) {
            // needs testing
            bounds = L.bounds([[xmin,ymin],[xmax,ymax]]);
        }
        return this._getMapMLExtent(bounds, [zmin,zmax], proj);
    },
    // a layer must share a projection with the map so that all the layers can
    // be overlayed in one coordinate space.  WGS84 is a 'wildcard', sort of.
    getProjection: function () {
      // TODO review logic because input[type=projection] is deprecated
        if (!this._extent || !this._extent.querySelector('input[type=projection]')) return 'WGS84';
        var projection = this._extent.querySelector('input[type=projection]');
        if (!projection.getAttribute('value')) return 'WGS84';
        return projection.getAttribute('value');
    },
    _parseLicenseAndLegend: function (xml, layer) {
        var licenseLink =  xml.querySelector('link[rel=license]'), licenseTitle, licenseUrl, attText;
        if (licenseLink) {
            licenseTitle = licenseLink.getAttribute('title');
            licenseUrl = licenseLink.getAttribute('href');
            attText = '<a href="' + licenseUrl + '" title="'+licenseTitle+'">'+licenseTitle+'</a>';
        }
        L.setOptions(layer,{attribution:attText});
        var legendLink = xml.querySelector('link[rel=legend]');
        if (legendLink) {
          layer._legendUrl = legendLink.getAttribute('href');
        }
    },
    _onMoveEnd: function () {
        // this can only be done when the layer is on a map, because the url
        // calculation requires to process the extent of the map through the 
        // extent form that should have already been received.
        var url =  this._calculateUrl();
        if (url) {
            this.href = url;
            this.fire('loadstart');
            this._mapmlvectors.clearLayers();
            this._initEl();
            this._getMapML(url);
        } else if (this._content && !this._mapmlvectors.getLayers().length) {
            // if the content hasn't been parsed yet, parse it into vectors,
            // images and tiles, if applicable
            // 
            // this shouldn't only be contingent on vectors - could be other stuff
            // located in this._content that has been parsed, so it should be 
            // generalized to be: if (this._content && !vectors && !images && !tiles)
            // tiles could be = Object.keys($0._layer._tileLayer._tiles).length
            // images = not sure yet. NOT FINISHED.
            // vectors = this._mapmlvectors.getLayers().length
            this._getMapML(null);
        }
    },
    _initEl: function () {
        if (!this._mapmlTileContainer) {return;}
        var container = this._mapmlTileContainer;
        while (container.firstChild)
            container.removeChild(container.firstChild);
    },
    _reset: function() {
        this._initEl();
        L.empty(this._container);
        this._mapmlvectors.clearLayers();
        //this._map.removeLayer(this._mapmlvectors);
        return;
    },
    // return the LatLngBounds of the map unprojected such that the whole
    // map is covered, not just a band defined by the projected map bounds.
    _getUnprojectedMapLatLngBounds: function(map) {
      
        map = map||this._map; 
        var origin = map.getPixelOrigin(),
          bounds = map.getPixelBounds(),
          nw = map.unproject(origin),
          sw = map.unproject(bounds.getBottomLeft()),
          ne = map.unproject(bounds.getTopRight()),
          se = map.unproject(origin.add(map.getSize()));
        return L.latLngBounds(sw,ne).extend(se).extend(nw);
    },
    _calculateUrl: function() {
        
        if (!this._map) return null;
        if (!this._mapmlTileContainer && !this._extent) return this._href;
        var extent = this._extent;
        if (!extent) return this._href;
        // action SHOULD HAVE BEEN resolved against any base ALREADY
        var action = extent.getAttribute("action"),
                base = new URI(this._href);
        // establish the range of zoom values for the extent
        var zoom = extent.querySelectorAll("input[type=zoom]")[0];
        if ( !zoom ) return null;
        var min = parseInt(zoom.getAttribute("min")),
            max = parseInt(zoom.getAttribute("max")),
            values = {}, // the values object will contain the values for the URI template
            mapZoom = this._map.getZoom();
        // check that the zoom of the map is in the range of the zoom of the service
        if ( min <= mapZoom && mapZoom <= max) {
          values.zoom = mapZoom;
        } else if (!action){
          if (extent.zoomin && mapZoom > max) {
            this._href = extent.zoomin;
            this.href = extent.zoomin;
            return this.href;
          } else if (extent.zoomout && mapZoom < min) {
            this._href = extent.zoomout;
            this.href = extent.zoomout;
            return this.href;
          }
        } else {
          return null;
        }
        
        if (!action || action === "synthetic") return null;
        var b,projectionValue = extent.getAttribute('units');
        
        // if the mapml extent being processed is WGS84, we need to speak in those units
        if (projectionValue === 'WGS84') {
          b = this._getUnprojectedMapLatLngBounds();
        } else {
          // otherwise, use the bounds of the map
          b = this._map.getPixelBounds();
        }
        var varnames = this._setUpInputVars(extent.querySelectorAll('input'));
        
        var queryParams = "";
        values[varnames.extent.zoom.name] = mapZoom;
        queryParams += varnames.extent.zoom.name+"={"+varnames.extent.zoom.name+"}&";
        values[varnames.extent.left.name] = b.min?b.min.x:b.getWest();
        queryParams += varnames.extent.left.name+"={"+varnames.extent.left.name+"}&";
        values[varnames.extent.bottom.name] = b.max?b.max.y:b.getSouth();
        queryParams += varnames.extent.bottom.name+"={"+varnames.extent.bottom.name+"}&";
        values[varnames.extent.right.name] = b.max?b.max.x:b.getEast();
        queryParams += varnames.extent.right.name+"={"+varnames.extent.right.name+"}&";
        values[varnames.extent.top.name] = b.min?b.min.y:b.getNorth();
        queryParams += varnames.extent.top.name+"={"+varnames.extent.top.name+"}"+(varnames.extent.hidden.length>0?"&":"");
        for (var i=0;i<varnames.extent.hidden.length;i++) {
          values[varnames.extent.hidden[i].name] = varnames.extent.hidden[i].value;
          queryParams += varnames.extent.hidden[i].name+"={"+varnames.extent.hidden[i].name+"}"+(i<varnames.extent.hidden.length-1?"&":"");
        }
        
        action += "?"+queryParams;
        var rel = new URI(action).resolve(base).toString();
        return L.Util.template(rel, values);
    },
    // this takes into account that WGS84 is considered a wildcard match.
    _projectionMatches: function(map) {
        map = map||this._map;
        var projection = this.getProjection();
        if (!map.options.projection || projection !== 'WGS84' && map.options.projection !== projection) return false;
        return true;
    }
});
M.mapMLLayer = function (url, node, options) {
	return new M.MapMLLayer(url, node ? node : document.createElement('div'), options);
};
M.ImageOverlay = L.ImageOverlay.extend({
	initialize: function (url, location, size, angle, container, options) { // (String, Point, Point, Number, Element, Object)
                this._container = container;
		this._url = url;
                // instead of calculating where the image goes, put it at 0,0
		//this._location = L.point(location);
                // the location for WMS requests will be the upper left hand
                // corner of the map.  When the map is initialized, that is 0,0,
                // but as the user pans, of course the
		this._location = location;
                this._size = L.point(size);
                this._angle = angle;

		L.setOptions(this, options);
	},
        getEvents: function() {
		var events = {
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
        },
	onAdd: function () {
                this.on({ 
                  load: this._onImageLoad
                  });

		if (!this._image) {
                    this._initImage();
		}

		if (this.options.interactive) {
			L.DomUtil.addClass(this._image, 'leaflet-interactive');
			this.addInteractiveTarget(this._image);
		}

		Polymer.dom(this._container).appendChild(this._image);
		this._reset();
	},
	onRemove: function () {
		L.DomUtil.remove(this._image);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image);
		}
	},
        _onImageLoad: function () {
            if (!this._image) { return; }
            this._image.loaded =  +new Date();
            this._updateOpacity();
        },
	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    translate = this._map.getPixelOrigin().add(this._location).multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(e.center, e.zoom)).round();

		if (L.Browser.any3d) {
			L.DomUtil.setTransform(this._image, translate, scale);
		} else {
			L.DomUtil.setPosition(this._image, translate);
		}
	},
        _reset: function () {
		var image = this._image,
		    location = this._location,
                    size = this._size,
                    angle = 0.0;

                // TBD use the angle to establish the image rotation in CSS

		L.DomUtil.setPosition(image, location);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
        },
	_updateOpacity: function () {
		if (!this._map) { return; }

		//L.DomUtil.setOpacity(this._image, this.options.opacity);

		var now = +new Date(),
		    nextFrame = false;

                var image = this._image;

                var fade = Math.min(1, (now - image.loaded) / 200);

                L.DomUtil.setOpacity(image, fade);
                if (fade < 1) {
                        nextFrame = true;
                } 
		if (nextFrame) {
			L.Util.cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = L.Util.requestAnimFrame(this._updateOpacity, this);
		}
                L.DomUtil.addClass(image, 'leaflet-image-loaded');
	}
        
});
M.imageOverlay = function (url, location, size, angle, container, options) {
        return new M.ImageOverlay(url, location, size, angle, container, options);
};
M.TemplatedImageLayer =  L.Layer.extend({
    initialize: function(template, options) {
        this._template = template;
        this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
        L.DomUtil.addClass(this._container, 'mapml-image-container');
        L.setOptions(this, L.extend(options,this._setUpExtentTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._onMoveEnd
        };
        return events;
    },
    onAdd: function () {
        this.setZIndex(this.options.zIndex);
        this._onMoveEnd();
    },
    redraw: function() {
        this._onMoveEnd();
    },
    _onMoveEnd: function() {
      
      var map = this._map,
        loc = map.getPixelBounds().min.subtract(map.getPixelOrigin()),
        size = map.getSize(),
        src = this.getImageUrl(),
        overlayToRemove = this._imageOverlay;
        this._imageOverlay = M.imageOverlay(src,loc,size,0,this._container);
          
      this._imageOverlay.addTo(map);
      if (overlayToRemove) {
        this._imageOverlay.on('load error', function () {map.removeLayer(overlayToRemove);});
      }
    },
    setZIndex: function (zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();

        return this;
    },
    _updateZIndex: function () {
        if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    onRemove: function () {
    },
    getImageUrl: function() {
        var obj = {};
        obj[this.options.extent.width] = this._map.getSize().x;
        obj[this.options.extent.height] = this._map.getSize().y;
        obj[this.options.extent.bottom] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).y;
        obj[this.options.extent.left] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).x;
        obj[this.options.extent.top] = this._TCRSToPCRS(this._map.getPixelBounds().min, this._map.getZoom()).y;
        obj[this.options.extent.right] = this._TCRSToPCRS(this._map.getPixelBounds().max,this._map.getZoom()).x;
        // hidden and other variables that may be associated
        for (var v in this.options.extent) {
            if (["width","height","left","right","top","bottom"].indexOf(v) < 0) {
                obj[v] = this.options.extent[v];
              }
        }
        return L.Util.template(this._template.template, obj);
    },
    _TCRSToPCRS: function(coords, zoom) {
      // TCRS pixel point to Projected CRS point (in meters, presumably)
      var map = this._map,
          crs = map.options.crs,
          loc = crs.transformation.untransform(coords,crs.scale(zoom));
          return loc;
    },
    _setUpExtentTemplateVars: function(template) {
      // process the inputs associated to template and create an object named
      // extent with member properties as follows:
      // {width: 'widthvarname', 
      //  height: 'heightvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'}

      var extentVarNames = {extent:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "width") {
              extentVarNames.extent.width = name;
        } else if ( type === "height") {
              extentVarNames.extent.height = name;
        } else if (type === "location" && units === "pcrs") {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting"/>
          switch (axis) {
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = name;
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = name;
                  }
              }
              break;
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  extentVarNames.extent.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  extentVarNames.extent.bottom = name;
                }
              }
              break;
          }
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          extentVarNames.extent[name] = function() {
              return parsedselect.value;
          };
        } else {
            /*jshint -W104 */
            const input = inputs[i];
            extentVarNames.extent[name] = function() {
                return input.getAttribute("value");
            };
        }
      }
      return extentVarNames;
    }
});
M.templatedImageLayer = function(template, options) {
    return new M.TemplatedImageLayer(template, options);
};
M.TemplatedFeaturesLayer =  L.Layer.extend({
  // this and M.ImageLayer could be merged or inherit from a common parent
    initialize: function(template, options) {
        this._template = template;
        this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
        L.DomUtil.addClass(this._container, 'mapml-features-container');
        L.setOptions(this, L.extend(options,this._setUpFeaturesTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._onMoveEnd
        };
        return events;
    },
    onAdd: function () {
      var mapml, headers = new Headers({'Accept': 'text/mapml'});
          var parser = new DOMParser(),
          opacity = this.options.opacity,
          container = this._container,
          map = this._map;
      if (!this._features) {
        this._features = M.mapMlFeatures( null, {
          // pass the vector layer a renderer of its own, otherwise leaflet
          // puts everything into the overlayPane
          renderer: L.svg(),
          // pass the vector layer the container for the parent into which
          // it will append its own container for rendering into
          pane: container,
          opacity: opacity,
          imagePath: this.options.imagePath,
          onEachFeature: function(properties, geometry) {
            // need to parse as HTML to preserve semantics and styles
            var c = document.createElement('div');
            c.insertAdjacentHTML('afterbegin', properties.innerHTML);
            geometry.bindPopup(c, {autoPan:false});
          }
        });
      }
      // this was tricky...recursion alwasy breaks my brain
      var features = this._features,
          _pullFeatureFeed = function (url, limit) {
            return (fetch (url,{redirect: 'follow',headers: headers})
                    .then( function (response) {return response.text();})
                    .then( function (text) {
              mapml = parser.parseFromString(text,"application/xml");
              var base = new URI(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : url);
              url = mapml.querySelector('link[rel=next]')? mapml.querySelector('link[rel=next]').getAttribute('href') : null;
              url =  url ? new URI(url).resolve(base).toString(): null;
              features.addData(mapml);
              if (url && --limit) {
                return _pullFeatureFeed(url, limit);
              }
            }));
          };
      _pullFeatureFeed(this._getfeaturesUrl(), 10)
        .then(function() { 
              map.addLayer(features);
        })
        .catch(function (error) { console.log(error);});
    },
    _onMoveEnd: function() {
      this._features.clearLayers();
      // TODO add preference with a bit less weight than that for text/mapml; 0.8 for application/geo+json; 0.6
      var mapml, headers = new Headers({'Accept': 'text/mapml;q=0.9,application/geo+json;q=0.8'}),
          parser = new DOMParser(),
          features = this._features,
          map = this._map,
          MAX_PAGES = 10,
        _pullFeatureFeed = function (url, limit) {
          return (fetch (url,{redirect: 'follow',headers: headers})
                  .then( function (response) {return response.text();})
                  .then( function (text) {
                    //TODO wrap this puppy in a try/catch/finally to parse application/geo+json if necessary
              mapml = parser.parseFromString(text,"application/xml");
              var base = new URI(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : url);
              url = mapml.querySelector('link[rel=next]')? mapml.querySelector('link[rel=next]').getAttribute('href') : null;
              url =  url ? new URI(url).resolve(base).toString(): null;
              // TODO if the xml parser barfed but the response is application/geo+json, use the parent addData method
            features.addData(mapml);
            if (url && --limit) {
              return _pullFeatureFeed(url, limit);
            }
          }));
        };
      _pullFeatureFeed(this._getfeaturesUrl(), MAX_PAGES)
        .then(function() { 
          map.addLayer(features);
        })
        .catch(function (error) { console.log(error);});
    },
    setZIndex: function (zIndex) {
        this.options.zIndex = zIndex;
        this._updateZIndex();
        return this;
    },
    _updateZIndex: function () {
        if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    onRemove: function () {
      this._map.removeLayer(this._features);
    },
    _getfeaturesUrl: function() {
        var pxBounds = this._map.getPixelBounds(),
            topLeft = pxBounds.getTopLeft(),
            topRight = pxBounds.getTopRight(),
            bottomRight = pxBounds.getBottomRight(),
            bottomLeft = pxBounds.getBottomLeft(),
            bounds = this._map.getBounds();
            bounds.extend(this._map.unproject(bottomLeft))
                  .extend(this._map.unproject(bottomRight))
                  .extend(this._map.unproject(topLeft))
                  .extend(this._map.unproject(topRight));
        var obj = {};
        // assumes gcrs at this moment
        obj[this.options.feature.zoom.name] = this._map.getZoom();
        obj[this.options.feature.bottom.name] = bounds.getSouth();
        obj[this.options.feature.left.name] = bounds.getWest();
        obj[this.options.feature.top.name] = bounds.getNorth();
        obj[this.options.feature.right.name] = bounds.getEast();
        // hidden and other variables that may be associated
        for (var v in this.options.feature) {
            if (["width","height","left","right","top","bottom","zoom"].indexOf(v) < 0) {
                obj[v] = this.options.feature[v];
              }
        }
        return L.Util.template(this._template.template, obj);
    },
    _setUpFeaturesTemplateVars: function(template) {
      // process the inputs and create an object named "extent"
      // with member properties as follows:
      // {width: {name: 'widthvarname'}, // value supplied by map if necessary
      //  height: {name: 'heightvarname'}, // value supplied by map if necessary
      //  left: {name: 'leftvarname', axis: 'leftaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  right: {name: 'rightvarname', axis: 'rightaxisname'}, // axis name (coordinate system of) drives the value supplied by the map
      //  top: {name: 'topvarname', axis: 'topaxisname'}, // axis name drives (coordinate system of) the value supplied by the map
      //  bottom: {name: 'bottomvarname', axis: 'bottomaxisname'} // axis name drives (coordinate system of) the value supplied by the map
      //  zoom: {name: 'zoomvarname'}
      //  hidden: [{name: name, value: value}]}

      var featuresVarNames = {feature:{}},
          inputs = template.values;
      featuresVarNames.feature.hidden = [];
      for (var i=0;i<inputs.length;i++) {
        // this can be removed when the spec removes the deprecated inputs...
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            value = inputs[i].getAttribute("value"),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "width") {
              featuresVarNames.feature.width = {name: name};
        } else if ( type === "height") {
              featuresVarNames.feature.height = {name: name};
        } else if (type === "zoom") {
              featuresVarNames.feature.zoom = {name: name};
        } else if (type === "location" && (units === "pcrs" || units ==="gcrs" || units === "tcrs")) {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting"/>
          switch (axis) {
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    featuresVarNames.feature.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    featuresVarNames.feature.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  featuresVarNames.feature.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  featuresVarNames.feature.bottom = { name: name, axis: axis};
                }
              }
              break;
            case ('x'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    featuresVarNames.feature.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    featuresVarNames.feature.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('y'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  featuresVarNames.feature.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  featuresVarNames.feature.bottom = { name: name, axis: axis};
                }
              }
              break;
            case ('longitude'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    featuresVarNames.feature.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    featuresVarNames.feature.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('latitude'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  featuresVarNames.feature.top = { name: name, axis: axis};
                } else if (position.match(/bottom-.*?/i)) {
                  featuresVarNames.feature.bottom = { name: name, axis: axis};
                }
              }
              break;
          }
         } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          featuresVarNames.feature[name] = function() {
              return parsedselect.value;
          };
         // projection is deprecated, make it hidden
        } else if (type === "hidden" || type === "projection") {
            featuresVarNames.feature.hidden.push({name: name, value: value});
        }
      }
      return featuresVarNames;
    }
});
M.templatedFeaturesLayer = function(template, options) {
    return new M.TemplatedFeaturesLayer(template, options);
};
M.TemplatedLayer = L.Layer.extend({
  initialize: function(templates, options) {
    this._templates =  templates;
    L.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
    L.DomUtil.addClass(this._container,'mapml-templatedlayer-container');

    for (var i=0;i<templates.length;i++) {
      if (templates[i].type === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i], 
            L.Util.extend(options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'query') {
          // add template to array of queryies to be added to map and processed
          // on click/tap events
          if (!this._queries) {
            this._queries = [];
          }
          this._queries.push(L.extend(templates[i], this._setupQueryVars(templates[i])));
      }
    }
  },
  getEvents: function() {
      return {
          zoomstart: this._onZoomStart
      };
  },
  redraw: function() {
    this.closePopup();
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].type === 'tile' || this._templates[i].type === 'image' || this._templates[i].type === 'features') {
          this._templates[i].layer.redraw();
      }
    }
  },
  _onZoomStart: function() {
      this.closePopup();
  },
  _setupQueryVars: function(template) {
      // process the inputs associated to template and create an object named
      // query with member properties as follows:
      // {width: 'widthvarname', 
      //  height: 'heightvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'
      //  i: 'ivarname'
      //  j: 'jvarname'}
      //  x: 'xvarname' x being the tcrs x axis
      //  y: 'yvarname' y being the tcrs y axis
      //  z: 'zvarname' zoom
      //  title: link title

      var queryVarNames = {query:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "width") {
              queryVarNames.query.width = name;
        } else if ( type === "height") {
              queryVarNames.query.height = name;
        } else if (type === "location" && units === "tilematrix") {
          switch (axis) {
            case("column"):
              queryVarNames.query.col = name;
              break;
            case("row"):
              queryVarNames.query.row = name;
              break;
            default:
              // unsuportted axis value
          }
        } else if (type === "location" && units === "pcrs") {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting"/>
          switch (axis) {
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    queryVarNames.query.left = name;
                  } else if (position.match(/.*?-right/i)) {
                    queryVarNames.query.right = name;
                  }
              } else {
                  queryVarNames.query.easting = name;
              }
              break;
            case ('northing'):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  queryVarNames.query.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  queryVarNames.query.bottom = name;
                }
              } else {
                queryVarNames.query.northing = name;
              }
              break;
          }
        } else if (type === "location" && units === "map" || units === "tile") {
          // <input name="..." type="location" units="map" axis="i|j"/>
          if (axis === "i") {
            queryVarNames.query.i = name;
          } else if (axis === "j") {
            queryVarNames.query.j = name;
          }
        } else if (type === "location" && units === "tcrs") {
          if (axis === "x") {
            queryVarNames.query.x = name;
          } else if (axis === "y") {
            queryVarNames.query.y = name;
          }
        } else if (type === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17"/>
           queryVarNames.query.zoom = name;
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          queryVarNames.query[name] = function() {
              return parsedselect.value;
          };
        } else {
            /*jshint -W104 */
            const input = inputs[i];
           queryVarNames.query[name] = function () {
              return input.getAttribute("value");
           };
        }
      }
      queryVarNames.query.title = template.title;
      return queryVarNames;
  },
  reset: function (templates) {
    if (!templates) {return;}
    if (!this._map) {return;}
    var addToMap = this._map && this._map.hasLayer(this),
        old_templates = this._templates;
    delete this._queries;
    this._map.off('click', null, this);

    this._templates = templates;
    for (var i=0;i<templates.length;i++) {
      if (templates[i].type === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i],
            L.Util.extend(this.options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].type === 'query') {
          if (!this._queries) {
            this._queries = [];
          }
          this._queries.push(L.extend(templates[i], this._setupQueryVars(templates[i])));
      }
      if (addToMap) {
        this.onAdd(this._map);
      }
    }
    for (i=0;i<old_templates.length;i++) {
      if (this._map.hasLayer(old_templates[i].layer)) {
        this._map.removeLayer(old_templates[i].layer);
      }
    }
  },
  onAdd: function (map) {
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].type !== 'query') {
        map.addLayer(this._templates[i].layer);
      }
    }
//    this.setZIndex(this.options.zIndex);
    if (this._queries) {
      map.on('click', handleClick, this);
    }

    // this needs a custom className as well as a selector in mapml.css in order
    // that the content of the popup does not overflow onto the map, but instead
    // gets a scrollbar.  This is particularly so when the content returned is
    // json, but also html can do this too.  There seems to be a max width
    // that a popup will take, after which if your content is too wide you will
    // have to do something like this.
    var popup = L.popup({autoPan: false, maxHeight: map.getSize().y - 20, className: "mapml-popup-overflow"});
    // bind the popup to this layer so that when the layer is added/removed
    // the popup will disappear automagically. Binding also allows other event
    // handlers (e.g. onRemove) to clear click event handlers from 'this' without
    // having access to the specific handler.
    this.bindPopup(popup);
    function handleClick(e) {
      // need to blank out the data from the last popping up to ensure repeated
      // info from last query doesn't appear in a different location
      popup.setContent(' ');
      var obj = {},
          template = this._queries[0],
          bounds = e.target.getPixelBounds(),
          zoom = e.target.getZoom(),
          map = e.target,
          crs = map.options.crs,
          tcrs2pcrs = function (c) {
            return crs.transformation.untransform(c,crs.scale(zoom));
          };
          
          
      var tcrsClickLoc = map.getPixelOrigin().add(e.layerPoint),
          tileMatrixClickLoc = tcrsClickLoc.divideBy(256).floor();

      obj[template.query.i] = tcrsClickLoc.x.toFixed() - (tileMatrixClickLoc.x * 256);
      obj[template.query.j] = tcrsClickLoc.y.toFixed() - (tileMatrixClickLoc.y * 256);
      
      obj[template.query.col] = tileMatrixClickLoc.x;
      obj[template.query.row] = tileMatrixClickLoc.y;

      // whereas the layerPoint is calculated relative to the origin plus / minus any
      // pan movements so is equal to containerPoint at first before any pans, but
      // changes as the map pans. 
      obj[template.query.x] = tcrsClickLoc.x.toFixed();
      obj[template.query.y] = tcrsClickLoc.y.toFixed();
      obj[template.query.easting] =  tcrs2pcrs(map.getPixelOrigin().add(e.layerPoint)).x;
      obj[template.query.northing] = tcrs2pcrs(map.getPixelOrigin().add(e.layerPoint)).y;
      obj[template.query.zoom] = zoom;
      obj[template.query.width] = map.getSize().x;
      obj[template.query.height] = map.getSize().y;
      obj[template.query.bottom] = tcrs2pcrs(bounds.max).y;
      obj[template.query.left] = tcrs2pcrs(bounds.min).x;
      obj[template.query.top] = tcrs2pcrs(bounds.min).y;
      obj[template.query.right] = tcrs2pcrs(bounds.max).x;
      // add hidden or other variables that may be present into the values to
      // be processed by L.Util.template below.
      for (var v in template.query) {
          if (["i","j","row","col","x","y","easting","northing","width","height","zoom","left","right","top","bottom"].indexOf(v) < 0) {
              obj[v] = template.query[v];
          }
      }
      popup.setContent('<a target="_blank" href="'+L.Util.template(template.template, obj)+'">'+template.query.title+'</a>');
//      fetch(L.Util.template(template.template, obj),{redirect: 'follow'}).then(
//          function(response) {
//            if (response.status !== 200) {
//              console.log('Looks like there was a problem. Status Code: ' +
//                response.status);
//            }
//
//             //Examine the text in the response
//            return response.text();
//          }
//        ).then(function(data) {
//              popup.setContent(data);
//        }).catch(function(err) {
//          console.log('Fetch Error :-S', err);
//        });
      
      popup.setLatLng(e.latlng).openOn(map);
    }
  },
//  setZIndex: function (zIndex) {
//      this.options.zIndex = zIndex;
//      this._updateZIndex();
//
//      return this;
//  },
//  _updateZIndex: function () {
//      if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
//          this._container.style.zIndex = this.options.zIndex;
//      }
//  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].type !== 'query') {
        map.removeLayer(this._templates[i].layer);
      }
    }
    map.off('click', null, this);
  }
});
M.templatedLayer = function(templates, options) {
  // templates is an array of template objects
  // a template object contains the template, plus associated <input> elements
  // which need to be processed just prior to creating a url from the template 
  // with the values of the inputs
  return new M.TemplatedLayer(templates, options);
};
M.TemplatedTileLayer = L.TileLayer.extend({
    // a TemplateTileLayer is similar to a L.TileLayer except its templates are
    // defined by the <extent><template/></extent>
    // content found in the MapML document.  As such, the client map does not
    // 'revisit' the server for more MapML content, it simply fills the map extent
    // with tiles for which it generates requests on demand (as the user pans/zooms/resizes
    // the map)
    initialize: function(template, options) {
      L.setOptions(this, L.extend(options,this._setUpTileTemplateVars(template)));
      this._initContainer();
      // call the parent constructor with the template tref value, per the 
      // Leaflet tutorial: http://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
      L.TileLayer.prototype.initialize.call(this, template.template, L.extend(options, {pane: this._container}));
    },
    // instead of being child of a pane, the TemplatedTileLayers are 'owned' by the group,
    // and so are DOM children of the group, not the pane element (the MapMLLayer is
    // a child of the overlay pane and always has a set of sub-layers)
    getPane: function() {
      return this.options.pane;
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
    getTileUrl: function (coords) {
        var obj = {};
        obj[this.options.tile.col] = coords.x;
        obj[this.options.tile.row] = coords.y;
        obj[this.options.tile.zoom] = this._getZoomForUrl();
        obj[this.options.tile.left] = this._tileMatrixToPCRSPosition(coords, 'top-left').x;
        obj[this.options.tile.right] = this._tileMatrixToPCRSPosition(coords, 'top-right').x;
        obj[this.options.tile.top] = this._tileMatrixToPCRSPosition(coords, 'top-left').y;
        obj[this.options.tile.bottom] = this._tileMatrixToPCRSPosition(coords, 'bottom-left').y;
        obj[this.options.tile.server] = this._getSubdomain(coords);
        for (var v in this.options.tile) {
            if (["row","col","zoom","left","right","top","bottom"].indexOf(v) < 0) {
                obj[v] = this.options.tile[v];
            }
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

      var tileVarNames = {tile:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            shard = (type === "hidden" && inputs[i].hasAttribute("shard")),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "location" && units === "tilematrix") {
          switch (axis) {
            case("column"):
              tileVarNames.tile.col = name;
              break;
            case("row"):
              tileVarNames.tile.row = name;
              break;
            case("easting"):
              if (position) {
                if (position.match(/.*?-left/i)) {
                  tileVarNames.tile.left = name;
                } else if (position.match(/.*?-right/i)) {
                  tileVarNames.tile.right = name;
                }
              } 
              break;
            case("northing"):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  tileVarNames.tile.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  tileVarNames.tile.bottom = name;
                }
              } 
              break;
            default:
              // unsuportted axis value
          }
        } else if (type === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17"/>
           tileVarNames.tile.zoom = name;
        } else if (shard) {
          tileVarNames.tile.server = name;
          tileVarNames.subdomains = inputs[i].servers.slice();
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          tileVarNames.tile[name] = function() {
              return parsedselect.value;
          };
        } else {
           // needs to be a const otherwise it gets overwritten
          /*jshint -W104 */
          const input = inputs[i];
          tileVarNames.tile[name] = function () {
              return input.getAttribute("value");
          };
        }
      }
      return tileVarNames;
    }
});
M.templatedTileLayer = function(template, options) {
  return new M.TemplatedTileLayer(template, options);
};
M.MapMLTileLayer = L.TileLayer.extend({
    initialize: function(url, options) {
        L.setOptions(this, options);
        L.TileLayer.prototype.initialize.call(this, url, options);
    },
    _initContainer: function () {
          if (this._container) { return; }

          this._container = L.DomUtil.create('div', 'leaflet-layer', this.getPane());
          L.DomUtil.addClass(this._container,'mapml-tilelayer-container');
          this._updateZIndex();

          if (this.options.opacity < 1) {
            this._updateOpacity();
          }
    },
    getEvents: function () {
		var events = {};
                // doing updates on move causes too much jank...
		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},
        getPane: function() {
          return this.options.pane;
        },
	_onMapMLProcessed: function () {
            if (!this._map) { return; }
            if (L.DomUtil.hasClass(this._map.getPane('mapPane'),'leaflet-zoom-anim')) { return; }

            this._update();
	},
        _update: function(center, zoom) {
            var map = this._map;
            if (!map) { return; }
            if (L.DomUtil.hasClass(map.getPane('mapPane'),'leaflet-zoom-anim')) { return; }

            if (center === undefined) { center = map.getCenter(); }
            if (zoom === undefined) { zoom = map.getZoom(); }
            var tileZoom = Math.round(zoom);

            if (tileZoom > this.options.maxZoom ||
                    tileZoom < this.options.minZoom) { return; }

            var pixelBounds = this._getTiledPixelBounds(center, zoom, tileZoom),
                tileRange = this._pxBoundsToTileRange(pixelBounds);

            /* Need to group / create arrays of tile elements grouped by
             * row & col values, then pass each array of tile elements to
             * the _addTile function, so that a MapML server may serve a set
             * of tile elements for each tile AND so that a MapML server
             * can rotate URLs for a single image over several servers per the
             * mechanism described by 
             * http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
             * 
             * Also, it should be possible for a MapML server to serve several
             * tile elements for a single tile row/col, such that the images
             * 'stack' to form a composite image.  Such URLs would necessarily
             * be different, so that should be permitted by the grouping.
             * */
            var tiles = this._groupTiles(this._mapmlTileContainer.getElementsByTagName('tile'));
            for (var key in this._tiles) {
                this._tiles[key].current = false;
            }
            // if the coordinates of a tile in the new pixelBounds are already in the
            // existing set of loaded tiles, exclude it from being re-created
            for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
                for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                    var coords = new L.Point(i, j);
                    coords.z = tileZoom;

                    if (!this._isValidTile(coords)) { continue; }

                    var tile = this._tiles[this._tileCoordsToKey(coords)];
                    if (tile) {
                        tile.current = true;
                        for (var k=0; k<tiles.length; k++) { 
                          if (tiles[k][0].row === tile.coords.y && tiles[k][0].col === tile.coords.x) { 
                            tiles.splice(k,1);
                            continue;
                          }
                        }
                    }
                }
            }
            
            if (!tiles.length) { return; }
            this.once('load', this._pruneTiles);
            this._addTiles(tiles);
        },
        _groupTiles: function (tiles) {
            var tileArray = [];
            for (var i=0;i<tiles.length;i++) {
              var tile = {};
              tile.row = parseInt(tiles[i].getAttribute('row'));
              tile.col = parseInt(tiles[i].getAttribute('col'));
              tile.src = tiles[i].getAttribute('src');
              tileArray.push(tile);
            }
            return groupBy(tileArray, function(item) { return[item.row, item.col]; });
            function groupBy( array , f ) {
                var groups = {};
                array.forEach( function( o ) {
                  var group = JSON.stringify( f(o) );
                  groups[group] = groups[group] || [];
                  groups[group].push( o );  
                });
                return Object.keys(groups).map( function( group ) {
                  return groups[group]; 
                });
            }
        },
	_addTiles: function (tiles) { // tiles is an array of arrays, representing tile image URLs grouped by shared row/col
		var queue = [], group = {};
                for (var i=0;i<tiles.length;i++) {
                    group.col = tiles[i][0].col;
                    group.row = tiles[i][0].row;
                    if (this._isValidTile(new L.Point(group.col, group.row))) {
                        queue.push(tiles[i]);
                    }
                }

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._loading) {
                    this._loading = true;
                    this.fire('loading');
		}

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		Polymer.dom(this._level.el).appendChild(fragment);
	},
	_addTile: function (groupToLoad, container) {
                // tiles have been grouped by row/col, so all members of the array
                // share those values.
		var coords = new L.Point(groupToLoad[0].col, groupToLoad[0].row);
                coords.z = this._map.getZoom();
                var key = this._tileCoordsToKey(coords);
                var tile;
                
                for (var i=0;i<groupToLoad.length;i++) {
                    // create an img element for each tile element for this grid cell
                    tile = this.createTile(groupToLoad[i].src, L.bind(this._tileReady, this, coords));
                    this._initTile(tile);
                    //setTimeout(L.bind(this._tileReady, this, coords, null, tile), 0);
                    groupToLoad[i].img = tile;
                }

                var tileContainer;
                if (this._tiles[key]) {
                  tileContainer = this._tiles[key].el;
                } else {
                  tileContainer = document.createElement('div');
                  L.DomUtil.addClass(tileContainer, 'leaflet-tile');
                    for (i=0;i<groupToLoad.length;i++) {
                        Polymer.dom(tileContainer).appendChild(groupToLoad[i].img);
                    }
                }
                // per L.TileLayer comment:
		// we prefer top/left over translate3d so that we don't create a HW-accelerated layer from each tile
		// which is slow, and it also fixes gaps between tiles in Safari
                L.DomUtil.setPosition(tileContainer, this._getTilePos(coords));

		// save tile in cache
		this._tiles[key] = {
			el: tileContainer,
			coords: coords,
			current: true
		};
                // append the tile container div to the container fragment
		Polymer.dom(container).appendChild(tileContainer);
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},
        // override Leaflet method of the same name, removing the 'leaflet-tile' 
        // class assignment from img elements because that class is on the parent 
        // div element (mapml layers can have > 1 img per tile).
	_initTile: function (tile) {
		// L.DomUtil.addClass(tile, 'leaflet-tile');

		var tileSize = this.getTileSize();
		tile.style.width = tileSize.x + 'px';
		tile.style.height = tileSize.y + 'px';

		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.android && !L.Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},
        // override the private method from L.GridLayer, adapt to the mapml situation
	_noTilesToLoad: function () {
                for (var key in this._tiles) {
                    if (!L.DomUtil.hasClass(this._tiles[key].el, 'leaflet-tile-loaded')) { return false; }
                }
                return true;
	},
	createTile: function (src, done) {
		var tile = document.createElement('img');

		tile.onload = L.bind(this._tileOnLoad, this, done, tile);
		tile.onerror = L.bind(this._tileOnError, this, done, tile);
                
		if (this.options.crossOrigin) {
			tile.crossOrigin = '';
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		tile.src = src;
//                L.DomUtil.addClass(tile, 'leaflet-tile-loaded');

		return tile;
	},
        _tileLoad: function(tile) {
          if (!tile) { return; }
          var images = tile.querySelectorAll('img'),
              allImagesLoaded = true;
          
          for (var i=0;i<images.length;i++) {
              
            if (!images[i].loaded) {
                allImagesLoaded = false;
            }
          }
          if (allImagesLoaded) {
              L.DomUtil.addClass(tile, 'leaflet-tile-loaded');
          }
        },
        // stops loading all tiles in the background layer, overrides method
        // from L.TileLayer because of different HTML model img -> div/img[]
	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			var tileDiv = this._tiles[i].el,
                            images = tileDiv.getElementsByTagName('img');
                        for (i = 0; i< images.length; i++) {
                            tile = images[i];
                            tile.onload = L.Util.falseFn;
                            tile.onerror = L.Util.falseFn;

                            if (!tile.complete) {
                                    tile.src = L.Util.emptyImageUrl;
                                    L.DomUtil.remove(tile);
                            }
                        }
		}
	}
});
M.mapMLTileLayer = function (url, options) {
	return new M.MapMLTileLayer(url, options);
};
M.MapMLTileLayer.addInitHook(function () {
    this.on('tileload', function (e) {
        var img = e.tile;
        this._tileLoad(img);
    }, this);
});
M.MapMLFeatures = L.FeatureGroup.extend({
  /*
   * M.MapML turns any MapML feature data into a Leaflet layer. Based on L.GeoJSON.
   */
    initialize: function (mapml, options) {
    
      L.setOptions(this, options);
      this._container = L.DomUtil.create('div','leaflet-layer', this.options.pane);
      // must have leaflet-pane class because of new/changed rule in leaflet.css
      // info: https://github.com/Leaflet/Leaflet/pull/4597 
      L.DomUtil.addClass(this._container,'leaflet-pane mapml-vector-container');
      L.setOptions(this.options.renderer, {pane: this._container});

      this._layers = {};

      if (mapml) {
        this.addData(mapml);
      }
    },

    addData: function (mapml) {
      var features = mapml.nodeType === Node.DOCUMENT_NODE || mapml.nodeName === "LAYER-" ? mapml.getElementsByTagName("feature") : null,
          i, len, feature;

      var linkedStylesheets = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelectorAll("link[rel=stylesheet]") : null;
      if (linkedStylesheets) {
        for (i=0;i < linkedStylesheets.length;i++) {

          var baseEl = mapml.querySelector('base'),
              stylesheet = linkedStylesheets[i],
            base = new URI(baseEl?baseEl.getAttribute('href'):mapml.baseURI),
            link = new URI(stylesheet.getAttribute('href'));
            stylesheet = link.resolve(base).toString();
          if (stylesheet) {
            if (!document.head.querySelector("link[href='"+stylesheet+"']")) {
              var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "link");
              linkElm.setAttribute("href", stylesheet);
              linkElm.setAttribute("type", "text/css");
              linkElm.setAttribute("rel", "stylesheet");
              document.head.appendChild(linkElm);
            }
          }
        }
      }
      var inlineStyleSheets = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelectorAll("style") : null;
      if (inlineStyleSheets) {
        for (i=0;i<inlineStyleSheets.length;i++) {
          document.head.insertAdjacentHTML('beforeend',inlineStyleSheets[i].outerHTML);
        }
      }

      if (features) {
       for (i = 0, len = features.length; i < len; i++) {
        // Only add this if geometry is set and not null
        feature = features[i];
        var geometriesExist = feature.getElementsByTagName("geometry").length && feature.getElementsByTagName("coordinates").length;
        if (geometriesExist) {
         this.addData(feature);
        }
       }
       return this;
      }

      var options = this.options;

      if (options.filter && !options.filter(mapml)) { return; }

      var layer = M.MapMLFeatures.geometryToLayer(mapml, options.pointToLayer, options.coordsToLatLng, options);
      if (layer) {
        layer.properties = mapml.getElementsByTagName('properties')[0];

        layer.options.className = mapml.getAttribute('class') ? mapml.getAttribute('class') : null;
        layer.defaultOptions = layer.options;
        this.resetStyle(layer);

        if (options.onEachFeature) {
         options.onEachFeature(layer.properties, layer);
        }
        return this.addLayer(layer);
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
    }
});
L.extend(M.MapMLFeatures, {
	 geometryToLayer: function (mapml, pointToLayer, coordsToLatLng, vectorOptions) {
    var geometry = mapml.tagName.toUpperCase() === 'FEATURE' ? mapml.getElementsByTagName('geometry')[0] : mapml,
        latlng, latlngs, coordinates;

    coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

    switch (geometry.firstElementChild.tagName.toUpperCase()) {
      case 'POINT':
        coordinates = [];
        geometry.getElementsByTagName('coordinates')[0].textContent.split(/\s+/gim).forEach(parseNumber,coordinates);
        latlng = coordsToLatLng(coordinates);

        var opacity = vectorOptions.opacity ? vectorOptions.opacity : null;
        return pointToLayer ? pointToLayer(mapml, latlng) : 
                                    new L.Marker(latlng, {opacity: opacity, icon: L.icon({
                                        iconUrl: vectorOptions.imagePath+"marker-icon.png",
                                        iconRetinaUrl: vectorOptions.imagePath+"marker-icon-2x.png",
                                        shadowUrl: vectorOptions.imagePath+"marker-shadow.png",
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        shadowSize: [41, 41]})});

      case 'MULTIPOINT':
        console.log('MULTIPOINT Not implemented yet');
        break;
      case 'LINESTRING':
        coordinates = [];
        geometry.getElementsByTagName('coordinates')[0].textContent.match(/(\S+ \S+)/gim).forEach(splitCoordinate, coordinates);
        latlngs = this.coordsToLatLngs(coordinates, 0, coordsToLatLng);
        return new L.Polyline(latlngs, vectorOptions);
      case 'MULTILINESTRING':
        console.log('MULTILINESTRING Not implemented yet');
        break;
      case 'POLYGON':
        var rings = geometry.getElementsByTagName('coordinates');
        latlngs = this.coordsToLatLngs(coordinatesToArray(rings), 1, coordsToLatLng);
        return new L.Polygon(latlngs, vectorOptions);
      case 'MULTIPOLYGON':
        var members = geometry.getElementsByTagName('polygon'),
            polygons = new Array(members.length);
        for (var member=0;member<members.length;member++) {
          polygons[member] = coordinatesToArray(members[member].querySelectorAll('coordinates'));
        }
        latlngs = this.coordsToLatLngs(polygons, 2, coordsToLatLng);
        return new L.Polygon(latlngs, vectorOptions);
      case 'GEOMETRYCOLLECTION':
        console.log('GEOMETRYCOLLECTION Not implemented yet');
        break;
    //			for (i = 0, len = geometry.geometries.length; i < len; i++) {
    //
    //				layers.push(this.geometryToLayer({
    //					geometry: geometry.geometries[i],
    //					type: 'Feature',
    //					properties: geojson.properties
    //				}, pointToLayer, coordsToLatLng, vectorOptions));
    //			}
    //			return new L.FeatureGroup(layers);

      default:
        console.log('Invalid GeoJSON object.');
        break;
    }
    function coordinatesToArray(coordinates) {
      var a = new Array(coordinates.length);
      for (var i=0;i<a.length;i++) {
        a[i]=[];
        coordinates[i].textContent.match(/(\S+\s+\S+)/gim).forEach(splitCoordinate, a[i]);
      }
      return a;
    }

    function splitCoordinate(element, index, array) {
      var a = [];
      element.split(/\s+/gim).forEach(parseNumber,a);
      this.push(a);
    }

    function parseNumber(element, index, array) {
      this.push(parseFloat(element));
    }
  },
        

  coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
   return new L.LatLng(coords[1], coords[0], coords[2]);
  },

  coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
    var latlng, i, len,
        latlngs = [];

    for (i = 0, len = coords.length; i < len; i++) {
     latlng = levelsDeep ?
             this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
             (coordsToLatLng || this.coordsToLatLng)(coords[i]);

     latlngs.push(latlng);
    }

    return latlngs;
  },

  latLngToCoords: function (latlng) {
    var coords = [latlng.lng, latlng.lat];

    if (latlng.alt !== undefined) {
     coords.push(latlng.alt);
    }
    return coords;
  },

  latLngsToCoords: function (latLngs) {
    var coords = [];

    for (var i = 0, len = latLngs.length; i < len; i++) {
      coords.push(L.MapML.latLngToCoords(latLngs[i]));
    }

    return coords;
  }
});
M.mapMlFeatures = function (mapml, options) {
	return new M.MapMLFeatures(mapml, options);
};
M.MapMLLayerControl = L.Control.Layers.extend({
    /* removes 'base' layers as a concept */
    options: {
      autoZIndex: false,
      sortLayers: true,
      sortFunction: function (layerA, layerB) {
        return layerA.options.zIndex < layerB.options.zIndex ? -1 : (layerA.options.zIndex > layerB.options.zIndex ? 1 : 0);
      }
    },
    initialize: function (overlays, options) {
        L.setOptions(this, options);
        
        // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
        // the array index is the id of the layer returned by L.stamp(layer) which I guess is a unique hash
        this._layerControlInputs = [];
        this._layers = [];
        this._lastZIndex = 0;
        this._handlingClick = false;

        for (var i in overlays) {
            this._addLayer(overlays[i], i, true);
        }
    },
    onAdd: function () {
        this._initLayout();
        this._map.on('moveend', this._validateExtents, this);
        this._update();
        this._validateExtents();
        return this._container;
    },
    onRemove: function (map) {
        map.off('moveend', this._validateExtents, this);
        // remove layer-registerd event handlers so that if the control is not
        // on the map it does not generate layer events
        for (var i = 0; i < this._layers.length; i++) {
          this._layers[i].layer.off('add remove', this._onLayerChange, this);
          this._layers[i].layer.off('extentload', this._validateExtents, this);
        }
    },
    addOrUpdateOverlay: function (layer, name) {
      var alreadyThere = false;
      for (var i=0;i<this._layers.length;i++) {
        if (this._layers[i].layer === layer) {
          alreadyThere = true;
          this._layers[i].name = name;
          // replace the controls with updated controls if necessary.
          break;
        }
      }
      if (!alreadyThere) {
        this.addOverlay(layer, name);
      }
      return (this._map) ? this._update() : this;
    },
    _validateExtents: function (e) {
        // get the bounds of the map in Tiled CRS pixel units
        var zoom = this._map.getZoom(),
            bounds = this._map.getPixelBounds(),
            zoomBounds, obj, visible, projectionMatches;
        for (var i = 0; i < this._layers.length; i++) {
            obj = this._layers[i];
            if (obj.layer._extent || obj.layer.error) {

                // get the 'bounds' of zoom levels of the layer as described by the server
                zoomBounds = obj.layer.getZoomBounds();
                projectionMatches = obj.layer._projectionMatches(this._map);
                //the bounds intersecting the layer extent bounds is used to
                // disable/enable the layer in the layer control
                visible = projectionMatches && this._withinZoomBounds(zoom, zoomBounds); // && bounds.intersects(obj.layer.getLayerExtentBounds(this._map)) ;
                if (!visible) {
                    obj.input.disabled = true;
                    if (!projectionMatches) {
                        this._map.removeLayer(obj.layer);
                        obj.input.disabled = true;
                        obj.input.checked = false;
                    }
                    obj.input.nextElementSibling.style.fontStyle = 'italic';
                } else {
                    obj.input.disabled = false;
                    obj.input.style = null;
                    // ie does not work with null 
                    obj.input.nextElementSibling.style.fontStyle = '';
                }
            }
        }
    },
    _withinZoomBounds: function(zoom, range) {
        return range.min <= zoom && zoom <= range.max;
    },
    _addItem: function (obj) {
      var layercontrols  =  obj.layer.getLayerUserControlsHTML();
      // the input is required by Leaflet...
      obj.input = layercontrols.querySelector('input');

      this._layerControlInputs.push(obj.input);
    		obj.input.layerId = L.stamp(obj.layer);

      L.DomEvent.on(obj.input, 'click', this._onInputClick, this);

      // this is necessary because when there are several layers in the
      // layer control, the response to the last one can be a long time
      // after the info is first displayed, so we have to go back and
      // verify the extent and legend for the layer to know whether to
      // disable it , add the legend link etc.
      obj.layer.on('extentload', this._validateExtents, this);
      
      Polymer.dom(this._overlaysList).appendChild(layercontrols);
      return layercontrols;
    }
});
M.mapMlLayerControl = function (layers, options) {
	return new M.MapMLLayerControl(layers, options);
};


}(window, document));
;/*
 * Copyright © 2007 Dominic Mitchell
 * 
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the Dominic Mitchell nor the names of its contributors
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
 * An URI datatype.  Based upon examples in RFC3986.
 *
 * TODO %-escaping
 * TODO split apart authority
 * TODO split apart query_string (on demand, anyway)
 *
 * @(#) $Id$
 */
 
// Constructor for the URI object.  Parse a string into its components.
function URI(str) {
    if (!str) str = "";
    // Based on the regex in RFC2396 Appendix B.
    var parser = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
    var result = str.match(parser);
    this.scheme    = result[1] || null;
    this.authority = result[2] || null;
    this.path      = result[3] || null;
    this.query     = result[4] || null;
    this.fragment  = result[5] || null;
}

// Restore the URI to it's stringy glory.
URI.prototype.toString = function () {
    var str = "";
    if (this.scheme) {
        str += this.scheme + ":";
    }
    if (this.authority) {
        str += "//" + this.authority;
    }
    if (this.path) {
        str += this.path;
    }
    if (this.query) {
        str += "?" + this.query;
    }
    if (this.fragment) {
        str += "#" + this.fragment;
    }
    return str;
};

// Introduce a new scope to define some private helper functions.
(function () {
    // RFC3986 §5.2.3 (Merge Paths)
    function merge(base, rel_path) {
        var dirname = /^(.*)\//;
        if (base.authority && !base.path) {
            return "/" + rel_path;
        }
        else {
            return base.path.match(dirname)[0] + rel_path;
        }
    }

    // Match two path segments, where the second is ".." and the first must
    // not be "..".
    var DoubleDot = /\/((?!\.\.\/)[^\/]*)\/\.\.\//;

    function remove_dot_segments(path) {
        if (!path) return "";
        // Remove any single dots
        var newpath = path.replace(/\/\.\//g, '/');
        // Remove any trailing single dots.
        newpath = newpath.replace(/\/\.$/, '/');
        // Remove any double dots and the path previous.  NB: We can't use
        // the "g", modifier because we are changing the string that we're
        // matching over.
        while (newpath.match(DoubleDot)) {
            newpath = newpath.replace(DoubleDot, '/');
        }
        // Remove any trailing double dots.
        newpath = newpath.replace(/\/([^\/]*)\/\.\.$/, '/');
        // If there are any remaining double dot bits, then they're wrong
        // and must be nuked.  Again, we can't use the g modifier.
        while (newpath.match(/\/\.\.\//)) {
            newpath = newpath.replace(/\/\.\.\//, '/');
        }
        return newpath;
    }

    // RFC3986 §5.2.2. Transform References;
    URI.prototype.resolve = function (base) {
        var target = new URI();
        if (this.scheme) {
            target.scheme    = this.scheme;
            target.authority = this.authority;
            target.path      = remove_dot_segments(this.path);
            target.query     = this.query;
        }
        else {
            if (this.authority) {
                target.authority = this.authority;
                target.path      = remove_dot_segments(this.path);
                target.query     = this.query;
            }        
            else {
                // XXX Original spec says "if defined and empty"…;
                if (!this.path) {
                    target.path = base.path;
                    if (this.query) {
                        target.query = this.query;
                    }
                    else {
                        target.query = base.query;
                    }
                }
                else {
                    if (this.path.charAt(0) === '/') {
                        target.path = remove_dot_segments(this.path);
                    } else {
                        target.path = merge(base, this.path);
                        target.path = remove_dot_segments(target.path);
                    }
                    target.query = this.query;
                }
                target.authority = base.authority;
            }
            target.scheme = base.scheme;
        }

        target.fragment = this.fragment;

        return target;
    };
})();
