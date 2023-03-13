import './leaflet.js';  // bundled with proj4, proj4leaflet, modularized
import './mapml.js';   
import DOMTokenList from './DOMTokenList.js';
import { MapLayer } from './layer.js';
import { MapCaption } from './map-caption.js';

export class MapViewer extends HTMLElement {
  static get observedAttributes() {
    return ['lat', 'lon', 'zoom', 'projection', 'width', 'height', 'controls', 'static', 'controlslist'];
  }
  // see comments below regarding attributeChangedCallback vs. getter/setter
  // usage.  Effectively, the user of the element must use the property, not
  // the getAttribute/setAttribute/removeAttribute DOM API, because the latter
  // calls don't result in the getter/setter being called (so you have to use
  // the getter/setter directly)
  get controls() {
    return this.hasAttribute('controls');
  }
  set controls(value) {
    const hasControls = Boolean(value);
    if (hasControls) {
      this.setAttribute('controls','');
    } else {
      this.removeAttribute('controls');
    }
  }
  get controlsList() {
    return this._controlsList;
  }
  set controlsList(value) {
    this._controlsList.value = value;
    this.setAttribute('controlslist', value);
  }
  get width() {
    return (window.getComputedStyle(this).width).replace('px','');
  }
  set width(val) {
    //img.height or img.width setters change or add the corresponding attributes
    this.setAttribute("width", val);
  }
  get height() {
    return (window.getComputedStyle(this).height).replace('px','');
  }
  set height(val) {
    //img.height or img.width setters change or add the corresponding attributes
    this.setAttribute("height", val);
  }
  get lat() {
    return this.hasAttribute("lat") ? this.getAttribute("lat") : "0";
  }
  set lat(val) {
    if (val) {
      this.setAttribute("lat", val);
    }
  }
  get lon() {
    return this.hasAttribute("lon") ? this.getAttribute("lon") : "0";
  }
  set lon(val) {
    if (val) {
      this.setAttribute("lon", val);
    }
  }
  get projection() {
    return this.hasAttribute("projection") ? this.getAttribute("projection") : "";
  }
  set projection(val) {
    if(val && M[val]){
      this.setAttribute('projection', val);
      if (this._map && this._map.options.projection !== val){
        this._map.options.crs = M[val];
        this._map.options.projection = val;
        for(let layer of this.querySelectorAll("layer-")){
          layer.removeAttribute("disabled");
          let reAttach = this.removeChild(layer);
          this.appendChild(reAttach);
        }
        if(this._debug) for(let i = 0; i<2;i++) this.toggleDebug();
      } else this.dispatchEvent(new CustomEvent('createmap'));
    } else throw new Error("Undefined Projection");
  }
  get zoom() {
    return this.hasAttribute("zoom") ? this.getAttribute("zoom") : 0;
  }
  set zoom(val) {
      var parsedVal = parseInt(val,10);
      if (!isNaN(parsedVal) && (parsedVal >= 0 && parsedVal <= 25)) {
        this.setAttribute('zoom', parsedVal);
      }
  }
  get layers() {
    return this.getElementsByTagName('layer-');
  }

  get extent(){
    let map = this._map,
      pcrsBounds = M.pixelToPCRSBounds(
        map.getPixelBounds(),
        map.getZoom(),
        map.options.projection);
    let formattedExtent = M._convertAndFormatPCRS(pcrsBounds, map);
    if(map.getMaxZoom() !== Infinity){
      formattedExtent.zoom = {
        minZoom:map.getMinZoom(),
        maxZoom:map.getMaxZoom()
      };
    }
    return (formattedExtent);
  }
  get static() {
    return this.hasAttribute('static');
  }
  set static(value) {
    const isStatic = Boolean(value);
    if (isStatic)
      this.setAttribute('static', '');
    else
      this.removeAttribute('static');
  }

  constructor() {
    // Always call super first in constructor
    super();
    this._source = this.outerHTML;
    // create an array to track the history of the map and the current index
    this._history = [];
    this._historyIndex = -1;
    this._traversalCall = false;
  }
  connectedCallback() {

    this._createShadowRoot();

    this._controlsList = new DOMTokenList(
      this.getAttribute("controlslist"),
      this, "controlslist", 
      ["noreload","nofullscreen","nozoom","nolayer","geolocation"]
    );

    // the dimension attributes win, if they're there. A map does not
    // have an intrinsic size, unlike an image or video, and so must
    // have a defined width and height.
    var s = window.getComputedStyle(this),
      wpx = s.width, hpx=s.height,
      w = this.hasAttribute("width") ? this.getAttribute("width") : parseInt(wpx.replace('px','')),
      h = this.hasAttribute("height") ? this.getAttribute("height") : parseInt(hpx.replace('px',''));
    this._changeWidth(w);
    this._changeHeight(h);      


    // wait for createmap event before creating leaflet map
    // this allows a safeguard for the case where loading a custom TCRS takes 
    // longer than loading mapml-viewer.js/web-map.js
    // the REASON we need a synchronous event listener (see comment below)
    // is because the mapml-viewer element has / can have a size of 0 up until after
    // something that happens between this point and the event handler executing
    // perhaps a browser rendering cycle??
    this.addEventListener('createmap', this._createMap);

    let custom = !(["CBMTILE","APSTILE","OSMTILE","WGS84"].includes(this.projection));
    // this is worth a read, because dispatchEvent is synchronous
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
    // In particular:
    //   "All applicable event handlers are called and return before dispatchEvent() returns."
    if (!custom) {	
      this.dispatchEvent(new CustomEvent('createmap'));
    }
    // https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/274
    this.setAttribute('role', 'application');
    this._toggleStatic();

    /*
    1. only deletes aria-label when the last (only remaining) map caption is removed
    2. only deletes aria-label if the aria-label was defined by the map caption element itself
    */

    let mapcaption = this.querySelector('map-caption');

    if (mapcaption !== null) {
      setTimeout(() => {
        let ariaupdate = this.getAttribute('aria-label');

        if (ariaupdate === mapcaption.innerHTML) {
          this.mapCaptionObserver = new MutationObserver((m) => {
            let mapcaptionupdate = this.querySelector('map-caption');
            if (mapcaptionupdate !== mapcaption) {
              this.removeAttribute('aria-label');
            }     
          });
          this.mapCaptionObserver.observe(this, {
            childList: true
          });
        }
      }, 0);
    }
  }
  _createShadowRoot() {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `<link rel="stylesheet" href="${new URL("mapml.css", import.meta.url).href}">`; // jshint ignore:line

    let shadowRoot = this.attachShadow({mode: 'open'});
    this._container = document.createElement('div');

    let output = "<output role='status' aria-live='polite' aria-atomic='true' class='mapml-screen-reader-output'></output>";
    this._container.insertAdjacentHTML("beforeend", output);

    // Set default styles for the map element.
    let mapDefaultCSS = document.createElement('style');
    mapDefaultCSS.innerHTML =
    `:host {` +
    `all: initial;` + // Reset properties inheritable from html/body, as some inherited styles may cause unexpected issues with the map element's components (https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/140).
    `contain: layout size;` + // Contain layout and size calculations within the map element.
    `display: inline-block;` + // This together with dimension properties is required so that Leaflet isn't working with a height=0 box by default.
    `height: 150px;` + // Provide a "default object size" (https://github.com/Maps4HTML/HTML-Map-Element/issues/31).
    `width: 300px;` +
    `border-width: 2px;` + // Set a default border for contrast, similar to UA default for iframes.
    `border-style: inset;` +
    `}` +
    `:host([frameborder="0"]) {` +
    `border-width: 0;` +
    `}` +
    `:host([hidden]) {` +
    `display: none!important;` +
    `}` +
    `:host .leaflet-control-container {` +
    `visibility: hidden!important;` + // Visibility hack to improve percieved performance (mitigate FOUC) – visibility is unset in mapml.css! (https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/154).
    `}`;

    // Hide all (light DOM) children of the map element.
    let hideElementsCSS = document.createElement('style');
    hideElementsCSS.innerHTML =
    `mapml-viewer > * {` +
    `display: none!important;` +
    `}`;
    this.appendChild(hideElementsCSS);
    
    // Make the Leaflet container element programmatically identifiable
    // (https://github.com/Leaflet/Leaflet/issues/7193).
    this._container.setAttribute('role', 'region');
    this._container.setAttribute('aria-label', 'Interactive map');

    shadowRoot.appendChild(mapDefaultCSS);
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    shadowRoot.appendChild(this._container);

  }
  _createMap() {
    if (!this._map) {
      this._map = L.map(this._container, {
        center: new L.LatLng(this.lat, this.lon),
        projection: this.projection,
        query: true,
        contextMenu: true,
        announceMovement: M.options.announceMovement,
        featureIndex: true,
        mapEl: this,
        crs: M[this.projection],
        zoom: this.zoom,
        zoomControl: false,
        // because the M.MapMLLayer invokes _tileLayer._onMoveEnd when
        // the mapml response is received the screen tends to flash.  I'm sure
        // there is a better configuration than that, but at this moment
        // I'm not sure how to approach that issue.
        // See https://github.com/Maps4HTML/MapML-Leaflet-Client/issues/24
        fadeAnimation: true
      });
      this._addToHistory();
      // the attribution control is not optional
      M.attributionControl(this);

      this._createControls();
      this._toggleControls();
      this._crosshair = M.crosshair().addTo(this._map);
      if(M.options.featureIndexOverlayOption) this._featureIndexOverlay = M.featureIndexOverlay().addTo(this._map);

      this._setUpEvents();
      M.scaleBar().addTo(this._map);
    }
  }
  disconnectedCallback() {
    //this._removeEvents();
    delete this._map;
  }
  adoptedCallback() {
//    console.log('Custom map element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
//    console.log('Attribute: ' + name + ' changed from: '+ oldValue + ' to: '+newValue);
    // "Best practice": handle side-effects in this callback
    // https://developers.google.com/web/fundamentals/web-components/best-practices
    // https://developers.google.com/web/fundamentals/web-components/best-practices#avoid-reentrancy
    // note that the example is misleading, since the user can't use
    // setAttribute or removeAttribute to set the property, they need to use
    // the property directly in their API usage, which kinda sucks
    /*
  const hasValue = newValue !== null;
  switch (name) {
    case 'checked':
      // Note the attributeChangedCallback is only handling the *side effects*
      // of setting the attribute.
      this.setAttribute('aria-checked', hasValue);
      break;
    ...
  }     */
    switch(name) {
      case 'controlslist':
        if (this._controlsList) {
          if (this._controlsList.valueSet === false) {
            this._controlsList.value = newValue;
          }
          this._toggleControls();
        }
      break;
      case 'controls':
        if (oldValue !== null && newValue === null) {
          this._hideControls();
        } else if (oldValue === null && newValue !== null) {
          this._showControls();
        }
      break;
      case 'height': 
        if (oldValue !== newValue) {
          this._changeHeight(newValue);
        }
      break;  
      case 'width': 
        if (oldValue !== newValue) {
          this._changeWidth(newValue);
        }
      break;
      case 'static':
        this._toggleStatic();
      break;
    }
  }

  // Creates All map controls and adds them to the map, when created.
  _createControls() {
    let mapSize = this._map.getSize().y,
          totalSize = 0;

    this._layerControl = M.layerControl(null,{"collapsed": true, mapEl: this}).addTo(this._map);

    // Only add controls if there is enough top left vertical space
    if (!this._zoomControl && (totalSize + 93) <= mapSize){
      totalSize += 93;
      this._zoomControl = L.control.zoom().addTo(this._map);
    }
    if (!this._reloadButton && (totalSize + 49) <= mapSize){
      totalSize += 49;
      this._reloadButton = M.reloadButton().addTo(this._map);
    }
    if (!this._fullScreenControl && (totalSize + 49) <= mapSize){
      totalSize += 49;
      this._fullScreenControl = M.fullscreenButton().addTo(this._map);
    }
    if (!this._geolocationButton) {
      this._geolocationButton = M.geolocationButton().addTo(this._map);
    }
  }
  
  // Sets controls by hiding/unhiding them based on the map attribute
  _toggleControls() {
    if (this.controls === false) {
      this._hideControls();
      this._map.contextMenu.toggleContextMenuItem("Controls", "disabled");
    } else  {
      this._showControls();
      this._map.contextMenu.toggleContextMenuItem("Controls", "enabled");
    }
  }

  _hideControls() {
    this._setControlsVisibility("fullscreen",true);
    this._setControlsVisibility("layercontrol",true);
    this._setControlsVisibility("reload",true);
    this._setControlsVisibility("zoom",true);
    this._setControlsVisibility("geolocation",true);
  }
  _showControls() {
    this._setControlsVisibility("fullscreen",false);
    this._setControlsVisibility("layercontrol",false);
    this._setControlsVisibility("reload",false);
    this._setControlsVisibility("zoom",false);
    this._setControlsVisibility("geolocation",true);
      
    // prune the controls shown if necessary
    // this logic could be embedded in _showControls
    // but would require being able to iterate the domain of supported tokens
    // for the controlslist
    if (this._controlsList) {
      this._controlsList.forEach((value) => {
        switch(value.toLowerCase()) {
          case 'nofullscreen':
            this._setControlsVisibility("fullscreen",true);
          break;
          case 'nolayer':
            this._setControlsVisibility("layercontrol",true);
          break;
          case 'noreload':
            this._setControlsVisibility("reload",true);
          break;
          case 'nozoom':
            this._setControlsVisibility("zoom",true);
          break;
          case 'geolocation':
            this._setControlsVisibility("geolocation",false);
          break;
        }
      });
    }
    if (this._layerControl && this._layerControl._layers.length === 0) {
      this._layerControl._container.setAttribute("hidden","");
    }
  }

  // Sets the control's visibility AND all its childrens visibility,
  // for the control element based on the Boolean hide parameter
  _setControlsVisibility(control, hide) {
    let container;
    switch(control) {
      case "zoom":
        if (this._zoomControl) {
          container = this._zoomControl._container;
        }
        break;
      case "reload":
        if (this._reloadButton) {
          container = this._reloadButton._container;
        }
        break;
      case "fullscreen":
        if (this._fullScreenControl) {
          container = this._fullScreenControl._container;
        }
        break;
      case "layercontrol":
        if (this._layerControl) {
          container = this._layerControl._container;
        }
        break;
      case "geolocation":
        if (this._geolocationButton) {
          container = this._geolocationButton._container;
        }
        break;
    }
    if (container) {
      if (hide) {
        // setting the visibility for all the children of the element
        [ ...container.children].forEach((childEl) => {
          childEl.setAttribute("hidden","");
        });
        container.setAttribute("hidden","");
      } else {
        // setting the visibility for all the children of the element
        [ ...container.children].forEach((childEl) => {
          childEl.removeAttribute("hidden");
        });
        container.removeAttribute("hidden");
      }
    }
  }
  _toggleStatic(){
    const isStatic = this.hasAttribute('static');
    if (this._map) {
      if (isStatic) {
        this._map.dragging.disable();
        this._map.touchZoom.disable();
        this._map.doubleClickZoom.disable();
        this._map.scrollWheelZoom.disable();
        this._map.boxZoom.disable();
        this._map.keyboard.disable();
        this._zoomControl.disable();
      } else {
        this._map.dragging.enable();
        this._map.touchZoom.enable();
        this._map.doubleClickZoom.enable();
        this._map.scrollWheelZoom.enable();
        this._map.boxZoom.enable();
        this._map.keyboard.enable();
        this._zoomControl.enable();
      }
    }
  }
  
  _dropHandler(event) {
    event.preventDefault();
    let text = event.dataTransfer.getData("text");
    M._pasteLayer(this, text);
  }
  _dragoverHandler(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }
  _removeEvents() {
    if (this._map) {
      this._map.off();
      this.removeEventListener("drop", this._dropHandler, false);
      this.removeEventListener("dragover", this._dragoverHandler, false);
    }
  }
  _setUpEvents() {
    this.addEventListener("drop", this._dropHandler, false);
    this.addEventListener("dragover", this._dragoverHandler, false);
    this.addEventListener("change",
    function(e) {
      if(e.target.tagName === "LAYER-"){
        this.dispatchEvent(new CustomEvent("layerchange", {details:{target: this, originalEvent: e}}));
      }
    }, false);

    this.parentElement.addEventListener('keyup', function (e) {
      if(e.keyCode === 9 && document.activeElement.nodeName === "MAPML-VIEWER"){
        document.activeElement.dispatchEvent(new CustomEvent('mapfocused', {detail:
              {target: this}}));
      }
    });
    // pasting layer-, links and geojson using Ctrl+V 
    this.addEventListener('keydown', function (e) {
      if(e.keyCode === 86 && e.ctrlKey){
        navigator.clipboard
          .readText()
          .then(
            (layer) => {
              M._pasteLayer(this, layer);
            });
      // Prevents default spacebar event on all of mapml-viewer
      } else if (e.keyCode === 32 &&
                 this.shadowRoot.activeElement.nodeName !== "INPUT") {
        e.preventDefault();
        this._map.fire('keypress', {originalEvent: e});
      }
    });
    this.parentElement.addEventListener('mousedown', function (e) {
      if(document.activeElement.nodeName === "MAPML-VIEWER"){
        document.activeElement.dispatchEvent(new CustomEvent('mapfocused', {detail:
              {target: this}}));
      }
    });

    this._map.on('locationfound',
      function (e) {
        this.dispatchEvent(new CustomEvent('maplocationfound', {detail:
          {latlng: e.latlng,     accuracy: e.accuracy}
         }));
      },this);
    this._map.on('locationerror',
      function (e) {
        this.dispatchEvent(new CustomEvent('locationerror', {detail:
          {error:e.message}
        }));
      },this);
    this._map.on('load',
      function () {
        this.dispatchEvent(new CustomEvent('load', {detail: {target: this}}));
      }, this);
    this._map.on('preclick',
      function (e) {
        this.dispatchEvent(new CustomEvent('preclick', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('click',
      function (e) {
        this.dispatchEvent(new CustomEvent('click', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('dblclick',
      function (e) {
        this.dispatchEvent(new CustomEvent('dblclick', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('mousemove',
      function (e) {
        this.dispatchEvent(new CustomEvent('mousemove', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('mouseover',
      function (e) {
        this.dispatchEvent(new CustomEvent('mouseover', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('mouseout',
      function (e) {
        this.dispatchEvent(new CustomEvent('mouseout', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('mousedown',
      function (e) {
        this.dispatchEvent(new CustomEvent('mousedown', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      },this);
    this._map.on('mouseup',
      function (e) {
        this.dispatchEvent(new CustomEvent('mouseup', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('contextmenu',
      function (e) {
        this.dispatchEvent(new CustomEvent('contextmenu', {detail:
          {lat: e.latlng.lat,     lon: e.latlng.lng,
             x: e.containerPoint.x, y: e.containerPoint.y}
         }));
      }, this);
    this._map.on('movestart',
      function () {
        this._updateMapCenter();
        this.dispatchEvent(new CustomEvent('movestart', {detail:
          {target: this}}));
      }, this);
    this._map.on('move',
      function () {
        this._updateMapCenter();
        this.dispatchEvent(new CustomEvent('move', {detail:
          {target: this}}));
      }, this);
    this._map.on('moveend',
      function () {
        this._updateMapCenter();
        this._addToHistory();
        this.dispatchEvent(new CustomEvent('moveend', {detail:
          {target: this}}));
      }, this);
    this._map.on('zoomstart',
      function () {
        this._updateMapCenter();
        this.dispatchEvent(new CustomEvent('zoomstart', {detail:
          {target: this}}));
      }, this);
    this._map.on('zoom',
      function () {
        this._updateMapCenter();
        this.dispatchEvent(new CustomEvent('zoom', {detail:
          {target: this}}));
      }, this);
    this._map.on('zoomend',
      function () {
        this._updateMapCenter();
        this.dispatchEvent(new CustomEvent('zoomend', {detail:
          {target: this}}));
      }, this);
    this.addEventListener('fullscreenchange', function(event) {
      if (document.fullscreenElement === null) {
        // full-screen mode has been exited
        this._map.contextMenu.setViewFullScreenInnerHTML('view');
      } else {
        this._map.contextMenu.setViewFullScreenInnerHTML('exit');
      }
    });
    this.addEventListener('keydown', function(event) {
      if (document.activeElement.nodeName === "MAPML-VIEWER") {
        // Check if Ctrl+R is pressed and map is focused
        if (event.ctrlKey && event.keyCode === 82) {
          // Prevent default browser behavior
          event.preventDefault();
          this.reload();
        } else if (event.altKey && event.keyCode === 39) {
          // Prevent default browser behavior
          event.preventDefault();
          this.forward();
        } else if (event.altKey && event.keyCode === 37) {
          // Prevent default browser behavior
          event.preventDefault();
          this.back();
        }
      }
    });
  }

  locate(options) { //options: https://leafletjs.com/reference.html#locate-options
    if (this._geolocationButton) {
      this._geolocationButton.stop();
    }
    if (options) {
      if (options.zoomTo) {
        options.setView = options.zoomTo;
        delete options.zoomTo;
      }
      this._map.locate(options);
    } else {
      this._map.locate({setView: true, maxZoom: 16});
    }
  }

  toggleDebug(){
    if(this._debug){
      this._debug.remove();
      this._debug = undefined;
    } else {
      this._debug = M.debugOverlay().addTo(this._map);
    }
  }
  
  _changeWidth(width) {
    if (this._container) {
      this._container.style.width = width+"px";
      this.shadowRoot.styleSheets[0].cssRules[0].style.width = width+"px";
    }
    if (this._map) {
        this._map.invalidateSize(false);
    }
  }
  _changeHeight(height) {
    if (this._container) {
      this._container.style.height = height+"px";
      this.shadowRoot.styleSheets[0].cssRules[0].style.height = height+"px";
    }
    if (this._map) {
        this._map.invalidateSize(false);
    }
  }
  zoomTo(lat, lon, zoom) {
    zoom = Number.isInteger(+zoom) ? +zoom : this.zoom;
    let location = new L.LatLng(+lat, +lon);
    this._map.setView(location, zoom);
    this.zoom = zoom;
    this.lat = location.lat;
    this.lon = location.lng;
  }
  _updateMapCenter() {
    // remember to tell Leaflet event handler that 'this' in here refers to
    //  something other than the map in this case the custom polymer element
    this.lat = this._map.getCenter().lat;
    this.lon = this._map.getCenter().lng;
    this.zoom = this._map.getZoom();
  }

  /**
   * Adds to the maps history on moveends
   * @private
   */
  _addToHistory(){
    if(this._traversalCall > 0) { // this._traversalCall tracks how many consecutive moveends to ignore from history
      this._traversalCall--;      // this is useful for ignoring moveends corresponding to back, forward and reload
      return;
    }

    let mapLocation = this._map.getPixelBounds().getCenter();
    let location = {
      zoom: this._map.getZoom(),
      x:mapLocation.x,
      y:mapLocation.y,
    };
    this._historyIndex++;
    this._history.splice(this._historyIndex, 0, location);
    // Remove future history and overwrite it when map pan/zoom while inside history
    if (this._historyIndex + 1 !== this._history.length) {
      this._history.length = this._historyIndex + 1;
    }
    if (this._historyIndex === 0) {
      // when at initial state of map, disable back, forward, and reload items
      this._map.contextMenu.toggleContextMenuItem("Back", "disabled"); // back contextmenu item
      this._map.contextMenu.toggleContextMenuItem("Forward", "disabled");// forward contextmenu item
      this._map.contextMenu.toggleContextMenuItem("Reload", "disabled"); // reload contextmenu item
      this._reloadButton?.disable();
    } else {
      this._map.contextMenu.toggleContextMenuItem("Back", "enabled"); // back contextmenu item
      this._map.contextMenu.toggleContextMenuItem("Forward", "disabled");// forward contextmenu item
      this._map.contextMenu.toggleContextMenuItem("Reload", "enabled"); // reload contextmenu item
      this._reloadButton?.enable();
    }
  }
  /**
   * Allow user to move back in history
   */
  back(){
    let history = this._history;
    let curr = history[this._historyIndex];

    if(this._historyIndex > 0){
      this._map.contextMenu.toggleContextMenuItem("Forward", "enabled");// forward contextmenu item
      this._historyIndex--;
      let prev = history[this._historyIndex];
      // Disable back, reload contextmenu item when at the end of history
      if (this._historyIndex === 0) {
        this._map.contextMenu.toggleContextMenuItem("Back", "disabled"); // back contextmenu item
        this._map.contextMenu.toggleContextMenuItem("Reload", "disabled"); // reload contextmenu item
        this._reloadButton?.disable();
      }

      if(prev.zoom !== curr.zoom){
        this._traversalCall = 2;  // allows the next 2 moveends to be ignored from history

        let currScale = this._map.options.crs.scale(curr.zoom); // gets the scale of the current zoom level
        let prevScale = this._map.options.crs.scale(prev.zoom); // gets the scale of the previous zoom level

        let scale = currScale / prevScale; // used to convert the previous pixel location to be in terms of the current zoom level

        this._map.panBy([((prev.x * scale) - curr.x), ((prev.y * scale) - curr.y)], {animate: false});
        this._map.setZoom(prev.zoom);
      } else {
        this._traversalCall = 1;
        this._map.panBy([(prev.x - curr.x), (prev.y - curr.y)]);
      }
    }
  }

  /**
   * Allows user to move forward in history
   */
  forward(){
    let history = this._history;
    let curr = history[this._historyIndex];
    if(this._historyIndex < history.length - 1){
      this._map.contextMenu.toggleContextMenuItem("Back", "enabled"); // back contextmenu item
      this._map.contextMenu.toggleContextMenuItem("Reload", "enabled"); // reload contextmenu item
      this._reloadButton?.enable();
      this._historyIndex++;
      let next = history[this._historyIndex];
      // disable forward contextmenu item, when at the end of forward history
      if (this._historyIndex + 1 === this._history.length) {
        this._map.contextMenu.toggleContextMenuItem("Forward", "disabled"); // forward contextmenu item
      }

      if(next.zoom !== curr.zoom){
        this._traversalCall = 2; // allows the next 2 moveends to be ignored from history

        let currScale = this._map.options.crs.scale(curr.zoom); // gets the scale of the current zoom level
        let nextScale = this._map.options.crs.scale(next.zoom); // gets the scale of the next zoom level

        let scale = currScale / nextScale; // used to convert the next pixel location to be in terms of the current zoom level

        this._map.panBy([((next.x * scale) - curr.x), ((next.y * scale) - curr.y)], {animate: false});
        this._map.setZoom(next.zoom);
      } else {
        this._traversalCall = 1;
        this._map.panBy([(next.x - curr.x), (next.y - curr.y)]);
      }
    }
  }

  /**
   * Allows the user to reload/reset the map's location to it's initial location
   */
  reload(){
    let initialLocation = this._history.shift();
    let mapLocation = this._map.getPixelBounds().getCenter();
    let curr = {
      zoom: this._map.getZoom(),
      x:mapLocation.x,
      y:mapLocation.y,
    };

    this._map.contextMenu.toggleContextMenuItem("Back", "disabled"); // back contextmenu item
    this._map.contextMenu.toggleContextMenuItem("Forward", "disabled");// forward contextmenu item
    this._map.contextMenu.toggleContextMenuItem("Reload", "disabled"); // reload contextmenu item
    this._reloadButton?.disable();

    this._history = [initialLocation];
    this._historyIndex = 0;

    if(initialLocation.zoom !== curr.zoom) {
      this._traversalCall = 2; // ignores the next 2 moveend events

      let currScale = this._map.options.crs.scale(curr.zoom); // gets the scale of the current zoom level
      let initScale = this._map.options.crs.scale(initialLocation.zoom); // gets the scale of the initial location's zoom

      let scale = currScale / initScale;

      this._map.panBy([((initialLocation.x * scale) - curr.x), ((initialLocation.y * scale) - curr.y)], {animate: false});
      this._map.setZoom(initialLocation.zoom);
    } else { // if it's on the same zoom level as the initial location, no need to calculate scales
      this._traversalCall = 1;
      this._map.panBy([(initialLocation.x- curr.x), (initialLocation.y - curr.y)]);
    }
  }

  _toggleFullScreen(){
    this._map.toggleFullscreen();
  }

  viewSource(){
    let blob = new Blob([this._source],{type:"text/plain"}),
        url = URL.createObjectURL(blob);
    window.open(url);
    URL.revokeObjectURL(url);
  }

  defineCustomProjection(jsonTemplate) {
    let t = JSON.parse(jsonTemplate);
    if (t === undefined || !t.proj4string || !t.projection || !t.resolutions || !t.origin || !t.bounds) throw new Error('Incomplete TCRS Definition');
    if (t.projection.indexOf(":") >= 0) throw new Error('":" is not permitted in projection name');
    if (M[t.projection.toUpperCase()]) return t.projection.toUpperCase();
    let tileSize = [256, 512, 1024, 2048, 4096].includes(t.tilesize)?t.tilesize:256;

    M[t.projection] = new L.Proj.CRS(t.projection, t.proj4string, {
      origin: t.origin,
      resolutions: t.resolutions,
      bounds: L.bounds(t.bounds),
      crs: {
        tcrs: {
          horizontal: {
            name: "x",
            min: 0, 
            max: zoom => (Math.round(M[t.projection].options.bounds.getSize().x / M[t.projection].options.resolutions[zoom]))
          },
          vertical: {
            name: "y",
            min:0, 
            max: zoom => (Math.round(M[t.projection].options.bounds.getSize().y / M[t.projection].options.resolutions[zoom]))
          },
          bounds: zoom => L.bounds([M[t.projection].options.crs.tcrs.horizontal.min,
            M[t.projection].options.crs.tcrs.vertical.min],
            [M[t.projection].options.crs.tcrs.horizontal.max(zoom),
            M[t.projection].options.crs.tcrs.vertical.max(zoom)])
        },
        pcrs: {
          horizontal: {
            name: "easting",
            get min() {return M[t.projection].options.bounds.min.x;},
            get max() {return M[t.projection].options.bounds.max.x;}
          }, 
          vertical: {
            name: "northing", 
            get min() {return M[t.projection].options.bounds.min.y;},
            get max() {return M[t.projection].options.bounds.max.y;}
          },
          get bounds() {return M[t.projection].options.bounds;}
        }, 
        gcrs: {
          horizontal: {
            name: "longitude",
            // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
            get min() {return M[t.projection].unproject(M.OSMTILE.options.bounds.min).lng;},
            get max() {return M[t.projection].unproject(M.OSMTILE.options.bounds.max).lng;}
          }, 
          vertical: {
            name: "latitude",
            // set min/max axis values from EPSG registry area of use, retrieved 2019-07-25
            get min() {return M[t.projection].unproject(M.OSMTILE.options.bounds.min).lat;},
            get max() {return M[t.projection].unproject(M.OSMTILE.options.bounds.max).lat;}
          },
          get bounds() {return L.latLngBounds(
                [M[t.projection].options.crs.gcrs.vertical.min,M[t.projection].options.crs.gcrs.horizontal.min],
                [M[t.projection].options.crs.gcrs.vertical.max,M[t.projection].options.crs.gcrs.horizontal.max]);}
        },
        map: {
          horizontal: {
            name: "i",
            min: 0,
            max: map => map.getSize().x
          },
          vertical: {
            name: "j",
            min: 0,
            max: map => map.getSize().y
          },
          bounds: map => L.bounds(L.point([0,0]),map.getSize())
        },
        tile: {
          horizontal: {
            name: "i",
            min: 0,
            max: tileSize,
          },
          vertical: {
            name: "j",
            min: 0,
            max: tileSize,
          },
          get bounds() {return L.bounds(
                    [M[t.projection].options.crs.tile.horizontal.min,M[t.projection].options.crs.tile.vertical.min],
                    [M[t.projection].options.crs.tile.horizontal.max,M[t.projection].options.crs.tile.vertical.max]);}
        },
        tilematrix: {
          horizontal: {
            name: "column",
            min: 0,
            max: zoom => (Math.round(M[t.projection].options.crs.tcrs.horizontal.max(zoom) / M[t.projection].options.crs.tile.bounds.getSize().x))
          },
          vertical: {
            name: "row",
            min: 0,
            max: zoom => (Math.round(M[t.projection].options.crs.tcrs.vertical.max(zoom) / M[t.projection].options.crs.tile.bounds.getSize().y))
          },
          bounds: zoom => L.bounds(
                   [M[t.projection].options.crs.tilematrix.horizontal.min,
                   M[t.projection].options.crs.tilematrix.vertical.min],
                   [M[t.projection].options.crs.tilematrix.horizontal.max(zoom),
                   M[t.projection].options.crs.tilematrix.vertical.max(zoom)])
        }
      },
    });      //creates crs using L.Proj
    M[t.projection.toUpperCase()] = M[t.projection]; //adds the projection uppercase to global M
    return t.projection;
  }

  geojson2mapml(json, options = {}){
    if (options.projection === undefined) {
      options.projection = this.projection;
    }
    let geojsonLayer = M.geojson2mapml(json, options);
    this.appendChild(geojsonLayer);
    return geojsonLayer;
  }
}
// need to provide options { extends: ... }  for custom built-in elements
window.customElements.define('mapml-viewer', MapViewer);
window.customElements.define('layer-', MapLayer);
window.customElements.define('map-caption',MapCaption);
