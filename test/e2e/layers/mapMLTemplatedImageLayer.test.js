const isVisible = require('./general/isVisible');
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: -6207743.103886206,
      vertical: 3952277.216154434,
    },
    bottomRight: {
      horizontal: 3952277.216154434,
      vertical: -3362085.3441706896,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: -136.9120743861578,
      vertical: 54.8100849543377,
    },
    bottomRight: {
      horizontal: -6.267177352336376,
      vertical: 6.5831982143623975,
    },
  };
  for (const browserType of BROWSER) {
    describe(
      "Playwright mapMLTemplatedImage Layer Tests in " + browserType,
      () => {
        isVisible.test("mapMLTemplatedImageLayer.html", 2, 1, browserType);
        zoomLimit.test("mapMLTemplatedImageLayer.html", 1, 0, browserType);
        extentProperty.test("mapMLTemplatedImageLayer.html", expectedPCRS, expectedGCRS, browserType);
      }
    );
  }
})();
