L.Map.Keyboard.include({
    _onKeyDown: function (e) {

        if (e.altKey || e.metaKey) { return; }

        let zoomIn = {
            187: 187,
            107: 107,
            61: 61,
            171: 171
        };

        let zoomOut = {
            189: 189,
            109: 109,
            54: 54,
            173: 173
        };

        var key = e.keyCode,
            map = this._map,
            offset;

        if (key in this._panKeys) {
            if (!map._panAnim || !map._panAnim._inProgress) {
                offset = this._panKeys[key];
                if (e.shiftKey) {
                    offset = L.point(offset).multiplyBy(3);
                }
                if (e.ctrlKey) {
                    offset = L.point(offset).divideBy(3);
                }

                map.panBy(offset);

                if (map.options.maxBounds) {
                    map.panInsideBounds(map.options.maxBounds);
                }
            }
        } else if (key in this._zoomKeys) {
            if((key in zoomIn && map._layersMaxZoom !== map.getZoom()) || (key in zoomOut && map._layersMinZoom !== map.getZoom()))
                map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

        } else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
            map.closePopup();

        } else {
            return;
        }

        L.DomEvent.stop(e);
    }
});