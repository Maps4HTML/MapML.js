const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: 1501645.2210838948,
      vertical: -66110.70639331453,
    },
    bottomRight: {
      horizontal: 1617642.4028044068,
      vertical: -222452.18449031282,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -76,
      vertical: 45.999999999999936,
    },
    bottomRight: {
      horizontal: -74,
      vertical: 44.99999999999991,
    },
  };
  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLFeatures (Static Features) Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedFeatures.html", 3, 2, browserType);
        zoomLimit.test("mapMLTemplatedFeatures.html", 2, 1, browserType);
        extentProperty.test("mapMLTemplatedFeatures.html", expectedPCRS, expectedGCRS, browserType);
      }
    );
  }
})();
