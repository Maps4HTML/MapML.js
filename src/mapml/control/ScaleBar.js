import { Control, DomUtil } from 'leaflet';

export var ScaleBar = Control.Scale.extend({
  options: {
    maxWidth: 100,
    updateWhenIdle: true,
    position: 'bottomleft'
  },

  onAdd: function (map) {
    // create output tag for screenreader to read from
    let outputScale =
      "<output role='status' aria-live='polite' aria-atomic='true' class='mapml-screen-reader-output-scale'></output>";
    map._container.insertAdjacentHTML('beforeend', outputScale);

    // initialize _container
    this._container = DomUtil.create('div', 'mapml-control-scale');
    let scaleControl = Control.Scale.prototype.onAdd.call(this, map);
    this._container.appendChild(scaleControl);
    this._container.setAttribute('tabindex', 0);
    this._scaleControl = this;

    // run on load
    setTimeout(() => {
      this._updateOutput();
      this._focusOutput();
    }, 0);

    // update whenever map is zoomed or dragged
    map.on('zoomend moveend', this._updateOutput, this);

    // have screenreader read out everytime the map is focused
    this._map._container.addEventListener('focus', () => this._focusOutput());

    return this._container;
  },

  onRemove: function (map) {
    map.off('zoomend moveend', this._updateOutput, this);
  },

  getContainer: function () {
    return this._container;
  },

  _pixelsToDistance: function (px, units) {
    let dpi = window.devicePixelRatio * 96; // default dpi
    if (units === 'metric') {
      return (px / dpi) * 2.54; // inches to cm
    }
    return px / dpi;
  },

  _scaleLength: function (scale) {
    let scaleLength = scale.getAttribute('style');
    let finalLength = parseInt(scaleLength.match(/width:\s*(\d+)px/)[1]);

    return finalLength;
  },

  _focusOutput: function () {
    setTimeout(() => {
      let outputFocus = this._map._container.querySelector(
        '.mapml-screen-reader-output-scale'
      );
      outputFocus.textContent = '';
      setTimeout(() => {
        outputFocus.textContent = this._container.getAttribute('aria-label');
      }, 100);
    }, 0);
  },

  _updateOutput: function () {
    let output = '';
    let scaleLine = this._scaleControl
      .getContainer()
      .getElementsByClassName('leaflet-control-scale-line')[0];

    if (this.options.metric) {
      let distance = parseFloat(
        this._pixelsToDistance(this._scaleLength(scaleLine), 'metric').toFixed(
          1
        )
      );
      output = `${distance} centimeters to ${scaleLine.textContent.trim()}`;
      output = output.replace(/(\d+)\s*m\b/g, '$1 meters');
      output = output.replace(/ km/g, ' kilometers');
    } else {
      let distance = parseFloat(
        this._pixelsToDistance(
          this._scaleLength(scaleLine),
          'imperial'
        ).toFixed(1)
      );
      output = `${distance} inches to ${scaleLine.textContent.trim()}`;
      output = output.replace(/ft/g, 'feet');
      output = output.replace(/mi/g, 'miles');
    }

    this._container.setAttribute('aria-label', output);
    this._map._container.querySelector(
      '.mapml-screen-reader-output-scale'
    ).textContent = output;
  }
});
export var scaleBar = function (options) {
  return new ScaleBar(options);
};
