import { parseMediaQueryList } from 'media-query-parser';
import { solveMediaQueryList } from 'media-query-solver';

export const matchMedia = function (query) {
  // useful features for maps: prefers-color-scheme, prefers-lang, projection, zoom, extent
  const parsedQuery = parseMediaQueryList(query);

  // less obviously useful: aspect-ratio, orientation, (device) resolution, overflow-block, overflow-inline

  const map = this;
  const features = {
    'prefers-lang': {
      type: 'discrete',
      get values() {
        return [navigator.language.substring(0, 2)];
      }
    },
    'map-projection': {
      type: 'discrete',
      get values() {
        return [map.projection.toLowerCase()];
      }
    },
    'map-zoom': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: false,
      canBeZero: true,
      get extraValues() {
        return {
          min: 0,
          max: map.zoom
        };
      }
    },
    'map-top-left-easting': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.topLeft.pcrs.horizontal)];
      }
    },
    'map-top-left-northing': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.topLeft.pcrs.vertical)];
      }
    },
    'map-bottom-right-easting': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.bottomRight.pcrs.horizontal)];
      }
    },
    'map-bottom-right-northing': {
      type: 'range',
      valueType: 'integer',
      canBeNegative: true,
      canBeZero: true,
      get values() {
        return [Math.trunc(map.extent.bottomRight.pcrs.vertical)];
      }
    },
    'prefers-color-scheme': {
      type: 'discrete',
      get values() {
        return [
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        ];
      }
    },
    'prefers-map-content': {
      type: 'discrete',
      get values() {
        return M.options.contentPreference;
      }
    }
  };

  const solveUnknownFeature = (featureNode) => {
    let feature = featureNode.feature;
    let queryValue = featureNode.value.value;

    if (feature === 'prefers-lang') {
      return features['prefers-lang'].values.includes(queryValue).toString();
    } else if (
      feature === 'map-zoom' ||
      feature === 'map-top-left-easting' ||
      feature === 'map-top-left-northing' ||
      feature === 'map-bottom-right-easting' ||
      feature === 'map-bottom-right-northing'
    ) {
      return solveRangeFeature(featureNode);
    } else if (feature === 'map-projection') {
      return features['map-projection'].values
        .some((p) => p === queryValue)
        .toString();
    } else if (feature === 'prefers-color-scheme') {
      return features['prefers-color-scheme'].values
        .some((s) => s === queryValue)
        .toString();
    } else if (feature === 'prefers-map-content') {
      return features[feature].values
        .some((pref) => pref === queryValue)
        .toString();
    }
    return 'false';
  };
  let matches =
    solveMediaQueryList(parsedQuery, {
      features,
      solveUnknownFeature
    }) === 'true'
      ? true
      : false;

  function solveRangeFeature(featureNode) {
    const { context, feature, value, op } = featureNode;

    if (!feature.startsWith('map-')) {
      return 'unknown';
    }

    const currentValue = getMapFeatureValue(feature);

    if (currentValue === undefined) {
      return 'unknown';
    }

    if (context === 'value') {
      // Plain case: <mf-name>: <mf-value>
      // Example: (map-zoom: 15)
      return currentValue === value.value ? 'true' : 'false';
    }

    if (context === 'range') {
      // Range case: <mf-name> <mf-comparison> <mf-value>
      // Example: (0 <= map-zoom < 15)
      switch (op) {
        case '<':
          return currentValue < value.value ? 'true' : 'false';
        case '<=':
          return currentValue <= value.value ? 'true' : 'false';
        case '>':
          return currentValue > value.value ? 'true' : 'false';
        case '>=':
          return currentValue >= value.value ? 'true' : 'false';
        case '=':
          return currentValue === value.value ? 'true' : 'false';
        default:
          return 'unknown';
      }
    }

    return 'unknown'; // If the context is neither "value" nor "range"
  }

  function getMapFeatureValue(feature) {
    switch (feature) {
      case 'map-zoom':
        return map.zoom;
      case 'map-top-left-easting':
        return Math.trunc(map.extent.topLeft.pcrs.horizontal);
      case 'map-top-left-northing':
        return Math.trunc(map.extent.topLeft.pcrs.vertical);
      case 'map-bottom-right-easting':
        return Math.trunc(map.extent.bottomRight.pcrs.horizontal);
      case 'map-bottom-right-northing':
        return Math.trunc(map.extent.bottomRight.pcrs.vertical);
      default:
        return undefined; // Unsupported or unknown feature
    }
  }

  // Make mediaQueryList an EventTarget for dispatching events
  const mediaQueryList = Object.assign(new EventTarget(), {
    matches,
    media: query,
    listeners: [],
    // this is a client facing api
    addEventListener(event, listener) {
      if (event === 'change') {
        this.listeners.push(listener);

        // Start observing properties only if there is at least one listener
        if (this.listeners.length !== 0) {
          observeProperties();
        }
        EventTarget.prototype.addEventListener.call(this, event, listener);
      }
    },

    // this is a client facing api
    removeEventListener(event, listener) {
      if (event === 'change') {
        this.listeners = this.listeners.filter((l) => l !== listener);

        // Stop observing if there are no more listeners
        if (this.listeners.length === 0) {
          stopObserving();
        }
        EventTarget.prototype.removeEventListener.call(this, event, listener);
      }
    }
  });

  const observeProperties = () => {
    const notifyIfChanged = () => {
      const newMatches =
        solveMediaQueryList(parsedQuery, {
          features,
          solveUnknownFeature
        }) === 'true'
          ? true
          : false;
      if (newMatches !== mediaQueryList.matches) {
        mediaQueryList.matches = newMatches;

        // Dispatch a "change" event to notify listeners of the update
        mediaQueryList.dispatchEvent(new Event('change'));
      }
    };
    notifyIfChanged.bind(this);
    // Subscribe to internal events for changes in projection, zoom, and extent
    this.addEventListener('map-projectionchange', notifyIfChanged);
    this.addEventListener('map-moveend', notifyIfChanged);
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', notifyIfChanged);

    // Stop observing function
    stopObserving = () => {
      this.removeEventListener('map-projectionchange', notifyIfChanged);
      this.removeEventListener('map-moveend', notifyIfChanged);
      colorSchemeQuery.removeEventListener('change', notifyIfChanged);
    };
  };

  let stopObserving; // Declare here so it can be assigned within observeProperties

  return mediaQueryList;
};
