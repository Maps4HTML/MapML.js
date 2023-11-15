export var GeolocationButton = L.Control.extend({
  options: {
    position: 'bottomright'
  },

  onAdd: function (map) {
    // customize locate control to focus map after start/stop, so that
    // featureIndexOverlay is correctly displayed
    L.Control.CustomLocate = L.Control.Locate.extend({
      start: function () {
        L.Control.Locate.prototype.start.call(this);
        map.getContainer().focus();
      },
      stop: function () {
        L.Control.Locate.prototype.stop.call(this);
        map.getContainer().focus();
      }
    });
    this.locateControl = new L.Control.CustomLocate({
      showPopup: false,
      strings: {
        title: M.options.locale.btnLocTrackOff
      },
      position: this.options.position,
      locateOptions: {
        maxZoom: 16
      }
    }).addTo(map);

    var container = this.locateControl._container;
    var button = this.locateControl;
    var observer = new MutationObserver(function (mutations) {
      if (
        container.classList.contains('active') &&
        container.classList.contains('following')
      ) {
        container.firstChild.title = M.options.locale.btnLocTrackOn;
        button._marker.bindTooltip(M.options.locale.btnMyLocTrackOn, {
          permanent: true
        });
      } else if (container.classList.contains('active')) {
        container.firstChild.title = M.options.locale.btnLocTrackLastKnown;
        button._marker.bindTooltip(M.options.locale.btnMyLastKnownLocTrackOn);
      } else {
        container.firstChild.title = M.options.locale.btnLocTrackOff;
      }
    });
    var observerConfig = { attributes: true, attributeFilter: ['class'] };
    observer.observe(container, observerConfig);

    return container;
  },

  stop: function () {
    return this.locateControl.stop();
  }
});

export var geolocationButton = function (options) {
  return new GeolocationButton(options);
};
