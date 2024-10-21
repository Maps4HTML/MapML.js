import { Layer, DomUtil, point, bounds } from 'leaflet';
import { Util } from '../utils/Util.js';

export var FeatureIndexOverlay = Layer.extend({
  onAdd: function (map) {
    let svgInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 100 100"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M0 0h100v100H0z" color="#000" overflow="visible"/></svg>`;

    this._container = DomUtil.create(
      'div',
      'mapml-feature-index-box',
      map._container
    );
    this._container.innerHTML = svgInnerHTML;

    this._output = DomUtil.create(
      'output',
      'mapml-feature-index',
      map._container
    );
    this._output.setAttribute('role', 'status');
    this._output.setAttribute('aria-live', 'polite');
    this._output.setAttribute('aria-atomic', 'true');
    this._body = DomUtil.create(
      'span',
      'mapml-feature-index-content',
      this._output
    );
    this._body.index = 0;
    this._output.initialFocus = false;
    map.on('focus blur popupclose', this._addOrRemoveFeatureIndex, this);
    map.on('moveend focus templatedfeatureslayeradd', this._checkOverlap, this);
    map.on('keydown', this._onKeyDown, this);
    this._addOrRemoveFeatureIndex();
  },

  _calculateReticleBounds: function () {
    let bnds = this._map.getPixelBounds();
    let center = bnds.getCenter();
    let wRatio =
      Math.abs(bnds.min.x - bnds.max.x) / this._map.options.mapEl.width;
    let hRatio =
      Math.abs(bnds.min.y - bnds.max.y) / this._map.options.mapEl.height;

    let reticleDimension = getComputedStyle(this._container).width.replace(
      /[^\d.]/g,
      ''
    );
    if (getComputedStyle(this._container).width.slice(-1) === '%') {
      reticleDimension =
        (reticleDimension * this._map.options.mapEl.width) / 100;
    }
    let w = (wRatio * reticleDimension) / 2;
    let h = (hRatio * reticleDimension) / 2;
    let minPoint = point(center.x - w, center.y + h);
    let maxPoint = point(center.x + w, center.y - h);
    let b = bounds(minPoint, maxPoint);
    return Util.pixelToPCRSBounds(
      b,
      this._map.getZoom(),
      this._map.options.projection
    );
  },

  _checkOverlap: function (e) {
    if (e.type === 'focus') this._output.initialFocus = true;
    if (!this._output.initialFocus) return;
    if (this._output.popupClosed) {
      this._output.popupClosed = false;
      return;
    }

    this._map.fire('mapkeyboardfocused');

    let featureIndexBounds = this._calculateReticleBounds();
    let features = this._map.featureIndex.inBoundFeatures;
    let index = 1;
    let keys = Object.keys(features);
    let body = this._body;
    let noFeaturesMessage = document.createElement('span');
    noFeaturesMessage.innerHTML =
      this._map.options.mapEl.locale.fIndexNoFeatures;

    body.innerHTML = '';
    body.index = 0;

    body.allFeatures = [];
    keys.forEach((i) => {
      let layer = features[i].layer;
      let layers = features[i].layer._layers;
      let b = bounds();

      if (layers) {
        let keys = Object.keys(layers);
        keys.forEach((j) => {
          if (!b)
            b = bounds(
              layer._layers[j]._bounds.min,
              layer._layers[j]._bounds.max
            );
          b.extend(layer._layers[j]._bounds.min);
          b.extend(layer._layers[j]._bounds.max);
        });
      } else if (layer._bounds) {
        b = bounds(layer._bounds.min, layer._bounds.max);
      }

      if (featureIndexBounds.overlaps(b)) {
        let label = features[i].path.getAttribute('aria-label');

        if (index < 8) {
          body.appendChild(this._updateOutput(label, index, index));
        }
        if (index % 7 === 0 || index === 1) {
          body.allFeatures.push([]);
        }
        body.allFeatures[Math.floor((index - 1) / 7)].push({
          label,
          index,
          layer
        });
        if (body.allFeatures[1] && body.allFeatures[1].length === 1) {
          body.appendChild(this._updateOutput('More results', 0, 9));
        }
        index += 1;
      }
    });
    this._addToggleKeys();
    if (index === 1) {
      body.appendChild(noFeaturesMessage);
    }
  },

  _updateOutput: function (label, index, key) {
    let span = document.createElement('span');
    span.setAttribute('data-index', index);
    //", " adds a brief auditory pause when a screen reader is reading through the feature index
    //also prevents names with numbers + key from being combined when read
    span.innerHTML = `<kbd>${key}</kbd>` + ' ' + label + '<span>, </span>';
    return span;
  },

  _addToggleKeys: function () {
    let allFeatures = this._body.allFeatures;
    for (let i = 0; i < allFeatures.length; i++) {
      if (allFeatures[i].length === 0) return;
      if (allFeatures[i - 1]) {
        let label = 'Previous results';
        allFeatures[i].push({ label });
      }

      if (allFeatures[i + 1] && allFeatures[i + 1].length > 0) {
        let label = 'More results';
        allFeatures[i].push({ label });
      }
    }
  },

  _onKeyDown: function (e) {
    let body = this._body;
    let key = e.originalEvent.keyCode;
    if (key >= 49 && key <= 55) {
      if (!body.allFeatures[body.index]) return;
      let feature = body.allFeatures[body.index][key - 49];
      if (!feature) return;
      let layer = feature.layer;
      if (layer) {
        this._map.featureIndex.currentIndex = feature.index - 1;
        if (layer._popup) {
          this._map.closePopup();
          layer.openPopup();
        } else layer.options.group.focus();
      }
    } else if (key === 56) {
      this._newContent(body, -1);
    } else if (key === 57) {
      this._newContent(body, 1);
    }
  },

  _newContent: function (body, direction) {
    let index = body.firstChild.getAttribute('data-index');
    let newContent = body.allFeatures[Math.floor((index - 1) / 7 + direction)];
    if (newContent && newContent.length > 0) {
      body.innerHTML = '';
      body.index += direction;
      for (let i = 0; i < newContent.length; i++) {
        let feature = newContent[i];
        let index = feature.index ? feature.index : 0;
        let key = i + 1;
        if (feature.label === 'More results') key = 9;
        if (feature.label === 'Previous results') key = 8;
        body.appendChild(this._updateOutput(feature.label, index, key));
      }
    }
  },

  _addOrRemoveFeatureIndex: function (e) {
    //Toggle aria-hidden attribute so screen reader rereads the feature index on focus
    if (!this._output.initialFocus) {
      this._output.setAttribute('aria-hidden', 'true');
    } else if (this._output.hasAttribute('aria-hidden')) {
      let obj = this;
      setTimeout(function () {
        obj._output.removeAttribute('aria-hidden');
      }, 100);
    }

    if (e && e.type === 'popupclose') {
      this._output.setAttribute('aria-hidden', 'true');
      this._output.popupClosed = true;
    } else if (e && e.type === 'focus') {
      this._container.removeAttribute('hidden');
      this._output.classList.remove('mapml-screen-reader-output');
      // this is a very subtle branch.  The event that gets handled below is a blur
      // event, which happens to have the e.target._popup property
      // when there will be a popup.  Because blur gets handled here, it doesn't
      // get handled in the next else if block, which would hide both the reticle
      // and the index menu, and then recursively call this method with no event
      // argument, which manipulates the aria-hidden attribute on the output
      // in order to have the screenreader read its contents when the focus returns
      // to (what exactly???).
    } else if (e && e.target._popup) {
      this._container.setAttribute('hidden', '');
    } else if (e && e.type === 'blur') {
      this._container.setAttribute('hidden', '');
      this._output.classList.add('mapml-screen-reader-output');
      this._output.initialFocus = false;
      this._addOrRemoveFeatureIndex();
    } else {
      // this is the default block, called when no event is passed (recursive call)
      this._container.setAttribute('hidden', '');
      this._output.classList.add('mapml-screen-reader-output');
    }
  }
});

export var featureIndexOverlay = function (options) {
  return new FeatureIndexOverlay(options);
};
