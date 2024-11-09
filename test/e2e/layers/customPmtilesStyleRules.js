class SpearfishSymbolizer {
  constructor(options) {
    this.color = options.color;
    this.shape = options.shape;
  }
  draw(context, geom, z, feature) {
    let pt = geom[0][0];
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.beginPath();
    if (this.shape === 'circle') {
      context.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
    } else {
      context.rect(pt.x - 2, pt.y - 2, 4, 4);
    }
    context.stroke();
    context.fill();
  }
}
const sheet = new protomapsL.Sheet(`
<html>
  <body>
    <svg id="star" width="32px" height="32px" xmlns="http://www.w3.org/2000/svg">
      <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA2UlEQVR4nNWPMWoCYRCFv0ICglYhVgEL3fcrdils0myRTvAKklZIwJ3fiN16hhhyABFEcgbvYKEnkBRJb5kEJTaysMtWyYPXDPO9mQd/Xr5GJTdsTaompvmvO0YmPuOQQr4PxNrEtw/opC7HLS5MTEwsDvaOtwN8DBDb0zxyzId1bhJD+i1KXsxOYIJ3vkGY3j3gPgFejRtcZuo+dNyeB3ixJKtMvPyCm0g8m/gysX9ylFPhOKTgxYc5XgfXFI+VxJ2JdxO91ICBaEeO7vn8oc6VD3jMXOP/6AfKF0wwWyONswAAAABJRU5ErkJggg==" width="16" height="16" />
    </svg>
  </body>
</html>
`);
const pmtilesRules = new Map();
const pmtilesRulesReady = sheet.load().then(() => {
  pmtilesRules.set(
    'http://localhost:30001/tiles/osmtile/{z}/{y}/{x}.mvt?format=application/vnd.mapbox-vector-tile',
    {
      rules: {
        PAINT_RULES: [
          {
            dataLayer: 'streams',
            symbolizer: new protomapsL.LineSymbolizer({
              color: 'steelblue',
              width: 2
            })
          },
          {
            dataLayer: 'roads',
            symbolizer: new protomapsL.LineSymbolizer({
              color: 'maroon',
              width: 2
            })
          },
          {
            dataLayer: 'restricted',
            symbolizer: new protomapsL.PolygonSymbolizer({
              fill: 'red',
              opacity: 0.5
            })
          },
          {
            dataLayer: 'restricted',
            symbolizer: new protomapsL.LineSymbolizer({
              color: 'red',
              width: 2
            })
          },
          {
            dataLayer: 'archsites',
            symbolizer: new SpearfishSymbolizer({
              color: 'red',
              shape: 'square'
            })
          },
          {
            dataLayer: 'bugsites',
            symbolizer: new SpearfishSymbolizer({
              color: 'black',
              shape: 'circle'
            })
          }
        ],
        LABEL_RULES: [
          {
            dataLayer: 'archsites',
            symbolizer: new protomapsL.GroupSymbolizer([
              new protomapsL.CenteredTextSymbolizer({
                labelProps: ['str1'],
                fill: 'white',
                width: 2,
                stroke: 'black',
                font: '600 16px sans-serif'
              }),
              new protomapsL.IconSymbolizer({
                name: 'star',
                sheet: sheet
              })
            ])
            // note that filter is a property of a rule, not an option to a symbolizer
            // filter: (z,f) => { return f.props['str1'].trim().toLowerCase() !== 'no name'; }
          }
        ]
      }
    }
  );
  return pmtilesRules;
});

export { pmtilesRules, pmtilesRulesReady };
