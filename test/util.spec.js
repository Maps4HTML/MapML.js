/* global expect, M */

describe("M.Util Tests", () => {
  describe("M.parseStylesheetToHTML(mapml,base,container) utility function tests", () => {

    var mapmlString = "<mapml><head><style>.css {property:cool}</style></head><body></body></mapml>",
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
      expect(mapml.firstChild.firstChild.nodeName).toEqual("head");
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
      var check = M.parseStylesheetAsHTML(null, null, null)
      expect(check).toBeFalsy()
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
      expect(check).toBeFalsy()
    });

    //base = Element
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href='', container)", () => {
      var nullBase = parser.parseFromString('<doc><base href=""/></doc>', 'application/xml').firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml");
      mapml.firstChild.firstChild.append(nullBase);
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, nullBase, testcontainer)
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
      var check = M.parseStylesheetAsHTML(mapml, new Object, testcontainer);
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
      var check = M.parseStylesheetAsHTML(mapml, base, new Object);
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
      expect(output).toEqual([[1, 2], [3, 4]])
    });

    test("Odd number of input coords", () => {
      var inputArray = "1,2,3,4,5";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([[1, 2], [3, 4]])
    });

    test("Single number input", () => {
      var inputArray = "1";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([])
    });

    test("Empty string input", () => {
      var inputArray = "";

      var output = M.coordsToArray(inputArray);
      expect(output).toEqual([])
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
      let output = M.metaContentToObject(new Object);
      expect(output).toEqual({});
    });
  });

  describe("M.pixelToMeterBounds utility function tests", () => {
    let resolutions = [
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
    test("Null, Null parameters", () => {
      let output = M.pixelToMeterBounds(null, null);
      expect(output).toEqual({});
    });
    test("Null, float parameters", () => {
      let output = M.pixelToMeterBounds(null, resolutions[0]);
      expect(output).toEqual({});
    });
    test("bounds, Null parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.pixelToMeterBounds(bounds, null);
      expect(output).toEqual({});
    });
    test("bounds, float parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(5, 5));
      let output = M.pixelToMeterBounds(bounds, resolutions[0]);
      expect(output).toEqual(L.bounds(L.point(156543.0339, 156543.0339), L.point(782715.1695000001, 782715.1695000001)));
    });
    test("bounds, float parameters", () => {
      let bounds = L.bounds(L.point(9, 0), L.point(54, 87));
      let output = M.pixelToMeterBounds(bounds, resolutions[3]);
      expect(output).toEqual(L.bounds(L.point(176110.9131375, 0), L.point(1056665.478825, 1702405.4936625)));
    });
    test("bounds (with null min & max points), float parameters", () => {
      let bounds = L.bounds(L.point(null, null), L.point(null, null));
      let output = M.pixelToMeterBounds(bounds, resolutions[3]);
      expect(output).toEqual({});
    });
    test("bounds (with valid min & null max point), float parameters", () => {
      let bounds = L.bounds(L.point(1, 1), L.point(null, null));
      let output = M.pixelToMeterBounds(bounds, resolutions[3]);
      expect(output).toEqual({});
    });

  });

});

