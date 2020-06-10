/* global assert, M */
describe("MapMLGridTest Tests", function () {
  var map, container;
  beforeEach(() => {
    map = L.map(document.createElement("map"));
    container = document.createElement("div");
  });

  test("Setting TempGrid Layer options", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMlTempGrid({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      resLength: 24,
    })
    map.addLayer(layer);
    expect(layer.options.pane).toEqual(container) && expect(layer.options.className).toEqual("tempGridML") &&
      expect(layer.options.maxNativeZoom).toEqual(3) && expect(layer.options.minNativeZoom).toEqual(0) &&
      expect(layer.options.maxZoom).toEqual(24) && expect(layer.options.minZoom).toEqual(0);
  });

  test("Creating tile group map", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMlTempGrid({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      resLength: 26,
    })

    const result = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
    expect(result.size).toEqual(6) && expect(result.has("17:18:3")).toEqual(true) &&
      expect(result.has("11:10:2")).toEqual(true) && expect(result.has("9:10:2")).toEqual(true) &&
      expect(result.has("9:11:2")).toEqual(true) && expect(result.has("2:3:0")).toEqual(true) &&
      expect(result.has("3:3:0")).toEqual(true);
  });

  test("Creating tile group map with multiple img in one tile in document order", function () {
    let tileContainer = document.createElement("div");
    tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
    const layer = M.mapMlTempGrid({
      pane: container,
      className: "tempGridML",
      tileContainer: tileContainer,
      resLength: 26,
    })
    const result = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
    expect(result.size).toEqual(5) && expect(result.get("17:18:3").length).toEqual(2) && expect(result.get("17:18:3")[0].src).toEqual("data/cbmt/2/c11_r12.png") &&
      expect(result.get("17:18:3").length).toEqual(2) && expect(result.get("17:18:3")[1].src).toEqual("data/cbmt/2/c11_r10.png");
  });

  describe("MapMLGridTest getting zoom bounds", function () {
    test("max=null,min=null,nativeMax=3,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles>\
          <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(3) && expect(zoomBounds.nMin).toEqual(2) &&
        expect(zoomBounds.max).toEqual(26) && expect(zoomBounds.min).toEqual(0);
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
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(3) && expect(zoomBounds.nMin).toEqual(2) &&
        expect(zoomBounds.max).toEqual(18) && expect(zoomBounds.min).toEqual(0);
    });
    test("max=18,min=null,nativeMax=20,nativeMin=4", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=3">\
          <tile zoom="4" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="5" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="20" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="18" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="18" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(20) && expect(zoomBounds.nMin).toEqual(4) &&
        expect(zoomBounds.max).toEqual(26) && expect(zoomBounds.min).toEqual(3);
    });
    test("max=0,min=0,nativeMax=0,nativeMin=0", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=5,max=18">\
          <tile zoom="0" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="0" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="0" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(0) && expect(zoomBounds.nMin).toEqual(0) &&
        expect(zoomBounds.max).toEqual(0) && expect(zoomBounds.min).toEqual(0);
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
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 26,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(3) && expect(zoomBounds.nMin).toEqual(2) &&
        expect(zoomBounds.max).toEqual(18) && expect(zoomBounds.min).toEqual(5);
    });
    test("max=string,min=string,nativeMax=19,nativeMin=2", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
        <tiles zoom="min=test,max=test">\
          <tile zoom="19" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
          <tile zoom="19" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile>\
          <tile zoom="15" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
          <tile zoom="12" row="11" col="9" src="data/cbmt/2/c10_r11.png"></tile>\
          <tile zoom="2" row="11" col="9" src="data/cbmt/2/c11_r11.png"></tile>\
        </tiles>'
      const layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 25,
      })
      let zoomBounds = layer._getZoomBounds(tileContainer, 26)
      expect(zoomBounds.nMax).toEqual(19) && expect(zoomBounds.nMin).toEqual(2) &&
        expect(zoomBounds.max).toEqual(25) && expect(zoomBounds.min).toEqual(0);
    });
  });
  describe("MapMLGridTest creating tiles", function () {
    test("One image element in tile", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '<tiles zoom="min=0,max=24"><tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile><tile zoom="2" row="10" col="11" src="data/cbmt/2/c11_r10.png"></tile><tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile><tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile><tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile><tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile></tiles>'
      let layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 24,
      })
      let point = {
        x: 17,
        y: 18,
        z: 3,
      }
      const groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      layer._groups = groups;
      const result = layer.createTile(point);
      expect(result.getElementsByTagName("img").length).toEqual(1);
    });

    /* test("One image element in tile", function () {
      let tileContainer = document.createElement("div");
      tileContainer.innerHTML = '\
      <tiles zoom="min=0,max=24">\
        <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r12.png"></tile>\
        <tile zoom="3" row="18" col="17" src="data/cbmt/2/c11_r10.png"></tile>\
        <tile zoom="2" row="10" col="9" src="data/cbmt/2/c9_r10.png"></tile>\
        <tile zoom="2" row="11" col="9" src="data/cbmt/2/c9_r11.png"></tile>\
        <tile zoom="0" row="3" col="2" src="data/cbmt/2/c10_r11.png"></tile>\
        <tile zoom="0" row="3" col="3" src="data/cbmt/2/c11_r11.png"></tile>\
      </tiles>'
      let layer = M.mapMlTempGrid({
        pane: container,
        className: "tempGridML",
        tileContainer: tileContainer,
        resLength: 24,
      });
      let point = {
        x: 18,
        y: 17,
        z: 3,
      }
      const groups = layer._groupTiles(tileContainer.getElementsByTagName('tile'));
      layer._groups = groups;
      const result = layer.createTile(point);
      console.log(layer._groups.get("17:18:3")[0])
      expect(result.getElementsByTagName("img").length).toEqual(2);
    }); */

  });
});
