/*
MIT License related to portions of M.ContextMenu 
Copyright (c) 2017 adam.ratcliffe@gmail.com
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
/* global M */

export var ContextMenu = L.Handler.extend({
  _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',

  initialize: function (map) {
    L.Handler.prototype.initialize.call(this, map);
    this.activeIndex = 0; //current fous index on menu
    this.excludedIndices = [4, 7]; //menu indexes that are --------
    this.isRunned = false; //variable for tracking edge case
    //setting the items in the context menu and their callback functions
    this._items = [
      {
        text: M.options.locale.cmBack + " (<kbd>Alt+Left Arrow</kbd>)",
        callback:this._goBack
      },
      {
        text: M.options.locale.cmForward + " (<kbd>Alt+Right Arrow</kbd>)",
        callback:this._goForward
      },
      {
        text: M.options.locale.cmReload + " (<kbd>Ctrl+R</kbd>)",
        callback:this._reload
      },
      {
        text: M.options.locale.btnFullScreen + " (<kbd>F</kbd>)",
        callback:this._toggleFullScreen
      },
      {
        spacer:"-"
      },
      {
        text: M.options.locale.cmCopyCoords + " (<kbd>C</kbd>)<span></span>",
        callback:this._copyCoords,
        hideOnSelect:false,
        popup:true,
        submenu:[
          {
            text: M.options.locale.cmCopyMapML,
            callback:this._copyMapML
          },
          {
            text: M.options.locale.cmCopyExtent,
            callback:this._copyExtent
          },
          {
            text: M.options.locale.cmCopyLocation,
            callback:this._copyLocation
          }
        ]
      },
      {
        text: M.options.locale.cmPasteLayer + " (<kbd>P</kbd>)",
        callback:this._paste
      },
      {
        spacer:"-"
      },
      {
        text: M.options.locale.cmToggleControls + " (<kbd>T</kbd>)",
        callback:this._toggleControls
      },      {
        text: M.options.locale.cmToggleDebug + " (<kbd>D</kbd>)",
        callback:this._toggleDebug
      },
      {
        text: M.options.locale.cmViewSource + " (<kbd>V</kbd>)",
        callback:this._viewSource
      }
    ];

    // setting the default cs for copying location and extent
    // should be public as they are used in tests
    this.defExtCS = M.options.defaultExtCoor;
    this.defLocCS = M.options.defaultLocCoor;
    this._layerItems = [
      {
        text: M.options.locale.lmZoomToLayer + " (<kbd>Z</kbd>)",
        callback:this._zoomToLayer
      },
      {
        text: M.options.locale.lmCopyLayer + " (<kbd>L</kbd>)",
        callback:this._copyLayer
      }
    ];
    this._mapMenuVisible = false;
    this._keyboardEvent = false;

    this._container = L.DomUtil.create("div", "mapml-contextmenu", map._container);
    this._container.setAttribute('hidden', '');
    
    for (let i = 0; i < 6; i++) {
      this._items[i].el = this._createItem(this._container, this._items[i]);
    }
    
    this._coordMenu = L.DomUtil.create("div", "mapml-contextmenu mapml-submenu", this._container);
    this._coordMenu.id = "mapml-copy-submenu";
    this._coordMenu.setAttribute('hidden', '');
    
    this._clickEvent = null;
    
    for(let i =0;i<this._items[5].submenu.length;i++){
      this._createItem(this._coordMenu,this._items[5].submenu[i],i);
    }
    
    this._items[6].el = this._createItem(this._container, this._items[6]);
    this._items[7].el = this._createItem(this._container, this._items[7]);
    this._items[8].el = this._createItem(this._container, this._items[8]);
    this._items[9].el = this._createItem(this._container, this._items[9]);
    this._items[10].el = this._createItem(this._container, this._items[10]);
    
    this._layerMenu = L.DomUtil.create("div", "mapml-contextmenu mapml-layer-menu", map._container);
    this._layerMenu.setAttribute('hidden', '');
    for (let i = 0; i < this._layerItems.length; i++) {
      this._createItem(this._layerMenu, this._layerItems[i]);
    }

    L.DomEvent
      .on(this._container, 'click', L.DomEvent.stop)
      .on(this._container, 'mousedown', L.DomEvent.stop)
      .on(this._container, 'dblclick', L.DomEvent.stop)
      .on(this._container, 'contextmenu', L.DomEvent.stop)
      .on(this._layerMenu, 'click', L.DomEvent.stop)
      .on(this._layerMenu, 'mousedown', L.DomEvent.stop)
      .on(this._layerMenu, 'dblclick', L.DomEvent.stop)
      .on(this._layerMenu, 'contextmenu', L.DomEvent.stop);
      
    this.t = document.createElement('template');
    this.t.innerHTML = 
     `<map-feature zoom="">
        <map-featurecaption></map-featurecaption>
        <map-properties>
            <h2></h2>
            <div style="text-align:center"></div>
        </map-properties>
        <map-geometry cs="">
          <map-point>
            <map-coordinates></map-coordinates>
          </map-point>
        </map-geometry>
      </map-feature>`;
  },

  addHooks: function () {
    var container = this._map.getContainer();

    L.DomEvent
      .on(container, 'mouseleave', this._hide, this)
      .on(document, 'keydown', this._onKeyDown, this);

    if (L.Browser.touch) {
      L.DomEvent.on(document, this._touchstart, this._hide, this);
    }

    this._map.on({
      contextmenu: this._show,
      mousedown: this._hide,
      zoomstart: this._hide
    }, this);
  },

  removeHooks: function () {
    var container = this._map.getContainer();

    L.DomEvent
      .off(container, 'mouseleave', this._hide, this)
      .off(document, 'keydown', this._onKeyDown, this);

    if (L.Browser.touch) {
      L.DomEvent.off(document, this._touchstart, this._hide, this);
    }

    this._map.off({
      contextmenu: this._show,
      mousedown: this._hide,
      zoomstart: this._hide
    }, this);
  },

  _updateCS: function () {
    if (this.defExtCS !== M.options.defaultExtCoor || this.defLocCS !== M.options.defaultLocCoor) {
      this.defExtCS = M.options.defaultExtCoor;
      this.defLocCS = M.options.defaultLocCoor;
    }
  },

  _copyExtent: function (e) {
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
        coord = context.defExtCS? context.defExtCS.toLowerCase() : 'pcrs',
        tL = e instanceof KeyboardEvent? this.extent.topLeft[coord] : this.options.mapEl.extent.topLeft[coord],
        bR = e instanceof KeyboardEvent? this.extent.bottomRight[coord] : this.options.mapEl.extent.bottomRight[coord],
        data = "";
    switch(coord) {
      case 'MapML':
      default: 
        if (coord === 'pcrs') {
          data = `<map-meta name="extent" content="top-left-easting=${Math.round(tL.horizontal)}, top-left-northing=${Math.round(tL.vertical)}, bottom-right-easting=${Math.round(bR.horizontal)}, bottom-right-northing=${Math.round(bR.vertical)}"></map-meta>`;
        } else if (coord === 'gcrs') {
          data = `<map-meta name="extent" content="top-left-longitude=${tL.horizontal}, top-left-latitude=${tL.vertical}, bottom-right-longitude=${bR.horizontal}, bottom-right-latitude=${bR.vertical}"></map-meta>`;
        } else if (coord === 'tcrs') {
          data = `<map-meta name="extent" content="top-left-x=${tL[0].horizontal}, top-left-y=${tL[0].vertical}, bottom-right-x=${bR[bR.length - 1].horizontal}, bottom-right-y=${bR[bR.length - 1].vertical}"></map-meta>`;
        } else if (coord === 'tilematrix') {          
          data = `<map-meta name="extent" content="top-left-column=${tL[0].horizontal}, top-left-row=${tL[0].vertical}, bottom-right-column=${bR[bR.length - 1].horizontal}, bottom-right-row=${bR[bR.length - 1].vertical}"></map-meta>`;
        } else {
          console.log('not support');
        }
        break;
    }
    context._copyData(data);
  },

  _zoomToLayer: function (e) {
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu;
    context._layerClicked.layer._layerEl.zoomTo();
  },

  _copyLayer: function (e) {
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
      layerElem = context._layerClicked.layer._layerEl;
    context._copyData(layerElem.outerHTML);
  },

  _goForward: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl.forward();
  },

  _goBack: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl.back();
  },

  _reload: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl.reload();
  },

  _toggleFullScreen: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl._toggleFullScreen();
  },

  _toggleControls: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    if (mapEl.controls) {
      mapEl.controls = false;
    } else {
      mapEl.controls = true;
    }
  },

  _copyMapML: function(e){
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
      mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    context._copyData(mapEl.outerHTML.replace(/<div class="mapml-web-map">.*?<\/div>|<style>\[is="web-map"].*?<\/style>|<style>mapml-viewer.*?<\/style>/gm, ""));
  },

  // Add support for pasting GeoJSON in the future
  _paste: function(e){
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
      mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    navigator.clipboard
      .readText()
      .then(
          (layer) => {
            M._pasteLayer(mapEl, layer);
        }
      );
  },

  _viewSource: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl.viewSource();
  },

  _toggleDebug: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl.toggleDebug();
  },

  _copyCoords: function(e){
    let directory = this.contextMenu?this.contextMenu:this;
    directory._showCoordMenu(e);
  },

  _copyData: function(data){
    const el = document.createElement('textarea');
    el.value = data;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },

  _copyLocation: function(e){
    const menu = this.contextMenu;
    switch(menu.defLocCS.toLowerCase()) {
      case 'tile': menu._copyTile.call(this, e); break;
      case 'tilematrix': menu._copyTileMatrix.call(this, e); break;
      case 'map': menu._copyMap.call(this, e); break;
      case 'tcrs': menu._copyTCRS.call(this, e); break;
      case 'pcrs': menu._copyPCRS.call(this, e); break;
      case 'gcrs': 
      default: 
        menu._copyGCRS.call(this, e);
        break;
    }
  },

  _copyGCRS: function(e) {
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        projection = mapEl.projection,
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');
   
    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','gcrs');
    caption.textContent = `Copied ${projection} gcrs location`;
    h2.textContent = `Copied ${projection} gcrs location`;
    div.textContent = `${click.latlng.lng.toFixed(6)} ${click.latlng.lat.toFixed(6)}`;
    coords.textContent = `${click.latlng.lng.toFixed(6)} ${click.latlng.lat.toFixed(6)}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyTCRS: function(e) {
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        pt = {x:point.x.toFixed(),y:point.y.toFixed()},
        projection = mapEl.projection,
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');

    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','tcrs');
    caption.textContent = `Copied ${projection} tcrs location`;
    h2.textContent = `Copied ${projection} tcrs location`;
    div.textContent = `${pt.x} ${pt.y}`;
    coords.textContent = `${pt.x} ${pt.y}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyTileMatrix: function(e) {
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
        projection = mapEl.projection,        
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');

    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','gcrs');
    caption.textContent = `Copied ${projection} tilematrix location (not implemented yet)`;
    h2.textContent = `Copied ${projection} tilematrix location (not implemented yet)`;
    div.textContent = `${Math.trunc(point.x/tileSize)} ${Math.trunc(point.y/tileSize)}`;
    coords.textContent = `${click.latlng.lng.toFixed(6)} ${click.latlng.lat.toFixed(6)}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyPCRS: function(e) {
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        scale = mapEl._map.options.crs.scale(+mapEl.zoom),
        pcrs = mapEl._map.options.crs.transformation.untransform(point,scale).round(),
        projection = mapEl.projection,
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');

    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','pcrs');
    caption.textContent = `Copied ${projection} pcrs location`;
    h2.textContent = `Copied ${projection} pcrs location`;
    div.textContent = `${pcrs.x} ${pcrs.y}`;
    coords.textContent = `${pcrs.x} ${pcrs.y}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyTile: function(e) {
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        // the _map.project method returns pixels, while the _map.crs.project 
        // method returns meters, confusingly:
        // https://leafletjs.com/reference.html#map-project
        // https://leafletjs.com/reference.html#crs-project
        point = mapEl._map.project(click.latlng),
        tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
        pointX = point.x % tileSize, pointY = point.y % tileSize,
        pt = L.point(pointX,pointY).trunc(),
        projection = mapEl.projection,
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');

    if(pt.x < 0) pt.x += tileSize;
    if(pt.y < 0) pt.y += tileSize; 

    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','gcrs');
    caption.textContent = `Copied ${projection} tile location (not implemented yet)`;
    h2.textContent = `Copied ${projection} tile location (not implemented yet)`;
    div.textContent = `${pt.x} ${pt.y}`;
    coords.textContent = `${click.latlng.lng.toFixed(6)} ${click.latlng.lat.toFixed(6)}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyMap: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        mapPt = click.containerPoint.trunc(),
        projection = mapEl.projection,
        feature = this.contextMenu.t.content.firstElementChild.cloneNode(true),
        caption =  feature.querySelector('map-featurecaption'),
        h2 = feature.querySelector('h2'),
        div = feature.querySelector('div'),
        geom = feature.querySelector('map-geometry'),
        coords = feature.querySelector('map-coordinates');

    feature.setAttribute('zoom', mapEl.zoom);
    geom.setAttribute('cs','gcrs');
    caption.textContent = `Copied ${projection} map location (not implemented yet)`;
    h2.textContent = `Copied ${projection} map location (not implemented yet)`;
    div.textContent = `${mapPt.x} ${mapPt.y}`;
    coords.textContent = `${click.latlng.lng.toFixed(6)} ${click.latlng.lat.toFixed(6)}`;
    this.contextMenu._copyData(feature.outerHTML);
  },

  _copyAllCoords: function(e){
    let mapEl = this.options.mapEl,
    click = this.contextMenu._clickEvent,
    point = mapEl._map.project(click.latlng),
    tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
    pointX = point.x % tileSize, pointY = point.y % tileSize,
    scale = mapEl._map.options.crs.scale(+mapEl.zoom),
    pcrs = mapEl._map.options.crs.transformation.untransform(point,scale);
    let allData = `z:${mapEl.zoom}\n`;
    allData += `tile: i:${Math.trunc(pointX)}, j:${Math.trunc(pointY)}\n`;
    allData += `tilematrix: column:${Math.trunc(point.x/tileSize)}, row:${Math.trunc(point.y/tileSize)}\n`;
    allData += `map: i:${Math.trunc(click.containerPoint.x)}, j:${Math.trunc(click.containerPoint.y)}\n`;
    allData += `tcrs: x:${Math.trunc(point.x)}, y:${Math.trunc(point.y)}\n`;
    allData += `pcrs: easting:${pcrs.x.toFixed(2)}, northing:${pcrs.y.toFixed(2)}\n`;
    allData += `gcrs: lon :${click.latlng.lng.toFixed(6)}, lat:${click.latlng.lat.toFixed(6)}`;
    this.contextMenu._copyData(allData);
  },

  _createItem: function (container, options, index) {
    if (options.spacer) {
      return this._createSeparator(container, index);
    }

    var itemCls = 'mapml-contextmenu-item',
        el = this._insertElementAt('button', itemCls, container, index),
        callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect),
        html = '';

    el.innerHTML = html + options.text;
    el.setAttribute("type", "button");
    el.classList.add("mapml-button");
    if(options.popup){
      el.setAttribute("aria-haspopup", "true");
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", "mapml-copy-submenu");
    }

    L.DomEvent
      .on(el, 'mouseover', this._onItemMouseOver, this)
      .on(el, 'mouseout', this._onItemMouseOut, this)
      .on(el, 'mousedown', L.DomEvent.stopPropagation)
      .on(el, 'click', callback);

    if (L.Browser.touch) {
      L.DomEvent.on(el, this._touchstart, L.DomEvent.stopPropagation);
    }

    // Devices without a mouse fire "mouseover" on tap, but never “mouseout"
    if (!L.Browser.pointer) {
      L.DomEvent.on(el, 'click', this._onItemMouseOut, this);
    }

    return {
      id: L.Util.stamp(el),
      el: el,
      callback: callback
    };
  },

  _createSeparator: function (container, index) {
    let el = this._insertElementAt('div', 'mapml-contextmenu-separator', container, index);

    return {
      id: L.Util.stamp(el),
      el: el
    };
  },

  _createEventHandler: function (el, func, context, hideOnSelect) {
    let parent = this;

    hideOnSelect = (hideOnSelect !== undefined) ? hideOnSelect : true;

    return function (e) {
      let map = parent._map,
        containerPoint = parent._showLocation.containerPoint,
        layerPoint = map.containerPointToLayerPoint(containerPoint),
        latlng = map.layerPointToLatLng(layerPoint),
        relatedTarget = parent._showLocation.relatedTarget,
        data = {
          containerPoint: containerPoint,
          layerPoint: layerPoint,
          latlng: latlng,
          relatedTarget: relatedTarget
        };

      if (hideOnSelect) {
        parent._hide();
      }

      if (func) {
        func.call(context || map, data);
      }

      parent._map.fire('contextmenu.select', {
        contextmenu: parent,
        el: el
      });
    };
  },

  _insertElementAt: function (tagName, className, container, index) {
      let refEl,
          el = document.createElement(tagName);

      el.className = className;

      if (index !== undefined) {
          refEl = container.children[index];
      }

      if (refEl) {
          container.insertBefore(el, refEl);
      } else {
          container.appendChild(el);
      }

      return el;
  },

  _show: function (e) {
    if(this._mapMenuVisible) this._hide();
    this._clickEvent = e;
    let elem = e.originalEvent.target;
    if(elem.closest("fieldset")){
      elem = elem.closest("fieldset");
      elem = (elem.className === "mapml-layer-extent") ? 
              elem.closest("fieldset").parentNode.parentNode.parentNode.querySelector("span") : 
              elem.querySelector("span");
      if(!elem.layer.validProjection) return;
      this._layerClicked = elem;
      this._layerMenu.removeAttribute('hidden');
      this._showAtPoint(e.containerPoint, e, this._layerMenu);
    } else if(elem.classList.contains("leaflet-container") || elem.classList.contains("mapml-debug-extent") ||
    elem.tagName === "path") {
      let layerList = this._map.options.mapEl.layers;
      this._layerClicked = Array.from(layerList).find(el => el.checked);
      // the 'hidden' attribute must be removed before any attempt to get the size of container
      this._container.removeAttribute('hidden');
      this._showAtPoint(e.containerPoint, e, this._container);
      this._updateCS();
    }
    if(e.originalEvent.button === 0 || e.originalEvent.button === -1){
      this._keyboardEvent = true;
      if(this._layerClicked.className.includes('mapml-layer-item')){
        let activeEl = document.activeElement;
        this._elementInFocus = activeEl.shadowRoot.activeElement;
        this._layerMenuTabs = 1;
        this._layerMenu.firstChild.focus();
      } else {
        this._container.querySelectorAll("button:not([disabled])")[0].focus();
      }

    }
  },

  _showAtPoint: function (pt, data, container) {
      if (this._items.length) {
          let event = L.extend(data || {}, {contextmenu: this});

          this._showLocation = {
              containerPoint: pt
          };

          if (data && data.relatedTarget){
              this._showLocation.relatedTarget = data.relatedTarget;
          }

          this._setPosition(pt,container);

          if (!this._mapMenuVisible) {
            container.removeAttribute('hidden');
              this._mapMenuVisible = true;
          }

          this._map.fire('contextmenu.show', event);
      }
  },

  _hide: function () {
      if (this._mapMenuVisible) {
          this._mapMenuVisible = false;
          this._container.setAttribute('hidden', '');
          this._coordMenu.setAttribute('hidden', '');
          this._layerMenu.setAttribute('hidden', '');
          this._map.fire('contextmenu.hide', {contextmenu: this});
          setTimeout(() => this._map._container.focus(), 0);
          this.activeIndex = 0;
          this.isRunned = false;
      }
  },

  _setPosition: function (pt, container) {
      let mapSize = this._map.getSize(),
          containerSize = this._getElementSize(container),
          anchor;

      if (this._map.options.contextmenuAnchor) {
          anchor = L.point(this._map.options.contextmenuAnchor);
          pt = pt.add(anchor);
      }

      container._leaflet_pos = pt;

      if (pt.x + containerSize.x > mapSize.x) {
          container.style.left = 'auto';
          container.style.right = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + 'px';
      } else {
          container.style.left = Math.max(pt.x, 0) + 'px';
          container.style.right = 'auto';
      }

      if (pt.y + containerSize.y > mapSize.y) {
          container.style.top = 'auto';
          container.style.bottom = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + 'px';
      } else {
          container.style.top = Math.max(pt.y, 0) + 'px';
          container.style.bottom = 'auto';
      }
  },

  _getElementSize: function (el) {
      let size = this._size;

      if (!size || this._sizeChanged) {
          size = {};

          el.style.left = '-999999px';
          el.style.right = 'auto';

          size.x = el.offsetWidth;
          size.y = el.offsetHeight;

          el.style.left = 'auto';

          this._sizeChanged = false;
      }

      return size;
  },

   // once tab is clicked on the layer menu, change the focus back to the layer control
   _focusOnLayerControl: function(){
    this._mapMenuVisible = false;
    delete this._layerMenuTabs;
    this._layerMenu.setAttribute('hidden', '');
    if(this._elementInFocus){
      this._elementInFocus.focus();
    } else {
      this._layerClicked.parentElement.firstChild.focus();
    }
    delete this._elementInFocus;
  },

  _setActiveItem: function(index) {
    if (document.activeElement.shadowRoot == null && this.noActiveEl == true){
      //bug fix when theres no active element
      this.noActiveEl = false;
      //setting this._items[9] is just for preventing some diabled index, it will be override by later code.
      this._items[9].el.el.focus();
    }
    if (document.activeElement.shadowRoot.activeElement.innerHTML === this._items[index].el.el.innerHTML){
      //edge case where pressing shift f10 focuses the first element on contextmenu (if already focused, have to press arrow twice to go down)
      let next = index + 1;
      while (this._items[next].el.el.disabled) {
        next++;
        if (next >= this._items.length) {
          next = 0;
        }
      }
      this._setActiveItem(next);
    } else {
      if (this.excludedIndices.includes(index)) {
        // find the next or previous non-excluded item
        let nextIndex = index + 1;
        let prevIndex = index - 1;
        while (this.excludedIndices.includes(nextIndex) || this._items[nextIndex].el.el.disabled) {
          nextIndex++;
          if (nextIndex >= this._items.length) {
            nextIndex = 0;
          }
        }
        while (this.excludedIndices.includes(prevIndex) || this._items[prevIndex].el.el.disabled) {
          prevIndex--;
          if (prevIndex < 0) {
            prevIndex = this._items.length - 1;
          }
        }
        // set the active item to the next or previous non-excluded item
        if (this.activeIndex < index) {
          this._setActiveItem(nextIndex);
        } else {
          this._setActiveItem(prevIndex);
        }
      } else {
        // set the focus item
        this._items[index].el.el.focus();
        this.activeIndex = index;
      }
    }
  },

  _onKeyDown: function (e) {
    if(!this._mapMenuVisible) return;

    let key = e.keyCode;
    let path = e.path || e.composedPath();

    if(key === 13)
      e.preventDefault();
    // keep track of where the focus is on the layer menu and when the layer menu is tabbed out of, focus on layer control
    if(this._layerMenuTabs && (key === 9 || key === 27)){
      if(e.shiftKey){
        this._layerMenuTabs -= 1;
      } else {
        this._layerMenuTabs += 1;
      }
      if(this._layerMenuTabs === 0 || this._layerMenuTabs === 3 || key === 27){
        L.DomEvent.stop(e);
        this._focusOnLayerControl();
      }
    } else if (key === 38) { //up arrow
      if (!this._coordMenu.hasAttribute('hidden') && 
        (document.activeElement.shadowRoot == null || //null happens when the focus is on submenu and when mouse hovers on main menu, submenu disappears
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[0].innerHTML)) { //"map" on submenu
        this._coordMenu.children[2].focus();
      } else if (!this._coordMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[1].innerHTML) { //"extent" on submenu
        this._coordMenu.children[0].focus();
      } else if (!this._coordMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[2].innerHTML) { //"Location" on submenu
        this._coordMenu.children[1].focus();
      } else if (!this._layerMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._layerMenu.children[0].innerHTML) { //"zoom to layer" on layermenu
        this._layerMenu.children[1].focus();
      } else if (!this._layerMenu.hasAttribute('hidden')) {
        this._layerMenu.children[0].focus();
      } else {
        if (this.activeIndex > 0) {
          let prevIndex = this.activeIndex - 1;
          while (this._items[prevIndex].el.el.disabled) {
            prevIndex--;
            if (prevIndex < 0) {
              prevIndex = this._items.length - 1;
            }
          }
          this._setActiveItem(prevIndex);
        } else {
          this._setActiveItem(this._items.length - 1);
        }
      }
    } else if (key === 40) { //down arrow
      if (!this._coordMenu.hasAttribute('hidden') && 
        (document.activeElement.shadowRoot == null ||
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[2].innerHTML)) { //"map" on submenu
        this._coordMenu.children[0].focus();
      } else if (!this._coordMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[1].innerHTML) { //"extent" on submenu
        this._coordMenu.children[2].focus();
      } else if (!this._coordMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[0].innerHTML) { //"Location" on submenu
        this._coordMenu.children[1].focus();
      } else if (!this._layerMenu.hasAttribute('hidden') && 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._layerMenu.children[0].innerHTML){ //"zoom to layer" on layermenu
        this._layerMenu.children[1].focus();
      } else if (!this._layerMenu.hasAttribute('hidden')){
        this._layerMenu.children[0].focus();  
      } else {
        if (this.activeIndex < this._items.length - 1) {
          //edge case at index 0
          if (!this.isRunned && this.activeIndex == 0 && !this._items[this.activeIndex].el.el.disabled){
            this._setActiveItem(0);
            this.isRunned = true;
          } else { //edge case over
            let nextIndex = this.activeIndex + 1;
            while (this._items[nextIndex].el.el.disabled) {
              nextIndex++;
              if (nextIndex >= this._items.length) {
                nextIndex = 0;
              }
            }
            this._setActiveItem(nextIndex);
          }
        } else {
          let nextIndex = 0;
          while (this._items[nextIndex].el.el.disabled) {
            nextIndex++;
            if (nextIndex >= this._items.length) {
              nextIndex = 0;
            }
          }
          this._setActiveItem(nextIndex);
        }
      }
    } else if (key === 39) { //right arrow
      if (document.activeElement.shadowRoot == null) { //do nothing when null
      } else {
        if (document.activeElement.shadowRoot.activeElement.innerHTML === this._items[5].el.el.innerHTML && //'copy'
          this._coordMenu.hasAttribute('hidden')){
          this._showCoordMenu();
          this._coordMenu.children[0].focus();
        } else if (document.activeElement.shadowRoot.activeElement.innerHTML === this._items[5].el.el.innerHTML && 
          !this._coordMenu.hasAttribute('hidden')) {
          this._coordMenu.children[0].focus();
        }
      }
    } else if (key === 37) { //left arrow
      if (!this._coordMenu.hasAttribute('hidden')) {
        if (document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[0].innerHTML ||
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[1].innerHTML || 
        document.activeElement.shadowRoot.activeElement.innerHTML === this._coordMenu.children[2].innerHTML){
          this._coordMenu.setAttribute('hidden','');
          this._setActiveItem(5);
        }
      }
    } else if(key !== 16 && key!== 9 && 
              !(!(this._layerClicked.className.includes('mapml-layer-item')) && key === 67) && 
              (path[0].innerText !== (M.options.locale.cmCopyCoords + " (C)") || key === 27)){
      this._hide();
    }
    switch(key){
      case 13:  //ENTER KEY
        if(document.activeElement.shadowRoot.activeElement.innerHTML === this._items[5].el.el.innerHTML){
          this._copyCoords({
            latlng:this._map.getCenter()
          });
          this._coordMenu.firstChild.focus();
        } else{
          if(this._map._container.parentNode.activeElement.parentNode.classList.contains("mapml-contextmenu"))
            this._map._container.parentNode.activeElement.click();
        }
        break;
      case 32:  //SPACE KEY
        if(this._map._container.parentNode.activeElement.parentNode.classList.contains("mapml-contextmenu"))
          this._map._container.parentNode.activeElement.click();
        break;
      case 67: //C KEY
        this._copyCoords({
          latlng:this._map.getCenter()
        });
        this._coordMenu.firstChild.focus();
        break;
      case 68: //D KEY
        this._toggleDebug(e);
        break;
      case 77: //M KEY
        this._copyMapML(e);
        break;
      case 76: //L KEY
        if(this._layerClicked.className.includes('mapml-layer-item'))
          this._copyLayer(e);
        break;
      case 70: //F KEY
        this._toggleFullScreen(e);
        break;
      case 80: //P KEY
        this._paste(e);
        break;
      case 84: //T KEY
        this._toggleControls(e);
        break;
      case 86: //V KEY
        this._viewSource(e);
        break;
      case 90: //Z KEY
        if(this._layerClicked.className.includes('mapml-layer-item'))
          this._zoomToLayer(e);
        break;
    }
  },

  _showCoordMenu: function(e){
    let mapSize = this._map.getSize(),
        click = this._clickEvent,
        menu = this._coordMenu,
        copyEl = this._items[5].el.el;

    copyEl.setAttribute("aria-expanded","true");
    menu.removeAttribute('hidden');

    const menuWidth = this._container.offsetWidth,
          menuHeight = this._container.offsetHeight,
          submenuWidth = menu.offsetWidth;
    if (click.containerPoint.x + menuWidth + submenuWidth > mapSize.x) {
      menu.style.left = 'auto';
      menu.style.right = menuWidth + 'px';
    } else {
      menu.style.left = menuWidth + 'px';
      menu.style.right = 'auto';
    }

    menu.style.top = 100 - 22 + 'px';
    menu.style.bottom = 'auto';
  },

  _hideCoordMenu: function(e){
    if(!e.relatedTarget || !e.relatedTarget.parentElement || 
        e.relatedTarget.parentElement.classList.contains("mapml-submenu") ||
        e.relatedTarget.classList.contains("mapml-submenu"))return;
    let menu = this._coordMenu, copyEl = this._items[4].el.el;
    copyEl.setAttribute("aria-expanded","false");
    menu.setAttribute('hidden', '');
    this.noActiveEl = true; //variable to keep track of no focus element on contextmenu, bug fix for arrow key navigation
  },

  _onItemMouseOver: function (e) {
    L.DomUtil.addClass(e.target || e.srcElement, 'over');
    if(e.srcElement.innerText === (M.options.locale.cmCopyCoords + " (C)")) this._showCoordMenu(e);
  },

  _onItemMouseOut: function (e) {
    L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    this._hideCoordMenu(e);
  },

  toggleContextMenuItem: function (options,state) {
    options = options.toUpperCase(); 
    if (state === "disabled") {
      if (options === "CONTROLS") {
        this._items[8].el.el.disabled = true;
      } else if (options === "BACK") {
        this._items[0].el.el.disabled = true;
      } else if (options === "FORWARD") {
        this._items[1].el.el.disabled = true;
      } else if (options === "RELOAD") {
        this._items[2].el.el.disabled = true;
      }
    } else if(state === "enabled") {
      if (options === "CONTROLS") {
        this._items[8].el.el.disabled = false;
      } else if (options === "BACK") {
        this._items[0].el.el.disabled = false;
      } else if (options === "FORWARD") {
        this._items[1].el.el.disabled = false;
      } else if (options === "RELOAD") {
        this._items[2].el.el.disabled = false;
      }
    }
  },
  
  setViewFullScreenInnerHTML: function (options) {
    if (options === 'view') {
      this._map.contextMenu._items[3].el.el.innerHTML = M.options.locale.btnFullScreen + " (<kbd>F</kbd>)";
    }
    else if (options === 'exit') {
      this._map.contextMenu._items[3].el.el.innerHTML = M.options.locale.btnExitFullScreen + " (<kbd>F</kbd>)";
    }
  }
});
