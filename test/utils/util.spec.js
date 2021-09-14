/* global expect, M */

describe("M.Util Tests", () => {
  describe("M.parseStylesheetToHTML(mapml,base,container) utility function tests", () => {

    var mapmlString = "<mapml-><map-head><style>.css {property:cool}</style></map-head><body></body></mapml->",
      parser = new DOMParser(),
      base = "https://example.org/mapml/is/awesome/",
      link = parser.parseFromString('<doc><link rel="stylesheet" href="./remote.css" /></doc>', 'application/xml').firstChild.firstChild;


    test("M.parseStylesheetToHTML(mapml,base,container)", () => {
      // in this test the mapml contains a <style>, but no <link rel=stylesheet> elements
      // base is a valid base
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      var testcontainer = document.createElement('div');
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(testcontainer.querySelector('link')).toBeFalsy();
      expect(testcontainer.querySelector('style')).toBeTruthy();
      expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');


    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base, container)", () => {
      // in this test, we will create a link element in the mapml
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);


      // we expect both the link and the inline style to be copied
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(mapml.firstChild.firstChild.nodeName).toEqual("map-head");
      expect(testcontainer.querySelector('link')).toBeTruthy();
      expect(testcontainer.querySelector('style')).toBeTruthy();
      expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');
      expect(testcontainer.querySelector('link').href).toEqual(base + "remote.css");

    });

    test("M.parseStylesheetToHTML(mapml with inline styles only, base, container)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(testcontainer.querySelector('link')).toBeFalsy();
      expect(testcontainer.querySelector('style')).toBeTruthy();
      expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');
    });
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, valid base, container)", () => {
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(base);
      mapml.firstChild.firstChild.append(link);

      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(testcontainer.querySelector('link')).toBeTruthy();
      expect(testcontainer.querySelector('style')).toBeTruthy();
      expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');
      expect(testcontainer.querySelector('link').href).toEqual(base + "remote.css");
    });
    test("M.parseStylesheetToHTML(mapml with assorted linked, inline styles, valid base, container)", () => {
      var styleLinkTwo = parser.parseFromString('<doc><link rel="stylesheet" href="./styleTwo.css" /></doc>', 'application/xml').firstChild;
      var styleLinkThree = parser.parseFromString('<doc><link rel="stylesheet" href="./styleThree.css" /></doc>', 'application/xml').firstChild;
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);
      mapml.firstChild.firstChild.append(styleLinkTwo);
      mapml.firstChild.firstChild.append(styleLinkThree);

      M.parseStylesheetAsHTML(mapml, base, testcontainer);

      expect(testcontainer.children[1].href).toEqual(base + "remote.css");
      expect(testcontainer.children[2].href).toEqual(base + "styleTwo.css");
      expect(testcontainer.children[3].href).toEqual(base + "styleThree.css");
      expect(testcontainer.children[0].textContent).toEqual('.css {property:cool}');

    });

    //base = null
    test("(null, null, null) should do nothing", () => {
      var check = M.parseStylesheetAsHTML(null, null, null);
      expect(check).toBeFalsy();
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=null, container)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      mapml.firstChild.firstChild.append(link);
      var check = M.parseStylesheetAsHTML(mapml, null, testcontainer);

      expect(testcontainer).toEqual(document.createElement('div'));
      expect(check).toBeFalsy();

    });

    test("M.parseStylesheetToHTML(mapml with assortedlinked, inline styles, null base, null container)", () => {
      var styleLinkTwo = parser.parseFromString('<doc><link rel="stylesheet" href="./styleTwo.css" /></doc>', 'application/xml').firstChild;
      var styleLinkThree = parser.parseFromString('<doc><link rel="stylesheet" href="./styleThree.css" /></doc>', 'application/xml').firstChild;
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);
      mapml.firstChild.firstChild.append(styleLinkTwo);
      mapml.firstChild.firstChild.append(styleLinkThree);

      var check = M.parseStylesheetAsHTML(mapml, null, testcontainer);
      expect(testcontainer).toEqual(document.createElement('div'));
      expect(check).toBeFalsy();
    });

    //base = Element
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href='', container)", () => {
      var nullBase = parser.parseFromString('<doc><base href=""/></doc>', 'application/xml').firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      mapml.firstChild.firstChild.append(nullBase);
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, nullBase, testcontainer);
      expect(testcontainer.querySelector('link').href).toEqual(document.URL + 'remote.css');
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href=test.com, container)", () => {
      var testBase = parser.parseFromString('<doc><base href="http://test.com/"/></doc>', 'application/xml').firstChild.firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      mapml.firstChild.firstChild.append(testBase);
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, testBase, testcontainer);
      expect(testcontainer.querySelector('link').href).toEqual('http://test.com/remote.css');
    });

    //base = random object
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base= Object, container)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");

      mapml.firstChild.firstChild.append(link);
      var check = M.parseStylesheetAsHTML(mapml, {}, testcontainer);
      expect(testcontainer).toEqual(document.createElement('div'));
      expect(check).toBeFalsy();
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=valid base, container = null)", () => {
      var testBase = parser.parseFromString('<doc><base href="http://test.com/"/></doc>', 'application/xml').firstChild.firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      mapml.firstChild.firstChild.append(testBase);
      mapml.firstChild.firstChild.append(link);
      var check = M.parseStylesheetAsHTML(mapml, base, null);
      expect(testcontainer).toEqual(document.createElement('div'));
      expect(check).toBeFalsy();
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=valid base, container = non Element)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");

      mapml.firstChild.firstChild.append(link);
      var check = M.parseStylesheetAsHTML(mapml, base, {});
      expect(testcontainer).toEqual(document.createElement('div'));
      expect(check).toBeFalsy();
    });
  });

  describe("M.coordsToArray(containerPoints) utility function tests", () => {

    /* test("Null input", () => {
      var output = M.coordsToArray(null);
      expect(output).toEqual([])
    });

    test("Array of numbers input", () => {
      var inputArray = [1, 2, 3, 4];

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([[1, 2], [3, 4]])
    });

    test("Single number array input", () => {
      var inputArray = [1];

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([])
    });

    test("Empty array input", () => {
      var inputArray = [];

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([])
    }); */

    test("Even number of input coords", () => {
      var inputArray = "1,2,3,4";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([[1, 2], [3, 4]]);
    });

    test("Odd number of input coords", () => {
      var inputArray = "1,2,3,4,5";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([[1, 2], [3, 4]]);
    });

    test("Single number input", () => {
      var inputArray = "1";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([]);
    });

    test("Empty string input", () => {
      var inputArray = "";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([]);
    });

  });

  describe("M.metaContentToObject(content) utility function tests", () => {
    test("Null object passed", () => {
      let output = M.metaContentToObject(null);

      expect(output).toEqual({});
    });

    test("Valid single input", () => {
      let output = M.metaContentToObject("max=5");

      expect(output).toEqual({ max: "5" });
    });

    test("Valid multiple input", () => {
      let output = M.metaContentToObject("max=5,min=23,zoom=65,x=65");

      expect(output).toEqual({ max: "5", min: "23", zoom: "65", x: "65" });
    });

    test("Empty string", () => {
      let output = M.metaContentToObject("");

      expect(output).toEqual({});
    });
    test("No equal sign just value", () => {
      let output = M.metaContentToObject("noequal");
      expect(output).toEqual({ content: "noequal" });
    });

    test("Invalid object", () => {
      let output = M.metaContentToObject({});
      expect(output).toEqual({});
    });
  });

  describe("M.metaContentToObject(content) utility function tests", () => {
    test("Null object passed", () => {
      let output = M.metaContentToObject(null);

      expect(output).toEqual({});
    });

    test("Valid single input", () => {
      let output = M.metaContentToObject("max=5");

      expect(output).toEqual({ max: "5" });
    });

    test("Valid multiple input", () => {
      let output = M.metaContentToObject("max=5,min=23,zoom=65,x=65");

      expect(output).toEqual({ max: "5", min: "23", zoom: "65", x: "65" });
    });

    test("Empty string", () => {
      let output = M.metaContentToObject("");

      expect(output).toEqual({});
    });
    test("No equal sign just value", () => {
      let output = M.metaContentToObject("noequal");
      expect(output).toEqual({ content: "noequal" });
    });

    test("Invalid object", () => {
      let output = M.metaContentToObject({});
      expect(output).toEqual({});
    });
  });

  describe("M.axisToCS() utility function tests", () => {
    test("Null axis", () => {
      let output = M.axisToCS(null);
      expect(output).toEqual(undefined);
    });
    test("Non-String axis", () => {
      let output = M.axisToCS(5);
      expect(output).toEqual(undefined);
    });
    test("Lowercase axis", () => {
      let output = M.axisToCS("row");
      expect(output).toEqual("TILEMATRIX");
    });
    test("Uppercase axis", () => {
      let output = M.axisToCS("NORTHING");
      expect(output).toEqual("PCRS");
    });
    test("Random String", () => {
      let output = M.axisToCS("TEST");
      expect(output).toEqual("TILEMATRIX");
    });
  });

  describe("M.csToAxes() utility function tests", () => {
    test("Null cs", () => {
      let output = M.csToAxes(null);
      expect(output).toEqual(undefined);
    });
    test("Non-string cs", () => {
      let output = M.csToAxes(5);
      expect(output).toEqual(undefined);
    });
    test("cs = tilematrix", () => {
      let output = M.csToAxes("tilematrix");
      expect(output).toEqual(["column", "row"]);
    });
    test("cs = pcrs", () => {
      let output = M.csToAxes("pcrs");
      expect(output).toEqual(["easting", "northing"]);
    });
    test("cs = gcrs", () => {
      let output = M.csToAxes("gcrs");
      expect(output).toEqual(["longitude", "latitude"]);
    });
    test("cs = tcrs", () => {
      let output = M.csToAxes("tcrs");
      expect(output).toEqual(["x", "y"]);
    });
    test("cs = map", () => {
      let output = M.csToAxes("map");
      expect(output).toEqual(["i", "j"]);
    });
    test("cs = tile", () => {
      let output = M.csToAxes("tile");
      expect(output).toEqual(["i", "j"]);
    });
  });

  describe("M.pixelToPCRSPoint() utility function tests", () => {
    let point = L.point(10, 10);
    test("Null point", () => {
      let output = M.pixelToPCRSPoint(null, 0, "CBMTILE");
      expect(output).toEqual(undefined);
    });
    test("Null zoom", () => {
      let output = M.pixelToPCRSPoint(point, null, "CBMTILE");
      expect(output).toEqual(undefined);
    });
    test("Null projection", () => {
      let output = M.pixelToPCRSPoint(point, 1, null);
      expect(output).toEqual(undefined);
    });
    test("Valid point conversion in CBMTILE", () => {
      let output = M.pixelToPCRSPoint(point, 1, "CBMTILE");
      expect(output).toEqual({"x": -34430903.7168741, "y": 39085103.7168741});
    });
    test("Valid point conversion in OSMTILE", () => {
      let output = M.pixelToPCRSPoint(point, 1, "OSMTILE");
      expect(output).toEqual({"x": -19254793.17314904, "y": 19254793.17314904});
    });
    test("Valid point conversion in WGS84", () => {
      let output = M.pixelToPCRSPoint(point, 1, "WGS84");
      expect(output).toEqual({"x": -176.484375, "y": 86.484375});
    });
  });

  describe("M.pointToPCRSPoint() utility function tests", () => {
    let expected = [
      [
        {"x": 63557729.76039286, "y": -58903529.76039286},
        {"x": 380712658.51299566, "y": -380712658.51299566},
        {"x": 1620, "y": -1710},
      ],
      [
        {"x": 10, "y": 10},
        {"x": 10, "y": 10},
        {"x": 10, "y": 10},
      ],
      [
        {"x": 9575762.405264193, "y": 5421756.419812092},
        {"x": 1113194.9079327357, "y": 1118889.974857959},
        {"x": 10, "y": 10},
      ],
      [
        {"x": -34272153.399373464, "y": 38926353.399373464},
        {"x": -18472078.003508836, "y": 18472078.003508836},
        {"x": -172.96875, "y": 82.96875},
      ]
    ],point = L.point(10, 10), csArray = ["tilematrix", "pcrs", "gcrs", "tcrs"], projArray = ["CBMTILE", "OSMTILE", "WGS84"];

    /* jshint ignore:start */
    for(let i in csArray ){
      for(let j in projArray ){
        test(`Valid conversion in ${projArray[j]} + ${csArray[i]}`, () => {
          let output = M.pointToPCRSPoint(point, 0, projArray[j], csArray[i]);
          expect(output).toEqual(expected[i][j]);
        });
      }
    }
    /* jshint ignore:end */

    test("Null point", () => {
      let output = M.pointToPCRSPoint(null, 0, "CBMTILE");
      expect(output).toEqual(undefined);
    });
    test("Null zoom", () => {
      let output = M.pointToPCRSPoint(point, null, "CBMTILE");
      expect(output).toEqual(undefined);
    });
    test("Null projection", () => {
      let output = M.pointToPCRSPoint(point, 1, null);
      expect(output).toEqual(undefined);
    });
    test("Null cs", () => {
      let output = M.pointToPCRSPoint(point, 1, "CBMTILE", null);
      expect(output).toEqual(undefined);
    });
  });

  describe("M.axisToXY() utility function tests", () => {
    let expectX = ["i", "column", "longitude", "x", "easting"], expectY = ["row", "j", "latitude", "y", "northing"];
    test("Null axis", () => {
      let output = M.axisToXY(null);
      expect(output).toEqual(undefined);
    });
    /* jshint ignore:start */
    for(let i in expectX ){
      test(`Expect X for ${expectX[i]}`, () => {
        let output = M.axisToXY(expectX[i]);
        expect(output).toEqual("x");
      });
    }
    /* jshint ignore:end */
    /* jshint ignore:start */
    for(let i in expectY ){
      test(`Expect X for ${expectY[i]}`, () => {
        let output = M.axisToXY(expectY[i]);
        expect(output).toEqual("y");
      });
    }
    /* jshint ignore:end */
  });
});