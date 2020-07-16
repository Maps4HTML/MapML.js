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
/* global L, Node */
/*jshint esversion: 6 */
(function (window, document, undefined) {
  
var M = {};
window.M = M;
const TILE_SIZE = 256;
const FALLBACK_PROJECTION = "OSMTILE";
const FALLBACK_CS = "TILEMATRIX";

(function () {
  M.detectImagePath = function (container) {
    // this relies on the CSS style leaflet-default-icon-path containing a 
    // relative url() that leads to a valid icon file.  Since that depends on
    // how all of this stuff is deployed (i.e. custom element or as leaflet-plugin)
    // also, because we're using 'shady DOM' api, the container must be 
    // a shady dom container, because the custom element tags it with added
    // style-scope ... and related classes.
   var el = L.DomUtil.create('div',  'leaflet-default-icon-path', container);
   var path = L.DomUtil.getStyle(el, 'background-image') ||
              L.DomUtil.getStyle(el, 'backgroundImage');	// IE8

   container.removeChild(el);

   if (path === null || path.indexOf('url') !== 0) {
    path = '';
   } else {
    path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
   }

   return path;
  };
  M.mime = "text/mapml";
  // see https://leafletjs.com/reference-1.5.0.html#crs-l-crs-base
  // "new classes can't inherit from (L.CRS), and methods can't be added 
  // to (L.CRS.anything) with the include function
  // so we'll use the options property as a way to integrate needed 
  // properties and methods...
  M.WGS84 = new L.Proj.CRS('EPSG:4326','+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ', {
    origin: [-180,+90],
    bounds: L.bounds([[-180,-90],[180,90]]),
    resolutions: [
      0.703125,
      0.3515625,
      0.17578125,
      0.087890625,
      0.0439453125,
      0.02197265625,
      0.010986328125,
      0.0054931640625,
      0.00274658203125,
      0.001373291015625,
      0.0006866455078125,
      0.0003433227539062,
      0.0001716613769531,
      0.0000858306884766,
      0.0000429153442383,
      0.0000214576721191,
      0.0000107288360596,
      0.0000053644180298,
      0.0000026822090149,
      0.0000013411045074,
      0.0000006705522537,
      0.0000003352761269
    ],
    crs: {
      tcrs: {
        horizontal: {
          name: "x",
          min: 0, 
          max: zoom => (M.WGS84.options.bounds.getSize().x / M.WGS84.options.resolutions[zoom]).toFixed()
        },
        vertical: {
          name: "y",
          min:0, 
          max: zoom => (M.WGS84.options.bounds.getSize().y / M.WGS84.options.resolutions[zoom]).toFixed()
        },
        bounds: zoom => L.bounds([M.WGS84.options.crs.tcrs.horizontal.min,
                          M.WGS84.options.crs.tcrs.vertical.min],
                         [M.WGS84.options.crs.tcrs.horizontal.max(zoom),
                          M.WGS84.options.crs.tcrs.vertical.max(zoom)])
      },
      pcrs: {
        horizontal: {
          name: "longitude",
          get min() {return M.WGS84.options.crs.gcrs.horizontal.min;},
          get max() {return M.WGS84.options.crs.gcrs.horizontal.max;}
        }, 
        vertical: {
          name: "latitude", 
          get min() {return M.WGS84.options.crs.gcrs.vertical.min;},
          get max() {return M.WGS84.options.crs.gcrs.vertical.max;}
        },
        get bounds() {return M.WGS84.options.bounds;}
      }, 
      gcrs: {
        horizontal: {
          name: "longitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: -180.0,
          max: 180.0
        }, 
        vertical: {
          name: "latitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: -90.0,
          max: 90.0
        },
        get bounds() {return L.latLngBounds(
              [M.WGS84.options.crs.gcrs.vertical.min,M.WGS84.options.crs.gcrs.horizontal.min],
              [M.WGS84.options.crs.gcrs.vertical.max,M.WGS84.options.crs.gcrs.horizontal.max]);}
      },
      map: {
        horizontal: {
          name: "i",
          min: 0,
          max: map => map.getSize().x
        },
        vertical: {
          name: "j",
          min: 0,
          max: map => map.getSize().y
        },
        bounds: map => L.bounds(L.point([0,0]),map.getSize())
      },
      tile: {
        horizontal: {
          name: "i",
          min: 0,
          max: 256
        },
        vertical: {
          name: "j",
          min: 0,
          max: 256
        },
        get bounds() {return L.bounds(
                  [M.WGS84.options.crs.tile.horizontal.min,M.WGS84.options.crs.tile.vertical.min],
                  [M.WGS84.options.crs.tile.horizontal.max,M.WGS84.options.crs.tile.vertical.max]);}
      },
      tilematrix: {
        horizontal: {
          name: "column",
          min: 0,
          max: zoom => (M.WGS84.options.crs.tcrs.horizontal.max(zoom) / M.WGS84.options.crs.tile.bounds.getSize().x).toFixed()
        },
        vertical: {
          name: "row",
          min: 0,
          max: zoom => (M.WGS84.options.crs.tcrs.vertical.max(zoom) / M.WGS84.options.crs.tile.bounds.getSize().y).toFixed()
        },
        bounds: zoom => L.bounds(
                 [M.WGS84.options.crs.tilematrix.horizontal.min,
                  M.WGS84.options.crs.tilematrix.vertical.min],
                 [M.WGS84.options.crs.tilematrix.horizontal.max(zoom),
                  M.WGS84.options.crs.tilematrix.vertical.max(zoom)])
      }
    }
  });
  M.CBMTILE = new L.Proj.CRS('EPSG:3978',
  '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs', {
    origin: [-34655800, 39310000],
    bounds: L.bounds([[-34655800,-39000000],[10000000,39310000]]),
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
    ],
    crs: {
      tcrs: {
        horizontal: {
          name: "x",
          min: 0, 
          max: zoom => (M.CBMTILE.options.bounds.getSize().x / M.CBMTILE.options.resolutions[zoom]).toFixed()
        },
        vertical: {
          name: "y",
          min:0, 
          max: zoom => (M.CBMTILE.options.bounds.getSize().y / M.CBMTILE.options.resolutions[zoom]).toFixed()
        },
        bounds: zoom => L.bounds([M.CBMTILE.options.crs.tcrs.horizontal.min,
                          M.CBMTILE.options.crs.tcrs.vertical.min],
                         [M.CBMTILE.options.crs.tcrs.horizontal.max(zoom),
                          M.CBMTILE.options.crs.tcrs.vertical.max(zoom)])
      },
      pcrs: {
        horizontal: {
          name: "easting",
          get min() {return M.CBMTILE.options.bounds.min.x;},
          get max() {return M.CBMTILE.options.bounds.max.x;}
        }, 
        vertical: {
          name: "northing", 
          get min() {return M.CBMTILE.options.bounds.min.y;},
          get max() {return M.CBMTILE.options.bounds.max.y;}
        },
        get bounds() {return M.CBMTILE.options.bounds;}
      }, 
      gcrs: {
        horizontal: {
          name: "longitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: -141.01,
          max: -47.74
        }, 
        vertical: {
          name: "latitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: 40.04,
          max: 86.46
        },
        get bounds() {return L.latLngBounds(
              [M.CBMTILE.options.crs.gcrs.vertical.min,M.CBMTILE.options.crs.gcrs.horizontal.min],
              [M.CBMTILE.options.crs.gcrs.vertical.max,M.CBMTILE.options.crs.gcrs.horizontal.max]);}
      },
      map: {
        horizontal: {
          name: "i",
          min: 0,
          max: map => map.getSize().x
        },
        vertical: {
          name: "j",
          min: 0,
          max: map => map.getSize().y
        },
        bounds: map => L.bounds(L.point([0,0]),map.getSize())
      },
      tile: {
        horizontal: {
          name: "i",
          min: 0,
          max: 256
        },
        vertical: {
          name: "j",
          min: 0,
          max: 256
        },
        get bounds() {return L.bounds(
                  [M.CBMTILE.options.crs.tile.horizontal.min,M.CBMTILE.options.crs.tile.vertical.min],
                  [M.CBMTILE.options.crs.tile.horizontal.max,M.CBMTILE.options.crs.tile.vertical.max]);}
      },
      tilematrix: {
        horizontal: {
          name: "column",
          min: 0,
          max: zoom => (M.CBMTILE.options.crs.tcrs.horizontal.max(zoom) / M.CBMTILE.options.crs.tile.bounds.getSize().x).toFixed()
        },
        vertical: {
          name: "row",
          min: 0,
          max: zoom => (M.CBMTILE.options.crs.tcrs.vertical.max(zoom) / M.CBMTILE.options.crs.tile.bounds.getSize().y).toFixed()
        },
        bounds: zoom => L.bounds([0,0],
                 [M.CBMTILE.options.crs.tilematrix.horizontal.max(zoom),
                  M.CBMTILE.options.crs.tilematrix.vertical.max(zoom)])
      }
    }
  });
  M.APSTILE = new L.Proj.CRS('EPSG:5936',
  '+proj=stere +lat_0=90 +lat_ts=50 +lon_0=-150 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs', {
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
    ],
    crs: {
      tcrs: {
        horizontal: {
          name: "x",
          min: 0, 
          max: zoom => (M.APSTILE.options.bounds.getSize().x / M.APSTILE.options.resolutions[zoom]).toFixed()
        },
        vertical: {
          name: "y",
          min:0, 
          max: zoom => (M.APSTILE.options.bounds.getSize().y / M.APSTILE.options.resolutions[zoom]).toFixed()
        },
        bounds: zoom => L.bounds([M.APSTILE.options.crs.tcrs.horizontal.min,
                          M.APSTILE.options.crs.tcrs.vertical.min],
                         [M.APSTILE.options.crs.tcrs.horizontal.max(zoom),
                          M.APSTILE.options.crs.tcrs.vertical.max(zoom)])
      },
      pcrs: {
        horizontal: {
          name: "easting",
          get min() {return M.APSTILE.options.bounds.min.x;},
          get max() {return M.APSTILE.options.bounds.max.x;}
        }, 
        vertical: {
          name: "northing", 
          get min() {return M.APSTILE.options.bounds.min.y;},
          get max() {return M.APSTILE.options.bounds.max.y;}
        },
        get bounds() {return M.APSTILE.options.bounds;}
      }, 
      gcrs: {
        horizontal: {
          name: "longitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: -180.0,
          max: 180.0
        }, 
        vertical: {
          name: "latitude",
          // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
          min: 60.0,
          max: 90.0
        },
        get bounds() {return L.latLngBounds(
                  [M.APSTILE.options.crs.gcrs.vertical.min,M.APSTILE.options.crs.gcrs.horizontal.min],
                  [M.APSTILE.options.crs.gcrs.vertical.max,M.APSTILE.options.crs.gcrs.horizontal.max]);}
      },
      map: {
        horizontal: {
          name: "i",
          min: 0,
          max: map => map.getSize().x
        },
        vertical: {
          name: "j",
          min: 0,
          max: map => map.getSize().y
        },
        bounds: map => L.bounds(L.point([0,0]),map.getSize())
      },
      tile: {
        horizontal: {
          name: "i",
          min: 0,
          max: 256
        },
        vertical: {
          name: "j",
          min: 0,
          max: 256
        },
        get bounds() {return L.bounds(
                  [M.APSTILE.options.crs.tile.horizontal.min,M.APSTILE.options.crs.tile.vertical.min],
                  [M.APSTILE.options.crs.tile.horizontal.max,M.APSTILE.options.crs.tile.vertical.max]);}
      },
      tilematrix: {
        horizontal: {
          name: "column",
          min: 0,
          max: zoom => (M.APSTILE.options.crs.tcrs.horizontal.max(zoom) / M.APSTILE.options.crs.tile.bounds.getSize().x).toFixed()
        },
        vertical: {
          name: "row",
          min: 0,
          max: zoom => (M.APSTILE.options.crs.tcrs.vertical.max(zoom) / M.APSTILE.options.crs.tile.bounds.getSize().y).toFixed()
        },
        bounds: zoom => L.bounds([0,0],
                 [M.APSTILE.options.crs.tilematrix.horizontal.max(zoom),
                  M.APSTILE.options.crs.tilematrix.vertical.max(zoom)])
      }
    }
  });
  M.OSMTILE = L.CRS.EPSG3857;
  L.setOptions(M.OSMTILE, {
    origin: [-20037508.342787, 20037508.342787],
    bounds: L.bounds([[-20037508.342787, -20037508.342787],[20037508.342787, 20037508.342787]]),
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
    ],
    crs: {
      tcrs: {
        horizontal: {
          name: "x",
          min: 0, 
          max: zoom => (M.OSMTILE.options.bounds.getSize().x / M.OSMTILE.options.resolutions[zoom]).toFixed()
        },
        vertical: {
          name: "y",
          min:0, 
          max: zoom => (M.OSMTILE.options.bounds.getSize().y / M.OSMTILE.options.resolutions[zoom]).toFixed()
        },
        bounds: zoom => L.bounds([M.OSMTILE.options.crs.tcrs.horizontal.min,
                          M.OSMTILE.options.crs.tcrs.vertical.min],
                         [M.OSMTILE.options.crs.tcrs.horizontal.max(zoom),
                          M.OSMTILE.options.crs.tcrs.vertical.max(zoom)])
      },
      pcrs: {
        horizontal: {
          name: "easting",
          get min() {return M.OSMTILE.options.bounds.min.x;},
          get max() {return M.OSMTILE.options.bounds.max.x;}
        }, 
        vertical: {
          name: "northing", 
          get min() {return M.OSMTILE.options.bounds.min.y;},
          get max() {return M.OSMTILE.options.bounds.max.y;}
        },
        get bounds() {return M.OSMTILE.options.bounds;}
      }, 
      gcrs: {
        horizontal: {
          name: "longitude",
          get min() {return M.OSMTILE.unproject(M.OSMTILE.options.bounds.min).lng;},
          get max() {return M.OSMTILE.unproject(M.OSMTILE.options.bounds.max).lng;}
        }, 
        vertical: {
          name: "latitude",
          get min() {return M.OSMTILE.unproject(M.OSMTILE.options.bounds.min).lat;},
          get max() {return M.OSMTILE.unproject(M.OSMTILE.options.bounds.max).lat;}
        },
        get bounds() {return L.latLngBounds(
              [M.OSMTILE.options.crs.gcrs.vertical.min,M.OSMTILE.options.crs.gcrs.horizontal.min],
              [M.OSMTILE.options.crs.gcrs.vertical.max,M.OSMTILE.options.crs.gcrs.horizontal.max]);}
      },
      map: {
        horizontal: {
          name: "i",
          min: 0,
          max: map => map.getSize().x
        },
        vertical: {
          name: "j",
          min: 0,
          max: map => map.getSize().y
        },
        bounds: map => L.bounds(L.point([0,0]),map.getSize())
      },
      tile: {
        horizontal: {
          name: "i",
          min: 0,
          max: 256
        },
        vertical: {
          name: "j",
          min: 0,
          max: 256
        },
        get bounds() {return L.bounds(
                  [M.OSMTILE.options.crs.tile.horizontal.min,M.OSMTILE.options.crs.tile.vertical.min],
                  [M.OSMTILE.options.crs.tile.horizontal.max,M.OSMTILE.options.crs.tile.vertical.max]);}
      },
      tilematrix: {
        horizontal: {
          name: "column",
          min: 0,
          max: zoom => (M.OSMTILE.options.crs.tcrs.horizontal.max(zoom) / M.OSMTILE.options.crs.tile.bounds.getSize().x).toFixed()
        },
        vertical: {
          name: "row",
          min: 0,
          max: zoom => (M.OSMTILE.options.crs.tcrs.vertical.max(zoom) / M.OSMTILE.options.crs.tile.bounds.getSize().y).toFixed()
        },
        bounds: zoom => L.bounds([0,0],
                 [M.OSMTILE.options.crs.tilematrix.horizontal.max(zoom),
                  M.OSMTILE.options.crs.tilematrix.vertical.max(zoom)])
      }
    }
  });
}());
M.Util = {  
  extractInputBounds: function(template){
    if(!template) return undefined;
    let inputs = template.values, projection = template.projection || FALLBACK_PROJECTION, value = 0, boundsUnit = FALLBACK_CS;
    let bounds = L.bounds(L.point(0,0),L.point(5,5)), nMinZoom = 0, nMaxZoom = this[projection].options.resolutions.length;
    if(!template.zoomBounds){
      template.zoomBounds ={};
      template.zoomBounds.min=0;
      template.zoomBounds.max=nMaxZoom;
    }
    for(let i=0;i<inputs.length;i++){
      switch(inputs[i].getAttribute("type")){
        case "zoom":
          nMinZoom = +inputs[i].getAttribute("min");
          nMaxZoom = +inputs[i].getAttribute("max");
          value = +inputs[i].getAttribute("value");
        break;
        case "location":
          if(!inputs[i].getAttribute("max") || !inputs[i].getAttribute("min")) continue;
          let max = +inputs[i].getAttribute("max"),min = +inputs[i].getAttribute("min");
          switch(inputs[i].getAttribute("axis").toLowerCase()){
            case "x":
            case "j":
            case "longitude":
            case "column":
            case "easting":
              boundsUnit = M.axisToCS(inputs[i].getAttribute("axis").toLowerCase());
              bounds.min.x = min;
              bounds.max.x = max;
            break;
            case "y":
            case "i":
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
    switch(axis.toLowerCase()){
      case "row":
      case "column":
        return "tilematrix";
      case "i":
      case "j":
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
  },

  boundsToPCRSBounds: function(bounds, zoom, projection,cs){
    if(!bounds || !zoom && +zoom !== 0 || !cs) return undefined;
    switch(cs.toUpperCase()){
      case "TILEMATRIX":
        let tileToPixelBounds = L.bounds(L.point(bounds.min.x*TILE_SIZE,bounds.min.y*TILE_SIZE),
                                  L.point(bounds.max.x*TILE_SIZE,bounds.max.y*TILE_SIZE));
        return M.pixelToPCRSBounds(tileToPixelBounds,zoom,projection);
      case "PCRS":
        return bounds;
      case "TCRS" || "TILE":
        return M.pixelToPCRSBounds(bounds,zoom,projection);
      case "GCRS":
        let minPoint = this[projection].project(L.latLng(bounds.min.y,bounds.min.x));
        let maxPoint = this[projection].project(L.latLng(bounds.max.y,bounds.max.x));
        return L.bounds(minPoint,maxPoint);
      default:
        return undefined;
    }
  },

  //L.bounds have fixed point positions, where min is always topleft, max is always bottom right, and the values are always sorted by leaflet
  //important to consider when working with pcrs where the origin is not topleft but rather bottomleft, could lead to confusion
  pixelToPCRSBounds : function(bounds, zoom, projection){
    if(!bounds || !bounds.max || !bounds.min ||zoom === undefined || zoom === null || zoom instanceof Object) return undefined;
    let min = this[projection].transformation.untransform(bounds.min,this[projection].scale(zoom));
    let max = this[projection].transformation.untransform(bounds.max,this[projection].scale(zoom));
    return L.bounds(min,max);
  },
  //meta content is the content attribute of meta
  // input "max=5,min=4" => [[max,5][min,5]]
  metaContentToObject: function(content){
    if(!content || content instanceof Object)return {};
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
      if (!(container instanceof Element) || !mapml || !mapml.querySelector('link[rel=stylesheet],style')) return;

      if(base instanceof Element) {
        base = base.getAttribute('href')?base.getAttribute('href'):document.URL;
      } else if (!base || base==="" || base instanceof Object) {
        return;
      }

      var ss = [];
      var stylesheets = mapml.querySelectorAll('link[rel=stylesheet],style');
      for (var i=0;i<stylesheets.length;i++) {
        if (stylesheets[i].nodeName.toUpperCase() === "LINK" ) {
          var href = stylesheets[i].hasAttribute('href') ? new URL(stylesheets[i].getAttribute('href'),base).href: null;
          if (href) {
            if (!container.querySelector("link[href='"+href+"']")) {
              var linkElm = document.createElement("link");
              linkElm.setAttribute("href", href);
              linkElm.setAttribute("rel", "stylesheet");
              ss.push(linkElm);
            }
          }  
        } else { // <style>
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
};

M.axisToCS = M.Util.axisToCS;
M.parseNumber = M.Util.parseNumber;
M.extractInputBounds = M.Util.extractInputBounds;
M.splitCoordinate = M.Util.splitCoordinate;
M.boundsToPCRSBounds = M.Util.boundsToPCRSBounds;
M.pixelToPCRSBounds = M.Util.pixelToPCRSBounds;
M.metaContentToObject = M.Util.metaContentToObject;
M.coordsToArray = M.Util.coordsToArray;
M.parseStylesheetAsHTML = M.Util.parseStylesheetAsHTML;
M.QueryHandler = L.Handler.extend({
    addHooks: function() {
        // get a reference to the actual <map> element, so we can 
        // use its layers property to iterate the layers from top down
        // evaluating if they are 'on the map' (enabled)
        L.setOptions(this, {mapEl: this._map.options.mapEl});
        L.DomEvent.on(this._map, 'click', this._queryTopLayer, this);
        L.DomEvent.on(this._map, 'keypress', this._queryTopLayerAtMapCenter, this);
    },
    removeHooks: function() {
        L.DomEvent.off(this._map, 'click', this._queryTopLayer, this);
        L.DomEvent.on(this._map, 'keypress', this._queryTopLayerAtMapCenter, this);
    },
    _getTopQueryableLayer: function() {
        var layers = this.options.mapEl.layers;
        // work backwards in document order (top down)
        for (var l=layers.length-1;l>=0;l--) {
          var mapmlLayer = layers[l]._layer;
          if (layers[l].checked && mapmlLayer.queryable) {
              return mapmlLayer;
          }
        }
    },
    _queryTopLayerAtMapCenter: function (event) {
        if (event.originalEvent.key === " ") {
          this._map.fire('click', { 
              latlng: this._map.getCenter(),
              layerPoint: this._map.latLngToLayerPoint(this._map.getCenter()),
              containerPoint: this._map.latLngToContainerPoint(this._map.getCenter())
          });
        }
    },
    _queryTopLayer: function(event) {
        var layer = this._getTopQueryableLayer();
        if (layer) {
            this._query(event, layer);
        }
    },
    _query(e, layer) {
      var obj = {},
          template = layer.getQueryTemplates()[0],
          zoom = e.target.getZoom(),
          map = this._map,
          crs = layer.crs,
          container = layer._container,
          popupOptions = {autoPan: true, maxHeight: (map.getSize().y * 0.5) - 50},
          tcrs2pcrs = function (c) {
            return crs.transformation.untransform(c,crs.scale(zoom));
          },
          tcrs2gcrs = function (c) {
            return crs.unproject(crs.transformation.untransform(c,crs.scale(zoom)),zoom);
          };
      var tcrsClickLoc = crs.latLngToPoint(e.latlng, zoom),
          tileMatrixClickLoc = tcrsClickLoc.divideBy(TILE_SIZE).floor(),
          tileBounds = new L.Bounds(tcrsClickLoc.divideBy(TILE_SIZE).floor().multiplyBy(TILE_SIZE), 
          tcrsClickLoc.divideBy(TILE_SIZE).ceil().multiplyBy(TILE_SIZE));
  
      // all of the following are locations that might be used in a query, I think.
      obj[template.query.tilei] = tcrsClickLoc.x.toFixed() - (tileMatrixClickLoc.x * TILE_SIZE);
      obj[template.query.tilej] = tcrsClickLoc.y.toFixed() - (tileMatrixClickLoc.y * TILE_SIZE);
      
      // this forces the click to the centre of the map extent in the layer crs
      obj[template.query.mapi] = (map.getSize().divideBy(2)).x.toFixed();
      obj[template.query.mapj] = (map.getSize().divideBy(2)).y.toFixed();
      
      obj[template.query.pixelleft] = crs.pointToLatLng(tcrsClickLoc, zoom).lng;
      obj[template.query.pixeltop] = crs.pointToLatLng(tcrsClickLoc, zoom).lat;
      obj[template.query.pixelright] = crs.pointToLatLng(tcrsClickLoc.add([1,1]), zoom).lng;
      obj[template.query.pixelbottom] = crs.pointToLatLng(tcrsClickLoc.add([1,1]), zoom).lat;
      
      obj[template.query.column] = tileMatrixClickLoc.x;
      obj[template.query.row] = tileMatrixClickLoc.y;
      obj[template.query.x] = tcrsClickLoc.x.toFixed();
      obj[template.query.y] = tcrsClickLoc.y.toFixed();
      
      // whereas the layerPoint is calculated relative to the origin plus / minus any
      // pan movements so is equal to containerPoint at first before any pans, but
      // changes as the map pans. 
      obj[template.query.easting] =  tcrs2pcrs(tcrsClickLoc).x;
      obj[template.query.northing] = tcrs2pcrs(tcrsClickLoc).y;
      obj[template.query.longitude] =  tcrs2gcrs(tcrsClickLoc).lng;
      obj[template.query.latitude] = tcrs2gcrs(tcrsClickLoc).lat;
      obj[template.query.zoom] = zoom;
      obj[template.query.width] = map.getSize().x;
      obj[template.query.height] = map.getSize().y;
      // assumes the click is at the centre of the map, per template.query.mapi, mapj above
      obj[template.query.mapbottom] = tcrs2pcrs(tcrsClickLoc.add(map.getSize().divideBy(2))).y;
      obj[template.query.mapleft] = tcrs2pcrs(tcrsClickLoc.subtract(map.getSize().divideBy(2))).x;
      obj[template.query.maptop] = tcrs2pcrs(tcrsClickLoc.subtract(map.getSize().divideBy(2))).y;
      obj[template.query.mapright] = tcrs2pcrs(tcrsClickLoc.add(map.getSize().divideBy(2))).x;
      
      obj[template.query.tilebottom] = tcrs2pcrs(tileBounds.max).y;
      obj[template.query.tileleft] = tcrs2pcrs(tileBounds.min).x;
      obj[template.query.tiletop] = tcrs2pcrs(tileBounds.min).y;
      obj[template.query.tileright] = tcrs2pcrs(tileBounds.max).x;
      // add hidden or other variables that may be present into the values to
      // be processed by L.Util.template below.
      for (var v in template.query) {
          if (["mapi","mapj","tilei","tilej","row","col","x","y","easting","northing","longitude","latitude","width","height","zoom","mapleft","mapright",",maptop","mapbottom","tileleft","tileright","tiletop","tilebottom","pixeltop","pixelbottom","pixelleft","pixelright"].indexOf(v) < 0) {
              obj[v] = template.query[v];
          }
      }
      fetch(L.Util.template(template.template, obj),{redirect: 'follow'}).then(
          function(response) {
            if (response.status >= 200 && response.status < 300) {
              return Promise.resolve(response);
            } else {
              console.log('Looks like there was a problem. Status Code: ' + response.status);
              return Promise.reject(response);
            }
          }).then(function(response) {
            var contenttype = response.headers.get("Content-Type");
            if ( contenttype.startsWith("text/mapml")) {
              return handleMapMLResponse(response, e.latlng);
            } else {
              return handleOtherResponse(response, layer, e.latlng);
            }
          }).catch(function(err) {
            // no op
          });
      function handleMapMLResponse(response, loc) {
          return response.text().then(mapml => {
              // bind the deprojection function of the layer's crs 
              var _unproject = L.bind(crs.unproject, crs);
              function _coordsToLatLng(coords) {
                  return _unproject(L.point(coords));
              }
              var parser = new DOMParser(),
                  mapmldoc = parser.parseFromString(mapml, "application/xml"),
                  f = M.mapMlFeatures(mapmldoc, {
                  // pass the vector layer a renderer of its own, otherwise leaflet
                  // puts everything into the overlayPane
                  renderer: L.svg(),
                  // pass the vector layer the container for the parent into which
                  // it will append its own container for rendering into
                  pane: container,
                  color: 'yellow',
                  // instead of unprojecting and then projecting and scaling,
                  // a much smarter approach would be to scale at the current
                  // zoom
                  coordsToLatLng: _coordsToLatLng,
                  imagePath: M.detectImagePath(map.getContainer())
              });
              f.addTo(map);

              var c = document.createElement('iframe');
              c.csp = "script-src 'none'";
              c.style = "border: none";
              c.srcdoc = mapmldoc.querySelector('feature properties').innerHTML;

              // passing a latlng to the popup is necessary for when there is no
              // geometry / null geometry
              layer.bindPopup(c, popupOptions).openPopup(loc);
              layer.on('popupclose', function() {
                  map.removeLayer(f);
              });
          });
      }
      function handleOtherResponse(response, layer, loc) {
          return response.text().then(text => {
              var c = document.createElement('iframe');
              c.csp = "script-src 'none'";
              c.style = "border: none";
              c.srcdoc = text;
              layer.bindPopup(c, popupOptions).openPopup(loc);
          });
      }
    }
});
// see https://leafletjs.com/examples/extending/extending-3-controls.html#handlers
L.Map.addInitHook('addHandler', 'query', M.QueryHandler);
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
        var mapml;
        if (href) {
            this._href = href;
        }
        if (content) {
          this._layerEl = content;
          mapml = content.querySelector('image,feature,tile,extent') ? true : false;
          if (!href && mapml) {
              this._content = content;
          }
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
        // weirdness.  options is actually undefined here, despite the hardcoded
        // options above. If you use this.options, you see the options defined
        // above.  Not going to change this, but failing to understand ATM.
        // may revisit some time.
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
              imagePath: M.detectImagePath(this._map.getContainer()),
              // each owned child layer gets a reference to the root layer
              _leafletLayer: this,
              onEachFeature: function(properties, geometry) {
                // need to parse as HTML to preserve semantics and styles
                if (properties) {
                  var c = document.createElement('div');
                  c.insertAdjacentHTML('afterbegin', properties.innerHTML);
                  geometry.bindPopup(c, {autoPan:false});
                }
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
        
        //only add the layer if there are tiles to be rendered
        if((!this._staticTileLayer || this._staticTileLayer._container === null) && 
          this._mapmlTileContainer.getElementsByTagName("tiles").length > 0)
        {
          this._staticTileLayer = M.mapMLStaticTileLayer({
            pane:this._container,
            className:"mapml-static-tile-layer",
            tileContainer:this._mapmlTileContainer,
            maxZoomBound:map.options.crs.options.resolutions.length,
          });
          map.addLayer(this._staticTileLayer);
        }

        // if the extent has been initialized and received, update the map,
        if (this._extent) {
            if (this._templateVars) {
              this._templatedLayer = M.templatedLayer(this._templateVars, 
              { pane: this._container,
                imagePath: M.detectImagePath(this._map.getContainer()),
                _leafletLayer: this,
                crs: this.crs
              }).addTo(map);
            }
        } else {
            this.once('extentload', function() {
                if (this._templateVars) {
                  this._templatedLayer = M.templatedLayer(this._templateVars, 
                  { pane: this._container,
                    imagePath: M.detectImagePath(this._map.getContainer()),
                    _leafletLayer: this,
                    crs: this.crs
                  }).addTo(map);
                  this._setLayerElExtent();
                }
              }, this);
        }
        this._setLayerElExtent();
        this.setZIndex(this.options.zIndex);
        this.getPane().appendChild(this._container);
    },

    //sets the <layer-> elements .bounds property 
    _setLayerElExtent: function(){
      let localBounds, localZoomRanges;
      let layerTypes = ["_staticTileLayer","_imageLayer","_mapmlvectors","_templatedLayer"];
      layerTypes.forEach((type) =>{
        if(this[type]){
          switch(type){
            case "_templatedLayer":
              for(let j =0;j<this[type]._templates.length;j++){
                let templateType = this[type]._templates[j].rel === "query"?"query":"layer";
                if(this[type]._templates[j][templateType].layerBounds){
                  if(!localBounds){
                    localBounds = this[type]._templates[j][templateType].layerBounds;
                    localZoomRanges = this[type]._templates[j][templateType].zoomBounds;
                  } else {
                    localBounds.extend(this[type]._templates[j][templateType].layerBounds);
                  }
                }
              }
              break;
            default:
              if(this[type].layerBounds){
                if(!localBounds){
                  localBounds = this[type].layerBounds;
                  localZoomRanges = this[type].zoomBounds;
                } else{
                  localBounds.extend(this[type].layerBounds);
                }
              } 
              break;
          }
        }
      });
      if(localBounds){
        let locations = {
          crs:`${this.options.mapprojection}/pcrs`,
          topLeft:{horizontal:localBounds.min.x,vertical:localBounds.max.y},
          bottomRight:{horizontal:localBounds.max.x,vertical:localBounds.min.y},
        };
        this._layerEl.extent = {extent:locations,zoom:localZoomRanges};
      }
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    getEvents: function () {
        return {zoomanim: this._onZoomAnim};
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
      if (!(min <= toZoom && toZoom <= max)){
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
        if(this._staticTileLayer){
          map.removeLayer(this._staticTileLayer);
        }
        map.removeLayer(this._mapmlvectors);
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
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting">
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
      var fieldset = document.createElement('fieldset'),
        input = document.createElement('input'),
        label = document.createElement('label'),
        name = document.createElement('span'),
        details = document.createElement('details'),
        summary = document.createElement('summary'),
        opacity = document.createElement('input'),
        opacityControl = document.createElement('details'),
        opacityControlSummary = document.createElement('summary'),
        opacityControlSummaryLabel = document.createElement('label');

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
        label.appendChild(input);
        label.appendChild(name);
        opacityControlSummaryLabel.innerText = 'Opacity';
        opacity.id = "o" + L.stamp(opacity);
        opacityControlSummaryLabel.setAttribute('for', opacity.id);
        opacityControlSummary.appendChild(opacityControlSummaryLabel);
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

        fieldset.appendChild(details);
        details.appendChild(summary);
        summary.appendChild(label);
        details.appendChild(opacityControl);

        if (this._styles) {
          details.appendChild(this._styles);
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
                  var userfieldset = document.createElement('fieldset'),
                      selectdetails = document.createElement('details'),
                      selectsummary = document.createElement('summary'),
                      selectSummaryLabel = document.createElement('label');
                      selectSummaryLabel.innerText = mapmlInput.getAttribute('name');
                      selectSummaryLabel.setAttribute('for', mapmlInput.getAttribute('id'));
                      L.DomUtil.addClass(selectdetails, 'mapml-control-layers');
                      selectsummary.appendChild(selectSummaryLabel);
                      selectdetails.appendChild(selectsummary);
                      selectdetails.appendChild(mapmlInput.htmlselect);
                      userfieldset.appendChild(selectdetails);
                  frag.appendChild(userfieldset);
                }
              }
            }
          }
          details.appendChild(frag);
        }
        return fieldset;
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
            _processInitialExtent.call(this, content);
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
            if(!this.responseXML && this.responseText) mapml = new DOMParser().parseFromString(this.responseText,'text/xml');
            if (this.readyState === this.DONE && mapml.querySelector) {
                var serverExtent = mapml.querySelector('extent') || mapml.querySelector('meta[name=projection]'),
                    projectionMatch = serverExtent && serverExtent.hasAttribute('units') && 
                    serverExtent.getAttribute('units').toUpperCase() === layer.options.mapprojection || 
                    serverExtent && serverExtent.hasAttribute('content') && 
                    M.metaContentToObject(serverExtent.getAttribute('content')).content ===layer.options.mapprojection,
                    selectedAlternate = !projectionMatch && mapml.querySelector('head link[rel=alternate][projection='+layer.options.mapprojection+']'),
                    
                    base = 
      (new URL(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : mapml.baseURI || this.responseURL, this.responseURL)).href;
                
                if (!serverExtent) {
                    serverExtent = layer._synthesizeExtent(mapml);
                    // the mapml resource does not have a (complete) extent form, save
                    // its content if any so we don't have to revisit the server, ever.
                    if (mapml.querySelector('feature,image,tile')) {
                        layer._content = mapml;
                    }
                } else if (!projectionMatch && selectedAlternate && selectedAlternate.hasAttribute('href')) {
                     
                    layer.fire('changeprojection', {href:  (new URL(selectedAlternate.getAttribute('href'), base)).href}, false);
                    return;
                } else if (serverExtent.querySelector('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]') &&
                        serverExtent.hasAttribute("units")) {
                  layer._templateVars = [];
                  // set up the URL template and associated inputs (which yield variable values when processed)
                  var tlist = serverExtent.querySelectorAll('link[rel=tile],link[rel=image],link[rel=features],link[rel=query]'),
                      varNamesRe = (new RegExp('(?:\{)(.*?)(?:\})','g')),
                      zoomInput = serverExtent.querySelector('input[type="zoom" i]'),
                      includesZoom = false;
                  for (var i=0;i< tlist.length;i++) {
                    var t = tlist[i],
                        template = t.getAttribute('tref'), v,
                        title = t.hasAttribute('title') ? t.getAttribute('title') : 'Query this layer',
                        vcount=template.match(varNamesRe),
                        trel = (!t.hasAttribute('rel') || t.getAttribute('rel').toLowerCase() === 'tile') ? 'tile' : t.getAttribute('rel').toLowerCase(),
                        ttype = (!t.hasAttribute('type')? 'image/*':t.getAttribute('type').toLowerCase()),
                        inputs = [];
                        var zoomBounds = mapml.querySelector('meta[name=zoom]')?
                                          M.metaContentToObject(mapml.querySelector('meta[name=zoom]').getAttribute('content')):
                                          undefined;
                    while ((v = varNamesRe.exec(template)) !== null) {
                      var varName = v[1],
                      inp = serverExtent.querySelector('input[name='+varName+'],select[name='+varName+']');
                      if (inp) {
                        inputs.push(inp);
                        includesZoom = includesZoom || inp.hasAttribute("type") && inp.getAttribute("type").toLowerCase() === "zoom";
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
                      if (trel === 'query') {
                        layer.queryable = true;
                      }
                      if(!includesZoom && zoomInput) {
                        inputs.push(zoomInput);
                      }
                      // template has a matching input for every variable reference {varref}
                      layer._templateVars.push({
                        template:decodeURI(new URL(template, base)), 
                        title:title, 
                        rel: trel, 
                        type: ttype, 
                        values: inputs, 
                        zoomBounds:zoomBounds, 
                        projection:serverExtent.getAttribute("units") || server.getAttribute("content") || "NONE" // TODO: dont think it ever reaches "NONE", need to check
                      });
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
                    layer._extent.zoomin = (new URL(zoomin.getAttribute('href'), base)).href;
                }
                if (zoomout) {
                    layer._extent.zoomout = (new URL(zoomout.getAttribute('href'), base)).href;
                }
                if (layer._templatedLayer) {
                  layer._templatedLayer.reset(layer._templateVars);
                }
                if (mapml.querySelector('tile')) {
                  var tiles = document.createElement("tiles"),
                    zoom = mapml.querySelector('meta[name=zoom][content]') || mapml.querySelector('input[type=zoom][value]');
                  tiles.setAttribute("zoom", zoom && zoom.getAttribute('content') || zoom && zoom.getAttribute('value') || "0");
                  var newTiles = mapml.getElementsByTagName('tile');
                  for (var nt=0;nt<newTiles.length;nt++) {
                      tiles.appendChild(document.importNode(newTiles[nt], true));
                  }
                  layer._mapmlTileContainer.appendChild(tiles);
                }
                M.parseStylesheetAsHTML(mapml, base, layer._container);
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
                    styleOptionInput.setAttribute("data-href", new URL(styleLinks[j].getAttribute('href'),base).href);
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
        
        extent.appendChild(xminInput);
        extent.appendChild(yminInput);
        extent.appendChild(xmaxInput);
        extent.appendChild(ymaxInput);
        extent.appendChild(zoom);
        extent.appendChild(projection);

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
        var lp = serverExtent.hasAttribute("units") ? serverExtent.getAttribute("units") : null;
        if (lp && lp === "OSMTILE" || lp === "WGS84" || lp === "APSTILE" || lp === "CBMTILE") {
          this.crs = M[lp];
        } else {
          this.crs = M.OSMTILE;
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
            proj = metaProjection ? metaProjection.getAttribute('content'): FALLBACK_PROJECTION,
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
    // this takes into account that WGS84 is considered a wildcard match.
    _projectionMatches: function(map) {
        map = map||this._map;
        var projection = this.getProjection();
        if (!map.options.projection || projection !== 'WGS84' && map.options.projection !== projection) return false;
        return true;
    },
    getQueryTemplates: function() {
        if (this._templatedLayer && this._templatedLayer._queries) {
          return this._templatedLayer._queries;
        }
    }
});
M.mapMLLayer = function (url, node, options) {
  if (!url && !node) return null;
	return new M.MapMLLayer(url, node, options);
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

		this._container.appendChild(this._image);
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
        let inputData = M.extractInputBounds(template);
        this.zoomBounds = inputData.zoomBounds;
        this.layerBounds=inputData.bounds;
        this.isVisible = true;
        L.setOptions(this, L.extend(options,this._setUpExtentTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._setBoundsFlag
        };
        return events;
    },
    onAdd: function () {
        this.setZIndex(this.options.zIndex);
        this._map.fire('moveend',true);
    },
    redraw: function() {
        this._onMoveEnd();
    },

    _setBoundsFlag : function(){
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom && 
                        this.layerBounds.overlaps(mapBounds);
      if(!(this.isVisible)){
        this._clearLayer();
        return;
      }
      this._onMoveEnd();
    },

    _clearLayer: function(){
      let containerImages = this._container.querySelectorAll('img');
      for(let i = 0; i< containerImages.length;i++){
        this._container.removeChild(containerImages[i]);
      }
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
            select = (inputs[i].tagName.toLowerCase() === "select"),
            min = inputs[i].getAttribute("min") || min,
            max = inputs[i].getAttribute("max") || max;
        if (type === "width") {
              extentVarNames.extent.width = name;
        } else if ( type === "height") {
              extentVarNames.extent.height = name;
        } else if (type === "location" && (units === "pcrs" || units ==="gcrs") ) {
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting|latitude|longitude">
          switch (axis) {
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    extentVarNames.extent.left = name;
                  } else if (position.match(/.*?-right/i)) {
                    extentVarNames.extent.right = name;
                  }
              }
              break;
            case ('latitude'):
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
    },
});
M.templatedImageLayer = function(template, options) {
    return new M.TemplatedImageLayer(template, options);
};
M.TemplatedFeaturesLayer =  L.Layer.extend({
  // this and M.ImageLayer could be merged or inherit from a common parent
    initialize: function(template, options) {
      let inputData = M.extractInputBounds(template);
      this.zoomBounds = inputData.zoomBounds;
      this.layerBounds=inputData.bounds;
      this.isVisible = true;
        this._template = template;
        this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
        L.DomUtil.addClass(this._container, 'mapml-features-container');
        L.setOptions(this, L.extend(options,this._setUpFeaturesTemplateVars(template)));
    },
    getEvents: function () {
        var events = {
            moveend: this._setBoundsFlag
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
              var base = (new URL(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : url)).href;
              url = mapml.querySelector('link[rel=next]')? mapml.querySelector('link[rel=next]').getAttribute('href') : null;
              url =  url ? (new URL(url, base)).href: null;
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

    // TODO: templated layers have very similar _setBoundsFlag methods, might be valuable considering inheriting this function from a paraent class
    _setBoundsFlag : function(){
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom && 
                        this.layerBounds.overlaps(mapBounds);
      if(Object.keys(this.layerBounds).length === 0){ //temporary to allow layers with no bounds currently to still work, remove once bounds
        this.isVisible = true;  //are implemented for all layer types that use templatedTileLayer
      }
      if(!(this.isVisible)){
        this._features.clearLayers();
        return;
      }
      this._onMoveEnd();
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
              var base = (new URL(mapml.querySelector('base') ? mapml.querySelector('base').getAttribute('href') : url)).href;
              url = mapml.querySelector('link[rel=next]')? mapml.querySelector('link[rel=next]').getAttribute('href') : null;
              url =  url ? (new URL(url, base)).href: null;
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
          //<input name="..." units="pcrs" type="location" position="top|bottom-left|right" axis="northing|easting">
          switch (axis) {
            case ('x'):
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    featuresVarNames.feature.left = { name: name, axis: axis};
                  } else if (position.match(/.*?-right/i)) {
                    featuresVarNames.feature.right = { name: name, axis: axis};
                  }
              }
              break;
            case ('y'):
            case ('latitude'):
            case ('northing'):
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
      if (templates[i].rel === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i], 
            L.Util.extend(options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'query') {
          // add template to array of queryies to be added to map and processed
          // on click/tap events
          this.options._leafletLayer._map.on('moveend', this._setBoundsFlag, this);
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
      if (this._templates[i].rel === 'tile' || this._templates[i].rel === 'image' || this._templates[i].rel === 'features') {
          this._templates[i].layer.redraw();
      }
    }
  },
  _onZoomStart: function() {
      this.closePopup();
  },

  _setBoundsFlag : function(){
    let templates = this._templates, map = this.options._leafletLayer._map;
    let zoom = map.getZoom(), mapBounds = M.pixelToPCRSBounds(map.getPixelBounds(),zoom,map.options.projection);
    for(let i = 0;i<templates.length;i++){
      if(templates[i].rel === "query"){
        if(zoom <= templates[i].query.zoomBounds.maxZoom && 
          zoom >= templates[i].query.zoomBounds.minZoom && 
          templates[i].query.layerBounds.overlaps(mapBounds))
        {
          templates[i].query.isVisible = true;
        }
      }
    }
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
          inputs = template.values,
          bounds = M.extractInputBounds(template);
      queryVarNames.query.layerBounds = bounds.bounds;
      queryVarNames.query.zoomBounds = bounds.zoomBounds;
      queryVarNames.query.isVisible = true;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            rel = inputs[i].getAttribute("rel"),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "width") {
              queryVarNames.query.width = name;
        } else if ( type === "height") {
              queryVarNames.query.height = name;
        } else if (type === "location") { 
          switch (axis) {
            case('x'):
            case('y'):
            case("column"): 
            case("row"):
              queryVarNames.query[axis] = name;
              break;
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelleft = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tileleft = name;
                    } else {
                      queryVarNames.query.mapleft = name;
                    }
                  } else if (position.match(/.*?-right/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelright = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tileright = name;
                    } else {
                      queryVarNames.query.mapright = name;
                    }
                  }
              } else {
                  queryVarNames.query[axis] = name;
              }
              break;
            case ('latitude'):
            case ('northing'):
              if (position) {
                  if (position.match(/top-.*?/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixeltop = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tiletop = name;
                    } else {
                      queryVarNames.query.maptop = name;
                    }
                  } else if (position.match(/bottom-.*?/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelbottom = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tilebottom = name;
                    } else {
                      queryVarNames.query.mapbottom = name;
                    }
                  }
              } else {
                queryVarNames.query[axis] = name;
              }
              break;
            case('i'):
              if (units === "tile") {
                queryVarNames.query.tilei = name;
              } else {
                queryVarNames.query.mapi = name;
              }
              break;
            case('j'):
              if (units === "tile") {
                queryVarNames.query.tilej = name;
              } else {
                queryVarNames.query.mapj = name;
              }
              break;
            default:
              // unsuportted axis value
          }
        } else if (type === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17">
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
      if (templates[i].rel === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i],
            L.Util.extend(this.options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'query') {
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
      if (this._templates[i].rel !== 'query') {
        map.addLayer(this._templates[i].layer);
      }
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
      if (this._templates[i].rel !== 'query') {
        map.removeLayer(this._templates[i].layer);
      } else {
        map.off('moveend',this._setBoundsFlag);
      }
    }
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
      // _setUpTileTemplateVars needs options.crs, not available unless we set
      // options first...
      let inputData = M.extractInputBounds(template);
      this.zoomBounds = inputData.zoomBounds;
      this.layerBounds=inputData.bounds;
      this.isVisible = true;
      Object.assign(options,this.zoomBounds);
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
      this._map.fire('moveend',true);
      L.TileLayer.prototype.onAdd.call(this,this._map);
    },

    getEvents: function(){
      let events = L.TileLayer.prototype.getEvents.call(this,this._map);
      events.moveend = this._setBoundsFlag;
      //events.move = ()=>{};
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
    _setBoundsFlag : function(e){
      let mapZoom = this._map.getZoom();
      let mapBounds = M.pixelToPCRSBounds(this._map.getPixelBounds(),mapZoom,this._map.options.projection);
      this.isVisible = mapZoom <= this.options.maxZoom && mapZoom >= this.options.minZoom && 
                        this.layerBounds.overlaps(mapBounds);
      if(Object.keys(this.layerBounds).length === 0){ //temporary to allow layers with no bounds currently to still work, remove once bounds
        this.isVisible = true;  //are implemented for all layer types that use templatedTileLayer
      }
      if(!(this.isVisible))return; //onMoveEnd still gets fired even when layer is out of bounds??, most likely need to overrride _onMoveEnd
      this.fire('moveend',e,true);
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
      //if(this.isVisible){
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
      //}

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
M.templatedTileLayer = function(template, options) {
  return new M.TemplatedTileLayer(template, options);
};
M.MapMLStaticTileLayer = L.GridLayer.extend({

  initialize: function (options) {
    this.zoomBounds = this._getZoomBounds(options.tileContainer,options.maxZoomBound);
    Object.assign(options,this.zoomBounds); //same as the ...operator but doesnt throw warnings by jshint
    L.setOptions(this, options);
    this._groups = this._groupTiles(this.options.tileContainer.getElementsByTagName('tile'));
  },

  onAdd: function(){
    this._bounds = this._getLayerBounds(this._groups,this._map.options.projection); //stores meter values of bounds
    this.layerBounds = this._bounds[Object.keys(this._bounds)[0]];
    for(let key of Object.keys(this._bounds)){
      this.layerBounds.extend(this._bounds[key].min);
      this.layerBounds.extend(this._bounds[key].max);
    }
    this._setBoundsFlag();
    L.GridLayer.prototype.onAdd.call(this,this._map);
  },
  
  getEvents: function(){
    let events = L.GridLayer.prototype.getEvents.call(this,this._map);
    events.moveend = this._setBoundsFlag;
    events.move = ()=>{}; //needed to prevent moveend from running
    return events;
  },


  //sets the bounds flag of the layer and calls default moveEnd if within bounds
  //its the zoom level is between the nativeZoom and zoom then it uses the nativeZoom value to get the bound its checking
  _setBoundsFlag : function(e){
    let mapZoom = this._map.getZoom();
    let zoomLevel = mapZoom;
    zoomLevel = zoomLevel > this.options.maxNativeZoom? this.options.maxNativeZoom: zoomLevel;
    zoomLevel = zoomLevel < this.options.minNativeZoom? this.options.minNativeZoom: zoomLevel;
    this.isVisible = mapZoom <= this.zoomBounds.maxZoom && mapZoom >= this.zoomBounds.minZoom && 
                      this._bounds[zoomLevel] && this._bounds[zoomLevel]
                      .overlaps(M.pixelToPCRSBounds(
                        this._map.getPixelBounds(),
                        this._map.getZoom(),
                        this._map.options.projection));
    
    if(!(this.isVisible))return; //onMoveEnd still gets fired even when layer is out of bounds??, most likely need to overrride _onMoveEnd
    this.fire('moveend',e,true);
  },

  _isValidTile(coords) {
    //return true;
    return this._groups[this._tileCoordsToKey(coords)];
  },

  createTile: function (coords) {
    let tileGroup = this._groups[this._tileCoordsToKey(coords)] || [],
        tileElem = document.createElement('tile');
    tileElem.setAttribute("col",coords.x);
    tileElem.setAttribute("row",coords.y);
    tileElem.setAttribute("zoom",coords.z);
    
    for(let i = 0;i<tileGroup.length;i++){
      let tile= document.createElement('img');
      tile.src = tileGroup[i].src;
      tileElem.appendChild(tile);
    }
    return tileElem;
  },

  _getLayerBounds: function(tileGroups, projection){
    let layerBounds = {};
    for(let tile in tileGroups){
      let sCoords = tile.split(":"), pixelCoords = {};
      pixelCoords.x = +sCoords[0] * TILE_SIZE;
      pixelCoords.y = +sCoords[1] * TILE_SIZE;
      pixelCoords.z = +sCoords[2]; //+String same as parseInt(String)
      if(sCoords[2] in layerBounds){

        layerBounds[sCoords[2]].extend(L.point(pixelCoords.x ,pixelCoords.y ));
        layerBounds[sCoords[2]].extend(L.point(((pixelCoords.x+TILE_SIZE) ),((pixelCoords.y+TILE_SIZE) )));
      } else{
        layerBounds[sCoords[2]] = L.bounds(
                                    L.point(pixelCoords.x ,pixelCoords.y ),
                                    L.point(((pixelCoords.x+TILE_SIZE) ),((pixelCoords.y+TILE_SIZE) )));
      }
    }
    // TODO: optimize by removing 2nd loop, add util function to convert point in pixels to point in pcrs, use that instead then this loop
    // won't be needed
    for(let pixelBounds in layerBounds){
      let zoom = +pixelBounds;
      layerBounds[pixelBounds] = M.pixelToPCRSBounds(layerBounds[pixelBounds],zoom,projection);//needs to be changed to get projection of layer
    }

    return layerBounds;
  },

  _getZoomBounds: function(container, maxZoomBound){
    if(!container) return null;
    let meta = M.metaContentToObject(container.getElementsByTagName('tiles')[0].getAttribute('zoom')),
        zoom = {},tiles = container.getElementsByTagName("tile");
    zoom.maxNativeZoom = 0;
    zoom.minNativeZoom = maxZoomBound;
    for (let i=0;i<tiles.length;i++) {
      if(!tiles[i].getAttribute('zoom')) continue;
      if(+tiles[i].getAttribute('zoom') > zoom.maxNativeZoom) zoom.maxNativeZoom = +tiles[i].getAttribute('zoom');
      if(+tiles[i].getAttribute('zoom') < zoom.minNativeZoom) zoom.minNativeZoom = +tiles[i].getAttribute('zoom');
    }

    //hard coded to only natively zoom out 2 levels, any more and too many tiles are going to be loaded in at one time
    //lagging the users computer
    zoom.minZoom = zoom.minNativeZoom - 2 <= 0? 0: zoom.minNativeZoom - 2;
    zoom.maxZoom = maxZoomBound;
    if(meta.min)zoom.minZoom = +meta.min < (zoom.minNativeZoom - 2)?(zoom.minNativeZoom - 2):+meta.min;
    if(meta.max)zoom.maxZoom = +meta.max;
    return zoom;
  },

  _groupTiles: function (tiles) {
    let tileMap = {};
    for (let i=0;i<tiles.length;i++) {
      let tile = {};
      tile.row = +tiles[i].getAttribute('row');
      tile.col = +tiles[i].getAttribute('col');
      tile.zoom = +tiles[i].getAttribute('zoom');
      tile.src = tiles[i].getAttribute('src');
      let tileCode = tile.col+":"+tile.row+":"+tile.zoom;
      if(tileCode in tileMap){
        tileMap[tileCode].push(tile);
      } else{
        tileMap[tileCode]=[tile];
      }
    }
    return tileMap;
  },
});

M.mapMLStaticTileLayer = function(options) {
  return new M.MapMLStaticTileLayer(options);
};
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
        //needed to check if the feature is static or not, since this method is used by templated also
        if(!mapml.querySelector('extent') && mapml.querySelector('feature')){
          this._features = {};
          this._staticFeature = true;
          this.isVisible = true; //placeholder for when this actually gets updated in the future
          this.zoomBounds = this._getZoomBounds(mapml);
          this.layerBounds = this._getLayerBounds(mapml);
        }
        this.addData(mapml);
        if(this._staticFeature){
          this._resetFeatures(this._clampZoom(this.options._leafletLayer._map.getZoom()));

          // TODO: attempt to set the maps zoom, doesnt update the map needs fixing
          this.options._leafletLayer._map.minZoom = Math.min(
            this.zoomBounds.minZoom,this.options._leafletLayer._map.minZoom || 30);
          this.options._leafletLayer._map.maxZoom = Math.max(
            this.zoomBounds.maxZoom,this.options._leafletLayer._map.maxZoom || 0);
        }
      }
    },

    getEvents: function(){
      if(this._staticFeature){
        return {
          'moveend':this._setBoundsFlag,
        };
      }
      return {
        'moveend':this._removeCSS
      };
    },

    _setBoundsFlag : function(){
      let zoomLevel = this._map.getZoom();
      zoomLevel = zoomLevel > this.zoomBounds.maxNativeZoom? this.zoomBounds.maxNativeZoom: zoomLevel;
      zoomLevel = zoomLevel < this.zoomBounds.minNativeZoom? this.zoomBounds.minNativeZoom: zoomLevel;
      this.isVisible = this._checkZoom() && this._layers && this.layerBounds && 
                        this.layerBounds.overlaps(
                          M.pixelToPCRSBounds(
                            this._map.getPixelBounds(),
                            this._map.getZoom(),this._map.options.projection));
      this._removeCSS();
    },

    //sets default if any are missing, better to only replace ones that are missing
    _getLayerBounds : function(container) {
      if (!container) return null;
      try{
        let projection = container.querySelector('meta[name=projection]') &&
                          M.metaContentToObject(
                            container.querySelector('meta[name=projection]').getAttribute('content'))
                            .content.toUpperCase() || FALLBACK_PROJECTION;
        let zoom = container.querySelector('meta[name=zoom]') && 
                    M.metaContentToObject(container.querySelector('meta[name=zoom]').getAttribute('content')).value || 
                    "0";
        let meta = container.querySelector('meta[name=extent]') && 
                    M.metaContentToObject(
                      container.querySelector('meta[name=extent]').getAttribute('content')) ||
                    {"top-left-vertical":0,"top-left-horizontal":0,"bottom-right-vertical":5,"bottom-right-horizontal":5};
        let cs = meta.cs || FALLBACK_CS;
        return M.boundsToPCRSBounds(
                L.bounds(L.point(+meta["top-left-vertical"],+meta["top-left-horizontal"]),
                L.point(+meta["bottom-right-vertical"],+meta["bottom-right-horizontal"])),
                zoom,projection.content,cs);
      } catch (error){
        //if error then by default set the layer to osm and bounds to the entire map view
        return M.boundsToPCRSBounds(L.bounds(L.point(0,0),L.point(5,5)),0,FALLBACK_PROJECTION,FALLBACK_CS);
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

    _checkZoom : function(){
      let clampZoom = this._clampZoom(this._map.getZoom());
      this._resetFeatures(clampZoom);
      if(clampZoom > this.zoomBounds.maxZoom || clampZoom < this.zoomBounds.minZoom){
        return false;
      }else if(this._features[clampZoom]){
        return true;
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

    _getZoomBounds: function(container){
      if (!container) return null;
      let nMin = 100,nMax=0, features = container.getElementsByTagName('feature'),meta,projection;
      for(let i =0;i<features.length;i++){
        if(!features[i].getAttribute('zoom')) continue;
        if(+features[i].getAttribute('zoom') > nMax) nMax = +features[i].getAttribute('zoom');
        if(+features[i].getAttribute('zoom') < nMin) nMin = +features[i].getAttribute('zoom');
      }
      try{
        projection = M.metaContentToObject(container.querySelector('meta[name=projection]').getAttribute('content')).content;
        meta = M.metaContentToObject(container.querySelector('meta[name=zoom]').getAttribute('content'));
      } catch(error){
        return {
          minZoom:0,
          maxZoom: M[projection || FALLBACK_PROJECTION].options.resolutions.length,
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

    addData: function (mapml) {
      var features = mapml.nodeType === Node.DOCUMENT_NODE || mapml.nodeName === "LAYER-" ? mapml.getElementsByTagName("feature") : null,
          i, len, feature;

      var linkedStylesheets = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelector("link[rel=stylesheet],style") : null;
      if (linkedStylesheets) {
        var base = mapml.querySelector('base') && mapml.querySelector('base').hasAttribute('href') ? 
            new URL(mapml.querySelector('base').getAttribute('href')).href : 
            mapml.URL;
        M.parseStylesheetAsHTML(mapml,base,this._container);
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
       return this; //if templated this runs
      }

      //if its a mapml with no more links this runs
      var options = this.options;

      if (options.filter && !options.filter(mapml)) { return; }
      
      if (mapml.classList.length) {
        options.className = mapml.classList.value;
      }

      var layer = M.MapMLFeatures.geometryToLayer(mapml, options.pointToLayer, options.coordsToLatLng, options);
      if (layer) {
        layer.properties = mapml.getElementsByTagName('properties')[0];
        
        // if the layer is being used as a query handler output, it will have
        // a color option set.  Otherwise, copy classes from the feature
        if (!layer.options.color && mapml.hasAttribute('class')) {
          layer.options.className = mapml.getAttribute('class');
        }
        layer.defaultOptions = layer.options;
        this.resetStyle(layer);

        if (options.onEachFeature) {
         options.onEachFeature(layer.properties, layer);
        }
        if(this._staticFeature){
          let featureZoom = mapml.getAttribute('zoom');
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
        this._container.removeChild(toDelete[i]);
      }
    },
});
L.extend(M.MapMLFeatures, {
	 geometryToLayer: function (mapml, pointToLayer, coordsToLatLng, vectorOptions) {
    var geometry = mapml.tagName.toUpperCase() === 'FEATURE' ? mapml.getElementsByTagName('geometry')[0] : mapml,
        latlng, latlngs, coordinates, member, members, linestrings;

    coordsToLatLng = coordsToLatLng || this.coordsToLatLng;
    var pointOptions = {  opacity: vectorOptions.opacity ? vectorOptions.opacity : null,
                          icon: L.icon(
                            { iconUrl: vectorOptions.imagePath+"marker-icon.png",
                              iconRetinaUrl: vectorOptions.imagePath+"marker-icon-2x.png",
                              shadowUrl: vectorOptions.imagePath+"marker-shadow.png",
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41]
                            })};

    switch (geometry.firstElementChild.tagName.toUpperCase()) {
      case 'POINT':
        coordinates = [];
        geometry.getElementsByTagName('coordinates')[0].textContent.split(/\s+/gim).forEach(M.parseNumber,coordinates);
        latlng = coordsToLatLng(coordinates);
        return pointToLayer ? pointToLayer(mapml, latlng) : 
                                    new L.Marker(latlng, pointOptions);

      case 'MULTIPOINT':
        coordinates = [];
        geometry.getElementsByTagName('coordinates')[0].textContent.match(/(\S+ \S+)/gim).forEach(M.splitCoordinate, coordinates);
        latlngs = this.coordsToLatLngs(coordinates, 0, coordsToLatLng);
        var points = new Array(latlngs.length);
        for(member=0;member<points.length;member++) {
          points[member] = new L.Marker(latlngs[member],pointOptions);
        }
        return new L.featureGroup(points);
      case 'LINESTRING':
        coordinates = [];
        geometry.getElementsByTagName('coordinates')[0].textContent.match(/(\S+ \S+)/gim).forEach(M.splitCoordinate, coordinates);
        latlngs = this.coordsToLatLngs(coordinates, 0, coordsToLatLng);
        return new L.Polyline(latlngs, vectorOptions);
      case 'MULTILINESTRING':
        members = geometry.getElementsByTagName('coordinates');
        linestrings = new Array(members.length);
        for (member=0;member<members.length;member++) {
          linestrings[member] = coordinatesToArray(members[member]);
        }
        latlngs = this.coordsToLatLngs(linestrings, 2, coordsToLatLng);
        return new L.Polyline(latlngs, vectorOptions);
      case 'POLYGON':
        var rings = geometry.getElementsByTagName('coordinates');
        latlngs = this.coordsToLatLngs(coordinatesToArray(rings), 1, coordsToLatLng);
        return new L.Polygon(latlngs, vectorOptions);
      case 'MULTIPOLYGON':
        members = geometry.getElementsByTagName('polygon');
        var polygons = new Array(members.length);
        for (member=0;member<members.length;member++) {
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
        (coordinates[i] || coordinates).textContent.match(/(\S+\s+\S+)/gim).forEach(M.splitCoordinate, a[i]);
      }
      return a;
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
        //this._validateExtents();
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
      //the settimeout allows the function inside the {} to be moved to the task/callback queue rather than executing immediately
      //allowing the callback function to be run after all the other moveend event handlers
      setTimeout(()=>{
        let layerTypes = ["_staticTileLayer","_imageLayer","_mapmlvectors","_templatedLayer"],layerProjection;
        for (let i = 0; i < this._layers.length; i++) {
          let count = 0, total=0;
          if(this._layers[i].layer._extent){
            layerProjection = this._layers[i].layer._extent.getAttribute('units') || 
              this._layers[i].layer._extent.getAttribute('content') ||
              this._layers[i].layer._extent.querySelector("input[type=projection]").getAttribute('value');
          } else {
            layerProjection = FALLBACK_PROJECTION;
          }
          if( !layerProjection || layerProjection === this._map.options.projection){
            for(let j = 0 ;j<layerTypes.length;j++){
              let type = layerTypes[j];
              if(this._layers[i].input.checked && this._layers[i].layer[type]){
                //uses switch incase other layer types have different structures where isVisible is located
                switch(type){
                  case "_templatedLayer":
                    for(let j =0;j<this._layers[i].layer[type]._templates.length;j++){
                      let templateType = this._layers[i].layer[type]._templates[j].rel ==="query"?
                                          "query":"layer";
                      total++;
                      if(!(this._layers[i].layer[type]._templates[j][templateType].isVisible))count++;
                    }
                  break;
                  default:
                    total++;
                    if(!(this._layers[i].layer[type].isVisible))count++;
                  break;
                }
              }
            }
          } else{
            count = 1;
            total = 1;
          }
          let label = this._layers[i].input.labels[0].getElementsByTagName("span"),
              input = this._layers[i].input.labels[0].getElementsByTagName("input");
          if(count === total && count != 0){
            input[0].parentElement.parentElement.parentElement.parentElement.disabled = true;
            label[0].style.fontStyle = "italic";
          } else {
            //might be better not to disable the layer controls, might want to deselect layer even when its out of bounds
            input[0].parentElement.parentElement.parentElement.parentElement.disabled = false;
            label[0].style.fontStyle = "normal";
          }
        }
      }, 0);
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
      
      this._overlaysList.appendChild(layercontrols);
      return layercontrols;
    }
});
M.mapMlLayerControl = function (layers, options) {
	return new M.MapMLLayerControl(layers, options);
};
}(window, document));
