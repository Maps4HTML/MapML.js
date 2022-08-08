module.exports = {
//  testTimeout: 300000, // 5 min for debugging
  projects: [
    {
      displayName: "UNIT Testing",
      testMatch: ["**/test/**/*.spec.js"],
      setupFiles: ["./test/setup.js"]
    }
  ]
};
