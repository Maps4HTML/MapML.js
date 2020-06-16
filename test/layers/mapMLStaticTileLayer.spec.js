/* global assert, M */
describe("MapMLStaticTileLayer Tests", function () {
  var map, container, resolutions = [
    156543.0339,
    78271.51695,
    39135.758475,
    19567.8792375,
    9783.93961875,
    4891.969809375,
    2445.9849046875,
    1222.9924523438,
    611.49622617188,
    305.74811308594,
    152.87405654297,
    76.437028271484,
    38.218514135742,
    19.109257067871,
    9.5546285339355,
    4.7773142669678,
    2.3886571334839,
    1.1943285667419,
    0.59716428337097,
    0.29858214168549,
    0.14929107084274,
    0.074645535421371,
    0.03732276771068573,
    0.018661383855342865,
    0.009330691927671432495
  ];
  beforeEach(() => {
    map = L.map(document.createElement("map"));
    container = document.createElement("div");
  });

  test("Setting Tile Layer options", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMLStaticTileLayer({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      maxZoomBound: 24,
    })
    map.addLayer(layer);
    expect(layer.options.pane).toEqual(container);
    expect(layer.options.className).toEqual("tempGridML");
    expect(layer.options.maxNativeZoom).toEqual(3);
    expect(layer.options.minNativeZoom).toEqual(0);
    expect(layer.options.maxZoom).toEqual(24);
    expect(layer.options.minZoom).toEqual(0);
  });

  test("Creating tile group map", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMLStaticTileLayer({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      maxZoomBound: 26,
    })

    const result = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
    expect(Object.keys(result).length).toEqual(6); expect(result["17:18:3"]).toBeTruthy();
    expect(result["11:10:2"]).toBeTruthy();
    expect(result["9:10:2"]).toBeTruthy();
    expect(result["9:11:2"]).toBeTruthy();
    expect(result["2:3:0"]).toBeTruthy();
    expect(result["3:3:0"]).toBeTruthy();
  });

  test("Creating tile group map with multiple img in one tile in document order", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMLStaticTileLayer({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      maxZoomBound: 26,
    })
    const result = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
    expect(Object.keys(result).length).toEqual(5);
    expect(result["17:18:3"].length).toEqual(2);
    expect(result["17:18:3"][0].src).toEqual("data/cbmt/2/c11_r12.png");
    expect(result["17:18:3"].length).toEqual(2);
    expect(result["17:18:3"][1].src).toEqual("data/cbmt/2/c11_r10.png");
  });

  describe("Deriving zoom bounds with MapMLStaticTileLayer._getZoomBounds()", function () {
    test("max=null,min=null,nativeMax=3,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles>\
          <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>';
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26);
      expect(zoomBounds.nMax).toEqual(3);
      expect(zoomBounds.nMin).toEqual(2);
      expect(zoomBounds.max).toEqual(26);
      expect(zoomBounds.min).toEqual(0);
    });
    test("max=18,min=null,nativeMax=3,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="max=18">\
          <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(3);
      expect(zoomBounds.nMin).toEqual(2);
      expect(zoomBounds.max).toEqual(18);
      expect(zoomBounds.min).toEqual(0);
    });
    test("max=null,min=3,nativeMax=20,nativeMin=4", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=3">\
          <tile zoom="4" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="5" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="20" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="18" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="18" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(20);
      expect(zoomBounds.nMin).toEqual(4);
      expect(zoomBounds.max).toEqual(26);
      expect(zoomBounds.min).toBe(3);
    });
    test("max=0,min=0,nativeMax=0,nativeMin=0", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=0,max=0">\
          <tile zoom="0" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="0" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(0);
      expect(zoomBounds.nMin).toEqual(0);
      expect(zoomBounds.max).toEqual(0);
      expect(zoomBounds.min).toEqual(0);
    });
    test("max=5,min=18,nativeMax=3,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=5,max=18">\
          <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(3);
      expect(zoomBounds.nMin).toEqual(2);
      expect(zoomBounds.max).toEqual(18);
      expect(zoomBounds.min).toEqual(5);
    });
    test("max=string,min=string,nativeMax=19,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=test,max=test">\
          <tile zoom="19" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="19" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="15" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="12" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="5" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 25,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 25);
      expect(zoomBounds.nMax).toEqual(19);
      expect(zoomBounds.nMin).toEqual(5);
      expect(zoomBounds.max).toBeFalsy();
      expect(zoomBounds.min).toBeFalsy();
    });
  });
  describe("Creating tiles with MapMLStaticTileLayer.createTile()", function () {
    test("One image element in tile", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let point = {
        x: 17,
        y: 18,
        z: 3,
      }
      const result = layer.createTile(point);
      expect(result.getElementsByTagName("img").length).toEqual(1);
    });

    test("Multiple image element in tile", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let point = {
        x: 17,
        y: 18,
        z: 3,
      }
      const result = layer.createTile(point);
      expect(result.getElementsByTagName("img").length).toEqual(2);
    });

    test("Multiple image element in tile in order", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let point = {
        x: 17,
        y: 18,
        z: 3,
      }
      const result = layer.createTile(point);
      expect(result.getElementsByTagName("img")[0].src).toEqual("http://localhost/data/cbmt/2/c11_r12.png");
      expect(result.getElementsByTagName("img")[1].src).toEqual("http://localhost/data/cbmt/2/c11_r10.png");
    });
  });

  //Testing _getLayerBounds method
  //returns the appropriate bounds of each zoom level of tiles
  describe("Deriving layer bounds with MapMLStaticTileLayer._getLayerBounds()", function () {
    test("Reasonable tiles", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      let result = layer._getLayerBounds(groups, resolutions);
      expect(result["0"]).toEqual(L.bounds(L.point(80150033.3568, 120225050.0352), L.point(160300066.7136, 160300066.7136)));
      expect(result["2"]).toEqual(L.bounds(L.point(90168787.5264, 100187541.69600001), L.point(100187541.69600001, 120225050.0352)));
      expect(result["3"]).toEqual(L.bounds(L.point(85159410.44160001, 90168787.5264), L.point(90168787.5264, 95178164.6112)));
      expect(result["1"]).toBeFalsy();
    });
    test("Different set of reasonable tiles", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="20" col="12" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="19" col="13" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="8" col="11" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="8" col="13" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="1" col="1" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="0" col="0" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      let result = layer._getLayerBounds(groups, resolutions);
      expect(result["0"]).toEqual(L.bounds(L.point(0, 0), L.point(80150033.3568, 80150033.3568)));
      expect(result["2"]).toEqual(L.bounds(L.point(110206295.8656, 80150033.3568), L.point(140262558.37440002, 90168787.5264)));
      expect(result["3"]).toEqual(L.bounds(L.point(60112525.0176, 95178164.6112), L.point(70131279.18720001, 105196918.7808)));
      expect(result["1"]).toBeFalsy();
    });
    test("Single tile", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="0" row="0" col="0" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      let result = layer._getLayerBounds(groups, resolutions);
      expect(result["0"]).toEqual(L.bounds(L.point(0, 0), L.point(40075016.6784, 40075016.6784)));
      expect(result["1"]).toBeFalsy();
    });
    test("Empty tiles container", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      let result = layer._getLayerBounds(groups, resolutions);
      expect(result).toEqual({});
    });
  });

  //Checking the _withinBound method of mapMLStaticTileLayer
  //return true when overlapping, if overlapped at exactly the border, return false
  describe("Checking layer overlap with map using MapMLStaticTileLayer._withinBounds()", function () {
    test("Within map bounds completely", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="0" row="1" col="1" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      let layerBounds = layer._getLayerBounds(groups, resolutions);
      let mapBound = L.bounds(L.point(0, 0,), L.point((2 * 256), (2 * 256)));
      expect(layer._withinBounds(mapBound, layerBounds["0"], resolutions, 0)).toEqual(true);
    });
    test("Layer bound above map bounds completely", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let mapBound = L.bounds(L.point(0, 0,), L.point(2816, 2816), layerBound = L.bounds(L.point(256 * resolutions[0], -1280 * resolutions[0]), L.point(2560 * resolutions[0], -256 * resolutions[0])));
      expect(layer._withinBounds(mapBound, layerBound, resolutions, 0)).toEqual(false);
    });
    test("Layer bound below map bounds completely", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let mapBound = L.bounds(L.point(0, 0,), L.point((11 * 256), (11 * 256))), layerBound = L.bounds(L.point(256 * resolutions[0], 3072 * resolutions[0]), L.point(2560 * resolutions[0], 3840 * resolutions[0]));
      expect(layer._withinBounds(mapBound, layerBound, resolutions, 0)).toEqual(false);
    });
    test("Layer bound to the left of map bounds completely", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let mapBound = L.bounds(L.point(0, 0,), L.point((11 * 256), (11 * 256))), layerBound = L.bounds(L.point(-2560 * resolutions[0], 256 * resolutions[0]), L.point(-256 * resolutions[0], 2560 * resolutions[0]));
      expect(layer._withinBounds(mapBound, layerBound, resolutions, 0)).toEqual(false);
    });
    test("Layer bound to the right of map bounds completely", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let mapBound = L.bounds(L.point(0, 0,), L.point((11 * 256), (11 * 256))), layerBound = L.bounds(L.point(3072 * resolutions[0], 256 * resolutions[0]), L.point(3584 * resolutions[0], 2560 * resolutions[0]));
      expect(layer._withinBounds(mapBound, layerBound, resolutions, 0)).toEqual(false);
    });
    test("Layer bounds overlaps at border of bounds", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"></tiles>'
      let layer = M.mapMLStaticTileLayer({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        maxZoomBound: 24,
      })
      let mapBound = L.bounds(L.point(0, 0,), L.point((11 * 256), (11 * 256))), layerBound = L.bounds(L.point(2816 * resolutions[0], 256 * resolutions[0]), L.point(3584 * resolutions[0], 2560 * resolutions[0]));
      expect(layer._withinBounds(mapBound, layerBound, resolutions, 0)).toEqual(false);
    });
  });
});
