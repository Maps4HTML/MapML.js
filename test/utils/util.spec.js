/* global expect, M */

describe('M.Util Tests', () => {
  describe('M.parseStylesheetToHTML(mapml,base,container) utility function tests', () => {
    var mapmlString =
        '<mapml-><map-head><map-style>.css {property:cool}</map-style></map-head><map-body></map-body></mapml->',
      parser = new DOMParser(),
      base = 'https://example.org/mapml/is/awesome/',
      link = parser.parseFromString(
        '<doc><map-link rel="stylesheet" href="./remote.css" ></map-link></doc>',
        'application/xml'
      ).firstChild.firstChild;

    test('M.parseStylesheetToHTML(mapml,base,container)', async () => {
      // in this test the mapml contains a <style>, but no <link rel=stylesheet> elements
      // base is a valid base
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      var testcontainer = document.createElement('div');
      M._parseStylesheetAsHTML(mapml, base, testcontainer);
      await expect(testcontainer.querySelector('link')).toBeFalsy();
      await expect(testcontainer.querySelector('style')).toBeTruthy();
      await expect(testcontainer.querySelector('style').textContent).toEqual(
        '.css {property:cool}'
      );
    });

    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base, container)', async () => {
      // in this test, we will create a link element in the mapml
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);

      // we expect both the link and the inline style to be copied
      M._parseStylesheetAsHTML(mapml, base, testcontainer);
      await expect(mapml.firstChild.firstChild.nodeName).toEqual('map-head');
      await expect(testcontainer.querySelector('link')).toBeTruthy();
      await expect(testcontainer.querySelector('style')).toBeTruthy();
      await expect(testcontainer.querySelector('style').textContent).toEqual(
        '.css {property:cool}'
      );
      await expect(testcontainer.querySelector('link').href).toEqual(
        base + 'remote.css'
      );
    });

    test('M.parseStylesheetToHTML(mapml with inline styles only, base, container)', async () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      M._parseStylesheetAsHTML(mapml, base, testcontainer);
      await expect(testcontainer.querySelector('link')).toBeFalsy();
      await expect(testcontainer.querySelector('style')).toBeTruthy();
      await expect(testcontainer.querySelector('style').textContent).toEqual(
        '.css {property:cool}'
      );
    });
    test('M.parseStylesheetToHTML(mapml with linked, inline styles, valid base, container)', async () => {
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(base);
      mapml.firstChild.firstChild.append(link);

      M._parseStylesheetAsHTML(mapml, base, testcontainer);
      await expect(testcontainer.querySelector('link')).toBeTruthy();
      await expect(testcontainer.querySelector('style')).toBeTruthy();
      await expect(testcontainer.querySelector('style').textContent).toEqual(
        '.css {property:cool}'
      );
      await expect(testcontainer.querySelector('link').href).toEqual(
        base + 'remote.css'
      );
    });
    test('M.parseStylesheetToHTML(mapml with assorted linked, inline styles, valid base, container)', async () => {
      var styleLinkTwo = parser.parseFromString(
        '<doc><map-link rel="stylesheet" href="./styleTwo.css" /></doc>',
        'application/xml'
      ).firstChild;
      var styleLinkThree = parser.parseFromString(
        '<doc><map-link rel="stylesheet" href="./styleThree.css" /></doc>',
        'application/xml'
      ).firstChild;
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);
      mapml.firstChild.firstChild.append(styleLinkTwo);
      mapml.firstChild.firstChild.append(styleLinkThree);

      M._parseStylesheetAsHTML(mapml, base, testcontainer);

      await expect(testcontainer.children[1].href).toEqual(base + 'remote.css');
      await expect(testcontainer.children[2].href).toEqual(
        base + 'styleTwo.css'
      );
      await expect(testcontainer.children[3].href).toEqual(
        base + 'styleThree.css'
      );
      await expect(testcontainer.children[0].textContent).toEqual(
        '.css {property:cool}'
      );
    });

    //base = null
    test('(null, null, null) should do nothing', async () => {
      var check = M._parseStylesheetAsHTML(null, null, null);
      await expect(check).toBeFalsy();
    });

    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base=null, container)', async () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      mapml.firstChild.firstChild.append(link);
      var check = M._parseStylesheetAsHTML(mapml, null, testcontainer);

      await expect(testcontainer).toEqual(document.createElement('div'));
      await expect(check).toBeFalsy();
    });

    test('M.parseStylesheetToHTML(mapml with assortedlinked, inline styles, null base, null container)', async () => {
      var styleLinkTwo = parser.parseFromString(
        '<doc><map-link rel="stylesheet" href="./styleTwo.css" /></doc>',
        'application/xml'
      ).firstChild;
      var styleLinkThree = parser.parseFromString(
        '<doc><map-link rel="stylesheet" href="./styleThree.css" /></doc>',
        'application/xml'
      ).firstChild;
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      var testcontainer = document.createElement('div');
      mapml.firstChild.firstChild.append(link);
      mapml.firstChild.firstChild.append(styleLinkTwo);
      mapml.firstChild.firstChild.append(styleLinkThree);

      var check = M._parseStylesheetAsHTML(mapml, null, testcontainer);
      await expect(testcontainer).toEqual(document.createElement('div'));
      await expect(check).toBeFalsy();
    });

    //base = Element
    test("M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href='', container)", async () => {
      var nullBase = parser.parseFromString(
        '<doc><base href=""/></doc>',
        'application/xml'
      ).firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      mapml.firstChild.firstChild.append(nullBase);
      mapml.firstChild.firstChild.append(link);
      M._parseStylesheetAsHTML(mapml, nullBase, testcontainer);
      await expect(testcontainer.querySelector('link').href).toEqual(
        document.URL + 'remote.css'
      );
    });

    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base=Element with href=test.com, container)', async () => {
      var testBase = parser.parseFromString(
        '<doc><map-base href="http://test.com/"/></doc>',
        'application/xml'
      ).firstChild.firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      mapml.firstChild.firstChild.append(testBase);
      mapml.firstChild.firstChild.append(link);
      M._parseStylesheetAsHTML(mapml, testBase, testcontainer);
      await expect(testcontainer.querySelector('link').href).toEqual(
        'http://test.com/remote.css'
      );
    });

    //base = random object
    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base= Object, container)', async () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');

      mapml.firstChild.firstChild.append(link);
      var check = M._parseStylesheetAsHTML(mapml, {}, testcontainer);
      await expect(testcontainer).toEqual(document.createElement('div'));
      await expect(check).toBeFalsy();
    });

    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base=valid base, container = null)', async () => {
      var testBase = parser.parseFromString(
        '<doc><map-base href="http://test.com/"/></doc>',
        'application/xml'
      ).firstChild.firstChild;
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');
      mapml.firstChild.firstChild.append(testBase);
      mapml.firstChild.firstChild.append(link);
      var check = M._parseStylesheetAsHTML(mapml, base, null);
      await expect(testcontainer).toEqual(document.createElement('div'));
      await expect(check).toBeFalsy();
    });

    test('M.parseStylesheetToHTML(mapml with linked, inline styles, base=valid base, container = non Element)', async () => {
      var testcontainer = document.createElement('div');
      var mapml = parser.parseFromString(mapmlString, 'application/xml');

      mapml.firstChild.firstChild.append(link);
      var check = M._parseStylesheetAsHTML(mapml, base, {});
      await expect(testcontainer).toEqual(document.createElement('div'));
      await expect(check).toBeFalsy();
    });
  });

  describe('M._coordsToArray(containerPoints) utility function tests', () => {
    /* test("Null input", () => {
      var output = M._coordsToArray(null);
      await expect(output).toEqual([])
    });

    test("Array of numbers input", () => {
      var inputArray = [1, 2, 3, 4];

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([[1, 2], [3, 4]])
    });

    test("Single number array input", () => {
      var inputArray = [1];

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([])
    });

    test("Empty array input", () => {
      var inputArray = [];

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([])
    }); */

    test('Even number of input coords', async () => {
      var inputArray = '1,2,3,4';

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([
        [1, 2],
        [3, 4]
      ]);
    });

    test('Odd number of input coords', async () => {
      var inputArray = '1,2,3,4,5';

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([
        [1, 2],
        [3, 4]
      ]);
    });

    test('Single number input', async () => {
      var inputArray = '1';

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([]);
    });

    test('Empty string input', async () => {
      var inputArray = '';

      var output = M._coordsToArray(inputArray);
      await expect(output).toEqual([]);
    });
  });

  describe('M._metaContentToObject(content) utility function tests', () => {
    test('Null object passed', async () => {
      let output = M._metaContentToObject(null);

      await expect(output).toEqual({});
    });

    test('Valid single input', async () => {
      let output = M._metaContentToObject('max=5');

      await expect(output).toEqual({ max: '5' });
    });

    test('Valid multiple input', async () => {
      let output = M._metaContentToObject('max=5,min=23,zoom=65,x=65');

      await expect(output).toEqual({
        max: '5',
        min: '23',
        zoom: '65',
        x: '65'
      });
    });

    test('Empty string', async () => {
      let output = M._metaContentToObject('');

      await expect(output).toEqual({});
    });
    test('No equal sign just value', async () => {
      let output = M._metaContentToObject('noequal');
      await expect(output).toEqual({ content: 'noequal' });
    });

    test('Invalid object', async () => {
      let output = M._metaContentToObject({});
      await expect(output).toEqual({});
    });
  });

  describe('M._metaContentToObject(content) utility function tests', () => {
    test('Null object passed', async () => {
      let output = M._metaContentToObject(null);

      await expect(output).toEqual({});
    });

    test('Valid single input', async () => {
      let output = M._metaContentToObject('max=5');

      await expect(output).toEqual({ max: '5' });
    });

    test('Valid multiple input', async () => {
      let output = M._metaContentToObject('max=5,min=23,zoom=65,x=65');

      await expect(output).toEqual({
        max: '5',
        min: '23',
        zoom: '65',
        x: '65'
      });
    });

    test('Empty string', async () => {
      let output = M._metaContentToObject('');

      await expect(output).toEqual({});
    });
    test('No equal sign just value', async () => {
      let output = M._metaContentToObject('noequal');
      await expect(output).toEqual({ content: 'noequal' });
    });

    test('Invalid object', async () => {
      let output = M._metaContentToObject({});
      await expect(output).toEqual({});
    });
  });

  describe('M.axisToCS() utility function tests', () => {
    test('Null axis', async () => {
      let output = M.axisToCS(null);
      await expect(output).toEqual(undefined);
    });
    test('Non-String axis', async () => {
      let output = M.axisToCS(5);
      await expect(output).toEqual(undefined);
    });
    test('Lowercase axis', async () => {
      let output = M.axisToCS('row');
      await expect(output).toEqual('TILEMATRIX');
    });
    test('Uppercase axis', async () => {
      let output = M.axisToCS('NORTHING');
      await expect(output).toEqual('PCRS');
    });
    test('Random String', async () => {
      let output = M.axisToCS('TEST');
      await expect(output).toEqual('TILEMATRIX');
    });
  });

  describe('M.csToAxes() utility function tests', () => {
    test('Null cs', async () => {
      let output = M.csToAxes(null);
      await expect(output).toEqual(undefined);
    });
    test('Non-string cs', async () => {
      let output = M.csToAxes(5);
      await expect(output).toEqual(undefined);
    });
    test('cs = tilematrix', async () => {
      let output = M.csToAxes('tilematrix');
      await expect(output).toEqual(['column', 'row']);
    });
    test('cs = pcrs', async () => {
      let output = M.csToAxes('pcrs');
      await expect(output).toEqual(['easting', 'northing']);
    });
    test('cs = gcrs', async () => {
      let output = M.csToAxes('gcrs');
      await expect(output).toEqual(['longitude', 'latitude']);
    });
    test('cs = tcrs', async () => {
      let output = M.csToAxes('tcrs');
      await expect(output).toEqual(['x', 'y']);
    });
    test('cs = map', async () => {
      let output = M.csToAxes('map');
      await expect(output).toEqual(['i', 'j']);
    });
    test('cs = tile', async () => {
      let output = M.csToAxes('tile');
      await expect(output).toEqual(['i', 'j']);
    });
  });

  describe('M.pixelToPCRSPoint() utility function tests', () => {
    let point = L.point(10, 10);
    test('Null point', async () => {
      let output = M.pixelToPCRSPoint(null, 0, 'CBMTILE');
      await expect(output).toEqual(undefined);
    });
    test('Null zoom', async () => {
      let output = M.pixelToPCRSPoint(point, null, 'CBMTILE');
      await expect(output).toEqual(undefined);
    });
    test('Null projection', async () => {
      let output = M.pixelToPCRSPoint(point, 1, null);
      await expect(output).toEqual(undefined);
    });
    test('Valid point conversion in CBMTILE', async () => {
      let output = M.pixelToPCRSPoint(point, 1, 'CBMTILE');
      await expect(output).toEqual({
        x: -34430903.7168741,
        y: 39085103.7168741
      });
    });
    test('Valid point conversion in OSMTILE', async () => {
      let output = M.pixelToPCRSPoint(point, 1, 'OSMTILE');
      await expect(output).toEqual({
        x: -19254793.17314904,
        y: 19254793.17314904
      });
    });
    test('Valid point conversion in WGS84', async () => {
      let output = M.pixelToPCRSPoint(point, 1, 'WGS84');
      await expect(output).toEqual({ x: -176.484375, y: 86.484375 });
    });
  });

  describe('M.pointToPCRSPoint() utility function tests', () => {
    let expected = [
        [
          { x: 63557729.76039286, y: -58903529.76039286 },
          { x: 380712658.51299566, y: -380712658.51299566 },
          { x: 1620, y: -1710 }
        ],
        [
          { x: 10, y: 10 },
          { x: 10, y: 10 },
          { x: 10, y: 10 }
        ],
        [
          { x: 9575762.405264193, y: 5421756.419812092 },
          { x: 1113194.9079327357, y: 1118889.974857959 },
          { x: 10, y: 10 }
        ],
        [
          { x: -34272153.399373464, y: 38926353.399373464 },
          { x: -18472078.003508836, y: 18472078.003508836 },
          { x: -172.96875, y: 82.96875 }
        ]
      ],
      point = L.point(10, 10),
      csArray = ['tilematrix', 'pcrs', 'gcrs', 'tcrs'],
      projArray = ['CBMTILE', 'OSMTILE', 'WGS84'];

    /* jshint ignore:start */
    for (let i in csArray) {
      for (let j in projArray) {
        test(`Valid conversion in ${projArray[j]} + ${csArray[i]}`, async () => {
          let output = M.pointToPCRSPoint(point, 0, projArray[j], csArray[i]);
          await expect(output).toEqual(expected[i][j]);
        });
      }
    }
    /* jshint ignore:end */

    test('Null point', async () => {
      let output = M.pointToPCRSPoint(null, 0, 'CBMTILE');
      await expect(output).toEqual(undefined);
    });
    test('Null zoom', async () => {
      let output = M.pointToPCRSPoint(point, null, 'CBMTILE');
      await expect(output).toEqual(undefined);
    });
    test('Null projection', async () => {
      let output = M.pointToPCRSPoint(point, 1, null);
      await expect(output).toEqual(undefined);
    });
    test('Null cs', async () => {
      let output = M.pointToPCRSPoint(point, 1, 'CBMTILE', null);
      await expect(output).toEqual(undefined);
    });
  });

  describe('M.axisToXY() utility function tests', () => {
    let expectX = ['i', 'column', 'longitude', 'x', 'easting'],
      expectY = ['row', 'j', 'latitude', 'y', 'northing'];
    test('Null axis', async () => {
      let output = M.axisToXY(null);
      await expect(output).toEqual(undefined);
    });
    /* jshint ignore:start */
    for (let i in expectX) {
      test(`Expect X for ${expectX[i]}`, async () => {
        let output = M.axisToXY(expectX[i]);
        await expect(output).toEqual('x');
      });
    }
    /* jshint ignore:end */
    /* jshint ignore:start */
    for (let i in expectY) {
      test(`Expect X for ${expectY[i]}`, async () => {
        let output = M.axisToXY(expectY[i]);
        await expect(output).toEqual('y');
      });
    }
    /* jshint ignore:end */
  });
});
