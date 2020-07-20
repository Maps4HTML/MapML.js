const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: -34655800,
      vertical: 39310000,
    },
    bottomRight: {
      horizontal: 14450964.88019643,
      vertical: -9796764.88019643,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -169.78391348558873,
      vertical: -60.79113663130127,
    },
    bottomRight: {
      horizontal: 79.6961805581841,
      vertical: -60.79110984572508,
    },
  };
  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLFeatures (Static Features) Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLFeatures.html", 5, 2, browserType);
        zoomLimit.test("mapMLFeatures.html", 3, 1, browserType);
        extentProperty.test("mapMLFeatures.html", expectedPCRS, expectedGCRS, browserType);
      }
    );
  }
})();
