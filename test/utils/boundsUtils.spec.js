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
      inputContainer.innerHTML = '<input name="zoomLevel" type="zoom" value="1" min="1" max="2">';
      inputContainer.innerHTML += '<input name="row" type="location" axis="row" units="tilematrix" min="0" max="2">';
      inputContainer.innerHTML += '<input name="col" type="location" axis="column" units="tilematrix" min="0" max="2">';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "0", max: "5" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 0, y: 90 }, min: { x: -180, y: -90 } }, zoomBounds: { maxNativeZoom: 2, maxZoom: 5, minNativeZoom: 1, minZoom: 0 } });
    });
    test("Another valid template with 3 inputs, pcrs", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<input name="zoomLevel" type="zoom" value="2" min="1" max="5">';
      inputContainer.innerHTML += '<input name="row" type="location" axis="northing" units="pcrs" min="5" max="10">';
      inputContainer.innerHTML += '<input name="col" type="location" axis="easting" units="pcrs" min="5" max="10">';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "1", max: "16" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 10, y: 10 }, min: { x: 5, y: 5 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 16, minNativeZoom: 1, minZoom: 1 } });
    });
    test("Valid template with 7 inputs, pcrs", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<input name="z" type="zoom" value="19" min="0" max="19"/>';
      inputContainer.innerHTML += '<input name="w" type="width"/>';
      inputContainer.innerHTML += '<input name="h" type="height"/>';
      inputContainer.innerHTML += '<input name="xmin" type="location" units="pcrs" position="top-left" axis="easting" min="28448056.0" max="38608077.0"/>';
      inputContainer.innerHTML += '<input name="ymin" type="location" units="pcrs" position="bottom-left" axis="northing" min="28448056.0" max="42672085.0"/>';
      inputContainer.innerHTML += '<input name="xmax" type="location" units="pcrs" position="top-right" axis="easting" min="28448056.0" max="38608077.0"/>';
      inputContainer.innerHTML += '<input name="ymax" type="location" units="pcrs" position="top-left" axis="northing" min="28448056.0" max="42672085.0"/>';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "0", max: "23" };
      template.projection = "CBMTILE";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 38608077, y: 42672085 }, min: { x: 28448056, y: 28448056 } }, zoomBounds: { maxNativeZoom: 19, maxZoom: 23, minNativeZoom: 0, minZoom: 0 } });
    });
    test("Another valid template with 7 inputs, tilematrix", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<input name="z" type="zoom" value="19" min="3" max="5"/>';
      inputContainer.innerHTML += '<input name="w" type="width"/>';
      inputContainer.innerHTML += '<input name="h" type="height"/>';
      inputContainer.innerHTML += '<input name="xmin" type="location" units="pcrs" position="top-left" axis="easting" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<input name="ymin" type="location" units="pcrs" position="bottom-left" axis="northing" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<input name="xmax" type="location" units="pcrs" position="top-right" axis="easting" min="0.0" max="500.0"/>';
      inputContainer.innerHTML += '<input name="ymax" type="location" units="pcrs" position="top-left" axis="northing" min="0.0" max="500.0"/>';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "2", max: "15" };
      template.projection = "CBMTILE";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 500, y: 500 }, min: { x: 0, y: 0 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 15, minNativeZoom: 3, minZoom: 2 } });
    });
    test("Template with missing easting and northing input", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<input name="zoomLevel" type="zoom" value="2" min="1" max="5">';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "1", max: "12" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 45, y: 90 }, min: { x: -180, y: -135 } }, zoomBounds: { maxNativeZoom: 5, maxZoom: 12, minNativeZoom: 1, minZoom: 1 } });
    });
    test("Template with 3 inputs missing", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "3", max: "12" };
      template.projection = "WGS84";

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 720, y: 90 }, min: { x: -180, y: -810 } }, zoomBounds: { maxNativeZoom: 21, maxZoom: 12, minNativeZoom: 0, minZoom: 3 } });
    });
    test("Template with no projection", () => {
      let template = {};
      let inputContainer = document.createElement("div");
      inputContainer.innerHTML = '<input name="zoomLevel" type="zoom" value="1" min="1" max="2">';
      inputContainer.innerHTML += '<input name="row" type="location" axis="row" units="tilematrix" min="0" max="2">';
      inputContainer.innerHTML += '<input name="col" type="location" axis="column" units="tilematrix" min="0" max="2">';
      template.values = inputContainer.querySelectorAll("input");
      template.zoomBounds = { min: "0", max: "5" };

      let extractedBounds = M.extractInputBounds(template);

      expect(extractedBounds).toEqual({ bounds: { max: { x: 20037508.342789244, y: 20037508.342789244 }, min: { x: -20037508.342789244, y: -20037508.342789244 } }, zoomBounds: { maxNativeZoom: 2, maxZoom: 5, minNativeZoom: 1, minZoom: 0 } });
    });
    test("Null template", () => {
      let extractedBounds = M.extractInputBounds(null);

      expect(extractedBounds).toEqual(undefined);
    });
  });

});