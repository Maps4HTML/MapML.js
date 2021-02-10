export var TemplatedLayer = L.Layer.extend({
  initialize: function(templates, options) {
    this._templates =  templates;
    L.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-layer', options.pane);
    L.DomUtil.addClass(this._container,'mapml-templatedlayer-container');

    for (var i=0;i<templates.length;i++) {
      if (templates[i].rel === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i], 
            L.Util.extend(options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'query') {
          // add template to array of queryies to be added to map and processed
          // on click/tap events
          this.hasSetBoundsHandler = true;
          if (!this._queries) {
            this._queries = [];
          }
          let inputData = M.extractInputBounds(templates[i]);
          templates[i].layerBounds = inputData.bounds;
          templates[i].zoomBounds = inputData.zoomBounds;
          this._queries.push(L.extend(templates[i], this._setupQueryVars(templates[i])));
      }
    }
  },
  getEvents: function() {
      return {
          zoomstart: this._onZoomStart
      };
  },
  redraw: function() {
    this.closePopup();
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].rel === 'tile' || this._templates[i].rel === 'image' || this._templates[i].rel === 'features') {
          this._templates[i].layer.redraw();
      }
    }
  },
  _onZoomStart: function() {
      this.closePopup();
  },


  _setupQueryVars: function(template) {
      // process the inputs associated to template and create an object named
      // query with member properties as follows:
      // {width: 'widthvarname', 
      //  height: 'heightvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'
      //  i: 'ivarname'
      //  j: 'jvarname'}
      //  x: 'xvarname' x being the tcrs x axis
      //  y: 'yvarname' y being the tcrs y axis
      //  z: 'zvarname' zoom
      //  title: link title

      var queryVarNames = {query:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            rel = inputs[i].getAttribute("rel"),
            select = (inputs[i].tagName.toLowerCase() === "select");
        if (type === "width") {
              queryVarNames.query.width = name;
        } else if ( type === "height") {
              queryVarNames.query.height = name;
        } else if (type === "location") { 
          switch (axis) {
            case('x'):
            case('y'):
            case("column"): 
            case("row"):
              queryVarNames.query[axis] = name;
              break;
            case ('longitude'):
            case ('easting'):
              if (position) {
                  if (position.match(/.*?-left/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelleft = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tileleft = name;
                    } else {
                      queryVarNames.query.mapleft = name;
                    }
                  } else if (position.match(/.*?-right/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelright = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tileright = name;
                    } else {
                      queryVarNames.query.mapright = name;
                    }
                  }
              } else {
                  queryVarNames.query[axis] = name;
              }
              break;
            case ('latitude'):
            case ('northing'):
              if (position) {
                  if (position.match(/top-.*?/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixeltop = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tiletop = name;
                    } else {
                      queryVarNames.query.maptop = name;
                    }
                  } else if (position.match(/bottom-.*?/i)) {
                    if (rel === "pixel") {
                      queryVarNames.query.pixelbottom = name;
                    } else if (rel === "tile") {
                      queryVarNames.query.tilebottom = name;
                    } else {
                      queryVarNames.query.mapbottom = name;
                    }
                  }
              } else {
                queryVarNames.query[axis] = name;
              }
              break;
            case('i'):
              if (units === "tile") {
                queryVarNames.query.tilei = name;
              } else {
                queryVarNames.query.mapi = name;
              }
              break;
            case('j'):
              if (units === "tile") {
                queryVarNames.query.tilej = name;
              } else {
                queryVarNames.query.mapj = name;
              }
              break;
            default:
              // unsuportted axis value
          }
        } else if (type === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17">
           queryVarNames.query.zoom = name;
        } else if (select) {
            /*jshint -W104 */
          const parsedselect = inputs[i].htmlselect;
          queryVarNames.query[name] = function() {
              return parsedselect.value;
          };
        } else {
            /*jshint -W104 */
            const input = inputs[i];
           queryVarNames.query[name] = function () {
              return input.getAttribute("value");
           };
        }
      }
      queryVarNames.query.title = template.title;
      return queryVarNames;
  },
  reset: function (templates) {
    if (!templates) {return;}
    if (!this._map) {return;}
    var addToMap = this._map && this._map.hasLayer(this),
        old_templates = this._templates;
    delete this._queries;
    this._map.off('click', null, this);

    this._templates = templates;
    for (var i=0;i<templates.length;i++) {
      if (templates[i].rel === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i],
            L.Util.extend(this.options, {errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'image') {
          this._templates[i].layer = M.templatedImageLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'features') {
          this._templates[i].layer = M.templatedFeaturesLayer(templates[i], L.Util.extend(this.options, {zIndex: i, pane: this._container}));
      } else if (templates[i].rel === 'query') {
          if (!this._queries) {
            this._queries = [];
          }
          this._queries.push(L.extend(templates[i], this._setupQueryVars(templates[i])));
      }
      if (addToMap) {
        this.onAdd(this._map);
      }
    }
    for (i=0;i<old_templates.length;i++) {
      if (this._map.hasLayer(old_templates[i].layer)) {
        this._map.removeLayer(old_templates[i].layer);
      }
    }
  },
  onAdd: function (map) {
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].rel !== 'query') {
        map.addLayer(this._templates[i].layer);
      }
    }
  },
//  setZIndex: function (zIndex) {
//      this.options.zIndex = zIndex;
//      this._updateZIndex();
//
//      return this;
//  },
//  _updateZIndex: function () {
//      if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
//          this._container.style.zIndex = this.options.zIndex;
//      }
//  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    for (var i=0;i<this._templates.length;i++) {
      if (this._templates[i].rel !== 'query') {
        map.removeLayer(this._templates[i].layer);
      }
    }
  },

  _previousFeature: function(e){
    if(this._count + -1 >= 0){
      this._count--;
      this._map.fire("featurepagination", {i: this._count, popup: this});
    }
  },
  
  _nextFeature: function(e){
    if(this._count + 1 < this._source._totalFeatureCount){
      this._count++;
      this._map.fire("featurepagination", {i: this._count, popup: this});
    }
  },

});
export var templatedLayer = function(templates, options) {
  // templates is an array of template objects
  // a template object contains the template, plus associated <input> elements
  // which need to be processed just prior to creating a url from the template 
  // with the values of the inputs
  return new TemplatedLayer(templates, options);
};