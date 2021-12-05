module.exports = {
//  testTimeout: 300000, // 5 min for debugging
  projects: [
    {
      displayName: "E2E Testing",
      preset: "jest-playwright-preset",
      globals: {
        PATH: "http://localhost:30001/",
      },
      testMatch: ["**/test/e2e/**/reticle.test.js"]
  }
  ]
};
