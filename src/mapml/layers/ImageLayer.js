import {
  ImageOverlay,
  DomUtil,
  point,
  setOptions,
  Util,
  Browser
} from 'leaflet';

export var ImageLayer = ImageOverlay.extend({
  initialize: function (url, location, size, angle, container, options) {
    // (String, Point, Point, Number, Element, Object)
    this._container = container;
    this._url = url;
    // instead of calculating where the image goes, put it at 0,0
    // this._location = point(location);
    // the location for WMS requests will be the upper left-hand
    // corner of the map.  When the map is initialized, that is 0,0,
    // but as the user pans, of course the
    this._location = location;
    this._size = point(size);
    this._angle = angle;

    setOptions(this, options);
  },
  getEvents: function () {
    var events = {
      viewreset: this._reset
    };

    if (this._zoomAnimated && this._step <= 1) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },
  onAdd: function (map) {
    this.on({
      load: this._onImageLoad
    });

    if (!this._image) {
      this._initImage();
    }

    if (this.options.interactive) {
      DomUtil.addClass(this._image, 'leaflet-interactive');
      this.addInteractiveTarget(this._image);
    }

    this._container.appendChild(this._image);
    this._reset();
  },
  onRemove: function () {
    DomUtil.remove(this._image);
    if (this.options.interactive) {
      this.removeInteractiveTarget(this._image);
    }
  },
  _onImageLoad: function () {
    if (!this._image) {
      return;
    }
    this._image.loaded = +new Date();
    this._updateOpacity();
  },
  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      translate = this._map
        .getPixelOrigin()
        .add(this._location)
        .multiplyBy(scale)
        .subtract(this._map._getNewPixelOrigin(e.center, e.zoom))
        .round();

    if (Browser.any3d) {
      DomUtil.setTransform(this._image, translate, scale);
    } else {
      DomUtil.setPosition(this._image, translate);
    }
  },
  _reset: function (e) {
    var image = this._image,
      location = this._location,
      size = this._size,
      angle = 0.0;
    // TBD use the angle to establish the image rotation in CSS

    if (
      e &&
      this._step > 1 &&
      (this._overlayToRemove === undefined ||
        this._url === this._overlayToRemove)
    ) {
      return;
    }
    DomUtil.setPosition(image, location);

    image.style.width = size.x + 'px';
    image.style.height = size.y + 'px';
  },
  _updateOpacity: function () {
    if (!this._map) {
      return;
    }

    //L.DomUtil.setOpacity(this._image, this.options.opacity);

    var now = +new Date(),
      nextFrame = false;

    var image = this._image;

    var fade = Math.min(1, (now - image.loaded) / 200);

    DomUtil.setOpacity(image, fade);
    if (fade < 1) {
      nextFrame = true;
    }
    if (nextFrame) {
      Util.cancelAnimFrame(this._fadeFrame);
      this._fadeFrame = Util.requestAnimFrame(this._updateOpacity, this);
    }
    DomUtil.addClass(image, 'leaflet-image-loaded');
  }
});
export var imageLayer = function (
  url,
  location,
  size,
  angle,
  container,
  options
) {
  return new ImageLayer(url, location, size, angle, container, options);
};
