describe("M.Util Bounds Related Tests", () => {
  let osmtileResolutions = [
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

  let cbmtileResolution = [
    38364.660062653464,
    22489.62831258996,
    13229.193125052918,
    7937.5158750317505,
    4630.2175937685215,
    2645.8386250105837,
    1587.5031750063501,
    926.0435187537042,
    529.1677250021168,
    317.50063500127004,
    185.20870375074085,
    111.12522225044451,
    66.1459656252646,
    38.36466006265346,
    22.48962831258996,
    13.229193125052918,
    7.9375158750317505,
    4.6302175937685215,
    2.6458386250105836,
    1.5875031750063502,
    0.92604351875370428,
    0.52916772500211673,
    0.31750063500127002,
    0.18520870375074083,
    0.11112522225044451,
    0.066145965625264591
  ];
  describe("M.pixelToPCRSBounds utility function tests", () => {

    test("Null, Null parameters", () => {
      let output = M.pixelToPCRSBounds(null, null);
      expect(output).toEqual(undefined);
    });
    test("Null, float parameters", () => {
      let output = M.pixelToPCRSBounds(null, osmtileResolutions[0]);
      expect(output).toEqual(undefined);
    });
    test("bounds, Null parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.pixelToPCRSBounds(bounds, null);
      expect(output).toEqual(undefined);
    });
    test("bounds, number parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.pixelToPCRSBounds(bounds, 0, "CBMTILE");
      expect(output).toEqual(L.bounds(L.point(-34617435.339937344, 39118176.699686736), L.point(-34463976.699686736, 39271635.339937344)));
    });
    test("bounds, number parameters", () => {
      let bounds = L.bounds(L.point(9, 0), L.point(54, 87));
      let output = M.pixelToPCRSBounds(bounds, 3, "OSMTILE");
      expect(output).toEqual(L.bounds(L.point(-19861397.4296202, 18335102.8488218), L.point(-18980842.86377497, 20037508.342789244)));
    });
    test("bounds (with null min & max points), float parameters", () => {
      let bounds = L.bounds(L.point(null, null), L.point(null, null));
      let output = M.pixelToPCRSBounds(bounds, 3, "CBMTILE");
      expect(output).toEqual(undefined);
    });
    test("bounds (with valid min & null max point), float parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(null, null));
      let output = M.pixelToPCRSBounds(bounds, 3, "OSMTILE");
      expect(output).toEqual(undefined);
    });

  });

  describe("M.boundsToPCRSBounds utility function tests", () => {

    let expected = [
      [
        {"max": {"x": 358198319.04157144, "y": -58903529.76039286}, "min": {"x": 63557729.76039286, "y": -549971178.5623572}},
        {"max": {"x": 1582963159.0803504, "y": -380712658.51299566}, "min": {"x": 380712658.51299566, "y": -2384463492.79192}},
        {"max": {"x": 7020, "y": -1710}, "min": {"x": 1620, "y": -10710}},
      ],
      [
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
      ],
      [
        {"max": {"x": 9575762.405264193, "y": 6462207.673340187}, "min": {"x": 2938149.2363012433, "y": 5421756.419812092}},
        {"max": {"x": 4452779.631730943, "y": 8399737.88981836}, "min": {"x": 1113194.9079327357, "y": 1118889.974857959}},
        {"max": {"x": 40, "y": 59.99999999999999}, "min": {"x": 10, "y": 10}},
      ],
      [
        {"max": {"x": -33121213.59749386, "y": 38926353.399373464}, "min": {"x": -34272153.399373464, "y": 37008120.39624079}},
        {"max": {"x": -13775786.985667607, "y": 18472078.003508836}, "min": {"x": -18472078.003508836, "y": 10644926.307106787}},
        {"max": {"x": -151.875, "y": 82.96875}, "min": {"x": -172.96875, "y": 47.8125}},
      ]
    ], p1 = L.point(10, 10), p2 = L.point(40, 60), bounds = L.bounds(p1, p2), csArray = ["tilematrix", "pcrs", "gcrs", "tcrs"], projArray = ["CBMTILE", "OSMTILE", "WGS84"];
    /* jshint ignore:start */
    for(let i in csArray ){
      for(let j in projArray ){
        test(`Valid conversion in ${projArray[j]} + ${csArray[i]}`, () => {
          let output = M.boundsToPCRSBounds(bounds, 0, projArray[j], csArray[i]);
          expect(output).toEqual(expected[i][j]);
        });
      }
    }
    /* jshint ignore:end */

    test("Null bounds", () => {
      let output = M.boundsToPCRSBounds(null, 3, "CBMTILE", "TILEMATRIX");
      expect(output).toEqual(undefined);
    });
    test("Tile bounds, null ", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.boundsToPCRSBounds(bounds, null, null, null);
      expect(output).toEqual(undefined);
    });
    test("Lowercase units bounds", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.boundsToPCRSBounds(bounds, 3, "CBMTILE", "tilematrix");
      expect(output).toEqual(L.bounds(L.point(-32623795.935991872, 29149979.679959357), L.point(-24495779.679959357, 37277995.93599187)));
    });
    test("TILEMATRIX bounds", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.boundsToPCRSBounds(bounds, 3, "CBMTILE", "TILEMATRIX");
      expect(output).toEqual(L.bounds(L.point(-32623795.935991872, 29149979.679959357), L.point(-24495779.679959357, 37277995.93599187)));
    });
    test("PCRS bounds ", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(559, 559));
      let output = M.boundsToPCRSBounds(bounds, 0, "CBMTILE", "pcrs");
      expect(output).toEqual(L.bounds(L.point(1, 1), L.point(559, 559)));
    });
    test("GCRS bounds ", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(15, 15));
      let output = M.boundsToPCRSBounds(bounds, 0, "CBMTILE", "GCrs");
      expect(output).toEqual(L.bounds(L.point(11044163.602622755, 6054659.650462182), L.point(8756326.16822687, 3974012.3343449486)));
    });
  });

  //template format = 
  //{
  //  values:[inputs...]
  //  projection:"CBMTILE"
  //  zoomBounds:{max:, min:}
  //}
  describe("M.extractInputBounds utility function tests", () => {
    test("Valid template with 3 inputs, tilematrix", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="zoomLevel" type="zoom" value="1" min="1" max="2">';
      inputContainer.innerHTML += '<map-input name="row" type="location" axis="row" units="tilematrix" min="0" max="2">';
      inputContainer.innerHTML += '<map-input name="col" type="location" axis="column" units="tilematrix" min="0" max="2">';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "0", max: "5" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 0, y: 90 }, min: { x: -180, y: -90 } }, zoomBounds: { maxNativeZoom: 2, maxZoom: 5, minNativeZoom: 1, minZoom: 0 } });
    });
    test("Another valid template with 3 inputs, pcrs", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="zoomLevel" type="zoom" value="2" min="1" max="5">';
      inputContainer.innerHTML += '<map-input name="row" type="location" axis="northing" units="pcrs" min="5" max="10">';
      inputContainer.innerHTML += '<map-input name="col" type="location" axis="easting" units="pcrs" min="5" max="10">';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "1", max: "16" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 10, y: 10 }, min: { x: 5, y: 5 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 16, minNativeZoom: 1, minZoom: 1 } });
    });
    test("Test defaulting maxNativeZoom to TCRS max", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="zoomLevel" type="zoom" value="2" min="1">';
      inputContainer.innerHTML += '<map-input name="row" type="location" axis="northing" units="pcrs" min="5" max="10">';
      inputContainer.innerHTML += '<map-input name="col" type="location" axis="easting" units="pcrs" min="5" max="10">';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "1", max: "16" };
      template.projection = "OSMTILE";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 10, y: 10 }, min: { x: 5, y: 5 } }, zoomBounds: { maxNativeZoom: 24, maxZoom: 16, minNativeZoom: 1, minZoom: 1 } });
    });
    test("Valid template with 7 inputs, pcrs", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="z" type="zoom" value="19" min="0" max="19"/>';
      inputContainer.innerHTML += '<map-input name="w" type="width"/>';
      inputContainer.innerHTML += '<map-input name="h" type="height"/>';
      inputContainer.innerHTML += '<map-input name="xmin" type="location" units="pcrs" position="top-left" axis="easting" min="28448056.0" max="38608077.0"/>';
      inputContainer.innerHTML += '<map-input name="ymin" type="location" units="pcrs" position="bottom-left" axis="northing" min="28448056.0" max="42672085.0"/>';
      inputContainer.innerHTML += '<map-input name="xmax" type="location" units="pcrs" position="top-right" axis="easting" min="28448056.0" max="38608077.0"/>';
      inputContainer.innerHTML += '<map-input name="ymax" type="location" units="pcrs" position="top-left" axis="northing" min="28448056.0" max="42672085.0"/>';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "0", max: "23" };
      template.projection = "CBMTILE";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 38608077, y: 42672085 }, min: { x: 28448056, y: 28448056 } }, zoomBounds: { maxNativeZoom: 19, maxZoom: 23, minNativeZoom: 0, minZoom: 0 } });
    });
    test("Another valid template with 7 inputs, tilematrix", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="z" type="zoom" value="19" min="3" max="5"/>';
      inputContainer.innerHTML += '<map-input name="w" type="width"/>';
      inputContainer.innerHTML += '<map-input name="h" type="height"/>';
      inputContainer.innerHTML += '<map-input name="xmin" type="location" units="pcrs" position="top-left" axis="easting" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<map-input name="ymin" type="location" units="pcrs" position="bottom-left" axis="northing" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<map-input name="xmax" type="location" units="pcrs" position="top-right" axis="easting" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<map-input name="ymax" type="location" units="pcrs" position="top-left" axis="northing" min="0.0" max="500.0"/>';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "2", max: "15" };
      template.projection = "CBMTILE";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 500, y: 500 }, min: { x: 0, y: 0 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 15, minNativeZoom: 3, minZoom: 2 } });
    });
    test("Template with missing easting and northing input", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="zoomLevel" type="zoom" value="2" min="1" max="5">';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "1", max: "12" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: -90, y: 90 }, min: { x: -180, y: 45 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 12, minNativeZoom: 1, minZoom: 1 } });
    });
    test("Template with 3 inputs missing", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "3", max: "12" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 180, y: 90 }, min: { x: -180, y: -90 } }, zoomBounds: { maxNativeZoom: 21, maxZoom: 12, minNativeZoom: 0, minZoom: 3 } });
    });
    test("Template with no projection", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<map-input name="zoomLevel" type="zoom" value="1" min="1" max="2">';
      inputContainer.innerHTML += '<map-input name="row" type="location" axis="row" units="tilematrix" min="0" max="2">';
      inputContainer.innerHTML += '<map-input name="col" type="location" axis="column" units="tilematrix" min="0" max="2">';
      template.values = inputContainer.querySelectorAll("map-input");
      template.zoomBounds = { min: "0", max: "5" };

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 20037508.342789244, y: 20037508.342789244 }, min: { x: -20037508.342789244, y: -20037508.342789244 } }, zoomBounds: { maxNativeZoom: 2, maxZoom: 5, minNativeZoom: 1, minZoom: 0 } });
    });
    test("Null template", () => {
      let extractedBounds = M.extractInputBounds(null);

      expect(extractedBounds).toEqual(undefined);
    });
  });

  /* jshint ignore:start */
  describe("M.convertAndFormatPCRS utility function tests", () => {
    let projections = ["CBMTILE", "OSMTILE", "WGS84", "APSTILE"];
    //all expected results are in the order of projections (CBMTILE then OSMTILE...)
    //all referring to bottomRight
    let expectedPCRS = [
      { horizontal: 643, vertical: 16 },
      { horizontal: 643, vertical: 16 },
      { horizontal: 643, vertical: 16 },
      { horizontal: 643, vertical: 16 }];
    let expectedGCRS = [
      { horizontal: -94.99116604546431, vertical: 49.00014387212851 },
      { horizontal: 0.005776167276888522, vertical: 0.00014373044546862331 },
      { horizontal: 643, vertical: 16 },
      { horizontal: 164.6567832000427, vertical: 64.91659472871468 }];
    let expectedFirstTileMatrix = [
      { horizontal: 3.528683174767241, vertical: 4.00250190537931 },
      { horizontal: 0.5000160449091025, vertical: 0.4999996007487626 },
      { horizontal: 4.572222222222222, vertical: 0.41111111111111115 },
      { horizontal: 0.4672963373316954, vertical: 0.5327139185619564 }];
    let expectedFirstTCRS = [
      { horizontal: 903.3428927404137, vertical: 1024.6404877771033 },
      { horizontal: 128.00410749673023, vertical: 127.99989779168322 },
      { horizontal: 1170.4888888888888, vertical: 105.24444444444445 },
      { horizontal: 119.62786235691402, vertical: 136.37476315186083 }];
    for (let i = 0; i < projections.length; i++) {
      test(`Accurate conversion and formatting in ${projections[i]} projection`, () => {
        let container = document.createElement('div'), mapEl = document.createElement('div');
        let map = L.map(container, {
          center: new L.LatLng(0, 0),
          projection: projections[i],
          query: true,
          mapEl: mapEl,
          crs: M[projections[i]],
          zoom: 0,
          zoomControl: false,
          fadeAnimation: true
        });
        let pcrsBounds = L.bounds(L.point(14, 16), L.point(643, 24454));
        let conversion = M.convertAndFormatPCRS(pcrsBounds, map);
        expect(conversion.bottomRight.pcrs).toEqual(expectedPCRS[i]);
        expect(conversion.bottomRight.gcrs).toEqual(expectedGCRS[i]);
        expect(conversion.bottomRight.tilematrix[0]).toEqual(expectedFirstTileMatrix[i]);
        expect(conversion.bottomRight.tcrs[0]).toEqual(expectedFirstTCRS[i]);
      });
      test(`Correct number of TCRS and TileMatrix conversions in ${projections[i]} projection`, () => {
        let container = document.createElement('div'), mapEl = document.createElement('div');
        let map = L.map(container, {
          center: new L.LatLng(0, 0),
          projection: projections[i],
          query: true,
          mapEl: mapEl,
          crs: M[projections[i]],
          zoom: 0,
          zoomControl: false,
          fadeAnimation: true
        });
        let pcrsBounds = L.bounds(L.point(14, 16), L.point(643, 24454));
        let conversion = M.convertAndFormatPCRS(pcrsBounds, map);
        expect(conversion.bottomRight.tilematrix.length).toEqual(M[projections[i]].options.resolutions.length);
        expect(conversion.bottomRight.tcrs.length).toEqual(M[projections[i]].options.resolutions.length);
      });
    }
  });
  /* jshint ignore:end */

  describe("M.convertPCRSBounds() utility function tests", () => {
    let expected = [
      [
        {"max": {"x": 3.528621777931034, "y": 4.002502516293103}, "min": {"x": 3.5286187233620687, "y": 4.002497425344827}},
        {"max": {"x": 0.5000009981280935, "y": 0.4999997504679766}, "min": {"x": 0.5000002495320234, "y": 0.4999985028078598}},
        {"max": {"x": 1.2222222222222223, "y": 0.4444444444444445}, "min": {"x": 1.0555555555555556, "y": 0.16666666666666669}},
      ],
      [
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
        {"max": {"x": 40, "y": 60}, "min": {"x": 10, "y": 10}},
      ],
      [
        {"max": {"x": -94.99945333421749, "y": 49.000539520078}, "min": {"x": -94.9998633350226, "y": 49.000089920088065}},
        {"max": {"x": 0.0003593261136478086, "y": 0.0005389891704723513}, "min": {"x": 0.00008983152841195215, "y": 0.00008983152840993817}},
        {"max": {"x": 40, "y": 59.99999999999999}, "min": {"x": 10, "y": 10}},
      ],
      [
        {"max": {"x": 903.3271751503447, "y": 1024.6406441710344}, "min": {"x": 903.3263931806896, "y": 1024.6393408882757}},
        {"max": {"x": 128.00025552079194, "y": 127.99993611980202}, "min": {"x": 128.00006388019798, "y": 127.9996167188121}},
        {"max": {"x": 312.8888888888889, "y": 113.77777777777779}, "min": {"x": 270.22222222222223, "y": 42.66666666666667}},
      ]
    ], p1 = L.point(10, 10), p2 = L.point(40, 60), bounds = L.bounds(p1, p2), csArray = ["tilematrix", "pcrs", "gcrs", "tcrs"], projArray = ["CBMTILE", "OSMTILE", "WGS84"];
    /* jshint ignore:start */
    for(let i in csArray ){
      for(let j in projArray ){
        test(`Valid conversion in ${projArray[j]} + ${csArray[i]}`, () => {
          let output = M.convertPCRSBounds(bounds, 0, projArray[j], csArray[i]);
          expect(output).toEqual(expected[i][j]);
        });
      }
    }
    /* jshint ignore:end */
    test("Null bounds", () => {
      let output = M.convertPCRSBounds(null, 0, "CBMTILE", "tilematrix");
      expect(output).toEqual(undefined);
    });
    test("Null zoom", () => {
      let output = M.convertPCRSBounds(bounds, null, "CBMTILE", "tilematrix");
      expect(output).toEqual(undefined);
    });
    test("Null projection", () => {
      let output = M.convertPCRSBounds(bounds, 1, null, "tilematrix");
      expect(output).toEqual(undefined);
    });
    test("Null cs", () => {
      let output = M.convertPCRSBounds(bounds, 1, "CBMTILE", null);
      expect(output).toEqual(undefined);
    });
  });
});
