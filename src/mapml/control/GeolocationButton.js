export var geolocationButton = function (map) {
    var CustomMarker = L.Marker.extend({
        options: {
            icon: new L.Icon({
                iconUrl: '../src/marker.png',
                iconSize: [20, 20],
            }),
            alt: '',
            title: 'My Location',
        }
    });
    return L.control.locate({
        markerClass: CustomMarker,
        showPopup: false,
        strings: {
          title: M.options.locale.btnLocTrackOff 
        },
        position: "bottomright",
        locateOptions: {
          maxZoom: 16
        },
    }).addTo(map);
};
