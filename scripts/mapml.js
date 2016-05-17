/* global L */
(function (window, document, undefined) {
  
var M = {};
window.M = M;

(function () {
    M.mime = "text/mapml";
    M.CBMTILE = new L.Proj.CRS('EPSG:3978',
  '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
  {
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
      1.5875031750063502
    ],
    origin: [-34655800, 39310000]
  });
    M.APSTILE = new L.Proj.CRS('EPSG:5936',
  '+proj=stere +lat_0=90 +lat_ts=50 +lon_0=-150 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs',
  {
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
    origin: [-2.8567784109255E7, 3.2567784109255E7]
  });
    M.OSMTILE = L.CRS.EPSG3857;
}());

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
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
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
        }
        
});
M.imageOverlay = function (url, location, size, angle, container, options) {
        return new M.ImageOverlay(url, location, size, angle, container, options);
};
M.MapMLLayer = L.Layer.extend({
    // zIndex has to be set, for the case where the layer is added to the
    // map before the layercontrol is used to control it (where autoZindex is used)
    // e.g. in the raw MapML-Leaflet-Client index.html page.
    options: {
        maxNext: 10,
        zIndex: 0
    },
    // initialize is executed before the layer is added to a map
    initialize: function (href, options) {
        // in the custom element, the attribute is actually 'src'
        // the _href version is the URL received from layer-@src
        this._href = href;
        // hit the service to determine what its extent might be
        this._initExtent();
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        this._map = map;
        if (!this._mapml) {
          this._mapml = M.mapMl(null,{
              opacity: this.options.opacity,
              onEachFeature: function(feature, layer) {
                var type;
                if (layer instanceof L.Polygon) {
                  type = "Polygon";
                } else if (layer instanceof L.Polyline) {
                  type = "LineString";
                } else if (layer instanceof L.Marker) {
                  type = "Point";
                } else {
                  type = "Unknown";
                }
                var popupContent = "<p>Type: " +  type + "</p>";
                var props = feature.children;
                for (var i = 0; i < props.length; i++) {
                    popupContent += props[i].tagName+ " = " + props[i].innerHTML  +"<br>";
                }  
                layer.bindPopup(popupContent, {autoPan:false});
              }
            });
        }
        map.addLayer(this._mapml);
        
        if (!this._imageLayer) {
            this._imageLayer = L.layerGroup();
        }
        map.addLayer(this._imageLayer);
        
        if (!this._tileLayer) {
          this._tileLayer = M.mapMLTileLayer(this.href?this.href:this._href, this.options);
        }
        if (!this._el) {
            this._el = this._tileLayer._el = L.DomUtil.create('div', 'mapml-layer leaflet-zoom-hide');
        }
        map.addLayer(this._tileLayer);
        this._tileLayer._container.appendChild(this._el);
        // if the extent has been initialized and received, update the map,
        /* TODO establish the minZoom, maxZoom for the _tileLayer based on
         * info received from mapml server. */
        if (this._extent) {
            this._onMoveEnd();
        } else {
            this.once('extentload', this._onMoveEnd, this);
        }
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    getEvents: function () {
      return {
        zoom: this._reset, 
        moveend: this._onMoveEnd};
    },
    onRemove: function (map) {
        this._mapml.clearLayers();
        map.removeLayer(this._mapml);
        map.removeLayer(this._tileLayer);
        map.removeLayer(this._imageLayer);
    },
    getZoomBounds: function () {
        if (!this._extent) return;
        var bounds = {};
        var v1 = this._extent.querySelector('[type=zoom]').getAttribute('min'),
            v2 = this._extent.querySelector('[type=zoom]').getAttribute('max');
        bounds.min = Math.min(v1,v2);
        bounds.max = Math.max(v1,v2);
        return bounds;
    },
    // retrieve the (projected, scaled) layer extent for the current map zoom level
    getLayerExtentBounds: function(map) {
        
        var zoom = map.getZoom(), projection = map.options.projection,
            projecting = (projection !== this._extent.querySelector('[type=projection]').getAttribute('value'));
        
        if (!this._extent) return;
        
        var xmin,ymin,xmax,ymax,v1,v2,extentZoomValue;
            
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
        extentZoomValue = parseInt(this._extent.querySelector('[type=zoom]').getAttribute('value'));
        // WGS84 can be converted to Tiled CRS units
        if (projecting) {
            //project and scale to M[projection] from WGS84
            var p = M[projection],
            corners = [
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom),
              p.latLngToPoint(L.latLng([ymax,xmax]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmax]),zoom)
            ];
            return L.bounds(corners);
        } else {
            // if the zoom level of the extent does not match that of the map
            if (extentZoomValue !== zoom) {
                // convert the extent bounds to corresponding bounds at the current map zoom
                var p = M[projection];
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
    // setZIndex and _updateZIndex are copied directly from Leaflet's GridLayer,
    // as we want to automatically control z-index behaviour for a MapMLLayer,
    // and need to provide methods where required by Leaflet code i.e. where internal
    // methods to L.Control.Layers are invoked but not overridden (by M.MapMLLayerControl)
    // are invoked by Leaflet ancestor methods. Whew.
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
    _initExtent: function() {
        if (!this._href) {return;}
        var layer = this;
        var xhr = new XMLHttpRequest();
        _get(this._href, _processInitialExtentResponse);
        function _get(url, fCallback  ) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if(this.status === 200 && this.callback) {
                  this.callback.apply(this, this.arguments ); 
                  return;
                } else if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.arguments = Array.prototype.slice.call(arguments, 2);
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              layer.error = true;
              layer.fire('extentload', layer, true);
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        };
        
        function _processInitialExtentResponse() {
            if (this.responseXML) {
                var xml = this.responseXML,
                    serverExtent = xml.getElementsByTagName('extent')[0];
                if (!serverExtent) {
                    // manufacture an extent that won't lead to repeated requests to server
                    serverExtent = layer._synthesizeExtentFromMetadata(xml);
                }
                if (serverExtent) {
                    layer._parseProjectionAndLinks(xml, serverExtent, layer);
                    layer["_extent"] = serverExtent;
                    if (layer._map) {
                        // if the layer is checked in the layer control, force the addition
                        // of the attribution just received
                        if (layer._map.hasLayer(layer)) {
                            layer._map.attributionControl.addAttribution(layer.getAttribution());
                        }
                        layer._map.fire('moveend', layer);
                    }
                } else {
                    layer.error = true;
                }
            } else {
                layer.error = true;
            }
            layer.fire('extentload', layer, true);
        };
    },
    _getMapML: function(url) {
        var layer = this;
        var requestCounter = 0;
        var xhr = new XMLHttpRequest();
        // add a listener to terminate pulling the feed 
        this._map.once('movestart', function() {
          xhr.abort();
        });
        _pull(url, _processMapMLFeedResponse);
        function _pull(url, fCallback) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if(this.status === 200 && this.callback) {
                  this.callback.apply(this, this.arguments ); 
                  return;
                } else if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.arguments = Array.prototype.slice.call(arguments, 2);
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              console.error(this.statusText); 
              layer.error = true;
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime+";projection="+layer.options.projection+";zoom="+layer.zoom);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        };
        function _processMapMLFeedResponse() {
            if (this.responseXML) {
              if (requestCounter === 0) {
                var serverExtent = this.responseXML.getElementsByTagName('extent')[0];
                  layer["_extent"] = serverExtent;
                  // the serverExtent should be removed if necessary from layer._el before by _initEl
                  layer._el.appendChild(document.importNode(serverExtent,true));
                  layer._parseProjectionAndLinks(this.responseXML, serverExtent, layer);
              }
              if (this.responseXML.getElementsByTagName('feature').length > 0) {
                  layer._mapml.addData(this.responseXML);
              }
              if (this.responseXML.getElementsByTagName('tile').length > 0) {
                  var tiles = document.createElement("tiles");
                  var newTiles = this.responseXML.getElementsByTagName('tile');
                  for (var i=0;i<newTiles.length;i++) {
                      tiles.appendChild(document.importNode(newTiles[i], true));
                  }
                  layer._el.appendChild(tiles);
              }
              if (this.responseXML.getElementsByTagName('image').length > 0) {
                  var images = this.responseXML.getElementsByTagName('image'),
                      imageOverlays = [],
                      // need a reference to the _imageLayer container element to pass to children
                      // so they can append the img element they create to it.
                      container = layer._el.parentElement;
                  for (var i=0;i<images.length;i++) {
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
                  var layersToRemove = layer._imageLayer.getLayers();
                  for (var i=0,last=imageOverlays.length-1;i < imageOverlays.length;i++) {
                    layer._imageLayer.addLayer(imageOverlays[i]);
                    if (i === last) {
                      imageOverlays[i].on('load', function() {
                        for (var i = 0;i < layersToRemove.length;i++) {
                          layer._imageLayer.removeLayer(layersToRemove[i]);
                        }
                      });
                    }
                  }
              }
              var next = _parseLink('next',this.responseXML);
              if (next && requestCounter < layer.options.maxNext) {
                  requestCounter++;
                  _pull(next, _processMapMLFeedResponse);
              } else {
                  if (layer._el.getElementsByTagName('tile').length > 0) {
                      layer._tileLayer._onMoveEnd();
                  }
                  layer.fire('extentload', layer, true);
              }
            }
        };
        function _parseLink(rel, xml) {
            // depends on js-uri http://code.google.com/p/js-uri/ 
            // would be greate to depend on the URL standard and not a library
            var baseEl = xml.querySelector('base'), 
                base =  baseEl ? baseEl.getAttribute('href'):null,
                baseUri = new URI(base||xml.baseURI),
                link = xml.querySelector('link[rel='+rel+']'),
                relLink = link?new URI(link.getAttribute('href')).resolve(baseUri):null;
            return relLink;
        };
    },
    _synthesizeExtentFromMetadata: function (mapmlResponse) {
        var metaZoom = mapmlResponse.querySelectorAll('meta[name=zoom]')[0],
                initial,min,max;
        if (metaZoom) {
            var expressions = metaZoom.getAttribute('content').split(',');
            for (var i=0;i<expressions.length;i++) {
              var expr = expressions[i].split('='),
                      lhs = expr[0],rhs=expr[1];
              if (lhs === 'min') {
                min = parseInt(rhs);
              }
              if (lhs === 'max') {
                max = parseInt(rhs);
              }
              if (lhs === 'iniital') {
                initial = parseInt(rhs);
              }
            }
            var fakeExtent = mapmlResponse.createElement('extent'), 
                    fakeZoom = mapmlResponse.createElement('input');
            fakeZoom.setAttribute('type','zoom');
            fakeZoom.setAttribute('min',min);
            fakeZoom.setAttribute('max',max);
            fakeExtent.appendChild(fakeZoom);

            var metaProjection = mapmlResponse.querySelector('meta[name=projection]'),projection;
            if (!metaProjection) {
              projection = 'WGS84';
            }
            var fakeProjection = mapmlResponse.createElement('input');
            fakeProjection.setAttribute('type','projection');
            fakeProjection.setAttribute('value','WGS84');
            fakeExtent.appendChild(fakeProjection);

            var metaExtent = mapmlResponse.querySelector('meta[name=extent]');
            if (metaExtent) {
                var expressions = metaExtent.getAttribute('content').split(','),xmin,ymin,xmax,ymax;

                for (var i=0;i<expressions.length;i++) {
                  var expr = expressions[i].split('='),
                          lhs = expr[0],rhs=expr[1];
                  if (lhs === 'xmin') {
                    xmin = parseInt(rhs);
                  }
                  if (lhs === 'xmax') {
                    xmax = parseInt(rhs);
                  }
                  if (lhs === 'ymin') {
                    ymin = parseInt(rhs);
                  }
                  if (lhs === 'ymax') {
                    ymax = parseInt(rhs);
                  }
                }
                var xminInput = mapmlResponse.createElement('input'),
                    xmaxInput = mapmlResponse.createElement('input'),
                    yminInput = mapmlResponse.createElement('input'),
                    ymaxInput = mapmlResponse.createElement('input');
                xminInput.setAttribute('type','xmin');
                xminInput.setAttribute('min',xmin);
                xminInput.setAttribute('max',xmax);
                xmaxInput.setAttribute('type','xmax');
                xmaxInput.setAttribute('min',xmin);
                xmaxInput.setAttribute('max',xmax);

                yminInput.setAttribute('type','ymin');
                yminInput.setAttribute('min',ymin);
                yminInput.setAttribute('max',ymax);
                ymaxInput.setAttribute('type','ymax');
                ymaxInput.setAttribute('min',ymin);
                ymaxInput.setAttribute('max',ymax);

                fakeExtent.appendChild(xminInput);
                fakeExtent.appendChild(yminInput);
                fakeExtent.appendChild(xmaxInput);
                fakeExtent.appendChild(ymaxInput);
            }
            return fakeExtent;
        }
    },
    _parseProjectionAndLinks: function (xml, serverExtent, layer) {
        var licenseLink =  xml.querySelectorAll('link[rel=license]')[0],
            licenseTitle = licenseLink.getAttribute('title'),
            licenseUrl = licenseLink.getAttribute('href'),
            legendLink = xml.querySelectorAll('link[rel=legend]')[0],
            attText = '<a href="' + licenseUrl + '" title="'+licenseTitle+'">'+licenseTitle+'</a>';
        L.setOptions(layer,{projection:serverExtent.querySelectorAll('input[type=projection]')[0].getAttribute('value'), attribution:attText });
        if (legendLink) {
          layer["_legendUrl"] = legendLink.getAttribute('href');
        }
    },
    _onMoveEnd: function () {
        // this can only be done when the layer is on a map, because the url
        // calculation requires to process the extent of the map through the 
        // extent form that should have already been received.
        var url =  this._calculateUrl();
        if (url) {
          this.href = url;
          this._mapml.clearLayers();
          this._initEl();
          this._getMapML(url);
        }
    },
    _initEl: function () {
        if (!this._el) {return;}
        var container = this._el;
        while (container.firstChild)
            container.removeChild(container.firstChild);
    },
    _reset: function() {
        this._initEl();
        this._mapml.clearLayers();
        //this._map.removeLayer(this._mapml);
        return;
    },
    // return the LatLngBounds of the map unprojected such that the whole
    // map is covered, not just a band defined by the projected map bounds.
    _getUnprojectedMapLatLngBounds: function(map) {
      
          map = map||this._map, 
                  origin = map.getPixelOrigin(), 
                  bounds = map.getPixelBounds(),
          nw = map.unproject(origin),
          sw = map.unproject(bounds.getBottomLeft()),
          ne = map.unproject(bounds.getTopRight()),
          se = map.unproject(origin.add(map.getSize()));
          return L.latLngBounds(sw,ne).extend(se).extend(nw);
    },
    _calculateUrl: function() {
        
        if (!this._el && !this._extent) return this._href;
        var extent = this._el.getElementsByTagName('extent')[0] || this._extent;
        if (!extent) return this._href;
        var action = extent.getAttribute("action");
        if (!action) return null;
        var b,
            projection = extent.querySelectorAll('input[type=projection]')[0],
            projectionValue = projection.getAttribute('value');
        
        // if the mapml extent being processed is WGS84, we need to speak in those units
        if (projectionValue === 'WGS84') {
            b = this._getUnprojectedMapLatLngBounds();
        } else {
            // otherwise, use the bounds of the map
            b = this._map.getPixelBounds();
        }
        
        // retrieve the required extent inputs by type
        var xmin = extent.querySelectorAll("input[type=xmin]")[0],
            ymin = extent.querySelectorAll("input[type=ymin]")[0],
            xmax = extent.querySelectorAll("input[type=xmax]")[0],
            ymax = extent.querySelectorAll("input[type=ymax]")[0];
        
        // if even one of them doesn't exist, we're snookered
        if (!xmin|| !ymin || !xmax || !ymax ) return  null;
        
        // use the @name as the name of the variable to transmit, or the @type value by default
        var xminName = (xmin.getAttribute('name')?xmin.getAttribute('name').trim():'xmin');
        var yminName = (ymin.getAttribute('name')?ymin.getAttribute('name').trim():'ymin');
        var xmaxName = (xmax.getAttribute('name')?xmax.getAttribute('name').trim():'xmax');
        var ymaxName = (ymax.getAttribute('name')?ymax.getAttribute('name').trim():'ymax');
        
        // generate a URI template for the extent request using the variable names above
        var bboxTemplate = "";
        bboxTemplate += xminName + "={" + xminName + "}" + "&";
        bboxTemplate += yminName + "={" + yminName + "}" + "&";
        bboxTemplate += xmaxName + "={" + xmaxName + "}" + "&";
        bboxTemplate += ymaxName + "={" + ymaxName + "}";
        
        // establish the range of zoom values for the extent
        var zoom = extent.querySelectorAll("input[type=zoom]")[0];
        if ( !zoom || !projection) return null;

        var min = parseInt(zoom.getAttribute("min")),
            max = parseInt(zoom.getAttribute("max")),
            values = {}, // the values object will contain the values for the URI template
            mapZoom = this._map.getZoom();
        // check that the zoom of the map is in the range of the zoom of the service
        if ( min <= mapZoom && mapZoom <= max) {
          values.zoom = mapZoom;
        } else {
          return null;
        }
        
        var zoomName = zoom.getAttribute('name')?zoom.getAttribute('name').trim():'zoom';
        var zoomTemplate = zoomName + "={" + zoomName + "}";

        values.xmin = b.min?b.min.x:b.getWest();
        values.ymin = b.min?b.min.y:b.getSouth();
        values.xmax = b.max?b.max.x:b.getEast();
        values.ymax = b.max?b.max.y:b.getNorth();
        values.projection = projectionValue;
        
        var projectionName = projection.getAttribute('name')?projection.getAttribute('name').trim():'projection';
        var projectionTemplate = projectionName + "={" + projectionName + "}";
        
        var requestTemplate = bboxTemplate + "&" + zoomTemplate + "&" + projectionTemplate;
        action += ((action.search(/\?/g) === -1) ? "?" : "&") + requestTemplate;
        return L.Util.template(action, values);
    },
    // this takes into account that WGS84 is considered a wildcard match.
    _projectionMatches: function(map) {
        map = map||this._map;
        if (!map.options.projection || this.options.projection !== 'WGS84' && map.options.projection !== this.options.projection) return false;
        return true;
    }
});
M.mapMLLayer = function (url, options) {
	return new M.MapMLLayer(url, options);
};
M.MapMLTileLayer = L.TileLayer.extend({
        // override the function of the same name defined in L.GridLayer
	getEvents: function () {
		var events = {
			viewreset: this._resetAll,
			zoom: this._resetView,
			moveend: this._onMoveEnd
		};
                // doing updates on move causes too much jank...
		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},
	_onMoveEnd: function () {
		if (!this._map) { return; }

		this._update();
		this._pruneTiles();
	},
        _update: function() {
            if (!this._map) { return; }
            var map = this._map,
                zoom = map.getZoom();
            if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
                return;
            }
            var tiles = this._groupTiles(this._el.getElementsByTagName('tile'));
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
            if (!tiles.length) { return; };
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
            };  
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

		this._level.el.appendChild(fragment);
	},
	_addTile: function (groupToLoad, container) {
                // tiles have been grouped by row/col, so all members of the array
                // share those values.
                var tilePoint = new L.Point(groupToLoad[0].col, groupToLoad[0].row);
		var coords = this._getTilePos(tilePoint);
                coords.z = this._map.getZoom();
                var key = this._tileCoordsToKey(coords);
                
                for (var i=0;i<groupToLoad.length;i++) {
                    // create an img element for each tile element for this grid cell
                    var tile = this.createTile(groupToLoad[i].src);
                    this._initTile(tile);
                    setTimeout(L.bind(this._tileReady, this, coords, null, tile), 0);
                    groupToLoad[i].img = tile;
                }

                var tileContainer;
                if (this._tiles[key]) {
                  tileContainer = this._tiles[key].el;
                } else {
                  tileContainer = document.createElement('div');
                    for (var i=0;i<groupToLoad.length;i++) {
                        tileContainer.appendChild(groupToLoad[i].img);
                    }
                }
                // per L.TileLayer comment:
		// we prefer top/left over translate3d so that we don't create a HW-accelerated layer from each tile
		// which is slow, and it also fixes gaps between tiles in Safari
                L.DomUtil.setPosition(tileContainer, coords);

		// save tile in cache
		this._tiles[key] = {
			el: tileContainer,
			coords: coords,
			current: true
		};

		container.appendChild(tileContainer);
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},
	createTile: function (src) {
		var tile = document.createElement('img');

		if (this.options.crossOrigin) {
			tile.crossOrigin = '';
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		tile.src = src;
                L.DomUtil.addClass(tile, 'leaflet-tile-loaded');

		return tile;
	},
        // stops loading all tiles in the background layer, overrides method
        // from L.TileLayer because of different HTML model img -> div/img[]
	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			tileDiv = this._tiles[i].el;
                        var images = tileDiv.getElementsByTagName('img');
                        for (var i = 0; i< images.length; i++) {
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
/*
 * M.MapML turns any MapML feature data into a Leaflet layer. Based on L.GeoJSON.
 */

M.MapML = L.FeatureGroup.extend({
	initialize: function (mapml, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (mapml) {
			this.addData(mapml);
		}
	},

	addData: function (mapml) {
		var features = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.getElementsByTagName("feature") : null,
		    i, len, feature;
            
                var stylesheet = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelector("link[rel=stylesheet]") : null;
                if (stylesheet) {
                  
                var baseEl = mapml.querySelector('base'),
                      base = new URI(baseEl?baseEl.getAttribute('href'):mapml.baseURI),
                      link = new URI(stylesheet.getAttribute('href')),
                      stylesheet = link.resolve(base).toString();
                }
                if (stylesheet) {
                  if (!document.head.querySelector("link[href='"+stylesheet+"']")) {
                    var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "link");
                    linkElm.setAttribute("href", stylesheet);
                    linkElm.setAttribute("type", "text/css");
                    linkElm.setAttribute("rel", "stylesheet");
                    document.head.appendChild(linkElm);
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

		var layer = M.MapML.geometryToLayer(mapml, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = mapml.getElementsByTagName('properties')[0];
                
                layer.options.className = mapml.getAttribute('class') ? mapml.getAttribute('class') : null;
		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(layer.feature, layer);
		}

		return this.addLayer(layer);
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

L.extend(M.MapML, {
	geometryToLayer: function (mapml, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = mapml.tagName === 'feature' ? mapml.getElementsByTagName('geometry')[0] : mapml,
		    coords = geometry.getElementsByTagName('coordinates'),
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.firstElementChild.tagName) {
		case 'Point':
                        var coordinates = [];
                        coords[0].innerHTML.split(/\s+/gi).forEach(parseNumber,coordinates);
			latlng = coordsToLatLng(coordinates);
                        
                        /* can't use L.Icon.Default because L gets the path from
                         * the <script> element for Leaflet, but that is not available
                         * inside a Web Component / Custom Element */
                        var pathToImages = "scripts/lib/images/";
                        var opacity = vectorOptions.opacity ? vectorOptions.opacity : null;
			return pointToLayer ? pointToLayer(mapml, latlng) : 
                                new L.Marker(latlng, {opacity: opacity, icon: L.icon({
                                    iconUrl: pathToImages+"marker-icon.png",
                                    iconRetinaUrl: pathToImages+"marker-icon-2x.png",
                                    shadowUrl: pathToImages+"marker-shadow.png",
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]})});

		case 'MultiPoint':
                        throw new Error('Not implemented yet');
//			for (i = 0, len = coords.length; i < len; i++) {
//				latlng = coordsToLatLng(coords[i]);
//				layers.push(pointToLayer ? pointToLayer(mapml, latlng) : new L.Marker(latlng));
//			}
//			return new L.FeatureGroup(layers);

		case 'LineString':
                        var coordinates = [];
                        coords[0].innerHTML.match(/(\S+ \S+)/gi).forEach(splitCoordinate, coordinates);
			latlngs = this.coordsToLatLngs(coordinates, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
                        var coordinates = new Array(coords.length);
                        for (var i=0;i<coords.length;i++) {
                          coordinates[i]=[];
                          coords[i].innerHTML.match(/(\S+ \S+)/gi).forEach(splitCoordinate, coordinates[i]);
                        }
			latlngs = this.coordsToLatLngs(coordinates, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);
		case 'MultiLineString':
                        throw new Error('Not implemented yet');
//			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
//			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
                        throw new Error('Not implemented yet');
//			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
//			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
                        throw new Error('Not implemented yet');
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
			throw new Error('Invalid GeoJSON object.');
		}

                function splitCoordinate(element, index, array) {
                  var a = [];
                  element.split(/\s+/gi).forEach(parseNumber,a);
                  this.push(a);
                };

                function parseNumber(element, index, array) {
                  this.push(parseFloat(element));
                };
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
 
M.mapMl = function (mapml, options) {
	return new M.MapML(mapml, options);
};


/* removes 'base' layers as a concept */
M.MapMLLayerControl = L.Control.Layers.extend({
    initialize: function (overlays, options) {
        L.setOptions(this, options);
        this.options.collapsed = false;
        
        // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
        // the array index is the id of the layer returned by L.stamp(layer) which I guess is a unique hash
        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        for (var i in overlays) {
                this._addLayer(overlays[i], i, true);
        }
    },
    onAdd: function () {
        this._initLayout();
        this._map.on('moveend', this._onMapMoveEnd, this);
        this._update();
        this._map.fire('moveend', this);
        return this._container;
    },
    onRemove: function (map) {
        map.off('moveend', this._onMapMoveEnd, this);
        // remove layer-registerd event handlers so that if the control is not
        // on the map it does not generate layer events
        for (var i in this._layers) {
          this._layers[i].layer.off('add remove', this._onLayerChange, this);
        }
    },
    _onMapMoveEnd: function(e) {
        this._validateExtents();
    },
    _validateExtents: function (e) {
        // get the bounds of the map in Tiled CRS pixel units
        var zoom = this._map.getZoom(),
            bounds = this._map.getPixelBounds(),
            zoomBounds, i, obj, visible, projectionMatches;
        for (i in this._layers) {
            obj = this._layers[i];
            if (obj.layer._extent || obj.layer.error) {

                // get the 'bounds' of zoom levels of the layer as described by the server
                zoomBounds = obj.layer.getZoomBounds();
                projectionMatches = obj.layer._projectionMatches(this._map);
                visible = projectionMatches && this._withinZoomBounds(zoom, zoomBounds) && bounds.intersects(obj.layer.getLayerExtentBounds(this._map)) ;
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
                this._setLegendLink(obj,obj.input.nextElementSibling);
            }
        }
    },
    _withinZoomBounds: function(zoom, range) {
        return range.min <= zoom && zoom <= range.max;
    },
    _setLegendLink: function (obj, span) {
        if (obj.layer._legendUrl) {
            var legendLink = document.createElement('a');
            legendLink.text = ' ' + obj.name;
            legendLink.href = obj.layer._legendUrl;
            legendLink.target = '_blank';
            span.innerHTML = '';
            span.appendChild(legendLink);
        } else {
            span.innerHTML = ' ' + obj.name;
        }
    },
    _addItem: function (obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
        obj.input = input;

        input.layerId = L.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        
        this._setLegendLink(obj, name);
        label.appendChild(input);
        label.appendChild(name);

        var container = this._overlaysList;
        container.appendChild(label);
        // this is necessary because when there are several layers in the
        // layer control, the response to the last one can be a long time
        // after the info is first displayed, so we have to go back and
        // verify the extent and legend for the layer to know whether to
        // disable it , add the legend link etc.
        obj.layer.on('extentload', this._validateExtents, this);

        return label;
    }
});
M.mapMlLayerControl = function (layers, options) {
	return new M.MapMLLayerControl(layers, options);
};

// when used in a custom element, the leaflet script element is hidden inside
// the import's shadow dom.
L.Icon.Default.imagePath = (function () {
        var imp = document.querySelector('link[rel="import"][href="web-map.html"]'),
            doc = imp ? imp.import : document,
            scripts = doc.getElementsByTagName('script'),
            leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

        var i, len, src, path;

        for (i = 0, len = scripts.length; i < len; i++) {
                src = scripts[i].src;

                if (src.match(leafletRe)) {
                        path = src.split(leafletRe)[0];
                        return (path ? path + '/' : '') + 'images';
                }
        }
}());

}(window, document));