import { TILE_SIZE } from '../utils/Constants';

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
        text:"Back (<kbd>B</kbd>)",
        callback:this._goBack,
      },
      {
        text:"Forward (<kbd>F</kbd>)",
        callback:this._goForward,
      },
      {
        text:"Reload (<kbd>R</kbd>)",
        callback:this._reload,
      },
      {
        spacer:"-",
      },
      {
        text:"Toggle Controls (<kbd>T</kbd>)",
        callback:this._toggleControls,
      },
      {
        text:"Copy Coordinates (<kbd>C</kbd>) >", 
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
            text:"All",
            callback:this._copyAllCoords,
          }
        ]
      },
      {
        text:"Toggle Debug Mode (<kbd>D</kbd>)",
        callback:this._toggleDebug,
      },
      {
        text:"View Map Source (<kbd>V</kbd>)",
        callback:this._viewSource,
      },
    ];
    this._visible = false;
    this._keyboardEvent = false;

    this._container = L.DomUtil.create("div", "mapml-contextmenu", map._container);
    this._container.style.zIndex = 10000;
    this._container.style.position = "absolute";

    this._container.style.width = "150px";
    
    for (let i = 0; i < 6; i++) {
      this._items[i].el = this._createItem(this._container, this._items[i]);
    }

    this._coordMenu = L.DomUtil.create("div", "mapml-contextmenu mapml-submenu", this._container);
    this._coordMenu.style.zIndex = 10000;
    this._coordMenu.style.position = "absolute";

    this._coordMenu.style.width = "80px";
    this._coordMenu.id = "mapml-copy-submenu";

    this._clickEvent = null;

    for(let i =0;i<this._items[5].submenu.length;i++){
      this._createItem(this._coordMenu,this._items[5].submenu[i],i);
    }

    this._items[6].el = this._createItem(this._container, this._items[6]);
    this._items[7].el = this._createItem(this._container, this._items[7]);

    L.DomEvent
      .on(this._container, 'click', L.DomEvent.stop)
      .on(this._container, 'mousedown', L.DomEvent.stop)
      .on(this._container, 'dblclick', L.DomEvent.stop)
      .on(this._container, 'contextmenu', L.DomEvent.stop);
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
    mapEl._toggleControls(true);
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
    this.contextMenu._copyData(`z:${mapEl.zoom}, lon :${click.latlng.lng}, lat:${click.latlng.lat}`);
  },

  _copyTCRS: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng);
    this.contextMenu._copyData(`z: ${mapEl.zoom}, x:${point.x}, y:${point.y}`);
  },

  _copyTileMatrix: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng);
    this.contextMenu._copyData(`z: ${mapEl.zoom}, column:${point.x/TILE_SIZE}, row:${point.y/TILE_SIZE}`);
  },

  _copyPCRS: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.project(click.latlng),
        scale = mapEl._map.options.crs.scale(+mapEl.zoom),
        pcrs = mapEl._map.options.crs.transformation.untransform(point,scale);
    this.contextMenu._copyData(`z: ${mapEl.zoom}, easting:${pcrs.x}, northing:${pcrs.y}`);
  },

  _copyTile: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent,
        point = mapEl._map.options.crs.project(click.latlng),
        pointX = point.x % TILE_SIZE, pointY = point.y % TILE_SIZE;
    if(pointX < 0) pointX+= TILE_SIZE;
    if(pointY < 0) pointY+= TILE_SIZE;

    this.contextMenu._copyData(`z: ${mapEl.zoom}, 
                                i:${Math.round(pointX)}, 
                                j:${Math.round(pointY)}`);
  },

  _copyMap: function(e){
    let mapEl = this.options.mapEl,
        click = this.contextMenu._clickEvent;
    this.contextMenu._copyData(`z:${mapEl.zoom}, i:${click.containerPoint.x}, j:${click.containerPoint.y}`);
  },

  _copyAllCoords: function(e){
    let mapEl = this.options.mapEl,
    click = this.contextMenu._clickEvent,
    point = mapEl._map.project(click.latlng),
    pointX = point.x % TILE_SIZE, pointY = point.y % TILE_SIZE,
    scale = mapEl._map.options.crs.scale(+mapEl.zoom),
    pcrs = mapEl._map.options.crs.transformation.untransform(point,scale);
    let allData = `z:${mapEl.zoom}\n`;
    allData += `tile: i:${Math.round(pointX)}, j:${Math.round(pointY)}\n`;
    allData += `tilematrix: column:${point.x/TILE_SIZE}, row:${point.y/TILE_SIZE}\n`;
    allData += `map: i:${click.containerPoint.x}, j:${click.containerPoint.y}\n`;
    allData += `tcrs: x:${point.x}, y:${point.y}\n`;
    allData += `pcrs: easting:${pcrs.x}, northing:${pcrs.y}\n`;
    allData += `gcrs: lon :${click.latlng.lng}, lat:${click.latlng.lat}`;
    this.contextMenu._copyData(allData);
  },

  _createItem: function (container, options, index) {
    if (options.spacer) {
      return this._createSeparator(container, index);
    }

    var itemCls = 'mapml-contextmenu-item',
        el = this._insertElementAt('a', itemCls, container, index),
        callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect),
        html = '';

    el.innerHTML = html + options.text;
    el.href = "#";
    el.setAttribute("role","button");
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
    this._clickEvent = e;
    this._showAtPoint(e.containerPoint, e);
    if(e.originalEvent.button === 0){
      this._keyboardEvent = true;
      this._container.firstChild.focus();
    }
  },

  _showAtPoint: function (pt, data) {
      if (this._items.length) {
          let event = L.extend(data || {}, {contextmenu: this});

          this._showLocation = {
              containerPoint: pt
          };

          if (data && data.relatedTarget){
              this._showLocation.relatedTarget = data.relatedTarget;
          }

          this._setPosition(pt);

          if (!this._visible) {
              this._container.style.display = 'block';
              this._visible = true;
          }

          this._map.fire('contextmenu.show', event);
      }
  },

  _hide: function () {
      if (this._visible) {
          this._visible = false;
          this._container.style.display = 'none';
          this._coordMenu.style.display = 'none';
          this._map.fire('contextmenu.hide', {contextmenu: this});
      }
  },

  _setPosition: function (pt) {
      let mapSize = this._map.getSize(),
          container = this._container,
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
      let size = this._size,
          initialDisplay = el.style.display;

      if (!size || this._sizeChanged) {
          size = {};

          el.style.left = '-999999px';
          el.style.right = 'auto';
          el.style.display = 'block';

          size.x = el.offsetWidth;
          size.y = el.offsetHeight;

          el.style.left = 'auto';
          el.style.display = initialDisplay;

          this._sizeChanged = false;
      }

      return size;
  },

   _debounceKeyDown: function(func, wait, immediate) {
    let timeout;
    let context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  },

  _onKeyDown: function (e) {
    if(!this._visible) return;
    this._debounceKeyDown(function(){
      let key = e.keyCode;

      switch(key){
        case 32:
          if(this._map._container.parentNode.activeElement.parentNode.classList.contains("mapml-contextmenu"))
            this._map._container.parentNode.activeElement.click();
          break;
        case 66:
          this._goBack(e);
          break;
        case 67:
          this._copyCoords({
            latlng:this._map.getCenter()
          });
          break;
        case 68:
          this._toggleDebug(e);
          break;
        case 70:
          this._goForward(e);
          break;
        case 82:
          this._reload(e);
          break;
        case 84:
          this._toggleControls(e);
          break;
        case 86:
          this._viewSource(e);
          break;
        case 27:
          this._hide();
          break;
      }
    },250);
  },

  _showCoordMenu: function(e){
    let mapSize = this._map.getSize(),
        click = this._clickEvent,
        menu = this._coordMenu,
        copyEl = this._items[5].el.el;

    copyEl.setAttribute("aria-expanded","true");
    menu.style.display = "block";

    if (click.containerPoint.x + 150 + 80 > mapSize.x) {
      menu.style.left = 'auto';
      menu.style.right = 150 + 'px';
    } else {
      menu.style.left = 150 + 'px';
      menu.style.right = 'auto';
    }

    if (click.containerPoint.y + 150 > mapSize.y) {
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
        e.srcElement.innerText === "Copy Coordinates (C) >")return;
    let menu = this._coordMenu, copyEl = this._items[5].el.el;
    copyEl.setAttribute("aria-expanded","false");
    menu.style.display = "none";
  },

  _onItemMouseOver: function (e) {
    L.DomUtil.addClass(e.target || e.srcElement, 'over');
    if(e.srcElement.innerText === "Copy Coordinates (C) >") this._showCoordMenu(e);
  },

  _onItemMouseOut: function (e) {
    L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    this._hideCoordMenu(e);
  }
});