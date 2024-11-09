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
  pmtilesRules.set('http://localhost:30001/spearfish.pmtiles?theme=dark', {
    theme: { theme: 'dark' }
  });
  pmtilesRules.set(
    'http://localhost:30001/tiles/osmtile/{beans}/{foo}/{bar}.mvt?theme=light',
    { theme: { theme: 'light' } }
  );
  pmtilesRules.set(
    'http://localhost:30001/tiles/osmtile/{z}/{x}/{y}.mvt?theme=light',
    { theme: { theme: 'light' } }
  );
  return pmtilesRules;
});

export { pmtilesRules, pmtilesRulesReady };
