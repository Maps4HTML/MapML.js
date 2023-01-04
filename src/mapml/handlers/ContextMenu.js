/*
MIT License related to portions of M.ContextMenu 
Copyright (c) 2017 adam.ratcliffe@gmail.com
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
export var ContextMenu = L.Handler.extend({
  _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',

  initialize: function (map) {
    L.Handler.prototype.initialize.call(this, map);

    //setting the items in the context menu and their callback functions
    this._items = [
      {
        text: M.options.locale.cmBack + " (<kbd>B</kbd>)",
        callback:this._goBack,
      },
      {
        text: M.options.locale.cmForward + " (<kbd>F</kbd>)",
        callback:this._goForward,
      },
      {
        text: M.options.locale.cmReload + " (<kbd>R</kbd>)",
        callback:this._reload,
      },
      {
        spacer:"-",
      },
      {
        text: M.options.locale.cmToggleControls + " (<kbd>T</kbd>)",
        callback:this._toggleControls,
      },
      {
        text: M.options.locale.cmCopyCoords + " (<kbd>C</kbd>)<span></span>",
        callback:this._copyCoords,
        hideOnSelect:false,
        popup:true,
        submenu:[
          {
            text:"tile",
            callback:this._copyTile,
          },
          {
            text:"tilematrix",
            callback:this._copyTileMatrix,
          },
          {
            spacer:"-",
          },
          {
            text:"map",
            callback:this._copyMap,
          },
          {
            spacer:"-",
          },
          {
            text:"tcrs",
            callback:this._copyTCRS,
          },
          {
            text:"pcrs",
            callback:this._copyPCRS,
          },
          {
            text:"gcrs",
            callback:this._copyGCRS,
          },
          {
            spacer:"-",
          },
          {
            text: M.options.locale.cmCopyAll,
            callback:this._copyAllCoords,
          }
        ]
      },
      {
        text: M.options.locale.cmToggleDebug + " (<kbd>D</kbd>)",
        callback:this._toggleDebug,
      },
      {
        text: M.options.locale.cmCopyMapML + " (<kbd>M</kbd>)",
        callback:this._copyMapML,
      },
      {
        text: M.options.locale.cmPasteLayer + " (<kbd>P</kbd>)",
        callback:this._pasteLayer,
      },
      {
        text: M.options.locale.cmViewSource + " (<kbd>V</kbd>)",
        callback:this._viewSource,
      },
    ];

    this._layerItems = [
      {
        text: M.options.locale.lmZoomToLayer + " (<kbd>Z</kbd>)",
        callback:this._zoomToLayer
      },
      {
        text: M.options.locale.lmCopyExtent + " (<kbd>C</kbd>)",
        callback:this._copyLayerExtent
      },
      {
        text: M.options.locale.lmCopyLayer + " (<kbd>L</kbd>)",
        callback:this._copyLayer
      },
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

  _copyLayerExtent: function (e) {
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
        layerElem = context._layerClicked.layer._layerEl,
        tL = layerElem.extent.topLeft.pcrs,
        bR = layerElem.extent.bottomRight.pcrs;

    let data = `<map-meta name="extent" content="top-left-easting=${tL.horizontal}, top-left-northing=${tL.vertical}, bottom-right-easting=${bR.horizontal}, bottom-right-northing=${bR.vertical}"></map-meta>`;
    context._copyData(data);
  },

  _zoomToLayer: function (e) {
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu;
    context._layerClicked.layer._layerEl.focus();
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

  _toggleControls: function(e){
    let mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    mapEl._toggleControls();
  },

  _copyMapML: function(e){
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
      mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    context._copyData(mapEl.outerHTML.replace(/<div class="mapml-web-map">.*?<\/div>|<style>\[is="web-map"].*?<\/style>|<style>mapml-viewer.*?<\/style>/gm, ""));
  },

  // Add support for pasting GeoJSON in the future
  _pasteLayer: function(e){
    let context = e instanceof KeyboardEvent ? this._map.contextMenu : this.contextMenu,
      mapEl = e instanceof KeyboardEvent?this._map.options.mapEl:this.options.mapEl;
    navigator.clipboard
      .readText()
      .then(
          (layer) => {
            try {
              new URL(layer);
              // create a new <layer-> child of this <mapml-viewer> element
              let l = '<layer- src="' + layer + '" label="' + M.options.locale.dfLayer + '" checked=""></layer->';
              mapEl.insertAdjacentHTML("beforeend", l);
            } catch (err) {
              layer = layer.replace(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, '').trim();
              if ((layer.slice(0,7) === "<layer-") && (layer.slice(-9) === "</layer->")) {
                mapEl.insertAdjacentHTML("beforeend", layer);
              } else {
                try {
                  mapEl.geojson2mapml(JSON.parse(layer));
                } catch {
                  console.log("Invalid Input!");
                }}
            }
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

  _copyGCRS: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent;
    this.contextMenu._copyData(`z:${mapEl.zoom}, lon :${click.latlng.lng.toFixed(6)}, lat:${click.latlng.lat.toFixed(6)}`);
  },

  _copyTCRS: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng);
    this.contextMenu._copyData(`z:${mapEl.zoom}, x:${point.x}, y:${point.y}`);
  },

  _copyTileMatrix: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x;
    this.contextMenu._copyData(`z:${mapEl.zoom}, column:${Math.trunc(point.x/tileSize)}, row:${Math.trunc(point.y/tileSize)}`);
  },

  _copyPCRS: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        scale = mapEl._map.options.crs.scale(+mapEl.zoom),
        pcrs = mapEl._map.options.crs.transformation.untransform(point,scale);
    this.contextMenu._copyData(`z:${mapEl.zoom}, easting:${pcrs.x.toFixed(2)}, northing:${pcrs.y.toFixed(2)}`);
  },

  _copyTile: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.options.crs.project(click.latlng),
        tileSize = mapEl._map.options.crs.options.crs.tile.bounds.max.x,
        pointX = point.x % tileSize, pointY = point.y % tileSize;
    if(pointX < 0) pointX+= tileSize;
    if(pointY < 0) pointY+= tileSize;

    this.contextMenu._copyData(`z:${mapEl.zoom}, i:${Math.trunc(pointX)}, j:${Math.trunc(pointY)}`);
  },

  _copyMap: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent;
    this.contextMenu._copyData(`z:${mapEl.zoom}, i:${Math.trunc(click.containerPoint.x)}, j:${Math.trunc(click.containerPoint.y)}`);
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
      elem = (elem.className === "mapml-layer-extent") ? elem.closest("fieldset").parentNode.parentNode.parentNode.querySelector("span") : elem.querySelector("span");
      if(!elem.layer.validProjection) return;
      this._layerClicked = elem;
      this._showAtPoint(e.containerPoint, e, this._layerMenu);
    } else if(elem.classList.contains("leaflet-container") || elem.classList.contains("mapml-debug-extent") ||
      elem.tagName === "path") {
      this._layerClicked = undefined;
      this._showAtPoint(e.containerPoint, e, this._container);
    }
    if(e.originalEvent.button === 0 || e.originalEvent.button === -1){
      this._keyboardEvent = true;
      if(this._layerClicked){
        let activeEl = document.activeElement;
        this._elementInFocus = activeEl.shadowRoot.activeElement;
        this._layerMenuTabs = 1;
        this._layerMenu.firstChild.focus();
      } else {
        this._container.firstChild.focus();
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
      if(this._layerMenuTabs === 0 || this._layerMenuTabs === 4 || key === 27){
        L.DomEvent.stop(e);
        this._focusOnLayerControl();
      } 
    } else if(key !== 16 && key!== 9 && !(!this._layerClicked && key === 67) && path[0].innerText !== (M.options.locale.cmCopyCoords + " (C)")){
      this._hide();
    }
    switch(key){
      case 13:  //ENTER KEY
      case 32:  //SPACE KEY
        if(this._map._container.parentNode.activeElement.parentNode.classList.contains("mapml-contextmenu"))
          this._map._container.parentNode.activeElement.click();
        break;
      case 66: //B KEY
        this._goBack(e);
        break;
      case 67: //C KEY
        if(this._layerClicked){
          this._copyLayerExtent(e);
        } else {
          this._copyCoords({
            latlng:this._map.getCenter()
          });
        }
        break;
      case 68: //D KEY
        this._toggleDebug(e);
        break;
      case 77: //M KEY
        this._copyMapML(e);
        break;
      case 70: //F KEY
        this._goForward(e);
        break;
      case 76: //L KEY
        if(this._layerClicked)
          this._copyLayer(e);
        break;
      case 80: //P KEY
        this._pasteLayer(e);
        break;
      case 82: //R KEY
        this._reload(e);
        break;
      case 84: //T KEY
        this._toggleControls(e);
        break;
      case 86: //V KEY
        this._viewSource(e);
        break;
      case 90: //Z KEY
        if(this._layerClicked)
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

    if (click.containerPoint.x + 160 + 80 > mapSize.x) {
      menu.style.left = 'auto';
      menu.style.right = 160 + 'px';
    } else {
      menu.style.left = 160 + 'px';
      menu.style.right = 'auto';
    }

    if (click.containerPoint.y + 160 > mapSize.y) {
      menu.style.top = 'auto';
      menu.style.bottom = 20 + 'px';
    } else {
      menu.style.top = 100 + 'px';
      menu.style.bottom = 'auto';
    }
    if(this._keyboardEvent)menu.firstChild.focus();
  },

  _hideCoordMenu: function(e){
    if(e.srcElement.parentElement.classList.contains("mapml-submenu") ||
        e.srcElement.innerText === (M.options.locale.cmCopyCoords + " (C)"))return;
    let menu = this._coordMenu, copyEl = this._items[5].el.el;
    copyEl.setAttribute("aria-expanded","false");
    menu.setAttribute('hidden', '');
  },

  _onItemMouseOver: function (e) {
    L.DomUtil.addClass(e.target || e.srcElement, 'over');
    if(e.srcElement.innerText === (M.options.locale.cmCopyCoords + " (C)")) this._showCoordMenu(e);
  },

  _onItemMouseOut: function (e) {
    L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    this._hideCoordMenu(e);
  }
});
