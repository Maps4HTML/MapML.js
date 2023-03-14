export var AnnounceScale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 100,
      updateWhenIdle: true,
      metric: true
    },
  
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-control-scale leaflet-control-accessible-scalebar');
      container.style.display = 'none'; 
      var innerDiv = L.DomUtil.create('div', '', container);
      let visibleScaleBar = 0;
      let text = "";

      if (this.options.metric) {
        visibleScaleBar = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
        text = `${visibleScaleBar.textContent.trim()}`;
      }
      else {
        visibleScaleBar = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
        text = `${visibleScaleBar.textContent.trim()}`;

        // Get the LatLngs of the scale line
        let bbox = visibleScaleBar.getBoundingClientRect();

        let distance = bbox.right - bbox.left;

        text = `${distance} to ${visibleScaleBar.textContent.trim()}`;
      }

      innerDiv.innerHTML = text;
  
      // get the physically visible scalebar and extract its distance in meters
      map.on('zoomend moveend', () => {
    
      if (this.options.metric) {
        visibleScaleBar = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[0];
        text = `${visibleScaleBar.textContent.trim()}`;
      }
      else {
        visibleScaleBar = map._controlCorners.bottomleft.getElementsByClassName('leaflet-control-scale-line')[1];
        text = `${visibleScaleBar.textContent.trim()}`;

        // Get the LatLngs of the scale line
        var latLngs = L.PolylineUtil.decode(visibleScaleBar.getAttribute('aria-label'));

        // Calculate the distance between the first two LatLngs in meters
        var distance = latLngs[0].distanceTo(latLngs[1])*100;

        text = `${distance} to ${visibleScaleBar.textContent.trim()}`;
      }
    
      //var visibleDistanceMeters = parseFloat(visibleScaleBar.textContent.trim());
     
      // round the distance to 2 decimal places
      //var roundedDistance = distance.toFixed(2);
  
      // create the accessible scalebar text
  
      // set the text as the innerHTML of the innerDiv element
      innerDiv.innerHTML = text;


      });
  
      // visually hide the accessible scalebar
      container.style.display = 'none';
  
      return container;
    }
  });
  
  export var announceScale = function (options) {
    return new AnnounceScale(options);
  };