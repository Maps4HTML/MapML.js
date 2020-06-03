module.exports = {
  projects: [
    {
      displayName: "UNIT Testing",
      testMatch: ["**/test/*.test.js"],
      setupFiles: ["./test/setup.js"]
    },
    {
      displayName: "E2E Testing",
      preset: "jest-playwright-preset",
      globals: {
        PATH: "http://localhost:30001/",
        BROWSER: ["chromium", "firefox"],
        ISHEADLESS: false
      },
      testMatch: ["**/test/e2e/*.test.js"]
    }
  ]
};
