/* global expect, M */

describe("M.Util Tests", () => {
	describe("M.parseStylesheetToHTML(mapml,base,container) utility function tests", () => {
    
    var mapmlString = "<mapml><head><style>.css {property:cool}</style></head><body></body></mapml>",
        htmlString = "<html lang=en><head><title>foo</title></head><body><div></div></body></html>",
        parser = new DOMParser(),
        mapml = parser.parseFromString(mapmlString, "application/xml"),
        html = parser.parseFromString(htmlString,"text/html"),
        base = "https://example.org/mapml/is/awesome/",
        link = parser.parseFromString('<doc><link rel="stylesheet" href="./remote.css" /></doc>', 'application/xml').firstChild;
    
		test("(null, null, null) should do nothing", () => {
      try {
        expect(M.parseStylesheetAsHTML(null,null,null));
      } catch (e) {
        expect(false).toBeTruthy();
      }
		});
    
    test("M.parseStylesheetToHTML(mapml,base,container)", () => {
      // in this test the mapml contains a <style>, but no <link rel=stylesheet> elements
      // base is a valid base
      var container = document.createElement('div');
      M.parseStylesheetAsHTML(mapml,base,container);
      expect(container.querySelector('link')).toBeFalsy();
      // expect the <style> to have been copied to the container
      expect(container.querySelector('style')).toBeTruthy();
      expect(container.querySelector('style').textContent).toEqual('.css {property:cool}');
      
      
    });
    
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base, container)", () => {
      // in this test, we will create a link element in the mapml
      expect(mapml.firstChild.firstChild.nodeName).toEqual("head");
      mapml.firstChild.firstChild.append(link);
      
      // we expect both the link and the inline style to be copied
      M.parseStylesheetAsHTML(mapml, base, html.head);
      expect(html.head.querySelector('link')).toBeTruthy();
      expect(html.head.querySelector('style')).toBeTruthy();
      expect(html.head.querySelector('style').textContent).toEqual('.css {property:cool}');
      expect(html.head.querySelector('link').href).toEqual(base+"remote.css");
      
    });
    
    // TODO
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=null, container)", () => {});
    test("M.parseStylesheetToHTML(mapml with inline styles only, base, container)", () => {});
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, valid base, container)", () => {});
    test("M.parseStylesheetToHTML(mapml with assorted linked, inline styles, valid base, container)", () => {});
    test("M.parseStylesheetToHTML(mapml with assortedlinked, inline styles, null base, null container)", () => {});
    
	});
});

