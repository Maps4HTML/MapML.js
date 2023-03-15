import '../../../dist/L.Control.Locate';
export var geolocationButton = function (options, map) {
    L.control.locate(options).addTo(map);
};