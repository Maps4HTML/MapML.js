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
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      var testcontainer = document.createElement('div');
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(testcontainer.querySelector('link')).toBeFalsy() &&
        expect(testcontainer.querySelector('style')).toBeTruthy() &&
        expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');


    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base, container)", () => {
      // in this test, we will create a link element in the mapml
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);


      // we expect both the link and the inline style to be copied
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(mapml.firstChild.firstChild.nodeName).toEqual("head") &&
        expect(testcontainer.querySelector('link')).toBeTruthy() &&
        expect(testcontainer.querySelector('style')).toBeTruthy() &&
        expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}') &&
        expect(testcontainer.querySelector('link').href).toEqual(base + "remote.css");

    });

    test("M.parseStylesheetToHTML(mapml with inline styles only, base, container)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      M.parseStylesheetAsHTML(mapml, base, testcontainer);
      expect(testcontainer.querySelector('link')).toBeFalsy() &&
        expect(testcontainer.querySelector('style')).toBeTruthy() &&
        expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}');
    });
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, valid base, container)", () => {
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(base)
      mapml.firstChild.firstChild.append(link);

      M.parseStylesheetAsHTML(mapml, base, testcontainer)
      expect(testcontainer.querySelector('link')).toBeTruthy() &&
        expect(testcontainer.querySelector('style')).toBeTruthy() &&
        expect(testcontainer.querySelector('style').textContent).toEqual('.css {property:cool}') &&
        expect(testcontainer.querySelector('link').href).toEqual(base + "remote.css");
    });
    test("M.parseStylesheetToHTML(mapml with assorted linked, inline styles, valid base, container)", () => {
      var styleLinkTwo = parser.parseFromString('<doc><link rel="stylesheet" href="./styleTwo.css" /></doc>', 'application/xml').firstChild;
      var styleLinkThree = parser.parseFromString('<doc><link rel="stylesheet" href="./styleThree.css" /></doc>', 'application/xml').firstChild;
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link)
      mapml.firstChild.firstChild.append(styleLinkTwo)
      mapml.firstChild.firstChild.append(styleLinkThree)

      M.parseStylesheetAsHTML(mapml, base, testcontainer)

      expect(testcontainer.children[1].href).toEqual(base + "remote.css") &&
        expect(testcontainer.children[2].href).toEqual(base + "styleTwo.css") &&
        expect(testcontainer.children[3].href).toEqual(base + "styleThree.css") &&
        expect(testcontainer.children[0].textContent).toEqual('.css {property:cool}');

    });

    //base = null
    test("(null, null, null) should do nothing", () => {
      try {
        expect(M.parseStylesheetAsHTML(null, null, null));
      } catch (e) {
        expect(false).toBeTruthy();
      }
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=null, container)", () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, null, testcontainer)

      expect(testcontainer.querySelector("link").href).toEqual(document.URL + 'remote.css')

    });

    test("M.parseStylesheetToHTML(mapml with assortedlinked, inline styles, null base, null container)", () => {
      var styleLinkTwo = parser.parseFromString('<doc><link rel="stylesheet" href="./styleTwo.css" /></doc>', 'application/xml').firstChild;
      var styleLinkThree = parser.parseFromString('<doc><link rel="stylesheet" href="./styleThree.css" /></doc>', 'application/xml').firstChild;
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link)
      mapml.firstChild.firstChild.append(styleLinkTwo)
      mapml.firstChild.firstChild.append(styleLinkThree)

      M.parseStylesheetAsHTML(mapml, null, testcontainer)

      expect(testcontainer.children[1].href).toEqual(document.URL + "remote.css") &&
        expect(testcontainer.children[2].href).toEqual("styleTwo.css") &&
        expect(testcontainer.children[3].href).toEqual("styleThree.css") &&
        expect(testcontainer.children[0].textContent).toEqual('.css {property:cool}');
    });

    //base = Element
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href='', container)", () => {
      var nullBase = parser.parseFromString('<doc><base href=""/></doc>', 'application/xml').firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      mapml.firstChild.firstChild.append(nullBase)
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, nullBase, testcontainer)
      expect(testcontainer.querySelector('link').href).toEqual(document.URL + 'remote.css')
    });

    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href=test.com, container)", () => {
      var testBase = parser.parseFromString('<doc><base href="http://test.com/"/></doc>', 'application/xml').firstChild.firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml")
      mapml.firstChild.firstChild.append(testBase)
      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, testBase, testcontainer)
      expect(testcontainer.querySelector('link').href).toEqual('http://test.com/remote.css')
    });

    //base = random object
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href='', container)", () => {

      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, "application/xml")

      mapml.firstChild.firstChild.append(link);
      M.parseStylesheetAsHTML(mapml, new Object, testcontainer)
      expect(testcontainer.querySelector('link').href).toEqual(document.URL + 'remote.css')
    });
  });
});

