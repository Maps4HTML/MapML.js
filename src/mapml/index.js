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
import { MapMLStaticTileLayer, mapMLStaticTileLayer } from './layers/StaticTileLayer';
import { MapMLLayerControl, mapMlLayerControl } from './layers/ControlLayer';
import { MapMLFeatures, mapMlFeatures } from './layers/FeatureLayer';
import { TemplatedTileLayer, templatedTileLayer } from './layers/TemplatedTileLayer';
import { TemplatedLayer, templatedLayer } from './layers/TemplatedLayer';
import { TemplatedFeaturesLayer, templatedFeaturesLayer } from './layers/TemplatedFeaturesLayer';
import { TemplatedImageLayer, templatedImageLayer } from './layers/TemplatedImageLayer';
import { ImageOverlay, imageOverlay } from './layers/ImageLayer';
import { MapMLLayer, mapMLLayer } from './layers/MapLayer';
import { DebugOverlay, debugOverlay} from './layers/DebugLayer';
import { QueryHandler } from './handlers/QueryHandler';
import { ContextMenu } from './handlers/ContextMenu';
import { Util } from './utils/Util';
import { ReloadButton, reloadButton } from './control/ReloadButton';

/* global L, Node */
(function (window, document, undefined) {
  
var M = {};
window.M = M;

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

M.csToAxes = Util.csToAxes;
M.convertAndFormatPCRS = Util.convertAndFormatPCRS;
M.axisToCS = Util.axisToCS;
M.parseNumber = Util.parseNumber;
M.extractInputBounds = Util.extractInputBounds;
M.splitCoordinate = Util.splitCoordinate;
M.boundsToPCRSBounds = Util.boundsToPCRSBounds;
M.pixelToPCRSBounds = Util.pixelToPCRSBounds;
M.metaContentToObject = Util.metaContentToObject;
M.coordsToArray = Util.coordsToArray;
M.parseStylesheetAsHTML = Util.parseStylesheetAsHTML;

M.QueryHandler = QueryHandler;
M.ContextMenu = ContextMenu;

// see https://leafletjs.com/examples/extending/extending-3-controls.html#handlers
L.Map.addInitHook('addHandler', 'query', M.QueryHandler);
L.Map.addInitHook('addHandler', 'contextMenu', M.ContextMenu);

M.MapMLLayer = MapMLLayer;
M.mapMLLayer = mapMLLayer;

M.ImageOverlay = ImageOverlay;
M.imageOverlay = imageOverlay;

M.TemplatedImageLayer = TemplatedImageLayer;
M.templatedImageLayer = templatedImageLayer;

M.TemplatedFeaturesLayer = TemplatedFeaturesLayer;
M.templatedFeaturesLayer = templatedFeaturesLayer;

M.TemplatedLayer = TemplatedLayer;
M.templatedLayer = templatedLayer;

M.TemplatedTileLayer = TemplatedTileLayer;
M.templatedTileLayer = templatedTileLayer;

M.MapMLFeatures = MapMLFeatures;
M.mapMlFeatures = mapMlFeatures;

M.MapMLLayerControl = MapMLLayerControl;
M.mapMlLayerControl = mapMlLayerControl;

M.ReloadButton = ReloadButton;
M.reloadButton = reloadButton;

M.MapMLStaticTileLayer = MapMLStaticTileLayer;
M.mapMLStaticTileLayer = mapMLStaticTileLayer;

M.DebugOverlay = DebugOverlay;
M.debugOverlay = debugOverlay;

}(window, document));
