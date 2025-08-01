import {
  Handler,
  DomEvent,
  DomUtil,
  setOptions,
  Bounds,
  Util as LeafletUtil
} from 'leaflet';
import { MapFeatureLayer } from '../layers/MapFeatureLayer.js';
import { featureRenderer } from '../features/featureRenderer.js';

export var QueryHandler = Handler.extend({
  addHooks: function () {
    // get a reference to the actual <map> element, so we can
    // use its layers property to iterate the layers from top down
    // evaluating if they are 'on the map' (enabled)
    setOptions(this, { mapEl: this._map.options.mapEl });
    DomEvent.on(this._map, 'click', this._queryTopLayer, this);
    DomEvent.on(this._map, 'keypress', this._queryTopLayerAtMapCenter, this);
  },
  removeHooks: function () {
    DomEvent.off(this._map, 'click', this._queryTopLayer, this);
    DomEvent.on(this._map, 'keypress', this._queryTopLayerAtMapCenter, this);
  },
  _getTopQueryableLayer: function () {
    var layers = this.options.mapEl.layers;
    // work backwards in document order (top down)
    for (var l = layers.length - 1; l >= 0; l--) {
      if (layers[l].queryable()) {
        return layers[l]._layer;
      }
    }
  },
  _queryTopLayerAtMapCenter: function (event) {
    setTimeout(() => {
      if (
        this._map.isFocused &&
        !this._map._popupClosed &&
        (event.originalEvent.key === ' ' || +event.originalEvent.keyCode === 13)
      ) {
        this._map.fire('click', {
          latlng: this._map.getCenter(),
          layerPoint: this._map.latLngToLayerPoint(this._map.getCenter()),
          containerPoint: this._map.latLngToContainerPoint(
            this._map.getCenter()
          )
        });
      } else {
        delete this._map._popupClosed;
      }
    }, 0);
  },
  _queryTopLayer: function (event) {
    var layer = this._getTopQueryableLayer();
    if (layer) {
      if (layer._mapmlFeatures) delete layer._mapmlFeatures;
      this._query(event, layer);
    }
  },
  _query(e, layer) {
    var zoom = e.target.getZoom(),
      map = this._map,
      crs = M[layer.options.projection], // the crs for each extent would be the same
      tileSize = map.options.crs.options.crs.tile.bounds.max.x,
      container = layer._container,
      popupOptions = {
        autoClose: false,
        autoPan: true,
        maxHeight: map.getSize().y * 0.5 - 50,
        maxWidth: map.getSize().x * 0.7
      },
      tcrs2pcrs = function (c) {
        return crs.transformation.untransform(c, crs.scale(zoom));
      },
      tcrs2gcrs = function (c) {
        return crs.unproject(
          crs.transformation.untransform(c, crs.scale(zoom)),
          zoom
        );
      };
    var tcrsClickLoc = crs.latLngToPoint(e.latlng, zoom),
      tileMatrixClickLoc = tcrsClickLoc.divideBy(tileSize).floor(),
      tileBounds = new Bounds(
        tcrsClickLoc.divideBy(tileSize).floor().multiplyBy(tileSize),
        tcrsClickLoc.divideBy(tileSize).ceil().multiplyBy(tileSize)
      );

    let point = this._map.project(e.latlng),
      scale = this._map.options.crs.scale(this._map.getZoom()),
      pcrsClick = this._map.options.crs.transformation.untransform(
        point,
        scale
      );
    let templates = layer.getQueryTemplates(pcrsClick, zoom);

    let fetches = [];

    var fetchFeatures = function (template, obj) {
      const parser = new DOMParser();
      return fetch(LeafletUtil.template(template.template, obj), {
        redirect: 'follow'
      })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.text().then((text) => {
              return {
                contenttype: response.headers.get('Content-Type'),
                text: text
              };
            });
          } else {
            throw new Error(response.status);
          }
        })
        .then((response) => {
          let features = [];
          let queryMetas = [];
          let geom =
            "<map-geometry cs='gcrs'><map-point><map-coordinates>" +
            e.latlng.lng +
            ' ' +
            e.latlng.lat +
            '</map-coordinates></map-point></map-geometry>';
          if (response.contenttype.startsWith('text/mapml')) {
            // the mapmldoc could have <map-meta> elements that are important, perhaps
            // also, the mapmldoc can have many features
            let mapmldoc = parser.parseFromString(
              response.text,
              'application/xml'
            );
            let geometrylessFeatures = mapmldoc.querySelectorAll(
              'map-feature:not(:has(map-geometry))'
            );
            if (geometrylessFeatures.length) {
              let g = parser.parseFromString(geom, 'application/xml');
              for (let i = 0; i < geometrylessFeatures.length; i++) {
                let f = geometrylessFeatures[i];
                f.appendChild(g.firstElementChild.cloneNode(true));
              }
            }
            features = Array.prototype.slice.call(
              mapmldoc.querySelectorAll('map-feature')
            );
            // <map-meta> elements for this query
            queryMetas = Array.prototype.slice.call(
              mapmldoc.querySelectorAll(
                'map-meta[name=cs], map-meta[name=zoom], map-meta[name=projection]'
              )
            );
            if (queryMetas.length)
              features.forEach((f) => (f.meta = queryMetas));
          } else {
            try {
              let featureDocument = parser.parseFromString(
                response.text,
                'application/xml'
              );
              let featureCollection =
                featureDocument.querySelectorAll('map-feature');
              if (
                featureDocument.querySelector('parsererror') ||
                featureCollection.length === 0
              ) {
                throw new Error('parsererror');
              }
              let g = parser.parseFromString(geom, 'application/xml');
              queryMetas = Array.prototype.slice.call(
                featureDocument.querySelectorAll(
                  'map-meta[name=cs], map-meta[name=zoom], map-meta[name=projection]'
                )
              );
              for (let feature of featureCollection) {
                if (!feature.querySelector('map-geometry')) {
                  feature.appendChild(g.firstElementChild.cloneNode(true));
                }
                feature.meta = queryMetas;
                features.push(feature);
              }
            } catch (err) {
              // try the html parser; script elements are marked as non-functional
              // by that api, which hopefully works!
              let html = parser.parseFromString(response.text, 'text/html');

              // synthesize a single feature from text or html content
              let featureDoc = parser.parseFromString(
                '<map-feature><map-properties>' +
                  '</map-properties>' +
                  geom +
                  '</map-feature>',
                'text/html'
              );
              if (html.body) {
                featureDoc
                  .querySelector('map-properties')
                  .appendChild(html.querySelector('html'));
              } else {
                featureDoc
                  .querySelector('map-properties')
                  .append(response.text);
              }
              features.push(featureDoc.querySelector('map-feature'));
            }
          }
          return { features: features, template: template };
        })
        .catch((err) => {
          console.log('Looks like there was a problem. Status: ' + err.message);
        });
    };

    for (let i = 0; i < templates.length; i++) {
      var obj = {},
        template = templates[i];

      // all of the following are locations that might be used in a query, I think.
      obj[template.query.tilei] =
        tcrsClickLoc.x.toFixed() - tileMatrixClickLoc.x * tileSize;
      obj[template.query.tilej] =
        tcrsClickLoc.y.toFixed() - tileMatrixClickLoc.y * tileSize;

      // this forces the click to the centre of the map extent in the layer crs
      obj[template.query.mapi] = map.getSize().divideBy(2).x.toFixed();
      obj[template.query.mapj] = map.getSize().divideBy(2).y.toFixed();

      obj[template.query.pixelleft] = crs.pointToLatLng(tcrsClickLoc, zoom).lng;
      obj[template.query.pixeltop] = crs.pointToLatLng(tcrsClickLoc, zoom).lat;
      obj[template.query.pixelright] = crs.pointToLatLng(
        tcrsClickLoc.add([1, 1]),
        zoom
      ).lng;
      obj[template.query.pixelbottom] = crs.pointToLatLng(
        tcrsClickLoc.add([1, 1]),
        zoom
      ).lat;

      obj[template.query.column] = tileMatrixClickLoc.x;
      obj[template.query.row] = tileMatrixClickLoc.y;
      obj[template.query.x] = tcrsClickLoc.x.toFixed();
      obj[template.query.y] = tcrsClickLoc.y.toFixed();

      // whereas the layerPoint is calculated relative to the origin plus / minus any
      // pan movements so is equal to containerPoint at first before any pans, but
      // changes as the map pans.
      obj[template.query.easting] = tcrs2pcrs(tcrsClickLoc).x;
      obj[template.query.northing] = tcrs2pcrs(tcrsClickLoc).y;
      obj[template.query.longitude] = tcrs2gcrs(tcrsClickLoc).lng;
      obj[template.query.latitude] = tcrs2gcrs(tcrsClickLoc).lat;
      obj[template.query.zoom] = zoom;
      obj[template.query.width] = map.getSize().x;
      obj[template.query.height] = map.getSize().y;
      // assumes the click is at the centre of the map, per template.query.mapi, mapj above
      obj[template.query.mapbottom] = tcrs2pcrs(
        tcrsClickLoc.add(map.getSize().divideBy(2))
      ).y;
      obj[template.query.mapleft] = tcrs2pcrs(
        tcrsClickLoc.subtract(map.getSize().divideBy(2))
      ).x;
      obj[template.query.maptop] = tcrs2pcrs(
        tcrsClickLoc.subtract(map.getSize().divideBy(2))
      ).y;
      obj[template.query.mapright] = tcrs2pcrs(
        tcrsClickLoc.add(map.getSize().divideBy(2))
      ).x;

      obj[template.query.tilebottom] = tcrs2pcrs(tileBounds.max).y;
      obj[template.query.tileleft] = tcrs2pcrs(tileBounds.min).x;
      obj[template.query.tiletop] = tcrs2pcrs(tileBounds.min).y;
      obj[template.query.tileright] = tcrs2pcrs(tileBounds.max).x;
      // add hidden or other variables that may be present into the values to
      // be processed by Util.template below.
      for (var v in template.query) {
        if (
          [
            'mapi',
            'mapj',
            'tilei',
            'tilej',
            'row',
            'col',
            'x',
            'y',
            'easting',
            'northing',
            'longitude',
            'latitude',
            'width',
            'height',
            'zoom',
            'mapleft',
            'mapright',
            ',maptop',
            'mapbottom',
            'tileleft',
            'tileright',
            'tiletop',
            'tilebottom',
            'pixeltop',
            'pixelbottom',
            'pixelleft',
            'pixelright'
          ].indexOf(v) < 0
        ) {
          obj[v] = template.query[v];
        }
      }
      fetches.push(fetchFeatures(template, obj));
    }
    Promise.allSettled(fetches).then((results) => {
      layer._mapmlFeatures = [];
      // f is an array of {features[], template}

      for (let f of results) {
        if (f.status === 'fulfilled') {
          // create connection between queried <map-feature> and its parent <map-link>
          for (let feature of f.value.features) {
            feature._linkEl = f.value.template.linkEl;
          }
          layer._mapmlFeatures = layer._mapmlFeatures.concat(f.value.features);
        }
      }
      if (layer._mapmlFeatures.length > 0)
        displayFeaturesPopup(layer._mapmlFeatures, e.latlng);
    });

    function displayFeaturesPopup(features, loc) {
      if (features.length === 0) return;
      let f = new MapFeatureLayer(features, {
        // pass the vector layer a renderer of its own, otherwise leaflet
        // puts everything into the overlayPane
        renderer: featureRenderer(),
        // pass the vector layer the container for the parent into which
        // it will append its own container for rendering into
        pane: container,
        //color: 'yellow',
        // instead of unprojecting and then projecting and scaling,
        // a much smarter approach would be to scale at the current
        // zoom
        projection: map.options.projection,
        _leafletLayer: layer,
        query: true,
        mapEl: map.options.mapEl
      });

      f.addTo(layer);

      let div = DomUtil.create('div', 'mapml-popup-content'),
        c = DomUtil.create('iframe');
      c.style = 'border: none';
      c.srcdoc = features[0].querySelector(
        'map-feature map-properties'
      ).innerHTML;
      c.setAttribute('sandbox', 'allow-same-origin allow-forms');
      div.appendChild(c);
      // passing a latlng to the popup is necessary for when there is no
      // geometry / null geometry
      layer._totalFeatureCount = features.length;
      layer.bindPopup(div, popupOptions).openPopup(loc);
      layer.on('popupclose', function () {
        layer.removeLayer(f);
      });
      f.showPaginationFeature({
        i: 0,
        popup: layer._popup
      });
    }
  }
});
