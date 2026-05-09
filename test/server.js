const express = require('express');
const app = express();
const path = require('path');
const serveStatic = require('serve-static');
const port = 30001;

app.use((req, res, next) => {
  // Check if the request URL contains .mapml
  if (req.url.includes('.mapml')) {
    res.setHeader('Content-Type', 'text/mapml');
  }
  next();
});

//then loads in the index file
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../node_modules/leaflet/dist')));
app.use(express.static(path.join(__dirname, 'e2e/core')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-extent')));
app.use(express.static(path.join(__dirname, 'e2e/elements/mapml-viewer')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-feature')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-a')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-input')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-link')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-style')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-tile')));
app.use(express.static(path.join(__dirname, 'e2e/elements/map-layer')));
app.use(express.static(path.join(__dirname, 'e2e/elements/layer-')));
app.use(express.static(path.join(__dirname, 'e2e/api')));
app.use(express.static(path.join(__dirname, 'e2e/api/matchMedia')));
app.use(express.static(path.join(__dirname, 'e2e/data')));
app.use(express.static(path.join(__dirname, 'e2e/geojson')));
// serveStatic enables byte range requests, only required on this directory
app.use(serveStatic(path.join(__dirname, 'e2e/layers')));
app.use(express.static(path.join(__dirname, 'e2e/mapml-viewer')));
app.use(express.static(path.join(__dirname, 'e2e/web-map')));

app.get('/data/query/us_map_query', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/tiles/cbmt/us_map_query.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query-response-fallback-cs-meta.mapml', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/tiles/cbmt/query-response-fallback-cs-meta.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query-response-fallback-cs-no-meta.mapml', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/tiles/cbmt/query-response-fallback-cs-no-meta.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
// unable to figure out how to map any .mapml file to the text/mapml content type
// had to hard-code this file
app.get('/layers/queryableMapExtent.mapml', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/layers/queryableMapExtent.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/html_query_response', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/tiles/cbmt/html_query_response.html',
    { headers: { 'Content-Type': 'text/html' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/DouglasFir', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/tiles/cbmt/DouglasFir.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/noMapMeta', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/noMapMeta.mapml',
    { headers: { 'Content-Type': 'text/mapml' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonFeature', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonFeature.geojson',
    { headers: { 'Content-Type': 'application/geo+json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonPoint', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonPoint.json',
    { headers: { 'Content-Type': 'application/json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonProjectedWithCrs', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonProjectedWithCrs.json',
    { headers: { 'Content-Type': 'application/json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonProjectedNoCrs', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonProjectedNoCrs.json',
    { headers: { 'Content-Type': 'application/json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonNullGeometry', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonNullGeometry.json',
    { headers: { 'Content-Type': 'application/geo+json' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonErroneousMediaType', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonPoint.json',
    { headers: { 'Content-Type': 'application/geojson' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonFeature.geojson', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonFeature.geojson',
    { headers: { 'Content-Type': 'text/html' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});
app.get('/data/query/geojsonPoint.json', (req, res, next) => {
  res.sendFile(
    __dirname + '/e2e/data/geojson/geojsonPoint.json',
    { headers: { 'Content-Type': 'text/html' } },
    (err) => {
      if (err) {
        res.status(403).send('Error.');
      }
    }
  );
});

app.use('/data', express.static(path.join(__dirname, 'e2e/data/tiles/cbmt')));
app.use('/data', express.static(path.join(__dirname, 'e2e/data/tiles/wgs84')));
app.use('/images', express.static(path.join(__dirname, 'e2e/data/images')));
app.use('/features', express.static(path.join(__dirname, 'e2e/features')));
app.use(
  '/data',
  express.static(path.join(__dirname, 'e2e/data/tiles/osmtile'))
);
app.use(
  '/data/cbmt/0',
  express.static(path.join(__dirname, 'e2e/data/tiles/cbmt/0'))
);
app.use(
  '/data/cbmt/1',
  express.static(path.join(__dirname, 'e2e/data/tiles/cbmt/1'))
);
app.use(
  '/data/cbmt/2',
  express.static(path.join(__dirname, 'e2e/data/tiles/cbmt/2'))
);
app.use(
  '/data/cbmt/3',
  express.static(path.join(__dirname, 'e2e/data/tiles/cbmt/3'))
);
app.use(
  '/data/wgs84/0',
  express.static(path.join(__dirname, 'e2e/data/tiles/wgs84/0'))
);
app.use(
  '/data/wgs84/1',
  express.static(path.join(__dirname, 'e2e/data/tiles/wgs84/1'))
);
app.use(
  '/data/osmtile/2',
  express.static(path.join(__dirname, 'e2e/data/tiles/osmtile/2'))
);

console.log('Running on localhost:' + port);

// Mock search suggestions endpoint for search control tests
app.get('/search/suggestions', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { display_name: 'Ottawa, Ontario, Canada', name: 'Ottawa' },
        geometry: { type: 'Point', coordinates: [-75.6972, 45.4215] },
        bbox: [-75.9, 45.2, -75.4, 45.6]
      },
      {
        type: 'Feature',
        properties: {
          display_name: 'Ottawa River, Canada',
          name: 'Ottawa River'
        },
        geometry: { type: 'Point', coordinates: [-75.5, 45.5] }
      },
      {
        type: 'Feature',
        properties: {
          display_name: 'Gatineau, Quebec, Canada',
          name: 'Gatineau'
        },
        geometry: { type: 'Point', coordinates: [-75.7, 45.48] }
      }
    ]
  });
});

// Mock search results endpoint for search control tests
app.get('/search/results', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          display_name: 'Ottawa, Ontario, Canada',
          name: 'Ottawa'
        },
        geometry: { type: 'Point', coordinates: [-75.6972, 45.4215] },
        bbox: [-75.9, 45.2, -75.4, 45.6]
      }
    ]
  });
});

// Mock geonames suggestions endpoint (returns geonames-format items array)
app.get('/geonames/suggestions', (req, res) => {
  res.json({
    items: [
      {
        id: 'FEVNT',
        name: 'Ottawa',
        latitude: 45.33339,
        longitude: -75.58429,
        bbox: [-76.3631149, 44.9445516, -75.2324963, 45.544859],
        concise: { code: 'CITY' },
        province: { code: '35' }
      },
      {
        id: 'NAABK',
        name: 'Arctic Ocean',
        latitude: 80,
        longitude: -140,
        bbox: [-140.02, 79.98, -139.98, 80.02],
        concise: { code: 'SEA' },
        province: { code: '73' }
      },
      {
        id: 'NAABI',
        name: 'Atlantic Ocean',
        latitude: 43,
        longitude: -63,
        bbox: [-63.02, 42.98, -62.98, 43.02],
        concise: { code: 'SEA' },
        province: { code: '73' }
      }
    ]
  });
});

// Mock geonames search endpoint (returns geonames-format items array)
app.get('/geonames/search', (req, res) => {
  res.json({
    items: [
      {
        id: 'FEVNT',
        name: 'Ottawa',
        latitude: 45.33339,
        longitude: -75.58429,
        bbox: [-76.3631149, 44.9445516, -75.2324963, 45.544859],
        concise: { code: 'CITY' },
        province: { code: '35' }
      }
    ]
  });
});

// Mock second-layer geonames suggestions endpoint (returns different items)
app.get('/geonames2/suggestions', (req, res) => {
  res.json({
    items: [
      {
        id: 'TRNTO',
        name: 'Toronto',
        latitude: 43.65107,
        longitude: -79.347015,
        bbox: [-79.6393, 43.4034, -79.1153, 43.8554],
        concise: { code: 'CITY' },
        province: { code: '35' }
      },
      {
        id: 'MNTRL',
        name: 'Montreal',
        latitude: 45.50884,
        longitude: -73.58781,
        bbox: [-73.9726, 45.4104, -73.4742, 45.7047],
        concise: { code: 'CITY' },
        province: { code: '24' }
      }
    ]
  });
});

// Mock second-layer geonames search endpoint
app.get('/geonames2/search', (req, res) => {
  res.json({
    items: [
      {
        id: 'TRNTO',
        name: 'Toronto',
        latitude: 43.65107,
        longitude: -79.347015,
        bbox: [-79.6393, 43.4034, -79.1153, 43.8554],
        concise: { code: 'CITY' },
        province: { code: '35' }
      }
    ]
  });
});

app.listen(port);
