const isVisible = require('./general/isVisible');
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");
jest.setTimeout(50000);
(async () => {
  let expectedPCRS = {
    topLeft: {
      horizontal: 28448056,
      vertical: 42672085,
    },
    bottomRight: {
      horizontal: 38608077,
      vertical: 28448056,
    },
  }, expectedGCRS = {
    topLeft: {
      horizontal: 49.21675580514393,
      vertical: -70.33287846599659,
    },
    bottomRight: {
      horizontal: 54.37855468522463,
      vertical: -60.404651716482284,
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
