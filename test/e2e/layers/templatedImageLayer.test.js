import { test, expect, chromium } from '@playwright/test';

const isVisible = require("./general/isVisible");
const zoomLimit = require("./general/zoomLimit");
const extentProperty = require("./general/extentProperty");

let expectedPCRS = {
  topLeft: {
    horizontal: -6207743.103886206,
    vertical: 3952277.216154434
  },
  bottomRight: {
    horizontal: 3952277.216154434,
    vertical: -3362085.3441706896
  }
}, expectedGCRS = {
  topLeft: {
    horizontal: -136.9120743861578,
    vertical: 54.8100849543377
  },
  bottomRight: {
    horizontal: -6.267177352336376,
    vertical: 6.5831982143623975
  }
};

test.describe("Playwright templatedImage Layer Tests", () => {
  isVisible.test("templatedImageLayer.html", 2, 1);
  zoomLimit.test("templatedImageLayer.html", 1, 0);
  extentProperty.test("templatedImageLayer.html", expectedPCRS, expectedGCRS);
});