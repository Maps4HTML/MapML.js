export var geolocationButton = function (options, map) {
    return L.control.locate(options).addTo(map);
};
